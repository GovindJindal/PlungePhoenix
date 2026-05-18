import time
from typing import Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Response

from backend.models.schemas import AnalysisRequest, AnalysisResult, TranscriptResult, PanicScore
from backend.services.rag_engine import retrieve_relevant_chunks, RAGEmptyError
from backend.services.llm_analyzer import analyze, LLMParseError
from backend.services.panic_scorer import score_panic
from backend.utils.response_utils import success

router = APIRouter()

class FullPipelineRequest(BaseModel):
    text: str

@router.post("/analyze")
async def perform_analysis(request: AnalysisRequest, response: Response) -> Dict[str, Any]:
    """
    Generate an investment analysis using provided transcript, panic score, and news chunks.
    """
    start_time = time.time()
    try:
        news_chunks = []
        try:
            news_chunks = retrieve_relevant_chunks(request.transcript, request.top_k_news)
        except RAGEmptyError:
            pass 
            
        analysis_result = await analyze(request, news_chunks)
        
        process_time = time.time() - start_time
        response.headers["X-Response-Time"] = f"{process_time:.4f}s"
        
        data = {
            "analysis": analysis_result.model_dump(),
            "news_used": news_chunks,
            "panic_score": request.panic_score
        }
        return success(data, "Analysis complete")
    except LLMParseError as e:
        raise HTTPException(status_code=502, detail={"error": str(e), "raw_response": e.raw_response})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/full-pipeline")
async def full_pipeline(req: FullPipelineRequest, response: Response) -> Dict[str, Any]:
    """
    Primary Endpoint: Run panic scoring + RAG retrieval + LLM analysis in one shot.
    """
    start_time = time.time()
    try:
        panic = score_panic(req.text)
        
        transcript_result = TranscriptResult(
            text=req.text,
            duration_seconds=0.0, 
            panic=panic
        )
        
        news_chunks = []
        try:
            news_chunks = retrieve_relevant_chunks(req.text, 5)
        except RAGEmptyError:
            pass
            
        analysis_req = AnalysisRequest(
            transcript=req.text,
            panic_score=panic.score,
            top_k_news=5
        )
        
        analysis_result = await analyze(analysis_req, news_chunks)
        
        process_time = time.time() - start_time
        response.headers["X-Response-Time"] = f"{process_time:.4f}s"
        
        data = {
            "transcript_result": transcript_result.model_dump(),
            "analysis": analysis_result.model_dump(),
            "news_used": news_chunks
        }
        return success(data, "Full pipeline complete")
    except LLMParseError as e:
        raise HTTPException(status_code=502, detail={"error": str(e), "raw_response": e.raw_response})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/demo")
async def demo_pipeline(response: Response) -> Dict[str, Any]:
    """
    Runs the full pipeline with a hardcoded demo transcript.
    """
    demo_text = "Markets are crashing today. Sensex down 1500 points. IT stocks in freefall. FIIs pulling out money. Complete selloff panic everywhere."
    
    req = FullPipelineRequest(text=demo_text)
    return await full_pipeline(req, response)
