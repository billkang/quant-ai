from typing import cast

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.auth import get_current_user
from src.api.common import success_response
from src.api.deps import _get_stock_by_code, get_db
from src.models import crud, models
from src.models.models import User
from src.services.stock_data import stock_service

router = APIRouter(prefix="/stocks", tags=["stocks"])


class AddWatchlistRequest(BaseModel):
    stock_code: str


@router.get("/watchlist")
async def get_watchlist(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    watchlist = crud.get_watchlist(db, user_id=cast(int, user.id))
    if not watchlist:
        return []
    result = []
    for watch in watchlist:
        stock = _get_stock_by_code(cast(str, watch.stock_code))
        if stock:
            result.append(stock)
    return result


@router.post("/watchlist")
async def add_to_watchlist(
    req: AddWatchlistRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    stock_code = req.stock_code
    existing = (
        db.query(crud.models.Watchlist)
        .filter(
            crud.models.Watchlist.stock_code == stock_code,
            crud.models.Watchlist.user_id == cast(int, user.id),
        )
        .first()
    )
    if existing:
        return success_response(message="股票已存在")

    stock_info = _get_stock_by_code(stock_code)
    if not stock_info or not stock_info.get("name"):
        return success_response(message="无法获取股票信息")

    crud.add_to_watchlist(db, stock_code, stock_info.get("name", ""), user_id=cast(int, user.id))

    code_upper = stock_code.upper()
    period = "6mo"
    if ".HK" in code_upper or ".US" in code_upper:
        kline_data = stock_service.get_hk_stock_kline(stock_code, period)
    else:
        kline_data = stock_service.get_a_stock_kline(stock_code, period)
    if kline_data:
        crud.save_stock_kline(db, stock_code, period, kline_data)

    return success_response(data={"stock_code": stock_code, "name": stock_info.get("name", "")})


@router.delete("/watchlist/{stock_code}")
async def remove_from_watchlist(
    stock_code: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    crud.remove_from_watchlist(db, stock_code, user_id=cast(int, user.id))
    return success_response()


@router.get("/{code}")
async def get_stock_endpoint(code: str):
    from src.api.deps import get_stock

    stock = await get_stock(code)
    return stock or {}


@router.get("/{code}/kline")
async def get_kline(code: str, period: str = "daily"):
    code_upper = code.upper()
    if ".HK" in code_upper or ".US" in code_upper:
        klines = stock_service.get_hk_stock_kline(code, period)
    else:
        klines = stock_service.get_a_stock_kline(code, period)
    return klines


@router.get("/{code}/event-factors")
async def get_event_factors(
    code: str,
    start: str | None = None,
    end: str | None = None,
    db: Session = Depends(get_db),
):
    from datetime import datetime

    query = db.query(models.EventFactor).filter(models.EventFactor.symbol == code)
    if start:
        query = query.filter(models.EventFactor.trade_date >= datetime.strptime(start, "%Y-%m-%d"))
    if end:
        query = query.filter(models.EventFactor.trade_date <= datetime.strptime(end, "%Y-%m-%d"))

    factors = query.order_by(models.EventFactor.trade_date.desc()).all()
    return success_response(
        data=[
            {
                "id": f.id,
                "symbol": f.symbol,
                "tradeDate": f.trade_date.strftime("%Y-%m-%d") if f.trade_date else None,
                "individualEvents": f.individual_events,
                "sectorEvents": f.sector_events,
                "marketEvents": f.market_events,
                "composite": f.composite,
            }
            for f in factors
        ]
    )


@router.get("/{code}/sector")
async def get_stock_sector(code: str, db: Session = Depends(get_db)):
    mapping = (
        db.query(models.StockSectorMapping)
        .filter(models.StockSectorMapping.stock_code == code)
        .first()
    )
    if not mapping:
        return success_response(data=None)
    return success_response(
        data={
            "sector": mapping.sector,
            "sectorCode": mapping.sector_code,
            "industryLevel1": mapping.industry_level1,
            "industryLevel2": mapping.industry_level2,
        }
    )
