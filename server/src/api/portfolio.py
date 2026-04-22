from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.api.auth import get_current_user
from src.api.common import success_response
from src.api.deps import get_db
from src.models import crud
from src.models.models import User
from src.services.stock_data import stock_service

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("")
async def get_portfolio(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    positions = crud.get_positions(db, user_id=user.id)
    result = []
    total_value = 0
    total_cost = 0

    for pos in positions:
        code = pos.stock_code
        if code.isdigit() and len(code) == 6:
            current = stock_service.get_a_stock_quote(code)
        else:
            current = stock_service.get_hk_stock_quote(code)

        current_price = current.get("price", 0) if current else 0
        value = current_price * pos.quantity
        cost = pos.cost_price * pos.quantity
        profit = value - cost
        profit_percent = (profit / cost * 100) if cost > 0 else 0

        result.append(
            {
                "code": pos.stock_code,
                "name": pos.stock_name,
                "quantity": pos.quantity,
                "costPrice": pos.cost_price,
                "currentPrice": current_price,
                "profit": profit,
                "profitPercent": profit_percent,
            }
        )
        total_value += value
        total_cost += cost

    return {
        "positions": result,
        "totalValue": total_value,
        "totalCost": total_cost,
        "totalProfit": total_value - total_cost,
    }


@router.post("")
async def add_position(
    stock_code: str,
    stock_name: str,
    quantity: int,
    cost_price: float,
    buy_date: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    date = datetime.strptime(buy_date, "%Y-%m-%d") if buy_date else datetime.now()
    crud.add_position(db, stock_code, stock_name, quantity, cost_price, date, user_id=user.id)
    return success_response()


@router.delete("/{stock_code}")
async def delete_position(
    stock_code: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    crud.delete_position(db, stock_code, user_id=user.id)
    return success_response()


@router.get("/transactions", tags=["transactions"])
async def get_transactions(
    limit: int = 50,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    transactions = crud.get_transactions(db, limit, user_id=user.id)
    return [
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
