from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.common import success_response
from src.api.deps import get_db
from src.models import crud

router = APIRouter(prefix="/data-channels", tags=["data-channels"])


class ChannelCreate(BaseModel):
    name: str
    provider: str
    endpoint: str | None = None
    headers: dict = {}
    timeout: int = 30
    proxy_url: str | None = None
    is_active: int = 1


class ChannelUpdate(BaseModel):
    name: str | None = None
    provider: str | None = None
    endpoint: str | None = None
    headers: dict | None = None
    timeout: int | None = None
    proxy_url: str | None = None
    is_active: int | None = None


@router.get("")
async def list_channels(db: Session = Depends(get_db)):
    channels = crud.get_data_channels(db)
    return success_response(
        data=[
            {
                "id": c.id,
                "name": c.name,
                "provider": c.provider,
                "endpoint": c.endpoint,
                "headers": c.headers,
                "timeout": c.timeout,
                "proxyUrl": c.proxy_url,
                "isActive": c.is_active,
                "createdAt": c.created_at.isoformat() if c.created_at else None,
            }
            for c in channels
        ]
    )


@router.post("")
async def create_channel(req: ChannelCreate, db: Session = Depends(get_db)):
    channel = crud.create_data_channel(db, **req.model_dump())
    return success_response(data={"id": channel.id})


@router.put("/{channel_id}")
async def update_channel(channel_id: int, req: ChannelUpdate, db: Session = Depends(get_db)):
    channel = crud.update_data_channel(db, channel_id, **req.model_dump(exclude_unset=True))
    if not channel:
        raise HTTPException(status_code=404, detail="渠道不存在")
    return success_response(data={"id": channel.id})


@router.delete("/{channel_id}")
async def delete_channel(channel_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_data_channel(db, channel_id)
    if not ok:
        raise HTTPException(status_code=404, detail="渠道不存在")
    return success_response()
