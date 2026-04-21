from typing import Any

from fastapi import HTTPException


def success_response(data: Any = None, message: str = "ok") -> dict:
    return {"code": 0, "data": data, "message": message}


def error_response(message: str, code: int = 1, data: Any = None) -> dict:
    return {"code": code, "data": data, "message": message}


class APIException(HTTPException):
    def __init__(self, message: str, status_code: int = 400, code: int = 1):
        self.code = code
        super().__init__(status_code=status_code, detail=message)
