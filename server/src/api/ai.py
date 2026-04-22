from typing import cast

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.auth import get_current_user
from src.api.common import success_response
from src.api.deps import get_db, get_stock
from src.models import crud
from src.models.models import User
from src.services.ai_analysis import ai_service
from src.services.news import news_service

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/analyze")
async def analyze_stock_legacy(code: str):
    stock = await get_stock(code)
    if not stock:
        raise HTTPException(status_code=404, detail="股票不存在")

    news = news_service.get_stock_news(code)
    advice = ai_service.analyze_stock(stock, news)
    return {"code": code, "advice": advice}


class AnalyzeV2Request(BaseModel):
    code: str
    dimensions: list[str] = ["fundamental", "technical", "risk"]


@router.post("/analyze")
async def analyze_stock(
    req: AnalyzeV2Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    stock = await get_stock(req.code)
    if not stock:
        raise HTTPException(status_code=404, detail="股票不存在")

    try:
        from src.services.ai_diagnostic import diagnostic_service

        news = news_service.get_stock_news(req.code)
        indicator = crud.get_latest_indicator(db, req.code)
        fundamental = crud.get_latest_fundamental(db, req.code)

        indicators = {}
        if indicator:
            indicators = {
                "ma5": indicator.ma5,
                "ma20": indicator.ma20,
                "rsi6": indicator.rsi6,
                "macd_dif": indicator.macd_dif,
                "macd_dea": indicator.macd_dea,
                "boll_upper": indicator.boll_upper,
                "boll_lower": indicator.boll_lower,
            }

        fundamentals = {}
        if fundamental:
            fundamentals = {
                "pe_ttm": fundamental.pe_ttm,
                "pb": fundamental.pb,
                "roe": fundamental.roe,
                "gross_margin": fundamental.gross_margin,
                "revenue_growth": fundamental.revenue_growth,
                "debt_ratio": fundamental.debt_ratio,
            }

        result = diagnostic_service.analyze(
            req.code, stock, indicators=indicators, fundamentals=fundamentals, news=news
        )

        try:
            crud.save_diagnostic_history(
                db,
                stock_code=req.code,
                stock_name=stock.get("name", ""),
                fundamental_analysis=result.get("fundamental_analysis", ""),
                technical_analysis=result.get("technical_analysis", ""),
                risk_analysis=result.get("risk_analysis", ""),
                final_report=result.get("final_report", ""),
                user_id=cast(int, user.id),
            )
        except Exception:
            pass

        return success_response(data={"code": req.code, **result})
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/history")
async def get_diagnostic_history(
    code: str = None,
    limit: int = 10,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    history = crud.get_diagnostic_history(db, code, limit, user_id=cast(int, user.id))
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


@router.get("/history/{history_id}")
async def get_diagnostic_history_detail(
    history_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    h = crud.get_diagnostic_history_by_id(db, history_id, user_id=cast(int, user.id))
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


@router.get("/chat")
async def chat(question: str):
    stock_data = {"context": "量化投资助手"}
    answer = ai_service.answer_question(question, stock_data)
    return success_response(data={"answer": answer})
