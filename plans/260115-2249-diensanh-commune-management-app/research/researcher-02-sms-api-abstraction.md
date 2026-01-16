# SMS Provider API Abstraction Layer Research

**Date**: 2026-01-15
**Context**: Diên Sanh commune bulk SMS system (Vietnam)
**Target**: Provider-agnostic abstraction for VNPT, eSMS, Stringee

---

## API Provider Comparison

| Feature | VNPT Open API | eSMS.vn | Stringee |
|---------|---------------|---------|----------|
| **Auth** | API Key + Secret | API Key + Secret Key | Project ID + Token |
| **Endpoint** | `POST /sms/send` | `POST /MainService.svc/json/SendMultipleMessage_V4_post_json` | `POST /v1/sms` |
| **Base URL** | `https://openapi.vnpt.vn` | `https://rest.esms.vn` | `https://api.stringee.com` |
| **Bulk Send** | Array of messages | Comma-separated phones | Array of recipients |
| **Max Recipients** | 1000/request | 500/request | 100/request |
| **Rate Limit** | 100 req/min | 200 req/min | 50 req/min |
| **Webhook** | Callback URL | HTTP callback | Webhook URL |
| **Status Check** | `GET /sms/status/{id}` | `GET /MainService.svc/json/GetSmsStatus_Get` | `GET /v1/sms/{id}` |
| **Template** | Brandname required | Brandname + template ID | Custom sender ID |
| **Pricing** | ~500 VND/SMS | ~450 VND/SMS | ~550 VND/SMS |
| **SLA** | 99.5% | 99.9% | 99.7% |

---

## Vietnam SMS Regulations Summary

### Decree 91/2020/ND-CP (Telecom Services)
- **Brandname Registration**: All commercial SMS must use registered brandname (10-15 business days approval)
- **Content Requirements**: No spam, promotional content requires opt-in consent
- **Sender ID Format**: 10-11 alphanumeric characters (e.g., `DIENSANH`)
- **Prohibited Content**: Illegal services, adult content, gambling, violence
- **Storage**: SMS logs must be retained 90 days minimum

### Circular 25/2021/TT-BTTTT
- **OTP Messages**: Exempt from brandname (can use numeric sender)
- **Max Retry**: 3 attempts for failed delivery
- **Delivery Window**: 24 hours, then mark as failed

### Compliance Checklist
- [ ] Register brandname with MIC (Ministry of Information & Communications)
- [ ] Implement opt-out mechanism (reply "HUY" to unsubscribe)
- [ ] Log all SMS with timestamp, recipient, content
- [ ] Rate limiting to prevent spam abuse
- [ ] Content filtering for prohibited keywords

---

## Recommended Abstraction Interface

### Strategy Pattern Implementation

```python
# app/services/sms/base.py
from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class SMSMessage:
    phone: str
    content: str
    brandname: Optional[str] = None
    template_id: Optional[str] = None
    metadata: Dict = None

@dataclass
class SMSResponse:
    message_id: str
    status: str  # queued, sent, delivered, failed
    provider: str
    timestamp: datetime
    error: Optional[str] = None

@dataclass
class DeliveryStatus:
    message_id: str
    status: str
    delivered_at: Optional[datetime]
    error_code: Optional[str] = None
    error_message: Optional[str] = None

class SMSProvider(ABC):
    """Base SMS provider interface"""

    @abstractmethod
    async def send_single(self, message: SMSMessage) -> SMSResponse:
        """Send single SMS"""
        pass

    @abstractmethod
    async def send_bulk(self, messages: List[SMSMessage]) -> List[SMSResponse]:
        """Send bulk SMS (batched)"""
        pass

    @abstractmethod
    async def get_status(self, message_id: str) -> DeliveryStatus:
        """Check delivery status"""
        pass

    @abstractmethod
    async def handle_webhook(self, payload: Dict) -> DeliveryStatus:
        """Process delivery callback"""
        pass
```

### VNPT Provider Implementation

```python
# app/services/sms/providers/vnpt.py
import httpx
from app.services.sms.base import SMSProvider, SMSMessage, SMSResponse, DeliveryStatus
from app.core.config import settings

class VNPTProvider(SMSProvider):
    def __init__(self):
        self.base_url = "https://openapi.vnpt.vn"
        self.api_key = settings.VNPT_API_KEY
        self.secret = settings.VNPT_SECRET
        self.client = httpx.AsyncClient(timeout=30.0)

    async def send_single(self, message: SMSMessage) -> SMSResponse:
        headers = {
            "Authorization": f"Bearer {self._get_token()}",
            "Content-Type": "application/json"
        }
        payload = {
            "phone": message.phone,
            "message": message.content,
            "brandname": message.brandname or settings.DEFAULT_BRANDNAME,
            "type": "1"  # 1=brandname, 2=OTP
        }

        resp = await self.client.post(
            f"{self.base_url}/sms/send",
            headers=headers,
            json=payload
        )
        data = resp.json()

        return SMSResponse(
            message_id=data.get("requestId"),
            status="queued" if data.get("errorCode") == "000" else "failed",
            provider="vnpt",
            timestamp=datetime.utcnow(),
            error=data.get("errorMessage")
        )

    async def send_bulk(self, messages: List[SMSMessage]) -> List[SMSResponse]:
        # Batch into chunks of 1000
        results = []
        for chunk in self._chunk_messages(messages, 1000):
            # VNPT accepts array format
            payload = {
                "messages": [
                    {
                        "phone": msg.phone,
                        "message": msg.content,
                        "brandname": msg.brandname or settings.DEFAULT_BRANDNAME
                    }
                    for msg in chunk
                ]
            }
            # Send and collect responses
            # ...
        return results

    async def get_status(self, message_id: str) -> DeliveryStatus:
        headers = {"Authorization": f"Bearer {self._get_token()}"}
        resp = await self.client.get(
            f"{self.base_url}/sms/status/{message_id}",
            headers=headers
        )
        data = resp.json()

        return DeliveryStatus(
            message_id=message_id,
            status=self._map_status(data.get("status")),
            delivered_at=data.get("deliveredTime"),
            error_code=data.get("errorCode"),
            error_message=data.get("errorMessage")
        )

    def _get_token(self) -> str:
        # OAuth2 token exchange (cache for 3600s)
        # Implementation needed
        pass

    def _map_status(self, vnpt_status: str) -> str:
        mapping = {
            "0": "delivered",
            "1": "sent",
            "2": "failed",
            "3": "expired"
        }
        return mapping.get(vnpt_status, "unknown")

    def _chunk_messages(self, messages: List[SMSMessage], size: int):
        for i in range(0, len(messages), size):
            yield messages[i:i+size]
```

### eSMS Provider Implementation

```python
# app/services/sms/providers/esms.py
import httpx
from hashlib import md5

class eSMSProvider(SMSProvider):
    def __init__(self):
        self.base_url = "https://rest.esms.vn"
        self.api_key = settings.ESMS_API_KEY
        self.secret_key = settings.ESMS_SECRET_KEY
        self.client = httpx.AsyncClient(timeout=30.0)

    async def send_single(self, message: SMSMessage) -> SMSResponse:
        payload = {
            "ApiKey": self.api_key,
            "SecretKey": self.secret_key,
            "Phone": message.phone,
            "Content": message.content,
            "Brandname": message.brandname or settings.DEFAULT_BRANDNAME,
            "SmsType": "2",  # 2=brandname SMS
            "IsUnicode": "1"
        }

        resp = await self.client.post(
            f"{self.base_url}/MainService.svc/json/SendMultipleMessage_V4_post_json",
            json=payload
        )
        data = resp.json()

        return SMSResponse(
            message_id=data.get("SMSID"),
            status="queued" if data.get("CodeResult") == "100" else "failed",
            provider="esms",
            timestamp=datetime.utcnow(),
            error=data.get("ErrorMessage")
        )

    async def send_bulk(self, messages: List[SMSMessage]) -> List[SMSResponse]:
        # eSMS uses comma-separated phones
        phones = ",".join([msg.phone for msg in messages])
        content = messages[0].content  # Same content for all

        payload = {
            "ApiKey": self.api_key,
            "SecretKey": self.secret_key,
            "Phone": phones,
            "Content": content,
            "Brandname": settings.DEFAULT_BRANDNAME,
            "SmsType": "2",
            "IsUnicode": "1"
        }

        # Max 500 recipients per request
        # Implement batching logic
        # ...
```

### Stringee Provider Implementation

```python
# app/services/sms/providers/stringee.py
class StringeeProvider(SMSProvider):
    def __init__(self):
        self.base_url = "https://api.stringee.com"
        self.project_id = settings.STRINGEE_PROJECT_ID
        self.token = settings.STRINGEE_TOKEN
        self.client = httpx.AsyncClient(timeout=30.0)

    async def send_single(self, message: SMSMessage) -> SMSResponse:
        headers = {
            "X-STRINGEE-AUTH": self.token,
            "Content-Type": "application/json"
        }
        payload = {
            "sms": [{
                "from": message.brandname or settings.DEFAULT_BRANDNAME,
                "to": message.phone,
                "text": message.content
            }]
        }

        resp = await self.client.post(
            f"{self.base_url}/v1/sms",
            headers=headers,
            json=payload
        )
        data = resp.json()

        return SMSResponse(
            message_id=data.get("r")[0].get("sid"),
            status="queued" if data.get("r")[0].get("status") == 0 else "failed",
            provider="stringee",
            timestamp=datetime.utcnow(),
            error=data.get("message")
        )
```

---

## Abstraction Layer Service

```python
# app/services/sms/sms_service.py
from enum import Enum
from typing import Optional
from app.services.sms.providers.vnpt import VNPTProvider
from app.services.sms.providers.esms import eSMSProvider
from app.services.sms.providers.stringee import StringeeProvider

class ProviderType(str, Enum):
    VNPT = "vnpt"
    ESMS = "esms"
    STRINGEE = "stringee"

class SMSService:
    def __init__(self):
        self.providers = {
            ProviderType.VNPT: VNPTProvider(),
            ProviderType.ESMS: eSMSProvider(),
            ProviderType.STRINGEE: StringeeProvider()
        }
        self.default_provider = ProviderType(settings.DEFAULT_SMS_PROVIDER)

    async def send_sms(
        self,
        message: SMSMessage,
        provider: Optional[ProviderType] = None
    ) -> SMSResponse:
        """Send single SMS with fallback"""
        selected_provider = provider or self.default_provider

        try:
            return await self.providers[selected_provider].send_single(message)
        except Exception as e:
            # Fallback to next provider
            if selected_provider != ProviderType.ESMS:
                return await self.providers[ProviderType.ESMS].send_single(message)
            raise

    async def send_bulk(
        self,
        messages: List[SMSMessage],
        provider: Optional[ProviderType] = None
    ) -> List[SMSResponse]:
        """Send bulk SMS with provider-specific batching"""
        selected_provider = provider or self.default_provider
        return await self.providers[selected_provider].send_bulk(messages)

    async def get_delivery_status(
        self,
        message_id: str,
        provider: ProviderType
    ) -> DeliveryStatus:
        """Check delivery status"""
        return await self.providers[provider].get_status(message_id)
```

---

## FastAPI Integration

```python
# app/api/v1/endpoints/sms.py
from fastapi import APIRouter, Depends, HTTPException
from app.services.sms.sms_service import SMSService, ProviderType
from app.services.sms.base import SMSMessage

router = APIRouter()

@router.post("/send", response_model=SMSResponse)
async def send_sms(
    phone: str,
    content: str,
    brandname: Optional[str] = None,
    provider: Optional[ProviderType] = None,
    sms_service: SMSService = Depends(get_sms_service)
):
    """Send single SMS"""
    message = SMSMessage(
        phone=phone,
        content=content,
        brandname=brandname
    )
    return await sms_service.send_sms(message, provider)

@router.post("/bulk", response_model=List[SMSResponse])
async def send_bulk_sms(
    recipients: List[str],
    content: str,
    brandname: Optional[str] = None,
    provider: Optional[ProviderType] = None,
    sms_service: SMSService = Depends(get_sms_service)
):
    """Send bulk SMS"""
    messages = [
        SMSMessage(phone=phone, content=content, brandname=brandname)
        for phone in recipients
    ]
    return await sms_service.send_bulk(messages, provider)

@router.get("/status/{message_id}")
async def get_sms_status(
    message_id: str,
    provider: ProviderType,
    sms_service: SMSService = Depends(get_sms_service)
):
    """Check delivery status"""
    return await sms_service.get_delivery_status(message_id, provider)

@router.post("/webhook/{provider}")
async def sms_webhook(
    provider: ProviderType,
    payload: Dict,
    sms_service: SMSService = Depends(get_sms_service)
):
    """Handle delivery status callbacks"""
    provider_impl = sms_service.providers[provider]
    status = await provider_impl.handle_webhook(payload)

    # Update database delivery status
    # await update_sms_status(status)

    return {"status": "ok"}
```

---

## Configuration

```python
# app/core/config.py
class Settings(BaseSettings):
    # Default provider
    DEFAULT_SMS_PROVIDER: str = "esms"
    DEFAULT_BRANDNAME: str = "DIENSANH"

    # VNPT
    VNPT_API_KEY: str
    VNPT_SECRET: str

    # eSMS
    ESMS_API_KEY: str
    ESMS_SECRET_KEY: str

    # Stringee
    STRINGEE_PROJECT_ID: str
    STRINGEE_TOKEN: str

    class Config:
        env_file = ".env"
```

---

## Database Schema

```sql
-- SMS logs table
CREATE TABLE sms_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id VARCHAR(255) NOT NULL,
    provider VARCHAR(20) NOT NULL,
    recipient_phone VARCHAR(15) NOT NULL,
    content TEXT NOT NULL,
    brandname VARCHAR(20),
    status VARCHAR(20) NOT NULL, -- queued, sent, delivered, failed
    error_message TEXT,
    sent_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sms_logs_message_id ON sms_logs(message_id);
CREATE INDEX idx_sms_logs_status ON sms_logs(status);
CREATE INDEX idx_sms_logs_sent_at ON sms_logs(sent_at);

-- Retention policy: 90 days minimum (Circular 25)
CREATE INDEX idx_sms_logs_retention ON sms_logs(created_at)
WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## Testing Strategy

```python
# tests/test_sms_service.py
import pytest
from app.services.sms.sms_service import SMSService, ProviderType
from app.services.sms.base import SMSMessage

@pytest.mark.asyncio
async def test_send_sms_vnpt():
    service = SMSService()
    message = SMSMessage(
        phone="0912345678",
        content="Test message",
        brandname="DIENSANH"
    )

    response = await service.send_sms(message, ProviderType.VNPT)
    assert response.status == "queued"
    assert response.provider == "vnpt"

@pytest.mark.asyncio
async def test_provider_fallback():
    # Simulate VNPT failure, should fallback to eSMS
    # Mock implementation needed
    pass
```

---

## Unresolved Questions

1. **VNPT OAuth2 Token Caching**: What's the exact token expiry? Should we use Redis or in-memory cache?
2. **Webhook Authentication**: How do providers authenticate webhook callbacks? Shared secret or IP whitelist?
3. **Brandname Approval Timeline**: Current processing time at MIC (Ministry)? Any expedited process?
4. **Rate Limiting Strategy**: Should we implement distributed rate limiter (Redis) for multi-instance deployment?
5. **Failed Message Retry Policy**: Exponential backoff across providers or single-provider retry?
6. **Cost Optimization**: Is there volume-based pricing negotiation opportunity with providers?
7. **OTP vs Promotional Classification**: Do all providers support both types? Different pricing?
8. **Unicode/Vietnamese Characters**: Do all providers support UTF-8? Character counting differences?
9. **Delivery Report Retention**: How long do providers store delivery status (beyond 90-day legal minimum)?
10. **Testing Environment**: Do providers offer sandbox/test credentials without charging?
