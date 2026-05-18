import logging
import asyncio
import assemblyai as aai
from backend.config import config

logger = logging.getLogger(__name__)

class TranscriptionError(Exception):
    """Custom exception raised when AssemblyAI transcription fails."""
    pass

def _ensure_assemblyai_configured() -> None:
    if not config.ASSEMBLYAI_API_KEY:
        raise TranscriptionError(
            "ASSEMBLYAI_API_KEY is not configured. Add it to your backend .env to enable transcription."
        )
    aai.settings.api_key = config.ASSEMBLYAI_API_KEY

def _run_transcription(audio_url_or_path: str) -> dict:
    """Synchronous transcription execution using AssemblyAI SDK."""
    _ensure_assemblyai_configured()
    transcription_config = aai.TranscriptionConfig(
        speech_models=["universal-3-pro", "universal-2"]
    )
    transcriber = aai.Transcriber(config=transcription_config)
    transcript = transcriber.transcribe(audio_url_or_path)
    
    if transcript.status == aai.TranscriptStatus.error:
        raise TranscriptionError(transcript.error)
        
    word_count = len(transcript.words) if transcript.words else 0
    duration = transcript.audio_duration or 0.0
    
    logger.info(f"Transcription successful. Duration: {duration}s, Words: {word_count}")
    
    words_list = []
    if transcript.words:
        words_list = [
            {
                "text": w.text, 
                "start": w.start, 
                "end": w.end, 
                "confidence": w.confidence
            } for w in transcript.words
        ]
        
    return {
        "text": transcript.text or "",
        "duration": duration,
        "words": words_list
    }

async def transcribe_audio(file_path: str) -> dict:
    """
    Asynchronously transcribes a local audio file.
    Returns a dict with text, duration, and words.
    """
    return await asyncio.to_thread(_run_transcription, file_path)

async def transcribe_from_url(url: str) -> dict:
    """
    Asynchronously transcribes audio from a public URL.
    Returns a dict with text, duration, and words.
    """
    return await asyncio.to_thread(_run_transcription, url)
