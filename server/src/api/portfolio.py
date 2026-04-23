from typing import cast

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.api.auth import get_current_user
from src.api.common import success_response
from src.api.deps import get_db
from src.models import crud, models
from src.models.models import User

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("")
async def get_portfolio(
    backtest_task_id: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get virtual positions. If backtest_task_id provided, filter by task."""
    query = db.query(models.StrategyPosition).filter(
        models.StrategyPosition.user_id == user.id,
        models.StrategyPosition.is_active == 1,
    )
    if backtest_task_id:
        query = query.filter(models.StrategyPosition.backtest_task_id == backtest_task_id)

    positions = query.all()
    result = []
    total_value = 0.0
    total_cost = 0.0

    for pos in positions:
        code = cast(str, pos.stock_code)
        # Use closing price instead of real-time quote for virtual positions
        latest_price = (
            db.query(models.StockDailyPrice)
            .filter(models.StockDailyPrice.stock_code == code)
            .order_by(models.StockDailyPrice.trade_date.desc())
            .first()
        )
        current_price = cast(float, latest_price.close) if latest_price else 0.0

        quantity = cast(int, pos.quantity)
        avg_cost = cast(float, pos.avg_cost)
        value = current_price * quantity
        cost = avg_cost * quantity
        profit = value - cost
        profit_percent = (profit / cost * 100) if cost > 0 else 0

        result.append(
            {
                "id": pos.id,
                "backtestTaskId": pos.backtest_task_id,
                "strategyId": pos.strategy_id,
                "code": pos.stock_code,
                "name": pos.stock_name,
                "quantity": pos.quantity,
                "avgCost": pos.avg_cost,
                "currentPrice": current_price,
                "unrealizedPnl": pos.unrealized_pnl,
                "profit": profit,
                "profitPercent": profit_percent,
                "isActive": pos.is_active,
            }
        )
        total_value += value
        total_cost += cost

    return success_response(
        data={
            "positions": result,
            "totalValue": total_value,
            "totalCost": total_cost,
            "totalProfit": total_value - total_cost,
        }
    )


@router.get("/transactions", tags=["transactions"])
async def get_transactions(
    limit: int = 50,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    transactions = crud.get_transactions(db, limit, user_id=cast(int, user.id))
    return success_response(
        data=[
            {
                "code": t.stock_code,
                "name": t.stock_name,
                "type": t.type,
                "quantity": t.quantity,
                "price": t.price,
                "commission": t.commission,
                "date": t.trade_date.isoformat() if t.trade_date else None,
            }
            for t in transactions
        ]
    )
