import logging
import time
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware

from backend.routers.news import router as news_router
from backend.routers.audio import router as audio_router
from backend.routers.analysis import router as analysis_router
from backend.middleware.error_handler import global_exception_handler
from backend.utils.response_utils import success

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("PlungePhoenix backend started")
    yield
    logger.info("PlungePhoenix backend shutting down")

app = FastAPI(
    title="PlungePhoenix API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Request logging middleware
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.4f}s")
        return response

app.add_middleware(RequestLoggingMiddleware)

# Attach Exception Handlers
app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(RequestValidationError, global_exception_handler)


# Mount routers
app.include_router(audio_router, prefix="/api/audio")
app.include_router(news_router, prefix="/api/news")
app.include_router(analysis_router, prefix="/api/analysis")

@app.get("/health")
def health_check():
    return success({"status": "ok", "version": "1.0.0"})

@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str):
    return {"ok": True}

@app.get("/api/docs-summary", response_class=PlainTextResponse)
def docs_summary():
    return """
PlungePhoenix API Summary
=========================

HEALTH
- GET /health

NEWS
- POST /api/news/ingest : Fetch ET RSS, ingest to ChromaDB
- GET /api/news/latest : Return last 10 articles
- GET /api/news/search?query=&top_k= : RAG search

AUDIO & PANIC
- POST /api/audio/transcribe (multipart file) : Upload audio, transcribe, score
- POST /api/audio/transcribe-url (JSON {url}) : Transcribe from public URL
- POST /api/audio/score-text (JSON {text}) : Score raw text instantly
- WS   /api/audio/ws-panic : WebSocket for real-time text chunks

ANALYSIS
- POST /api/analysis/analyze (JSON {transcript, panic_score, top_k_news}) : RAG + LLM analysis
- POST /api/analysis/full-pipeline (JSON {text}) : Primary endpoint: Panic + RAG + LLM
- GET /api/analysis/demo : Run full pipeline on hardcoded text
""".strip()

# React frontend. In development run Vite from /frontend; after `npm run build`,
# FastAPI serves the compiled SPA from /frontend/dist.
project_root = Path(__file__).resolve().parents[1]
frontend_dist = project_root / "frontend" / "dist"
frontend_source = project_root / "frontend"
frontend_dir = frontend_dist if frontend_dist.exists() else frontend_source
app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")
