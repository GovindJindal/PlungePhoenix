from fastapi.responses import JSONResponse
from typing import Any

def success(data: Any, message: str = "ok") -> dict:
    """
    Standardize successful API responses.
    """
    return {
        "success": True,
        "message": message,
        "data": data
    }

def error(message: str, code: int = 400) -> JSONResponse:
    """
    Standardize API error responses (for cases not caught by global_exception_handler).
    """
    return JSONResponse(
        status_code=code,
        content={"success": False, "error": message}
    )
