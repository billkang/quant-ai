from datetime import datetime

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.common import success_response
from src.api.deps import get_db
from src.models import crud
from src.services.system_log_service import system_log_service

router = APIRouter(prefix="/system-logs", tags=["system-logs"])


class SystemLogCreate(BaseModel):
    level: str = "INFO"
    category: str = "general"
    message: str
    details: dict | None = None
    source: str | None = None


class SystemLogBatchDelete(BaseModel):
    ids: list[int]


@router.get("")
async def list_system_logs(
    level: str | None = Query(None),
    category: str | None = Query(None),
    source: str | None = Query(None),
    start_time: datetime | None = Query(None),
    end_time: datetime | None = Query(None),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    items, total = system_log_service.get_logs(
        db, level, category, source, start_time, end_time, limit, offset
    )
    return success_response(
        {
            "items": [
                {
                    "id": item.id,
                    "level": item.level,
                    "category": item.category,
                    "message": item.message,
                    "details": item.details,
                    "source": item.source,
                    "createdAt": item.created_at.isoformat() if item.created_at else None,
                }
                for item in items
            ],
            "total": total,
            "limit": limit,
            "offset": offset,
        }
    )


@router.post("")
async def create_system_log(data: SystemLogCreate, db: Session = Depends(get_db)):
    log = system_log_service.log(
        db,
        level=data.level,
        category=data.category,
        message=data.message,
        details=data.details,
        source=data.source,
    )
    return success_response(
        {
            "id": log.id,
            "level": log.level,
            "category": log.category,
            "message": log.message,
            "createdAt": log.created_at.isoformat() if log.created_at else None,
        }
    )


@router.delete("")
async def delete_system_logs(
    before_days: int | None = Query(None, ge=1),
    ids: list[int] | None = Query(None),
    db: Session = Depends(get_db),
):
    if before_days:
        count = system_log_service.cleanup_old_logs(db, before_days)
        return success_response({"deleted": count})
    if ids:
        count = crud.delete_system_logs_by_ids(db, ids)
        return success_response({"deleted": count})
    return success_response({"deleted": 0}, message="No deletion criteria provided")


@router.get("/stats")
async def get_system_log_stats(
    hours: int = Query(24, ge=1, le=168),
    db: Session = Depends(get_db),
):
    stats = system_log_service.get_stats(db, hours)
    return success_response(stats)
