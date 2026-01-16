"""
FastAPI backend for Diên Sanh chatbot.
Provides RAG-powered chat endpoint using api.ai4u.now.
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from openai import OpenAI
from pydantic import BaseModel

# Determine base directory
BASE_DIR = Path(__file__).parent.parent.parent if '__file__' in dir() else Path.cwd()

# Add src to path for imports
sys.path.insert(0, str(BASE_DIR / "src"))

from config import settings

# Import vector store (will be loaded lazily)
vector_store = None

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Diên Sanh Chatbot API",
    description="RAG-powered chatbot for Diên Sanh commune public services",
    version="1.0.0"
)

# CORS configuration for widget embedding
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_vector_store():
    """Lazy-load vector store."""
    global vector_store
    if vector_store is None:
        # Import from parent directory
        import importlib.util
        vs_path = BASE_DIR / "src" / "vector-store.py"
        spec = importlib.util.spec_from_file_location("vector_store", vs_path)
        vs_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(vs_module)
        vector_store = vs_module.VectorStore(persist_dir=str(BASE_DIR / "data" / "vector_store"))
    return vector_store


def get_llm_client() -> OpenAI:
    """Get OpenAI-compatible client for api.ai4u.now."""
    api_key = settings.ai4u_api_key or os.getenv("AI4U_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="AI4U API key not configured. Set AI4U_API_KEY environment variable."
        )

    return OpenAI(
        base_url=settings.ai4u_base_url,
        api_key=api_key
    )


# Request/Response models
class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None
    include_sources: bool = True


class ChatResponse(BaseModel):
    response: str
    sources: list[dict] | None = None
    conversation_id: str | None = None


class HealthResponse(BaseModel):
    status: str
    documents_indexed: int
    model: str


# System prompt for the chatbot
SYSTEM_PROMPT = """Bạn là trợ lý ảo của UBND xã Diên Sanh, tỉnh Quảng Trị.
Nhiệm vụ của bạn là hỗ trợ người dân tìm hiểu thông tin về:
- Các thủ tục hành chính công (đăng ký khai sinh, kết hôn, cấp giấy tờ, v.v.)
- Thông tin về UBND xã và các cơ quan liên quan
- Hướng dẫn quy trình, hồ sơ cần thiết, thời gian xử lý, phí/lệ phí

Quy tắc trả lời:
1. Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu
2. Chỉ trả lời dựa trên thông tin được cung cấp trong ngữ cảnh
3. Nếu không có thông tin, nói rõ và hướng dẫn liên hệ UBND xã
4. Cung cấp thông tin liên hệ khi cần: Điện thoại, địa chỉ, email (nếu có trong ngữ cảnh)
5. Nếu thủ tục có bước thực hiện, liệt kê rõ ràng từng bước

Luôn thân thiện và sẵn sàng hỗ trợ người dân."""


def build_context(query: str, n_results: int = 5) -> str:
    """Retrieve relevant context from vector store."""
    try:
        store = get_vector_store()
        results = store.search(query, n_results=n_results)

        if not results:
            return "Không tìm thấy thông tin liên quan trong cơ sở dữ liệu."

        context_parts = []
        for i, r in enumerate(results, 1):
            title = r["metadata"].get("title", "Không có tiêu đề")
            source = r["metadata"].get("source", "unknown")
            content = r["content"][:1500]  # Limit content length

            context_parts.append(f"[{i}] {title}\n(Nguồn: {source})\n{content}")

        return "\n\n---\n\n".join(context_parts)

    except Exception as e:
        print(f"Error retrieving context: {e}")
        return ""


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    try:
        store = get_vector_store()
        doc_count = store.count()
    except:
        doc_count = 0

    return HealthResponse(
        status="healthy",
        documents_indexed=doc_count,
        model=settings.chat_model
    )


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint.
    Uses RAG to retrieve relevant context and generate response.
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Retrieve relevant context
    context = build_context(request.message)

    # Build messages for LLM
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"""Ngữ cảnh (thông tin từ cơ sở dữ liệu):
---
{context}
---

Câu hỏi của người dân: {request.message}

Hãy trả lời câu hỏi dựa trên ngữ cảnh trên."""
        }
    ]

    # Call LLM
    try:
        client = get_llm_client()
        response = client.chat.completions.create(
            model=settings.chat_model,
            messages=messages,
            temperature=0.3,  # Lower for more factual responses
            max_tokens=1024
        )

        answer = response.choices[0].message.content

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

    # Prepare sources if requested
    sources = None
    if request.include_sources:
        try:
            store = get_vector_store()
            results = store.search(request.message, n_results=3)
            sources = [
                {
                    "title": r["metadata"].get("title", ""),
                    "url": r["metadata"].get("url", ""),
                    "score": r["score"]
                }
                for r in results
            ]
        except:
            sources = []

    return ChatResponse(
        response=answer,
        sources=sources,
        conversation_id=request.conversation_id
    )


@app.get("/", response_class=HTMLResponse)
async def root():
    """Simple test page."""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Diên Sanh Chatbot API</title>
        <style>
            body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
            h1 { color: #1a5f2a; }
            .status { background: #e8f5e9; padding: 15px; border-radius: 8px; }
        </style>
    </head>
    <body>
        <h1>🏛️ Trợ lý ảo UBND xã Diên Sanh</h1>
        <div class="status">
            <p>✅ API đang hoạt động</p>
            <p>📖 Xem tài liệu API: <a href="/docs">/docs</a></p>
            <p>🔧 Health check: <a href="/health">/health</a></p>
        </div>
    </body>
    </html>
    """


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api-server:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True
    )
