"""Dashboard API: research overview."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.api.auth import get_current_user
from src.api.common import success_response
from src.api.deps import get_db
from src.models import models

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
async def get_dashboard(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    # Stats
    strategy_count = (
        db.query(models.Strategy)
        .filter(
            (models.Strategy.user_id == user.id) | (models.Strategy.is_builtin == 1),
            models.Strategy.is_active == 1,
        )
        .count()
    )

    backtest_count = (
        db.query(models.BacktestTask).filter(models.BacktestTask.user_id == user.id).count()
    )

    # Recent backtests
    recent_backtests = (
        db.query(models.BacktestTask)
        .filter(models.BacktestTask.user_id == user.id)
        .order_by(models.BacktestTask.created_at.desc())
        .limit(5)
        .all()
    )

    # Top strategies by total return
    top_strategies = (
        db.query(models.BacktestTask)
        .filter(
            models.BacktestTask.user_id == user.id, models.BacktestTask.total_return.isnot(None)
        )
        .order_by(models.BacktestTask.total_return.desc())
        .limit(5)
        .all()
    )

    # Data coverage
    watchlist_count = db.query(models.Watchlist).filter(models.Watchlist.user_id == user.id).count()

    price_count = db.query(models.StockDailyPrice).count()
    indicator_count = db.query(models.StockIndicator).count()
    event_count = db.query(models.Event).count()

    return success_response(
        data={
            "stats": {
                "strategyCount": strategy_count,
                "backtestCount": backtest_count,
                "watchlistCount": watchlist_count,
                "dataCoverage": {
                    "prices": price_count,
                    "indicators": indicator_count,
                    "events": event_count,
                },
            },
            "recentBacktests": [
                {
                    "id": b.id,
                    "strategy": b.strategy_name,
                    "stockCode": b.stock_code,
                    "startDate": b.start_date.strftime("%Y-%m-%d") if b.start_date else None,
                    "endDate": b.end_date.strftime("%Y-%m-%d") if b.end_date else None,
                    "totalReturn": b.total_return,
                    "status": b.status,
                    "createdAt": b.created_at.isoformat() if b.created_at else None,
                }
                for b in recent_backtests
            ],
            "topStrategies": [
                {
                    "id": b.id,
                    "strategy": b.strategy_name,
                    "stockCode": b.stock_code,
                    "totalReturn": b.total_return,
                    "sharpeRatio": b.sharpe_ratio,
                    "maxDrawdown": b.max_drawdown,
                }
                for b in top_strategies
            ],
        }
    )
