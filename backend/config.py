import logging
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

class Config:
    ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY")
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    LLM_MODEL = os.getenv("LLM_MODEL", "anthropic/claude-sonnet-4-5")
    CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
    ET_RSS_URL = os.getenv("ET_RSS_URL", "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms")
    
    try:
        PANIC_THRESHOLD = float(os.getenv("PANIC_THRESHOLD", "0.6"))
    except ValueError:
        PANIC_THRESHOLD = 0.6
        
    try:
        PORT = int(os.getenv("PORT", "8000"))
    except ValueError:
        PORT = 8000

    @classmethod
    def validate(cls):
        """Require LLM credentials; AssemblyAI is optional until transcription is used."""
        missing_keys = []
        if not cls.OPENROUTER_API_KEY:
            missing_keys.append("OPENROUTER_API_KEY")

        if missing_keys:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_keys)}")

        if not cls.ASSEMBLYAI_API_KEY:
            logger.warning(
                "ASSEMBLYAI_API_KEY is not set — POST /api/audio/transcribe will fail until it is configured."
            )

# Validate config on import
Config.validate()
config = Config()
