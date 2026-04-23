from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.auth import get_current_user
from src.api.common import success_response
from src.api.deps import get_db
from src.models.models import PaperAccount, PaperOrder, PaperPosition, User
from src.services.stock_data import stock_service

router = APIRouter(prefix="/paper", tags=["paper-trading"])

DEFAULT_INITIAL_CASH = 1_000_000.0


class OrderRequest(BaseModel):
    stock_code: str
    stock_name: str
    side: str  # buy / sell
    quantity: int
    order_type: str = "market"


def _get_or_create_account(db: Session, user: User | None) -> PaperAccount:
    user_id = user.id if user else None
    account = db.query(PaperAccount).filter(PaperAccount.user_id == user_id).first()
    if not account:
        account = PaperAccount(
            user_id=user_id,
            initial_cash=DEFAULT_INITIAL_CASH,
            available_cash=DEFAULT_INITIAL_CASH,
        )
        db.add(account)
        db.commit()
        db.refresh(account)
    return account


def _get_current_price(stock_code: str) -> float:
    quote = stock_service.get_a_stock_quote(stock_code)
    if quote and quote.get("price"):
        return float(quote["price"])
    # fallback: last daily price
    return 0.0


@router.get("/account")
async def get_account(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    account = _get_or_create_account(db, user)
    positions = db.query(PaperPosition).filter(PaperPosition.user_id == user.id).all()

    total_market_value = 0.0
    total_profit = 0.0

    for pos in positions:
        current_price = _get_current_price(pos.stock_code)
        market_value = current_price * (pos.quantity or 0)
        cost_value = (pos.cost_price or 0) * (pos.quantity or 0)
        total_market_value += market_value
        total_profit += market_value - cost_value

    total_assets = account.available_cash + total_market_value

    return success_response(
        data={
            "initialCash": account.initial_cash,
            "availableCash": account.available_cash,
            "totalMarketValue": total_market_value,
            "totalAssets": total_assets,
            "totalProfit": total_profit,
            "totalProfitPercent": (
                (total_profit / (account.initial_cash or 1)) * 100 if account.initial_cash else 0
            ),
        }
    )


@router.get("/positions")
async def get_positions(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    positions = db.query(PaperPosition).filter(PaperPosition.user_id == user.id).all()

    result = []
    for pos in positions:
        current_price = _get_current_price(pos.stock_code)
        market_value = current_price * (pos.quantity or 0)
        cost_value = (pos.cost_price or 0) * (pos.quantity or 0)
        profit = market_value - cost_value
        profit_percent = (profit / cost_value) * 100 if cost_value else 0

        result.append(
            {
                "code": pos.stock_code,
                "name": pos.stock_name,
                "quantity": pos.quantity,
                "costPrice": pos.cost_price,
                "currentPrice": current_price,
                "marketValue": market_value,
                "profit": profit,
                "profitPercent": round(profit_percent, 2),
            }
        )

    return success_response(data=result)


@router.post("/orders")
async def create_order(
    req: OrderRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    account = _get_or_create_account(db, user)
    price = _get_current_price(req.stock_code)
    if price <= 0:
        raise HTTPException(status_code=400, detail="无法获取当前价格，下单失败")

    amount = price * req.quantity

    if req.side == "buy":
        if account.available_cash < amount:
            raise HTTPException(status_code=400, detail="可用资金不足")

        # Update account
        account.available_cash = (account.available_cash or 0) - amount

        # Update position
        position = (
            db.query(PaperPosition)
            .filter(
                PaperPosition.user_id == user.id,
                PaperPosition.stock_code == req.stock_code,
            )
            .first()
        )

        if position:
            total_cost = (position.cost_price or 0) * (position.quantity or 0) + amount
            total_qty = (position.quantity or 0) + req.quantity
            position.cost_price = total_cost / total_qty if total_qty else 0
            position.quantity = total_qty
            position.stock_name = req.stock_name
        else:
            position = PaperPosition(
                user_id=user.id,
                stock_code=req.stock_code,
                stock_name=req.stock_name,
                quantity=req.quantity,
                cost_price=price,
            )
            db.add(position)

    elif req.side == "sell":
        position = (
            db.query(PaperPosition)
            .filter(
                PaperPosition.user_id == user.id,
                PaperPosition.stock_code == req.stock_code,
            )
            .first()
        )

        if not position or (position.quantity or 0) < req.quantity:
            raise HTTPException(status_code=400, detail="持仓数量不足")

        # Update account
        account.available_cash = (account.available_cash or 0) + amount

        # Update position
        position.quantity = (position.quantity or 0) - req.quantity
        if position.quantity <= 0:
            db.delete(position)
    else:
        raise HTTPException(status_code=400, detail="无效的side参数")

    order = PaperOrder(
        user_id=user.id,
        stock_code=req.stock_code,
        stock_name=req.stock_name,
        side=req.side,
        quantity=req.quantity,
        price=price,
        amount=amount,
        status="filled",
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    return success_response(
        data={
            "id": order.id,
            "stock_code": order.stock_code,
            "side": order.side,
            "quantity": order.quantity,
            "price": order.price,
            "amount": order.amount,
            "status": order.status,
            "created_at": order.created_at.isoformat() if order.created_at else None,
        },
        message="下单成功",
    )


@router.get("/orders")
async def get_orders(
    limit: int = 50,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    orders = (
        db.query(PaperOrder)
        .filter(PaperOrder.user_id == user.id)
        .order_by(PaperOrder.created_at.desc())
        .limit(limit)
        .all()
    )

    return success_response(
        data=[
            {
                "id": o.id,
                "stock_code": o.stock_code,
                "stock_name": o.stock_name,
                "side": o.side,
                "quantity": o.quantity,
                "price": o.price,
                "amount": o.amount,
                "status": o.status,
                "created_at": o.created_at.isoformat() if o.created_at else None,
            }
            for o in orders
        ]
    )


@router.post("/reset")
async def reset_account(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db.query(PaperPosition).filter(PaperPosition.user_id == user.id).delete()
    db.query(PaperOrder).filter(PaperOrder.user_id == user.id).delete()

    account = db.query(PaperAccount).filter(PaperAccount.user_id == user.id).first()
    if account:
        account.available_cash = account.initial_cash
    else:
        account = PaperAccount(
            user_id=user.id,
            initial_cash=DEFAULT_INITIAL_CASH,
            available_cash=DEFAULT_INITIAL_CASH,
        )
        db.add(account)

    db.commit()
    return success_response(message="账户已重置")
