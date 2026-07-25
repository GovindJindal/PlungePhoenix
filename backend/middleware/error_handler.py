import logging
import traceback
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

logger = logging.getLogger(__name__)

async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global exception handler for all unhandled exceptions.
    Returns consistent error schema: 
    {
        "success": false, 
        "error": {"code": str, "message": str, "details": Any, "retryable": bool}
    }
    """
    request_id = getattr(request.state, "request_id", "unknown")
    
    if isinstance(exc, HTTPException):
        logger.warning(f"[{request_id}] HTTP {exc.status_code}: {exc.detail}")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": f"HTTP_{exc.status_code}",
                    "message": str(exc.detail),
                    "details": None,
                    "retryable": exc.status_code in [408, 429, 502, 503, 504]
                }
            }
        )
    
    if isinstance(exc, RequestValidationError):
        logger.warning(f"[{request_id}] Validation Error: {exc.errors()}")
        details = [{"loc": err["loc"], "msg": err["msg"], "type": err["type"]} for err in exc.errors()]
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Invalid request parameters.",
                    "details": details,
                    "retryable": False
                }
            }
        )
        
    # Unhandled 500 exceptions
    logger.error(f"[{request_id}] Unhandled Exception: {exc}")
    logger.error(f"[{request_id}] {traceback.format_exc()}")
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred on the server.",
                "details": str(exc),
                "retryable": True
            }
        }
    )
