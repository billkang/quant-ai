from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.common import success_response
from src.api.deps import get_db
from src.models import crud
from src.services.news import news_service

router = APIRouter(prefix="/news", tags=["news"])


@router.get("")
async def get_news(category: str = "all", symbol: str | None = None):
    if symbol:
        return news_service.get_stock_news_from_db(symbol)
    else:
        return []


@router.get("/sources")
async def get_news_sources(db: Session = Depends(get_db)):
    sources = crud.get_news_sources(db)
    return [
        {
            "id": s.id,
            "name": s.name,
            "sourceType": s.source_type,
            "config": s.config,
            "intervalMinutes": s.interval_minutes,
            "enabled": bool(s.enabled),
            "lastFetchedAt": s.last_fetched_at.isoformat() if s.last_fetched_at else None,
        }
        for s in sources
    ]


class NewsSourceCreate(BaseModel):
    name: str
    source_type: str
    config: dict
    interval_minutes: int = 60


@router.post("/sources")
async def add_news_source_body(body: NewsSourceCreate, db: Session = Depends(get_db)):
    source = crud.add_news_source(
        db, body.name, body.source_type, body.config, body.interval_minutes
    )
    return success_response(data={"id": source.id})


@router.put("/sources/{source_id}")
async def update_news_source(
    source_id: int,
    name: str = None,
    source_type: str = None,
    config: dict = None,
    interval_minutes: int = None,
    enabled: bool = None,
    db: Session = Depends(get_db),
):
    source = crud.update_news_source(
        db, source_id, name, source_type, config, interval_minutes, enabled
    )
    if not source:
        raise HTTPException(status_code=404, detail="数据源不存在")
    return success_response()


@router.delete("/sources/{source_id}")
async def delete_news_source(source_id: int, db: Session = Depends(get_db)):
    crud.delete_news_source(db, source_id)
    return success_response()


@router.post("/sources/{source_id}/fetch")
async def fetch_news_source(source_id: int, db: Session = Depends(get_db)):
    result = news_service.fetch_and_save_news(db, source_id)
    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result.get("message", "抓取失败"))
    return result
