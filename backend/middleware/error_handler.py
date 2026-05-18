import logging
import traceback
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

logger = logging.getLogger(__name__)

async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global exception handler for all unhandled exceptions.
    Returns consistent error schema: {"error": str, "detail": str, "code": int}
    """
    if isinstance(exc, HTTPException):
        # Pass through cleanly
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": "HTTP Exception", "detail": str(exc.detail), "code": exc.status_code}
        )
    
    if isinstance(exc, RequestValidationError):
        # Field-level details
        details = [{"loc": err["loc"], "msg": err["msg"], "type": err["type"]} for err in exc.errors()]
        return JSONResponse(
            status_code=422,
            content={"error": "Validation Error", "detail": details, "code": 422}
        )
        
    # Unhandled 500 exceptions
    logger.error(f"Unhandled Exception: {exc}")
    logger.error(traceback.format_exc())
    
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "detail": "An unexpected error occurred.", "code": 500}
    )
