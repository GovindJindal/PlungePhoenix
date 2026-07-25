import logging
import chromadb
from chromadb.config import Settings
from backend.config import config
from backend.models.schemas import NewsArticle

logger = logging.getLogger(__name__)

class RAGEmptyError(Exception):
    """Custom exception raised when the ChromaDB collection is empty."""
    pass

# Initialize the persistent ChromaDB client
chroma_client = chromadb.PersistentClient(path=config.CHROMA_PERSIST_DIR)

def get_collection():
    """Get or create the plungephoenix_news collection."""
    # ChromaDB uses all-MiniLM-L6-v2 by default for embeddings
    return chroma_client.get_or_create_collection(name="plungephoenix_news")

def ingest_articles(articles: list[NewsArticle]) -> int:
    """
    Ingest a list of NewsArticle objects into ChromaDB.
    Combines title + summary as the document text.
    Deduplicates based on the article URL.
    Returns the count of newly inserted documents.
    """
    collection = get_collection()
    
    if not articles:
        return 0
        
    new_docs_count = 0
    
    for article in articles:
        doc_id = article.url
        
        # Check if doc_id already exists to prevent duplicate inserts
        # collection.get() returns a dict with 'ids'
        existing = collection.get(ids=[doc_id])
        if existing and existing['ids']:
            continue
            
        text = f"{article.title}\n{article.summary}"
        
        metadata = {
            "title": article.title,
            "source": article.source,
            "published_at": article.published_at,
            "url": article.url
        }
        
        # Add to collection
        collection.add(
            documents=[text],
            metadatas=[metadata],
            ids=[doc_id]
        )
        new_docs_count += 1
        
    logger.info(f"Ingested {new_docs_count} new articles into ChromaDB.")
    return new_docs_count

def retrieve_relevant_chunks(query: str, top_k: int = 5) -> list[dict]:
    """
    Query the ChromaDB collection for the given text.
    Returns a list of dicts: {text, title, url, published_at, distance}
    """
    collection = get_collection()
    
    if collection.count() == 0:
        raise RAGEmptyError("No articles in DB yet — run /api/news/ingest first")
        
    results = collection.query(
        query_texts=[query],
        n_results=min(top_k, collection.count())
    )
    
    retrieved = []
    ids_list = results.get('ids')
    docs_list = results.get('documents')
    metas_list = results.get('metadatas')
    dists_list = results.get('distances')
    
    if ids_list and len(ids_list) > 0 and ids_list[0]:
        for i in range(len(ids_list[0])):
            doc_text = docs_list[0][i] if docs_list and len(docs_list) > 0 and docs_list[0] else ""
            metadata = metas_list[0][i] if metas_list and len(metas_list) > 0 and metas_list[0] else {}
            distance = dists_list[0][i] if dists_list and len(dists_list) > 0 and dists_list[0] else 0.0
            
            retrieved.append({
                "text": doc_text,
                "title": metadata.get("title", ""),
                "url": metadata.get("url", ""),
                "published_at": metadata.get("published_at", ""),
                "distance": distance
            })
            
    return retrieved
