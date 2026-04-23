from datetime import datetime
from typing import Any, cast

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.auth import get_current_user
from src.api.common import error_response, success_response
from src.api.deps import get_db
from src.models import crud, models
from src.models.models import User
from src.services.backtest_service import backtest_service
from src.services.fundamental_service import fundamental_service
from src.services.strategy_service import StrategyService

router = APIRouter(prefix="/quant", tags=["quant"])


# ---- Indicators ----


@router.get("/indicators/{code}")
async def get_indicators(code: str, db: Session = Depends(get_db)):
    indicator = crud.get_latest_indicator(db, code)
    if not indicator:
        return success_response(data=None)
    return success_response(
        data={
            "stockCode": indicator.stock_code,
            "tradeDate": indicator.trade_date.strftime("%Y-%m-%d")
            if indicator.trade_date
            else None,
            "ma5": indicator.ma5,
            "ma10": indicator.ma10,
            "ma20": indicator.ma20,
            "ma60": indicator.ma60,
            "rsi6": indicator.rsi6,
            "rsi12": indicator.rsi12,
            "rsi24": indicator.rsi24,
            "macdDif": indicator.macd_dif,
            "macdDea": indicator.macd_dea,
            "macdBar": indicator.macd_bar,
            "kdjK": indicator.kdj_k,
            "kdjD": indicator.kdj_d,
            "kdjJ": indicator.kdj_j,
            "bollUpper": indicator.boll_upper,
            "bollMid": indicator.boll_mid,
            "bollLower": indicator.boll_lower,
            "volMa5": indicator.vol_ma5,
            "volMa10": indicator.vol_ma10,
        }
    )


@router.get("/indicators/{code}/history")
async def get_indicator_history(code: str, limit: int = 60, db: Session = Depends(get_db)):
    indicators = crud.get_indicator_history(db, code, limit)
    return success_response(
        data=[
            {
                "tradeDate": i.trade_date.strftime("%Y-%m-%d") if i.trade_date else None,
                "ma5": i.ma5,
                "ma10": i.ma10,
                "ma20": i.ma20,
                "ma60": i.ma60,
                "rsi6": i.rsi6,
                "rsi12": i.rsi12,
                "rsi24": i.rsi24,
                "macdDif": i.macd_dif,
                "macdDea": i.macd_dea,
                "macdBar": i.macd_bar,
                "kdjK": i.kdj_k,
                "kdjD": i.kdj_d,
                "kdjJ": i.kdj_j,
                "bollUpper": i.boll_upper,
                "bollMid": i.boll_mid,
                "bollLower": i.boll_lower,
                "volMa5": i.vol_ma5,
                "volMa10": i.vol_ma10,
            }
            for i in reversed(indicators)
        ]
    )


# ---- Fundamentals ----


@router.get("/fundamentals/{code}")
async def get_fundamentals(code: str, db: Session = Depends(get_db)):
    fundamental = crud.get_latest_fundamental(db, code)
    if not fundamental:
        # Try to fetch from akshare on demand
        try:
            data = fundamental_service.fetch_fundamental(code)
            if data:
                report_date = datetime.strptime(data.get("report_date", "2025-12-31"), "%Y-%m-%d")
                crud.save_fundamental(db, code, report_date, **data)
                fundamental = crud.get_latest_fundamental(db, code)
        except Exception:
            pass
    if not fundamental:
        return success_response(data=None)
    return success_response(
        data={
            "stockCode": fundamental.stock_code,
            "reportDate": fundamental.report_date.strftime("%Y-%m-%d")
            if fundamental.report_date
            else None,
            "peTtm": fundamental.pe_ttm,
            "pb": fundamental.pb,
            "ps": fundamental.ps,
            "roe": fundamental.roe,
            "roa": fundamental.roa,
            "grossMargin": fundamental.gross_margin,
            "netMargin": fundamental.net_margin,
            "revenueGrowth": fundamental.revenue_growth,
            "profitGrowth": fundamental.profit_growth,
            "debtRatio": fundamental.debt_ratio,
            "freeCashFlow": fundamental.free_cash_flow,
        }
    )


# ---- Backtest ----


class BacktestRequest(BaseModel):
    stockCode: str
    strategy: str | None = None
    strategyId: int | None = None
    strategyVersionId: int | None = None
    strategyParams: dict[str, Any] = {}
    startDate: str
    endDate: str
    initialCash: float = 100000


@router.post("/backtest")
async def run_backtest(
    req: BacktestRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Determine strategy info
    strategy_name = req.strategy
    strategy_code: str | None = None
    strategy_id = None
    strategy_version_id = None
    params = req.strategyParams or {}

    if req.strategyId:
        svc = StrategyService(db)
        strategy = svc.get_strategy(req.strategyId)
        if strategy:
            strategy_id = strategy.id
            strategy_code = cast(str | None, strategy.strategy_code)
            strategy_name = cast(str, strategy.name)
            # Validate params
            valid, msg = svc.validate_params(req.strategyId, params)
            if not valid:
                return error_response(message=f"参数验证失败: {msg}")

    if req.strategyVersionId:
        strategy_version_id = req.strategyVersionId

    result = backtest_service.run(
        strategy_name=strategy_name,
        strategy_code=strategy_code,
        stock_code=req.stockCode,
        start_date=req.startDate,
        end_date=req.endDate,
        initial_cash=req.initialCash,
        params=params,
        db=db,
        use_snapshots=False,  # MVP: fallback to kline for now
    )

    # Save to backtest_tasks
    backtest = models.BacktestTask(
        user_id=user.id,
        strategy_id=strategy_id,
        strategy_version_id=strategy_version_id,
        strategy_name=strategy_name,
        stock_code=req.stockCode,
        start_date=datetime.strptime(req.startDate, "%Y-%m-%d"),
        end_date=datetime.strptime(req.endDate, "%Y-%m-%d"),
        initial_cash=req.initialCash,
        params=params,
        final_value=result["final_value"],
        total_return=result["total_return"],
        annualized_return=result["annualized_return"],
        max_drawdown=result["max_drawdown"],
        sharpe_ratio=result["sharpe_ratio"],
        win_rate=result["win_rate"],
        trade_count=result["trade_count"],
        trades=result["trades"],
        equity_curve=result["equity_curve"],
        status="completed",
        progress=100.0,
        completed_at=datetime.utcnow(),
    )
    db.add(backtest)
    db.commit()
    db.refresh(backtest)

    return success_response(
        data={
            "id": backtest.id,
            **result,
        }
    )


@router.get("/backtests")
async def get_backtests(
    limit: int = 50,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    backtests = (
        db.query(models.BacktestTask)
        .filter(models.BacktestTask.user_id == user.id)
        .order_by(models.BacktestTask.created_at.desc())
        .limit(limit)
        .all()
    )
    return success_response(
        data=[
            {
                "id": b.id,
                "strategy": b.strategy_name,
                "strategyId": b.strategy_id,
                "strategyVersionId": b.strategy_version_id,
                "stockCode": b.stock_code,
                "startDate": b.start_date.strftime("%Y-%m-%d") if b.start_date else None,
                "endDate": b.end_date.strftime("%Y-%m-%d") if b.end_date else None,
                "totalReturn": b.total_return,
                "annualizedReturn": b.annualized_return,
                "maxDrawdown": b.max_drawdown,
                "sharpeRatio": b.sharpe_ratio,
                "winRate": b.win_rate,
                "tradeCount": b.trade_count,
                "status": b.status,
                "progress": b.progress,
            }
            for b in backtests
        ]
    )


@router.get("/backtests/{backtest_id}")
async def get_backtest_detail(
    backtest_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    b = (
        db.query(models.BacktestTask)
        .filter(models.BacktestTask.id == backtest_id, models.BacktestTask.user_id == user.id)
        .first()
    )
    if not b:
        return success_response(data=None)
    return success_response(
        data={
            "id": b.id,
            "strategy": b.strategy_name,
            "strategyId": b.strategy_id,
            "strategyVersionId": b.strategy_version_id,
            "stockCode": b.stock_code,
            "startDate": b.start_date.strftime("%Y-%m-%d") if b.start_date else None,
            "endDate": b.end_date.strftime("%Y-%m-%d") if b.end_date else None,
            "initialCash": b.initial_cash,
            "params": b.params,
            "finalValue": b.final_value,
            "totalReturn": b.total_return,
            "annualizedReturn": b.annualized_return,
            "maxDrawdown": b.max_drawdown,
            "sharpeRatio": b.sharpe_ratio,
            "winRate": b.win_rate,
            "tradeCount": b.trade_count,
            "equityCurve": b.equity_curve,
            "trades": b.trades,
            "status": b.status,
            "factorSnapshotIds": b.factor_snapshot_ids,
        }
    )


# ---- Portfolio Analysis ----


@router.get("/portfolio/analysis")
async def portfolio_analysis(db: Session = Depends(get_db)):
    from src.services.portfolio_analysis_service import portfolio_analysis_service

    result = portfolio_analysis_service.analyze(db)
    return success_response(data=result)


# ---- Alerts ----


@router.get("/alerts")
async def get_alerts(
    is_read: bool | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    alerts = crud.get_alerts(db, is_read, limit, user_id=cast(int, user.id))
    return success_response(
        data=[
            {
                "id": a.id,
                "stockCode": a.stock_code,
                "alertType": a.alert_type,
                "condition": a.condition,
                "message": a.message,
                "triggeredAt": a.triggered_at.isoformat() if a.triggered_at else None,
                "isRead": bool(a.is_read),
                "createdAt": a.created_at.isoformat() if a.created_at else None,
            }
            for a in alerts
        ]
    )


class AlertRuleRequest(BaseModel):
    stockCode: str
    alertType: str
    condition: str
    message: str


@router.post("/alerts/rules")
async def create_alert_rule(
    req: AlertRuleRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # For now, just save as an alert triggered immediately
    alert = crud.save_alert(
        db=db,
        stock_code=req.stockCode,
        alert_type=req.alertType,
        condition=req.condition,
        message=req.message,
        triggered_at=datetime.now(),
        user_id=cast(int, user.id),
    )
    return success_response(data={"id": alert.id})


@router.put("/alerts/{alert_id}/read")
async def mark_alert_read(
    alert_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    crud.mark_alert_read(db, alert_id, user_id=cast(int, user.id))
    return success_response()
