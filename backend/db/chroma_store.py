"""
chroma_store.py — ChromaDB client singleton for PlungePhoenix.

We use a module-level singleton to avoid re-initializing the persistent
client on every import. ChromaDB's PersistentClient is thread-safe and
designed to be shared across coroutines.
"""

import logging

import chromadb
from chromadb.config import Settings as ChromaSettings

from chromadb.api import ClientAPI
from backend.config import config

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Singleton client — initialized once when the module is first imported
# ---------------------------------------------------------------------------

_chroma_client: ClientAPI | None = None


def get_chroma_client() -> ClientAPI:
    """
    Return the shared ChromaDB persistent client.
    Creates it on first call; subsequent calls return the cached instance.

    Why PersistentClient?
    - Survives FastAPI restarts (data on disk in CHROMA_PERSIST_DIR)
    - No external Chroma server required for single-node deployments
    - Trivially swappable to HttpClient for distributed setups
    """
    global _chroma_client

    if _chroma_client is None:
        logger.info(
            "Initialising ChromaDB PersistentClient at '%s'",
            config.CHROMA_PERSIST_DIR,
        )
        _chroma_client = chromadb.PersistentClient(
            path=config.CHROMA_PERSIST_DIR,
            settings=ChromaSettings(
                anonymized_telemetry=False,  # disable usage telemetry in prod
                allow_reset=True,            # allows test teardown; restrict in prod
            ),
        )
        logger.info("ChromaDB client ready")

    return _chroma_client


def get_or_create_collection(
    collection_name: str | None = None,
) -> chromadb.Collection:
    """
    Return the named collection, creating it if it does not exist.
    Uses cosine similarity — appropriate for text embedding spaces.
    """
    client = get_chroma_client()
    name = collection_name or "plungephoenix_news"

    collection = client.get_or_create_collection(
        name=name,
        metadata={"hnsw:space": "cosine"},  # cosine distance for text embeddings
    )
    logger.debug("Using ChromaDB collection '%s'", name)
    return collection


def reset_collection(collection_name: str | None = None) -> None:
    """
    Delete and recreate the collection. Used in tests / re-ingestion flows.
    WARNING: This permanently deletes all stored vectors.
    """
    client = get_chroma_client()
    name = collection_name or "plungephoenix_news"
    logger.warning("Resetting ChromaDB collection '%s' — all data will be lost!", name)
    client.delete_collection(name)
    get_or_create_collection(name)
