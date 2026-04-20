from contextlib import asynccontextmanager
from datetime import datetime

import redis
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from src.core.config import settings
from src.models import crud
from src.models.database import Base, engine, get_db
from src.services.ai_analysis import ai_service
from src.services.news import news_service
from src.services.stock_data import stock_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Quant AI API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


@app.get("/api/stocks/watchlist")
async def get_watchlist(db: Session = Depends(get_db)):
    watchlist = crud.get_watchlist(db)
    if not watchlist:
        return []
    result = []
    for watch in watchlist:
        code = watch.stock_code
        if code.isdigit() and len(code) == 6:
            stock = stock_service.get_a_stock_quote(code)
        else:
            stock = stock_service.get_hk_stock_quote(code)
        if stock:
            result.append(stock)
    return result


@app.post("/api/stocks/watchlist")
async def add_to_watchlist(stock_code: str, db: Session = Depends(get_db)):
    # Check if already exists
    existing = db.query(crud.models.Watchlist).filter(crud.models.Watchlist.stock_code == stock_code).first()
    if existing:
        return {"status": "error", "message": "股票已存在"}
    crud.add_to_watchlist(db, stock_code)
    return {"status": "ok", "stock_code": stock_code}


@app.delete("/api/stocks/watchlist/{stock_code}")
async def remove_from_watchlist(stock_code: str, db: Session = Depends(get_db)):
    crud.remove_from_watchlist(db, stock_code)
    return {"status": "ok"}


@app.get("/api/stocks/{code}")
async def get_stock(code: str):
    cache_key = f"stock:{code}"
    cached = redis_client.get(cache_key)
    if cached:
        import json
        return json.loads(cached)

    if code.isdigit() and len(code) == 6:
        stock = stock_service.get_a_stock_quote(code)
    else:
        stock = stock_service.get_hk_stock_quote(code)

    if stock:
        import json
        redis_client.setex(cache_key, 60, json.dumps(stock))
    return stock or {}


@app.get("/api/stocks/{code}/kline")
async def get_kline(code: str, period: str = "daily"):
    if code.isdigit() and len(code) == 6:
        klines = stock_service.get_a_stock_kline(code, period)
    else:
        klines = stock_service.get_hk_stock_kline(code, period)
    return klines


@app.get("/api/news")
async def get_news(category: str = "all", symbol: str | None = None):
    if symbol:
        return news_service.get_stock_news(symbol)
    elif category == "macro":
        return news_service.get_macro_news()
    else:
        return news_service.get_stock_news(symbol or "")


@app.get("/api/ai/analyze")
async def analyze_stock(code: str):
    stock = await get_stock(code)
    if not stock:
        raise HTTPException(status_code=404, detail="股票不存在")

    news = news_service.get_stock_news(code)
    advice = ai_service.analyze_stock(stock, news)
    return {"code": code, "advice": advice}


@app.get("/api/ai/chat")
async def chat(question: str):
    stock_data = {"context": "量化投资助手"}
    answer = ai_service.answer_question(question, stock_data)
    return {"answer": answer}


@app.get("/api/portfolio")
async def get_portfolio(db: Session = Depends(get_db)):
    positions = crud.get_positions(db)
    result = []
    total_value = 0
    total_cost = 0

    for pos in positions:
        code = pos.stock_code
        if code.isdigit() and len(code) == 6:
            current = stock_service.get_a_stock_quote(code)
        else:
            current = stock_service.get_hk_stock_quote(code)

        current_price = current.get('price', 0) if current else 0
        value = current_price * pos.quantity
        cost = pos.cost_price * pos.quantity
        profit = value - cost
        profit_percent = (profit / cost * 100) if cost > 0 else 0

        result.append({
            'code': pos.stock_code,
            'name': pos.stock_name,
            'quantity': pos.quantity,
            'costPrice': pos.cost_price,
            'currentPrice': current_price,
            'profit': profit,
            'profitPercent': profit_percent,
        })
        total_value += value
        total_cost += cost

    return {
        'positions': result,
        'totalValue': total_value,
        'totalCost': total_cost,
        'totalProfit': total_value - total_cost,
    }


@app.post("/api/portfolio")
async def add_position(
    stock_code: str,
    stock_name: str,
    quantity: int,
    cost_price: float,
    buy_date: str | None = None,
    db: Session = Depends(get_db)
):
    date = datetime.strptime(buy_date, '%Y-%m-%d') if buy_date else datetime.now()
    crud.add_position(db, stock_code, stock_name, quantity, cost_price, date)
    return {"status": "ok"}


@app.delete("/api/portfolio/{stock_code}")
async def delete_position(stock_code: str, db: Session = Depends(get_db)):
    crud.delete_position(db, stock_code)
    return {"status": "ok"}


@app.get("/api/transactions")
async def get_transactions(limit: int = 50, db: Session = Depends(get_db)):
    transactions = crud.get_transactions(db, limit)
    return [
        {
            'code': t.stock_code,
            'name': t.stock_name,
            'type': t.type,
            'quantity': t.quantity,
            'price': t.price,
            'commission': t.commission,
            'date': t.trade_date.isoformat() if t.trade_date else None,
        }
        for t in transactions
    ]


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
