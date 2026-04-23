"""Factor snapshot APIs."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.auth import get_current_user
from src.api.common import success_response
from src.models import models
from src.models.database import get_db
from src.services.factor_snapshot_builder import FactorSnapshotBuilder

router = APIRouter(tags=["factor-snapshots"])


class SnapshotGenerateRequest(BaseModel):
    symbol: str
    start_date: str | None = None
    end_date: str | None = None


@router.post("/factors/snapshots/generate")
async def generate_snapshots(
    req: SnapshotGenerateRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    builder = FactorSnapshotBuilder(db)

    if req.start_date and req.end_date:
        start = datetime.strptime(req.start_date, "%Y-%m-%d")
        end = datetime.strptime(req.end_date, "%Y-%m-%d")
        snapshots = builder.build_range(req.symbol, start, end)
    else:
        snapshot = builder.build_for_symbol(req.symbol)
        snapshots = [snapshot]

    return success_response(
        data={
            "symbol": req.symbol,
            "count": len(snapshots),
            "dates": [s.trade_date.isoformat() for s in snapshots],
        }
    )


@router.get("/factors/snapshots/{symbol}")
async def get_snapshots(
    symbol: str,
    start: str | None = None,
    end: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.FactorSnapshot).filter(models.FactorSnapshot.symbol == symbol)
    if start:
        query = query.filter(
            models.FactorSnapshot.trade_date >= datetime.strptime(start, "%Y-%m-%d")
        )
    if end:
        query = query.filter(models.FactorSnapshot.trade_date <= datetime.strptime(end, "%Y-%m-%d"))

    snapshots = query.order_by(models.FactorSnapshot.trade_date.desc()).all()
    return success_response(
        data=[
            {
                "id": s.id,
                "symbol": s.symbol,
                "trade_date": s.trade_date.isoformat() if s.trade_date else None,
                "technical": s.technical,
                "events": s.events,
                "price": s.price,
            }
            for s in snapshots
        ]
    )


@router.get("/factors/snapshot/latest")
async def get_latest_snapshot(
    symbol: str,
    db: Session = Depends(get_db),
):
    snapshot = (
        db.query(models.FactorSnapshot)
        .filter(models.FactorSnapshot.symbol == symbol)
        .order_by(models.FactorSnapshot.trade_date.desc())
        .first()
    )
    if not snapshot:
        raise HTTPException(status_code=404, detail="No snapshot found")
    return success_response(
        data={
            "id": snapshot.id,
            "symbol": snapshot.symbol,
            "trade_date": snapshot.trade_date.isoformat() if snapshot.trade_date else None,
            "technical": snapshot.technical,
            "events": snapshot.events,
            "price": snapshot.price,
        }
    )
