# Phase 06: SMS Messaging System

## Context Links
- [Plan Overview](./plan.md)
- [SMS Research](./research/researcher-02-sms-api-abstraction.md)
- [PWA Research](./research/researcher-01-pwa-offline-patterns.md) - Background Sync

## Overview
| Field | Value |
|-------|-------|
| Priority | P1 |
| Status | pending |
| Effort | 14h |
| Dependencies | Phase 05 complete, SMS provider credentials |

Provider-agnostic SMS system with VNPT/eSMS/Stringee support, bulk messaging, and offline queue.

---

## Key Insights
- Strategy pattern for provider abstraction
- Background Sync API for offline SMS queueing
- Brandname "DIENSANH" requires MIC registration
- 90-day log retention per Circular 25/2021
- Rate limits vary: VNPT 100/min, eSMS 200/min, Stringee 50/min
- **SMS permission: Commune admin only** (Validated Decision)

---

## Requirements

### Functional
- FR1: Send single SMS to phone number
- FR2: Bulk SMS to village (all households)
- FR3: Bulk SMS to selected recipients
- FR4: Track delivery status
- FR5: SMS history/logs with search
- FR6: Queue SMS when offline

### Non-Functional
- NFR1: SMS queued even offline
- NFR2: Fallback to secondary provider on failure
- NFR3: 90-day log retention
- NFR4: Vietnamese content support (Unicode)

---

## Architecture

### Backend Extension (FastAPI)
```
src/
├── api/
│   ├── api-server.py          # Existing
│   └── sms-router.py          # New: SMS endpoints
├── services/
│   └── sms/
│       ├── __init__.py
│       ├── base.py            # Abstract provider
│       ├── sms_service.py     # Main service
│       └── providers/
│           ├── vnpt.py
│           ├── esms.py
│           └── stringee.py
```

### Frontend Components
```
src/components/messages/
├── message-composer.tsx       # Compose SMS
├── recipient-selector.tsx     # Select recipients
├── message-preview.tsx        # Preview before send
├── message-history.tsx        # SMS logs table
├── delivery-status.tsx        # Status badge
└── bulk-progress.tsx          # Bulk send progress

src/pages/admin/messages/
├── index.tsx                  # Message center
├── compose.tsx                # New message
└── [messageId].tsx            # Message details
```

### Data Flow
```
User composes SMS
  → Validates content (160 chars, prohibited words)
  → Selects recipients (individual, village, all)
  → Preview with cost estimate
  → Confirm send
    → Online: POST /api/sms/send → Provider → Webhook → Update status
    → Offline: Queue in IndexedDB → Background Sync → Retry when online
```

---

## Related Code Files

### Create (Backend)
- `src/services/sms/__init__.py`
- `src/services/sms/base.py`
- `src/services/sms/sms_service.py`
- `src/services/sms/providers/vnpt.py`
- `src/services/sms/providers/esms.py`
- `src/services/sms/providers/stringee.py`
- `src/api/sms-router.py`

### Create (Frontend)
- `src/components/messages/message-composer.tsx`
- `src/components/messages/recipient-selector.tsx`
- `src/components/messages/message-history.tsx`
- `src/pages/admin/messages/index.tsx`
- `src/pages/admin/messages/compose.tsx`
- `src/hooks/use-messages.ts`
- `src/hooks/use-send-sms.ts`

### Modify
- `src/api/api-server.py` - Add SMS router
- `src/config.py` - Add SMS provider configs
- `vite.config.ts` - Add Background Sync for SMS

---

## Implementation Steps

### 1. Create SMS Base Classes (1.5h)
```python
# src/services/sms/base.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import List, Dict, Optional

@dataclass
class SMSMessage:
    phone: str
    content: str
    brandname: Optional[str] = None
    metadata: Dict = None

@dataclass
class SMSResponse:
    message_id: str
    status: str  # queued, sent, delivered, failed
    provider: str
    timestamp: datetime
    error: Optional[str] = None

class SMSProvider(ABC):
    @abstractmethod
    async def send_single(self, message: SMSMessage) -> SMSResponse:
        pass

    @abstractmethod
    async def send_bulk(self, messages: List[SMSMessage]) -> List[SMSResponse]:
        pass

    @abstractmethod
    async def get_status(self, message_id: str) -> dict:
        pass
```

### 2. Implement eSMS Provider (2h)
```python
# src/services/sms/providers/esms.py
import httpx
from ..base import SMSProvider, SMSMessage, SMSResponse

class eSMSProvider(SMSProvider):
    BASE_URL = "https://rest.esms.vn"

    def __init__(self, api_key: str, secret_key: str, brandname: str):
        self.api_key = api_key
        self.secret_key = secret_key
        self.brandname = brandname
        self.client = httpx.AsyncClient(timeout=30.0)

    async def send_single(self, message: SMSMessage) -> SMSResponse:
        payload = {
            "ApiKey": self.api_key,
            "SecretKey": self.secret_key,
            "Phone": message.phone,
            "Content": message.content,
            "Brandname": message.brandname or self.brandname,
            "SmsType": "2",
            "IsUnicode": "1"
        }

        resp = await self.client.post(
            f"{self.BASE_URL}/MainService.svc/json/SendMultipleMessage_V4_post_json",
            json=payload
        )
        data = resp.json()

        return SMSResponse(
            message_id=data.get("SMSID", ""),
            status="queued" if data.get("CodeResult") == "100" else "failed",
            provider="esms",
            timestamp=datetime.utcnow(),
            error=data.get("ErrorMessage")
        )

    async def send_bulk(self, messages: List[SMSMessage]) -> List[SMSResponse]:
        # eSMS uses comma-separated phones (max 500)
        results = []
        for chunk in self._chunk(messages, 500):
            phones = ",".join([m.phone for m in chunk])
            content = chunk[0].content

            payload = {
                "ApiKey": self.api_key,
                "SecretKey": self.secret_key,
                "Phone": phones,
                "Content": content,
                "Brandname": self.brandname,
                "SmsType": "2",
                "IsUnicode": "1"
            }

            resp = await self.client.post(
                f"{self.BASE_URL}/MainService.svc/json/SendMultipleMessage_V4_post_json",
                json=payload
            )
            # Process response...
        return results

    def _chunk(self, items, size):
        for i in range(0, len(items), size):
            yield items[i:i+size]
```

### 3. Create SMS Service (2h)
```python
# src/services/sms/sms_service.py
from enum import Enum
from typing import Optional, List
from .providers.esms import eSMSProvider
from .providers.vnpt import VNPTProvider
from .providers.stringee import StringeeProvider

class ProviderType(str, Enum):
    VNPT = "vnpt"
    ESMS = "esms"
    STRINGEE = "stringee"

class SMSService:
    def __init__(self, settings):
        self.providers = {
            ProviderType.ESMS: eSMSProvider(
                settings.ESMS_API_KEY,
                settings.ESMS_SECRET_KEY,
                settings.DEFAULT_BRANDNAME
            ),
            # Add other providers...
        }
        self.default_provider = ProviderType(settings.DEFAULT_SMS_PROVIDER)

    async def send_sms(
        self,
        phone: str,
        content: str,
        provider: Optional[ProviderType] = None
    ) -> SMSResponse:
        selected = provider or self.default_provider
        message = SMSMessage(phone=phone, content=content)

        try:
            return await self.providers[selected].send_single(message)
        except Exception as e:
            # Fallback to secondary provider
            if selected != ProviderType.ESMS:
                return await self.providers[ProviderType.ESMS].send_single(message)
            raise

    async def send_bulk_sms(
        self,
        phones: List[str],
        content: str,
        provider: Optional[ProviderType] = None
    ) -> List[SMSResponse]:
        selected = provider or self.default_provider
        messages = [SMSMessage(phone=p, content=content) for p in phones]
        return await self.providers[selected].send_bulk(messages)
```

### 4. Create FastAPI Router (1.5h)
```python
# src/api/sms-router.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from ..services.sms.sms_service import SMSService, ProviderType

router = APIRouter(prefix="/api/sms", tags=["SMS"])

class SendSMSRequest(BaseModel):
    phone: str
    content: str
    provider: Optional[ProviderType] = None

class BulkSMSRequest(BaseModel):
    phones: List[str]
    content: str
    provider: Optional[ProviderType] = None

@router.post("/send")
async def send_sms(request: SendSMSRequest):
    sms_service = SMSService(settings)
    result = await sms_service.send_sms(
        request.phone,
        request.content,
        request.provider
    )
    # Log to Firestore
    await log_sms_to_firestore(result)
    return result

@router.post("/bulk")
async def send_bulk_sms(request: BulkSMSRequest):
    sms_service = SMSService(settings)
    results = await sms_service.send_bulk_sms(
        request.phones,
        request.content,
        request.provider
    )
    # Log all to Firestore
    for result in results:
        await log_sms_to_firestore(result)
    return {"sent": len(results), "results": results}

@router.post("/webhook/{provider}")
async def sms_webhook(provider: ProviderType, payload: dict):
    # Handle delivery status callback
    await update_sms_status(payload)
    return {"status": "ok"}
```

### 5. Create MessageComposer Component (2h)
```typescript
// src/components/messages/message-composer.tsx
export function MessageComposer() {
  const [content, setContent] = useState('')
  const [recipients, setRecipients] = useState<string[]>([])
  const [recipientType, setRecipientType] = useState<'individual' | 'village' | 'all'>('individual')
  const sendMutation = useSendSMS()

  const charCount = content.length
  const smsCount = Math.ceil(charCount / 160)
  const estimatedCost = recipients.length * smsCount * 500 // 500 VND/SMS

  return (
    <div className="space-y-6">
      <div>
        <Label>Loại người nhận</Label>
        <RadioGroup value={recipientType} onValueChange={setRecipientType}>
          <RadioGroupItem value="individual" label="Chọn cá nhân" />
          <RadioGroupItem value="village" label="Chọn thôn" />
          <RadioGroupItem value="all" label="Toàn xã" />
        </RadioGroup>
      </div>

      <RecipientSelector
        type={recipientType}
        value={recipients}
        onChange={setRecipients}
      />

      <div>
        <Label>Nội dung tin nhắn</Label>
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Nhập nội dung tin nhắn..."
          rows={4}
        />
        <div className="text-sm text-gray-500 mt-1">
          {charCount}/160 ký tự • {smsCount} tin nhắn
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between text-sm">
          <span>Số người nhận:</span>
          <span className="font-medium">{recipients.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Chi phí ước tính:</span>
          <span className="font-medium">{estimatedCost.toLocaleString('vi-VN')} VND</span>
        </div>
      </div>

      <Button
        onClick={() => sendMutation.mutate({ phones: recipients, content })}
        disabled={!content || recipients.length === 0 || sendMutation.isPending}
      >
        {sendMutation.isPending ? 'Đang gửi...' : `Gửi tin nhắn (${recipients.length})`}
      </Button>
    </div>
  )
}
```

### 6. Create RecipientSelector Component (1.5h)
```typescript
// src/components/messages/recipient-selector.tsx
export function RecipientSelector({ type, value, onChange }: Props) {
  const { data: villages } = useVillages()

  if (type === 'individual') {
    return (
      <div>
        <Label>Số điện thoại (mỗi số một dòng)</Label>
        <Textarea
          value={value.join('\n')}
          onChange={e => onChange(e.target.value.split('\n').filter(Boolean))}
          placeholder="0912345678"
          rows={5}
        />
      </div>
    )
  }

  if (type === 'village') {
    return (
      <div>
        <Label>Chọn thôn</Label>
        <Select multiple value={value} onChange={onChange}>
          {villages?.map(v => (
            <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
          ))}
        </Select>
      </div>
    )
  }

  // type === 'all'
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-sm text-yellow-700">
        Tin nhắn sẽ được gửi đến tất cả chủ hộ trong xã
      </p>
    </div>
  )
}
```

### 7. Create MessageHistory Component (1.5h)
Table with filters, search, pagination.

### 8. Configure Background Sync (1h)
```typescript
// vite.config.ts - Update PWA config
workbox: {
  runtimeCaching: [
    {
      urlPattern: /\/api\/sms\/.*/,
      method: 'POST',
      handler: 'NetworkOnly',
      options: {
        backgroundSync: {
          name: 'sms-queue',
          options: { maxRetentionTime: 24 * 60 }
        }
      }
    }
  ]
}
```

### 9. Create useSendSMS Hook (1h)
With offline detection and queue feedback.

---

## Todo List
- [ ] Create SMS base classes
- [ ] Implement eSMS provider
- [ ] Implement VNPT provider (stub)
- [ ] Implement Stringee provider (stub)
- [ ] Create SMSService with fallback
- [ ] Create FastAPI SMS router
- [ ] Add SMS router to api-server.py
- [ ] Create MessageComposer component
- [ ] Create RecipientSelector component
- [ ] Create MessageHistory component
- [ ] Configure Background Sync
- [ ] Create useSendSMS hook
- [ ] Create MessagesPage
- [ ] Test single SMS send
- [ ] Test bulk SMS send
- [ ] Test offline queueing

---

## Success Criteria
- [ ] Single SMS sends and logs
- [ ] Bulk SMS works for 100+ recipients
- [ ] Delivery status updates via webhook
- [ ] Offline SMS queues and sends when online
- [ ] Message history displays correctly
- [ ] Cost estimate shows before send

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Brandname not approved | Critical | Use OTP type temporarily, expedite registration |
| Provider API changes | Medium | Abstract interface, easy swap |
| High costs | Medium | Show confirmation, daily limits |

---

## Security Considerations
- **SMS endpoints restricted to commune_admin role only** (Validated Decision)
- Rate limit SMS endpoints (prevent abuse)
- Validate phone format
- Filter prohibited content
- Secure API keys in env vars
- Log all SMS for audit

### Role-Based Access Control for SMS
```python
# src/api/sms-router.py - Add role check dependency
from fastapi import Depends, HTTPException, status
from firebase_admin import auth

async def require_admin(authorization: str = Header(None)):
    """Verify user is commune_admin before allowing SMS operations."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization")

    token = authorization.split(" ")[1]
    try:
        decoded = auth.verify_id_token(token)
        # Fetch user role from Firestore
        user_doc = db.collection("users").document(decoded["uid"]).get()
        if not user_doc.exists or user_doc.to_dict().get("role") != "commune_admin":
            raise HTTPException(status_code=403, detail="SMS feature requires commune_admin role")
        return decoded
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

# Apply to all SMS routes
@router.post("/send", dependencies=[Depends(require_admin)])
async def send_sms(request: SendSMSRequest):
    # ... existing code

@router.post("/bulk", dependencies=[Depends(require_admin)])
async def send_bulk_sms(request: BulkSMSRequest):
    # ... existing code
```

---

## Unresolved Questions
1. Brandname registration status with MIC?
2. Which provider to use as primary (cost vs reliability)?
3. Daily/monthly SMS budget limit?
4. ~~Should village leaders be able to send SMS?~~ → **Resolved: No, commune admin only**

---

## Next Steps
After completion:
1. → Phase 07: Task Assignment Module
2. Complete brandname registration
3. Set up billing alerts with provider
