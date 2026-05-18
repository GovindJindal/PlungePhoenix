from typing import List, Dict, Any
from pydantic import BaseModel, Field

class PanicScore(BaseModel):
    score: float = Field(..., ge=0.0, le=1.0, description="Panic score between 0 and 1")
    level: str = Field(..., description="low/medium/high/extreme")
    keywords_found: List[str] = Field(default_factory=list)

class TranscriptResult(BaseModel):
    text: str
    duration_seconds: float
    panic: PanicScore

class NewsArticle(BaseModel):
    title: str
    summary: str
    source: str
    published_at: str
    url: str

class RecommendationItem(BaseModel):
    action: str
    asset: str
    reasoning: str

class AnalysisResult(BaseModel):
    summary: str
    sector_impact: List[Dict[str, Any]]
    risk_level: str
    recommendations: List[RecommendationItem]
    panic_context: str

class AnalysisRequest(BaseModel):
    transcript: str
    panic_score: float
    top_k_news: int = 5
