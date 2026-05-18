import os
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Dict, Any

from backend.models.schemas import TranscriptResult, PanicScore
from backend.services.transcriber import transcribe_audio, transcribe_from_url, TranscriptionError
from backend.services.panic_scorer import score_panic
from backend.utils.response_utils import success

router = APIRouter()

ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".webm", ".ogg", ".flac"}

CONTENT_TYPE_TO_EXT = {
    "audio/webm": ".webm",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/wave": ".wav",
    "audio/mpeg": ".mp3",
    "audio/mp3": ".mp3",
    "audio/mp4": ".m4a",
    "audio/x-m4a": ".m4a",
    "audio/m4a": ".m4a",
    "audio/ogg": ".ogg",
    "audio/flac": ".flac",
    "application/ogg": ".ogg",
}

class UrlRequest(BaseModel):
    url: str

class TextRequest(BaseModel):
    text: str

@router.post("/transcribe")
async def transcribe_audio_file(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Upload an audio file, transcribe it, and calculate the panic score.
    """
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS and file.content_type:
        ct = file.content_type.split(";")[0].strip().lower()
        ext = CONTENT_TYPE_TO_EXT.get(ct, ext)
    if ext not in ALLOWED_EXTENSIONS and file.content_type:
        ct_base = file.content_type.split(";")[0].strip().lower()
        if ct_base.startswith("audio/"):
            ext = ".webm"
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type ({file.filename!r}, {file.content_type!r}). Allowed extensions: {sorted(ALLOWED_EXTENSIONS)}",
        )
        
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
            
        transcription_data = await transcribe_audio(temp_path)
        panic = score_panic(transcription_data["text"])
        
        data = TranscriptResult(
            text=transcription_data["text"],
            duration_seconds=transcription_data["duration"],
            panic=panic
        ).model_dump()
        return success(data, "Audio transcribed and scored")
    except TranscriptionError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

@router.post("/transcribe-url")
async def transcribe_public_url(req: UrlRequest) -> Dict[str, Any]:
    """
    Transcribe audio from a public URL and calculate the panic score.
    """
    try:
        transcription_data = await transcribe_from_url(req.url)
        panic = score_panic(transcription_data["text"])
        
        data = TranscriptResult(
            text=transcription_data["text"],
            duration_seconds=transcription_data["duration"],
            panic=panic
        ).model_dump()
        return success(data, "URL transcribed and scored")
    except TranscriptionError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.post("/score-text")
async def score_raw_text(req: TextRequest) -> Dict[str, Any]:
    """
    Score raw text for panic instantly.
    """
    data = score_panic(req.text).model_dump()
    return success(data, "Text scored")

@router.websocket("/ws-panic")
async def websocket_panic_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time panic scoring.
    """
    await websocket.accept()
    try:
        while True:
            text = await websocket.receive_text()
            panic = score_panic(text)
            await websocket.send_json(success(panic.model_dump(), "Realtime score"))
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.close(code=1011, reason=str(e))
        except Exception:
            pass
