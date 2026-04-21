from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.api.common import success_response
from src.api.deps import _get_stock_by_code, get_db
from src.models import crud
from src.services.stock_data import stock_service

router = APIRouter(prefix="/stocks", tags=["stocks"])


@router.get("/watchlist")
async def get_watchlist(db: Session = Depends(get_db)):
    watchlist = crud.get_watchlist(db)
    if not watchlist:
        return []
    result = []
    for watch in watchlist:
        stock = _get_stock_by_code(watch.stock_code)
        if stock:
            result.append(stock)
    return result


@router.post("/watchlist")
async def add_to_watchlist(stock_code: str, db: Session = Depends(get_db)):
    existing = (
        db.query(crud.models.Watchlist)
        .filter(crud.models.Watchlist.stock_code == stock_code)
        .first()
    )
    if existing:
        return success_response(message="股票已存在")

    stock_info = _get_stock_by_code(stock_code)
    if not stock_info or not stock_info.get("name"):
        return success_response(message="无法获取股票信息")

    crud.add_to_watchlist(db, stock_code, stock_info.get("name", ""))

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
async def remove_from_watchlist(stock_code: str, db: Session = Depends(get_db)):
    crud.remove_from_watchlist(db, stock_code)
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
