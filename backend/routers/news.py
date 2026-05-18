import logging
from typing import Dict, Any, List
from fastapi import APIRouter, BackgroundTasks, HTTPException, Query
from backend.models.schemas import NewsArticle
from backend.config import config
from backend.services.news_ingester import fetch_et_articles, ETIngestionError
from backend.services.rag_engine import ingest_articles, retrieve_relevant_chunks, RAGEmptyError, get_collection
from backend.utils.response_utils import success

logger = logging.getLogger(__name__)

router = APIRouter()

async def background_ingest_task(rss_url: str):
    """Background task to fetch and ingest articles."""
    try:
        articles = await fetch_et_articles(rss_url)
        ingested = ingest_articles(articles)
        logger.info(f"Background task ingested {ingested} new articles.")
    except Exception as e:
        logger.error(f"Background ingestion failed: {e}")

@router.post("/ingest")
async def trigger_ingestion(background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """
    Fetch articles from ET RSS and ingest into ChromaDB.
    """
    try:
        articles = await fetch_et_articles(config.ET_RSS_URL)
        ingested = ingest_articles(articles)
        collection = get_collection()
        total_in_db = collection.count()
        
        background_tasks.add_task(background_ingest_task, config.ET_RSS_URL)
        
        data = {
            "ingested": ingested,
            "total_in_db": total_in_db,
            "articles": [a.model_dump() for a in articles]
        }
        return success(data, "Ingestion triggered successfully")
    except ETIngestionError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/latest")
async def get_latest_news() -> Dict[str, Any]:
    """
    Return last 10 articles from ChromaDB collection metadata.
    """
    try:
        collection = get_collection()
        count = collection.count()
        if count == 0:
            return success({"articles": []}, "No articles found")
            
        results = collection.get(limit=10) 
        
        articles = []
        if results and results.get('metadatas'):
            for meta in results['metadatas']:
                article = NewsArticle(
                    title=meta.get('title', ''),
                    summary="", 
                    source=meta.get('source', ''),
                    published_at=meta.get('published_at', ''),
                    url=meta.get('url', '')
                )
                articles.append(article.model_dump())
                
        return success({"articles": articles}, "Latest news fetched")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/search")
async def search_news(query: str = Query(..., description="Search query string"), top_k: int = Query(5, description="Number of results")) -> Dict[str, Any]:
    """
    Run RAG retrieval and return relevant chunks.
    """
    try:
        results = retrieve_relevant_chunks(query, top_k)
        return success({
            "query": query,
            "results": results
        }, "Search completed")
    except RAGEmptyError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
