from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.auth import get_current_user
from src.api.common import success_response
from src.api.deps import get_db
from src.models.models import (
    ScreenerTemplate,
    StockDailyPrice,
    StockFundamental,
    StockIndicator,
    User,
)
from src.services.stock_data import stock_service

router = APIRouter(prefix="/screener", tags=["screener"])


class Condition(BaseModel):
    field: str
    operator: str
    value: float


class ScreenerRunRequest(BaseModel):
    conditions: list[Condition]
    sort_by: str = "pe_ttm"
    sort_order: str = "asc"
    limit: int = 50


class ScreenerTemplateCreate(BaseModel):
    name: str
    conditions: list[Condition]


@router.post("/run")
async def run_screener(
    req: ScreenerRunRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Run stock screener with multiple conditions."""
    # Get all A-stock codes
    all_stocks = stock_service.get_a_stock_quote("")
    if not all_stocks:
        # Fallback: get codes from stock_daily_prices
        codes = [r[0] for r in db.query(StockDailyPrice.stock_code).distinct().limit(100).all()]
    else:
        # This is a simplified approach - in production we'd query from stocks table
        codes = []

    if not codes:
        codes = ["000001", "000002", "600519", "300750"]

    results = []

    for code in codes:
        # Get latest fundamentals
        fundamental = (
            db.query(StockFundamental)
            .filter(StockFundamental.stock_code == code)
            .order_by(StockFundamental.report_date.desc())
            .first()
        )

        # Get latest indicators
        indicator = (
            db.query(StockIndicator)
            .filter(StockIndicator.stock_code == code)
            .order_by(StockIndicator.trade_date.desc())
            .first()
        )

        # Get latest price
        price = (
            db.query(StockDailyPrice)
            .filter(StockDailyPrice.stock_code == code)
            .order_by(StockDailyPrice.trade_date.desc())
            .first()
        )

        if not fundamental and not indicator and not price:
            continue

        # Build stock data dict
        stock_data = {
            "code": code,
            "name": price and price.stock_code or code,
            "price": price.close if price else 0,
            "changePercent": 0,
            "pe_ttm": fundamental.pe_ttm if fundamental else None,
            "pb": fundamental.pb if fundamental else None,
            "ps": fundamental.ps if fundamental else None,
            "roe": fundamental.roe if fundamental else None,
            "roa": fundamental.roa if fundamental else None,
            "gross_margin": fundamental.gross_margin if fundamental else None,
            "net_margin": fundamental.net_margin if fundamental else None,
            "revenue_growth": fundamental.revenue_growth if fundamental else None,
            "profit_growth": fundamental.profit_growth if fundamental else None,
            "debt_ratio": fundamental.debt_ratio if fundamental else None,
            "rsi6": indicator.rsi6 if indicator else None,
            "rsi12": indicator.rsi12 if indicator else None,
            "rsi24": indicator.rsi24 if indicator else None,
            "ma5": indicator.ma5 if indicator else None,
            "ma10": indicator.ma10 if indicator else None,
            "ma20": indicator.ma20 if indicator else None,
            "ma60": indicator.ma60 if indicator else None,
            "macd_dif": indicator.macd_dif if indicator else None,
            "volume": price.volume if price else None,
        }

        # Apply conditions
        match = True
        for cond in req.conditions:
            field_val = stock_data.get(cond.field)
            if field_val is None:
                match = False
                break

            op = cond.operator
            val = cond.value

            if op == "<" and not (field_val < val):
                match = False
                break
            elif op == ">" and not (field_val > val):
                match = False
                break
            elif op == "<=" and not (field_val <= val):
                match = False
                break
            elif op == ">=" and not (field_val >= val):
                match = False
                break
            elif op == "==" and not (field_val == val):
                match = False
                break

        if match:
            results.append(stock_data)

    # Sort
    reverse = req.sort_order == "desc"
    results.sort(key=lambda x: x.get(req.sort_by) or 0, reverse=reverse)

    # Limit
    results = results[: req.limit]

    return success_response(
        data={
            "count": len(results),
            "stocks": results,
        }
    )


@router.post("/templates")
async def create_template(
    req: ScreenerTemplateCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    template = ScreenerTemplate(
        user_id=user.id,
        name=req.name,
        conditions=[c.model_dump() for c in req.conditions],
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return success_response(data={"id": template.id})


@router.get("/templates")
async def list_templates(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    templates = (
        db.query(ScreenerTemplate)
        .filter(ScreenerTemplate.user_id == user.id)
        .order_by(ScreenerTemplate.created_at.desc())
        .all()
    )
    return success_response(
        data=[
            {
                "id": t.id,
                "name": t.name,
                "conditions": t.conditions,
                "createdAt": t.created_at.isoformat() if t.created_at else None,
            }
            for t in templates
        ]
    )


@router.delete("/templates/{template_id}")
async def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    template = (
        db.query(ScreenerTemplate)
        .filter(ScreenerTemplate.id == template_id, ScreenerTemplate.user_id == user.id)
        .first()
    )
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")
    db.delete(template)
    db.commit()
    return success_response()
