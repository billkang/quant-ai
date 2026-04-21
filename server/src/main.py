from contextlib import asynccontextmanager
from datetime import datetime

import redis
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.core.config import settings
from src.models import crud
from src.models.database import Base, engine, get_db
from src.services.ai_analysis import ai_service
from src.services.news import news_service
from src.services.scheduler import scheduler_service
from src.services.stock_data import stock_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    await scheduler_service.start()
    yield
    await scheduler_service.stop()


app = FastAPI(title="Quant AI API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


def _get_stock_by_code(code: str) -> dict | None:
    code_upper = code.upper()
    if '.HK' in code_upper:
        return stock_service.get_hk_stock_quote(code)
    elif '.US' in code_upper:
        return stock_service.get_hk_stock_quote(code)
    else:
        return stock_service.get_a_stock_quote(code)


@app.get("/api/stocks/watchlist")
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


@app.post("/api/stocks/watchlist")
async def add_to_watchlist(stock_code: str, db: Session = Depends(get_db)):
    existing = db.query(crud.models.Watchlist).filter(crud.models.Watchlist.stock_code == stock_code).first()
    if existing:
        return {"status": "error", "message": "股票已存在"}

    stock_info = _get_stock_by_code(stock_code)
    if not stock_info or not stock_info.get('name'):
        return {"status": "error", "message": "无法获取股票信息"}

    crud.add_to_watchlist(db, stock_code, stock_info.get('name', ''))

    code_upper = stock_code.upper()
    period = "6mo"
    if '.HK' in code_upper or '.US' in code_upper:
        kline_data = stock_service.get_hk_stock_kline(stock_code, period)
    else:
        kline_data = stock_service.get_a_stock_kline(stock_code, period)
    if kline_data:
        crud.save_stock_kline(db, stock_code, period, kline_data)

    return {"status": "ok", "stock_code": stock_code, "name": stock_info.get('name', '')}


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

    stock = _get_stock_by_code(code)

    if stock:
        import json
        redis_client.setex(cache_key, 60, json.dumps(stock))
    return stock or {}


@app.get("/api/stocks/{code}/kline")
async def get_kline(code: str, period: str = "daily"):
    code_upper = code.upper()
    if '.HK' in code_upper or '.US' in code_upper:
        klines = stock_service.get_hk_stock_kline(code, period)
    else:
        klines = stock_service.get_a_stock_kline(code, period)
    return klines


@app.get("/api/news")
async def get_news(category: str = "all", symbol: str | None = None):
    if symbol:
        return news_service.get_stock_news(symbol)
    elif category == "macro":
        return news_service.get_macro_news()
    else:
        return news_service.get_stock_news(symbol or "")


@app.get("/api/news/sources")
async def get_news_sources(db: Session = Depends(get_db)):
    sources = crud.get_news_sources(db)
    return [
        {
            'id': s.id,
            'name': s.name,
            'sourceType': s.source_type,
            'config': s.config,
            'intervalMinutes': s.interval_minutes,
            'enabled': bool(s.enabled),
            'lastFetchedAt': s.last_fetched_at.isoformat() if s.last_fetched_at else None,
        }
        for s in sources
    ]


class NewsSourceCreate(BaseModel):
    name: str
    source_type: str
    config: dict
    interval_minutes: int = 60


@app.post("/api/news/sources")
async def add_news_source_body(
    body: NewsSourceCreate,
    db: Session = Depends(get_db)
):
    source = crud.add_news_source(db, body.name, body.source_type, body.config, body.interval_minutes)
    return {'id': source.id, 'status': 'ok'}


@app.put("/api/news/sources/{source_id}")
async def update_news_source(
    source_id: int,
    name: str = None,
    source_type: str = None,
    config: dict = None,
    interval_minutes: int = None,
    enabled: bool = None,
    db: Session = Depends(get_db)
):
    source = crud.update_news_source(db, source_id, name, source_type, config, interval_minutes, enabled)
    if not source:
        raise HTTPException(status_code=404, detail="数据源不存在")
    return {'status': 'ok'}


@app.delete("/api/news/sources/{source_id}")
async def delete_news_source(source_id: int, db: Session = Depends(get_db)):
    crud.delete_news_source(db, source_id)
    return {'status': 'ok'}


@app.post("/api/news/sources/{source_id}/fetch")
async def fetch_news_source(source_id: int, db: Session = Depends(get_db)):
    source = db.query(crud.models.NewsSource).filter(crud.models.NewsSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="数据源不存在")

    news_data = []
    try:
        if source.source_type == 'stock_news':
            symbol = source.config.get('symbol', '')
            news_data = news_service.get_stock_news(symbol)
        elif source.source_type == 'stock_notices':
            symbol = source.config.get('symbol', '')
            news_data = news_service.get_stock_notices(symbol)
        elif source.source_type == 'macro_news':
            news_data = news_service.get_macro_news()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"拉取失败: {str(e)}")

    crud.update_fetch_time(db, source_id)
    return {'status': 'ok', 'count': len(news_data), 'data': news_data}


@app.get("/api/ai/analyze")
async def analyze_stock(code: str):
    stock = await get_stock(code)
    if not stock:
        raise HTTPException(status_code=404, detail="股票不存在")

    news = news_service.get_stock_news(code)
    advice = ai_service.analyze_stock(stock, news)
    return {"code": code, "advice": advice}


class AnalyzeV2Request(BaseModel):
    code: str
    dimensions: list[str] = ["fundamental", "technical", "risk"]


@app.post("/api/ai/analyze")
async def analyze_stock(req: AnalyzeV2Request, db: Session = Depends(get_db)):
    stock = await get_stock(req.code)
    if not stock:
        raise HTTPException(status_code=404, detail="股票不存在")

    try:
        from src.services.ai_diagnostic import diagnostic_service

        news = news_service.get_stock_news(req.code)
        result = diagnostic_service.analyze(req.code, stock, news)

        try:
            crud.save_diagnostic_history(
                db,
                stock_code=req.code,
                stock_name=stock.get("name", ""),
                fundamental_analysis=result.get("fundamental_analysis", ""),
                technical_analysis=result.get("technical_analysis", ""),
                risk_analysis=result.get("risk_analysis", ""),
                final_report=result.get("final_report", ""),
            )
        except Exception:
            pass

        return {"code": req.code, **result}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/ai/history")
async def get_diagnostic_history(code: str = None, limit: int = 10, db: Session = Depends(get_db)):
    history = crud.get_diagnostic_history(db, code, limit)
    return [
        {
            "id": h.id,
            "stockCode": h.stock_code,
            "stockName": h.stock_name,
            "finalReport": h.final_report,
            "score": h.score,
            "createdAt": h.created_at.isoformat() if h.created_at else None,
        }
        for h in history
    ]


@app.get("/api/ai/history/{history_id}")
async def get_diagnostic_history_detail(history_id: int, db: Session = Depends(get_db)):
    h = crud.get_diagnostic_history_by_id(db, history_id)
    if not h:
        raise HTTPException(status_code=404, detail="诊断记录不存在")
    return {
        "id": h.id,
        "stockCode": h.stock_code,
        "stockName": h.stock_name,
        "fundamentalAnalysis": h.fundamental_analysis,
        "technicalAnalysis": h.technical_analysis,
        "riskAnalysis": h.risk_analysis,
        "finalReport": h.final_report,
        "score": h.score,
        "createdAt": h.created_at.isoformat() if h.created_at else None,
    }


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
