import re
import logging
import asyncio
import httpx
import feedparser
from datetime import datetime
from backend.models.schemas import NewsArticle

logger = logging.getLogger(__name__)

class ETIngestionError(Exception):
    """Custom exception for ET RSS feed ingestion failures."""
    pass

async def fetch_et_articles(rss_url: str, max_articles: int = 30) -> list[NewsArticle]:
    """
    Fetch articles from the Economic Times RSS feed.
    Uses feedparser to parse the RSS XML, and has an httpx async fallback if feedparser fails to fetch.
    """
    parsed_feed = feedparser.parse(rss_url)
    
    # Check if feedparser failed or returned 0 entries
    if not parsed_feed.entries or parsed_feed.bozo:
        logger.warning("feedparser failed or returned 0 entries. Attempting httpx fallback.")
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(rss_url, timeout=10.0)
                response.raise_for_status()
                parsed_feed = feedparser.parse(response.content)
        except Exception as e:
            logger.error(f"HTTPX fallback failed: {e}")
            raise ETIngestionError("ET RSS fetch failed — check URL or network")
            
    if not parsed_feed.entries:
        raise ETIngestionError("ET RSS fetch failed — check URL or network")
        
    articles = []
    
    for entry in parsed_feed.entries[:max_articles]:
        title = entry.get('title', '')
        logger.debug(f"Parsing article: {title}")
        
        # Strip HTML tags from summary
        summary_raw = entry.get('summary', '')
        summary = re.sub(r'<[^>]+>', '', summary_raw).strip()
        
        url = entry.get('link', '')
        
        # Parse published_parsed to ISO string
        published_at = ''
        if 'published_parsed' in entry and entry.published_parsed:
            published_at = datetime(*entry.published_parsed[:6]).isoformat()
            
        article = NewsArticle(
            title=title,
            summary=summary,
            source="Economic Times",
            published_at=published_at,
            url=url
        )
        articles.append(article)
        
    return articles
