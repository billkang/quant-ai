import logging

from fastapi import Request
from starlette.responses import JSONResponse

from src.api.common import APIException

logger = logging.getLogger(__name__)


def register_exception_handlers(app):
    @app.exception_handler(APIException)
    async def api_exception_handler(request: Request, exc: APIException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"code": exc.code, "data": None, "message": exc.detail},
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled exception: %s", exc)
        return JSONResponse(
            status_code=500,
            content={"code": 500, "data": None, "message": "Internal server error"},
        )
