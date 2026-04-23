"""Event management APIs."""

from datetime import datetime
from typing import Any, cast

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.common import success_response
from src.models import models
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
    sources = db.query(models.EventSource).all()
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
                "last_fetched_at": s.last_fetched_at.isoformat() if s.last_fetched_at else None,
                "last_error": s.last_error,
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
    db.delete(source)
    db.commit()
    return success_response()


@router.post("/event-sources/{source_id}/trigger")
async def trigger_event_source(source_id: int, db: Session = Depends(get_db)):
    source = db.query(models.EventSource).filter(models.EventSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Event source not found")
    try:
        result = run_fetcher(db, source)
        return success_response(data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


# ───────────────────────────────────────────────
#  Event Jobs
# ───────────────────────────────────────────────


@router.get("/event-jobs")
async def list_event_jobs(limit: int = 50, db: Session = Depends(get_db)):
    jobs = db.query(models.EventJob).order_by(models.EventJob.started_at.desc()).limit(limit).all()
    return success_response(
        data=[
            {
                "id": j.id,
                "source_id": j.source_id,
                "status": j.status,
                "new_events_count": j.new_events_count,
                "duplicate_count": j.duplicate_count,
                "error_count": j.error_count,
                "started_at": j.started_at.isoformat() if j.started_at else None,
                "completed_at": j.completed_at.isoformat() if j.completed_at else None,
            }
            for j in jobs
        ]
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
