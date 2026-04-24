"""Channel management APIs for external data collection channels."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.common import success_response
from src.models import models
from src.models.database import get_db

router = APIRouter(prefix="/channels", tags=["channels"])


class ChannelCreate(BaseModel):
    name: str
    source_type: str
    scope: str = "individual"
    config: dict[str, Any] = {}
    schedule: str = "0 */6 * * *"
    category: str = "stock_info"
    enabled: int = 1


class ChannelUpdate(BaseModel):
    name: str | None = None
    source_type: str | None = None
    scope: str | None = None
    config: dict[str, Any] | None = None
    schedule: str | None = None
    category: str | None = None
    enabled: int | None = None


@router.get("")
async def list_channels(
    category: str | None = None,
    enabled: int | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.EventSource).filter(models.EventSource.is_builtin == 0)
    if category:
        query = query.filter(models.EventSource.category == category)
    if enabled is not None:
        query = query.filter(models.EventSource.enabled == enabled)
    channels = query.order_by(models.EventSource.created_at.desc()).all()
    return success_response(
        data=[
            {
                "id": c.id,
                "name": c.name,
                "source_type": c.source_type,
                "scope": c.scope,
                "config": c.config,
                "schedule": c.schedule,
                "category": c.category,
                "enabled": c.enabled,
                "last_fetched_at": c.last_fetched_at.isoformat() if c.last_fetched_at else None,
                "last_error": c.last_error,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "updated_at": c.updated_at.isoformat() if c.updated_at else None,
            }
            for c in channels
        ]
    )


@router.post("")
async def create_channel(req: ChannelCreate, db: Session = Depends(get_db)):
    channel = models.EventSource(**req.model_dump(), is_builtin=0)
    db.add(channel)
    db.commit()
    db.refresh(channel)
    return success_response(data={"id": channel.id})


@router.put("/{channel_id}")
async def update_channel(channel_id: int, req: ChannelUpdate, db: Session = Depends(get_db)):
    channel = (
        db.query(models.EventSource)
        .filter(models.EventSource.id == channel_id, models.EventSource.is_builtin == 0)
        .first()
    )
    if not channel:
        raise HTTPException(status_code=404, detail="渠道不存在")
    for key, value in req.model_dump(exclude_unset=True).items():
        setattr(channel, key, value)
    db.commit()
    db.refresh(channel)
    return success_response(data={"id": channel.id})


@router.delete("/{channel_id}")
async def delete_channel(channel_id: int, db: Session = Depends(get_db)):
    channel = (
        db.query(models.EventSource)
        .filter(models.EventSource.id == channel_id, models.EventSource.is_builtin == 0)
        .first()
    )
    if not channel:
        raise HTTPException(status_code=404, detail="渠道不存在")
    db.delete(channel)
    db.commit()
    return success_response()
