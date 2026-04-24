"""Event management APIs."""

from datetime import datetime
from typing import Any, cast

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.common import success_response
from src.models import crud, models
from src.models.database import get_db
from src.services.event_fetchers import run_fetcher
from src.services.event_pipeline_service import EventPipelineService

router = APIRouter(tags=["events"])


# ───────────────────────────────────────────────
#  Schemas
# ───────────────────────────────────────────────


class EventSourceCreate(BaseModel):
    name: str
    source_type: str
    scope: str = "individual"
    config: dict[str, Any] = {}
    schedule: str = "0 */6 * * *"
    enabled: int = 1


class EventSourceUpdate(BaseModel):
    name: str | None = None
    source_type: str | None = None
    scope: str | None = None
    config: dict[str, Any] | None = None
    schedule: str | None = None
    enabled: int | None = None


class LinkChannelsRequest(BaseModel):
    channel_ids: list[int]


class EventRuleCreate(BaseModel):
    name: str
    rule_type: str
    version: str = "1.0"
    config: dict[str, Any] = {}


class EventRuleUpdate(BaseModel):
    name: str | None = None
    config: dict[str, Any] | None = None


class EventUpdate(BaseModel):
    title: str | None = None
    summary: str | None = None
    sentiment: float | None = None
    strength: float | None = None
    certainty: float | None = None
    urgency: float | None = None
    tags: list[str] | None = None


# ───────────────────────────────────────────────
#  Event Sources
# ───────────────────────────────────────────────


@router.get("/event-sources")
async def list_event_sources(db: Session = Depends(get_db)):
    # Only return built-in data sources
    sources = db.query(models.EventSource).filter(models.EventSource.is_builtin == 1).all()
    source_ids = [s.id for s in sources]
    # Fetch selected channel ids for all sources in one query
    link_rows = (
        db.query(models.SourceChannelLink)
        .filter(models.SourceChannelLink.source_id.in_(source_ids))
        .all()
    )
    source_to_channels: dict[int, list[int]] = {}
    for row in link_rows:
        source_to_channels.setdefault(row.source_id, []).append(row.channel_id)

    return success_response(
        data=[
            {
                "id": s.id,
                "name": s.name,
                "source_type": s.source_type,
                "scope": s.scope,
                "config": s.config,
                "schedule": s.schedule,
                "enabled": s.enabled,
                "category": s.category,
                "last_fetched_at": s.last_fetched_at.isoformat() if s.last_fetched_at else None,
                "last_error": s.last_error,
                "is_builtin": s.is_builtin,
                "selected_channel_ids": source_to_channels.get(s.id, []),
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in sources
        ]
    )


@router.post("/event-sources")
async def create_event_source(req: EventSourceCreate, db: Session = Depends(get_db)):
    source = models.EventSource(**req.model_dump())
    db.add(source)
    db.commit()
    db.refresh(source)
    return success_response(data={"id": source.id})


@router.put("/event-sources/{source_id}")
async def update_event_source(
    source_id: int, req: EventSourceUpdate, db: Session = Depends(get_db)
):
    source = db.query(models.EventSource).filter(models.EventSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Event source not found")
    for key, value in req.model_dump(exclude_unset=True).items():
        setattr(source, key, value)
    db.commit()
    db.refresh(source)
    return success_response(data={"id": source.id})


@router.delete("/event-sources/{source_id}")
async def delete_event_source(source_id: int, db: Session = Depends(get_db)):
    source = db.query(models.EventSource).filter(models.EventSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Event source not found")
    if source.is_builtin == 1:
        raise HTTPException(status_code=400, detail="内置数据源不可删除")
    db.delete(source)
    db.commit()
    return success_response()


@router.post("/event-sources/{source_id}/trigger")
async def trigger_event_source(source_id: int, db: Session = Depends(get_db)):
    source = db.query(models.EventSource).filter(models.EventSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Event source not found")
    try:
        # First try selected channels from source_channel_links
        selected_channel_ids = [
            r[0]
            for r in db.query(models.SourceChannelLink.channel_id)
            .filter(models.SourceChannelLink.source_id == source_id)
            .all()
        ]
        if selected_channel_ids:
            channels = (
                db.query(models.DataChannel)
                .filter(
                    models.DataChannel.id.in_(selected_channel_ids),
                    models.DataChannel.enabled == 1,
                )
                .all()
            )
        else:
            # Fallback: default channels where data_source_id matches
            channels = (
                db.query(models.DataChannel)
                .filter(
                    models.DataChannel.data_source_id == source_id,
                    models.DataChannel.enabled == 1,
                )
                .all()
            )

        if not channels:
            # Final fallback: run source directly without channel
            result = run_fetcher(db, source, trigger_type="manual")
            return success_response(data=result)

        total_new = 0
        total_dup = 0
        total_err = 0
        errors = []
        for channel in channels:
            from src.services.scheduler import _map_channel_to_fetcher

            fetcher_type = _map_channel_to_fetcher(channel)
            try:
                result = run_fetcher(
                    db,
                    source,
                    channel_id=channel.id,
                    fetcher_type=fetcher_type,
                    trigger_type="manual",
                )
                if result.get("status") == "error":
                    errors.append(f"{channel.name}: {result.get('message')}")
                else:
                    total_new += result.get("new_events", 0)
                    total_dup += result.get("duplicates", 0)
                    total_err += result.get("errors", 0)
            except Exception as e:
                errors.append(f"{channel.name}: {str(e)}")
                total_err += 1

        return success_response(
            data={
                "new_events": total_new,
                "duplicates": total_dup,
                "errors": total_err,
                "error_messages": errors if errors else None,
            }
        )
    except Exception as e:
        return success_response(data={"status": "error", "message": str(e)})


@router.get("/event-sources/{source_id}/channels")
async def get_source_channels(source_id: int, db: Session = Depends(get_db)):
    source = db.query(models.EventSource).filter(models.EventSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Event source not found")
    channels = crud.get_selected_channels_by_source(db, source_id)
    return success_response(
        data=[
            {
                "id": c.id,
                "dataSourceId": c.data_source_id,
                "name": c.name,
                "collectionMethod": c.collection_method,
                "endpoint": c.endpoint,
                "config": c.config,
                "enabled": c.enabled,
                "createdAt": c.created_at.isoformat() if c.created_at else None,
            }
            for c in channels
        ]
    )


@router.post("/event-sources/{source_id}/channels")
async def link_channels_to_source(
    source_id: int, req: LinkChannelsRequest, db: Session = Depends(get_db)
):
    source = db.query(models.EventSource).filter(models.EventSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Event source not found")
    for channel_id in req.channel_ids:
        channel = db.query(models.DataChannel).filter(models.DataChannel.id == channel_id).first()
        if not channel:
            raise HTTPException(status_code=404, detail=f"Channel {channel_id} not found")
        crud.link_channel_to_source(db, source_id, channel_id)
    return success_response()


@router.delete("/event-sources/{source_id}/channels/{channel_id}")
async def unlink_channel_from_source(
    source_id: int, channel_id: int, db: Session = Depends(get_db)
):
    source = db.query(models.EventSource).filter(models.EventSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Event source not found")
    ok = crud.unlink_channel_from_source(db, source_id, channel_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Association not found")
    return success_response()


# ───────────────────────────────────────────────
#  Event Jobs
# ───────────────────────────────────────────────


@router.get("/event-jobs")
async def list_event_jobs(
    source_id: int = None,
    channel_id: int = None,
    start_date: str = None,
    end_date: str = None,
    collection_type: str = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(models.EventJob)
    if source_id is not None:
        query = query.filter(models.EventJob.source_id == source_id)
    if channel_id is not None:
        query = query.filter(models.EventJob.channel_id == channel_id)
    if start_date:
        query = query.filter(models.EventJob.started_at >= start_date)
    if end_date:
        query = query.filter(models.EventJob.started_at <= end_date)
    if collection_type:
        query = query.filter(models.EventJob.trigger_type == collection_type)
    jobs = query.order_by(models.EventJob.started_at.desc()).limit(limit).all()
    return success_response(
        data=[
            {
                "id": j.id,
                "source_id": j.source_id,
                "channel_id": j.channel_id,
                "status": j.status,
                "trigger_type": j.trigger_type,
                "new_events_count": j.new_events_count,
                "duplicate_count": j.duplicate_count,
                "error_count": j.error_count,
                "started_at": j.started_at.isoformat() if j.started_at else None,
                "completed_at": j.completed_at.isoformat() if j.completed_at else None,
            }
            for j in jobs
        ]
    )


@router.get("/event-jobs/monitor")
async def get_event_jobs_monitor(
    start_date: str = None,
    end_date: str = None,
    collection_type: str = None,
    db: Session = Depends(get_db),
):
    """Return channel-based monitoring list with aggregated stats."""
    from sqlalchemy import case, func

    job_query = db.query(models.EventJob)
    if start_date:
        job_query = job_query.filter(models.EventJob.started_at >= start_date)
    if end_date:
        job_query = job_query.filter(models.EventJob.started_at <= end_date)
    if collection_type:
        job_query = job_query.filter(models.EventJob.trigger_type == collection_type)

    # Aggregate by channel_id
    stats = (
        job_query.with_entities(
            models.EventJob.channel_id,
            func.count(models.EventJob.id).label("total_jobs"),
            func.sum(case((models.EventJob.status == "success", 1), else_=0)).label(
                "success_count"
            ),
            func.sum(case((models.EventJob.status == "failed", 1), else_=0)).label("failed_count"),
            func.max(models.EventJob.started_at).label("last_started_at"),
        )
        .group_by(models.EventJob.channel_id)
        .all()
    )

    channels = db.query(models.DataChannel).all()
    channel_map = {c.id: c for c in channels}

    # Build channel_id -> list of referencing source ids
    link_rows = db.query(models.SourceChannelLink).all()
    channel_to_source_ids: dict[int, list[int]] = {}
    all_source_ids: set[int] = set()
    for row in link_rows:
        channel_to_source_ids.setdefault(row.channel_id, []).append(row.source_id)
        all_source_ids.add(row.source_id)

    # Also include default data_source_id as a referencing source
    for c in channels:
        if c.data_source_id:
            channel_to_source_ids.setdefault(c.id, []).append(c.data_source_id)
            all_source_ids.add(c.data_source_id)

    sources = {
        s.id: s
        for s in db.query(models.EventSource)
        .filter(models.EventSource.id.in_(all_source_ids))
        .all()
    }

    result = []
    for row in stats:
        if not row.channel_id:
            continue
        channel = channel_map.get(row.channel_id)
        if not channel:
            continue
        ref_source_ids = channel_to_source_ids.get(channel.id, [])
        ref_source_names = [sources[sid].name for sid in ref_source_ids if sid in sources]
        default_source = sources.get(channel.data_source_id)
        result.append(
            {
                "id": channel.id,
                "name": channel.name,
                "source_type": default_source.source_type if default_source else None,
                "category": default_source.category if default_source else None,
                "dataSourceName": ", ".join(ref_source_names)
                if ref_source_names
                else (default_source.name if default_source else None),
                "aggregated": {
                    "total_jobs": row.total_jobs,
                    "success_count": row.success_count or 0,
                    "failed_count": row.failed_count or 0,
                },
                "last_started_at": row.last_started_at.isoformat() if row.last_started_at else None,
            }
        )

    return success_response(data=result)


@router.get("/event-jobs/{job_id}/detail")
async def get_event_job_detail(job_id: int, db: Session = Depends(get_db)):
    """Return detailed event job with logs."""
    job = db.query(models.EventJob).filter(models.EventJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    source = db.query(models.EventSource).filter(models.EventSource.id == job.source_id).first()
    channel = db.query(models.DataChannel).filter(models.DataChannel.id == job.channel_id).first()
    return success_response(
        data={
            "id": job.id,
            "source_id": job.source_id,
            "source_name": source.name if source else None,
            "channel_id": job.channel_id,
            "channel_name": channel.name if channel else None,
            "status": job.status,
            "trigger_type": job.trigger_type,
            "new_events_count": job.new_events_count,
            "duplicate_count": job.duplicate_count,
            "error_count": job.error_count,
            "logs": job.logs,
            "error_message": job.error_message,
            "started_at": job.started_at.isoformat() if job.started_at else None,
            "completed_at": job.completed_at.isoformat() if job.completed_at else None,
        }
    )


@router.get("/event-jobs/{job_id}")
async def get_event_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.EventJob).filter(models.EventJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Event job not found")
    return success_response(
        data={
            "id": job.id,
            "source_id": job.source_id,
            "status": job.status,
            "trigger_type": job.trigger_type,
            "new_events_count": job.new_events_count,
            "duplicate_count": job.duplicate_count,
            "error_count": job.error_count,
            "logs": job.logs,
            "error_message": job.error_message,
            "started_at": job.started_at.isoformat() if job.started_at else None,
            "completed_at": job.completed_at.isoformat() if job.completed_at else None,
        }
    )


# ───────────────────────────────────────────────
#  Event Rules
# ───────────────────────────────────────────────


@router.get("/event-rules")
async def list_event_rules(db: Session = Depends(get_db)):
    rules = db.query(models.EventRule).order_by(models.EventRule.created_at.desc()).all()
    return success_response(
        data=[
            {
                "id": r.id,
                "name": r.name,
                "rule_type": r.rule_type,
                "version": r.version,
                "config": r.config,
                "is_active": r.is_active,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rules
        ]
    )


@router.post("/event-rules")
async def create_event_rule(req: EventRuleCreate, db: Session = Depends(get_db)):
    rule = models.EventRule(**req.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return success_response(data={"id": rule.id})


@router.put("/event-rules/{rule_id}")
async def update_event_rule(rule_id: int, req: EventRuleUpdate, db: Session = Depends(get_db)):
    rule = db.query(models.EventRule).filter(models.EventRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Event rule not found")
    for key, value in req.model_dump(exclude_unset=True).items():
        setattr(rule, key, value)
    db.commit()
    db.refresh(rule)
    return success_response(data={"id": rule.id})


@router.post("/event-rules/{rule_id}/activate")
async def activate_event_rule(rule_id: int, db: Session = Depends(get_db)):
    rule = db.query(models.EventRule).filter(models.EventRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Event rule not found")

    # Deactivate other versions of same rule_type
    db.query(models.EventRule).filter(
        models.EventRule.rule_type == rule.rule_type,
        models.EventRule.id != rule_id,
    ).update({"is_active": 0})

    rule.is_active = 1  # type: ignore[assignment]
    db.commit()
    db.refresh(rule)
    return success_response(data={"id": rule.id, "is_active": rule.is_active})


# ───────────────────────────────────────────────
#  Events
# ───────────────────────────────────────────────


@router.get("/events")
async def list_events(
    symbol: str | None = None,
    sector: str | None = None,
    scope: str | None = None,
    source_type: str | None = None,
    source_id: int | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(models.Event)
    if symbol:
        query = query.filter(models.Event.symbol == symbol)
    if sector:
        query = query.filter(models.Event.sector == sector)
    if scope:
        query = query.filter(models.Event.scope == scope)
    if source_id is not None:
        query = query.filter(models.Event.source_id == source_id)
    if start_date:
        query = query.filter(models.Event.created_at >= start_date)
    if end_date:
        query = query.filter(models.Event.created_at <= end_date)
    if source_type:
        sources = (
            db.query(models.EventSource).filter(models.EventSource.source_type == source_type).all()
        )
        source_ids = [s.id for s in sources]
        query = query.filter(models.Event.source_id.in_(source_ids))

    events = query.order_by(models.Event.created_at.desc()).limit(limit).all()
    return success_response(
        data=[
            {
                "id": e.id,
                "source_id": e.source_id,
                "scope": e.scope,
                "symbol": e.symbol,
                "sector": e.sector,
                "title": e.title,
                "summary": e.summary,
                "sentiment": e.sentiment,
                "strength": e.strength,
                "certainty": e.certainty,
                "urgency": e.urgency,
                "duration": e.duration,
                "tags": e.tags,
                "signals": e.signals,
                "is_edited": e.is_edited,
                "created_at": e.created_at.isoformat() if e.created_at else None,
            }
            for e in events
        ]
    )


@router.put("/events/{event_id}")
async def update_event(event_id: int, req: EventUpdate, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    for key, value in req.model_dump(exclude_unset=True).items():
        setattr(event, key, value)
    event.is_edited = 1  # type: ignore[assignment]
    db.commit()
    db.refresh(event)

    # Regenerate event_factors for affected symbol/date
    if event.symbol:
        pipeline = EventPipelineService(db)
        pipeline.aggregate_event_factors(cast(str, event.symbol), cast(datetime, event.created_at))

    return success_response(data={"id": event.id})


@router.delete("/events/{event_id}")
async def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    symbol = event.symbol
    created_at = event.created_at

    db.delete(event)
    db.commit()

    # Regenerate event_factors
    if symbol:
        pipeline = EventPipelineService(db)
        pipeline.aggregate_event_factors(cast(str, symbol), cast(datetime, created_at))

    return success_response()
