"""Data channel management APIs."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.common import success_response
from src.models import crud, models
from src.models.database import get_db

router = APIRouter(prefix="/channels", tags=["channels"])


class ChannelCreate(BaseModel):
    data_source_id: int
    name: str
    collection_method: str
    endpoint: str | None = None
    headers: dict[str, Any] = {}
    timeout: int = 30
    proxy_url: str | None = None
    config: dict[str, Any] = {}
    enabled: int = 1


class ChannelUpdate(BaseModel):
    data_source_id: int | None = None
    name: str | None = None
    collection_method: str | None = None
    endpoint: str | None = None
    headers: dict[str, Any] | None = None
    timeout: int | None = None
    proxy_url: str | None = None
    config: dict[str, Any] | None = None
    enabled: int | None = None


@router.get("")
async def list_channels(
    data_source_id: int = None,
    enabled: int = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.DataChannel)
    if data_source_id is not None:
        query = query.filter(models.DataChannel.data_source_id == data_source_id)
    if enabled is not None:
        query = query.filter(models.DataChannel.enabled == enabled)
    channels = query.order_by(models.DataChannel.created_at.desc()).all()

    # Fetch associated data sources for enrichment
    source_ids = {c.data_source_id for c in channels if c.data_source_id}

    # Fetch referencing sources via source_channel_links
    all_channel_ids = {c.id for c in channels}
    link_rows = (
        db.query(models.SourceChannelLink)
        .filter(models.SourceChannelLink.channel_id.in_(all_channel_ids))
        .all()
    )
    channel_to_source_ids: dict[int, list[int]] = {}
    for row in link_rows:
        channel_to_source_ids.setdefault(row.channel_id, []).append(row.source_id)
        source_ids.add(row.source_id)

    sources = (
        {
            s.id: s
            for s in db.query(models.EventSource)
            .filter(models.EventSource.id.in_(source_ids))
            .all()
        }
        if source_ids
        else {}
    )

    return success_response(
        data=[
            {
                "id": c.id,
                "dataSourceId": c.data_source_id,
                "dataSourceName": sources.get(c.data_source_id, {}).name
                if c.data_source_id in sources
                else None,
                "referencingSourceIds": channel_to_source_ids.get(c.id, []),
                "referencingSourceNames": [
                    sources[sid].name
                    for sid in channel_to_source_ids.get(c.id, [])
                    if sid in sources
                ],
                "name": c.name,
                "collectionMethod": c.collection_method,
                "endpoint": c.endpoint,
                "headers": c.headers,
                "timeout": c.timeout,
                "proxyUrl": c.proxy_url,
                "config": c.config,
                "enabled": c.enabled,
                "createdAt": c.created_at.isoformat() if c.created_at else None,
                "updatedAt": c.updated_at.isoformat() if c.updated_at else None,
            }
            for c in channels
        ]
    )


@router.post("")
async def create_channel(req: ChannelCreate, db: Session = Depends(get_db)):
    # Verify data_source exists
    source = (
        db.query(models.EventSource).filter(models.EventSource.id == req.data_source_id).first()
    )
    if not source:
        raise HTTPException(status_code=404, detail="数据源不存在")
    channel = crud.create_data_channel(db, **req.model_dump())
    return success_response(data={"id": channel.id})


@router.put("/{channel_id}")
async def update_channel(channel_id: int, req: ChannelUpdate, db: Session = Depends(get_db)):
    if req.data_source_id is not None:
        source = (
            db.query(models.EventSource).filter(models.EventSource.id == req.data_source_id).first()
        )
        if not source:
            raise HTTPException(status_code=404, detail="数据源不存在")
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


@router.get("/{channel_id}")
async def get_channel(channel_id: int, db: Session = Depends(get_db)):
    channel = crud.get_data_channel_by_id(db, channel_id)
    if not channel:
        raise HTTPException(status_code=404, detail="渠道不存在")
    source = (
        db.query(models.EventSource).filter(models.EventSource.id == channel.data_source_id).first()
    )
    ref_source_ids = crud.get_source_ids_for_channel(db, channel_id)
    ref_sources = {
        s.id: s
        for s in db.query(models.EventSource)
        .filter(models.EventSource.id.in_(ref_source_ids))
        .all()
    }
    return success_response(
        data={
            "id": channel.id,
            "dataSourceId": channel.data_source_id,
            "dataSourceName": source.name if source else None,
            "referencingSourceIds": ref_source_ids,
            "referencingSourceNames": [
                ref_sources[sid].name for sid in ref_source_ids if sid in ref_sources
            ],
            "name": channel.name,
            "collectionMethod": channel.collection_method,
            "endpoint": channel.endpoint,
            "headers": channel.headers,
            "timeout": channel.timeout,
            "proxyUrl": channel.proxy_url,
            "config": channel.config,
            "enabled": channel.enabled,
            "createdAt": channel.created_at.isoformat() if channel.created_at else None,
            "updatedAt": channel.updated_at.isoformat() if channel.updated_at else None,
        }
    )
