# 量化分析引擎规格

## 功能概述

提供量化投资所需的核心分析能力：技术指标计算、策略回测、组合风险分析、基本面数据、告警系统。

## API 接口

量化分析模块的所有端点均使用 `success_response` 统一包装响应 (`{"code": 0, "data": ..., "message": "ok"}`)。

### 技术指标

```
GET /api/quant/indicators/{code}
```
Response:
```json
{
  "code": 0,
  "data": {
    "stockCode": "600519",
    "tradeDate": "2026-04-21",
    "ma5": 1680.5,
    "ma10": 1670.2,
    "ma20": 1655.8,
    "ma60": 1600.1,
    "rsi6": 65.3,
    "rsi12": 58.7,
    "rsi24": 52.1,
    "macdDif": 2.35,
    "macdDea": 1.80,
    "macdBar": 1.10,
    "kdjK": 78.5,
    "kdjD": 72.3,
    "kdjJ": 90.9,
    "bollUpper": 1720.0,
    "bollMid": 1650.0,
    "bollLower": 1580.0,
    "volMa5": 5000000,
    "volMa10": 4800000
  },
  "message": "ok"
}
```

```
GET /api/quant/indicators/{code}/history?limit=60
```
返回近 60 个交易日的指标历史，用于图表绘制。

### 策略回测

```
POST /api/quant/backtest
```
Body (BaseModel):
```json
{
  "stockCode": "600519",
  "strategy": "ma_cross",
  "strategyParams": {"short": 5, "long": 20},
  "startDate": "2025-01-01",
  "endDate": "2026-04-21",
  "initialCash": 100000
}
```
Response:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "total_return": 15.5,
    "annualized_return": 12.3,
    "max_drawdown": -8.2,
    "sharpe_ratio": 1.15,
    "win_rate": 55.0,
    "trade_count": 12,
    "equity_curve": [
      {"date": "2025-01-02", "value": 100000}
    ],
    "trades": [
      {"date": "2025-01-05", "action": "buy", "price": 1600, "shares": 62}
    ],
    "final_value": 115500
  },
  "message": "ok"
}
```
> **注意**: 返回字段为 snake_case (`total_return` 等)，与列表接口的 camelCase 不一致。

```
GET /api/quant/backtests?limit=50
GET /api/quant/backtests/{id}
```
列表接口返回 camelCase:
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "strategy": "ma_cross",
      "stockCode": "600519",
      "startDate": "2025-01-01",
      "endDate": "2026-04-21",
      "totalReturn": 15.5,
      "annualizedReturn": 12.3,
      "maxDrawdown": -8.2,
      "sharpeRatio": 1.15,
      "winRate": 55.0,
      "tradeCount": 12
    }
  ],
  "message": "ok"
}
```

### 基本面数据

```
GET /api/quant/fundamentals/{code}
```
Response:
```json
{
  "code": 0,
  "data": {
    "stockCode": "600519",
    "reportDate": "2025-12-31",
    "peTtm": 28.5,
    "pb": 8.2,
    "ps": 5.5,
    "roe": 25.5,
    "roa": 18.2,
    "grossMargin": 91.5,
    "netMargin": 52.3,
    "revenueGrowth": 15.2,
    "profitGrowth": 18.5,
    "debtRatio": 25.0,
    "freeCashFlow": 5000000000
  },
  "message": "ok"
}
```
> 若数据库无数据，会尝试从 akshare 实时拉取并缓存。

### 组合分析

```
GET /api/quant/portfolio/analysis
```
Response:
```json
{
  "code": 0,
  "data": {
    "sharpeRatio": 1.2,
    "maxDrawdown": -10.5,
    "volatility": 18.3,
    "industryDistribution": { "其他": 100 },
    "correlationMatrix": {
      "600519": {"600519": 1.0, "300750": 0.3}
    }
  },
  "message": "ok"
}
```
> `industryDistribution` 当前为占位实现 (始终返回 `{"其他": 100}`)。

### 告警

```
GET /api/quant/alerts?is_read={bool}&limit=50
POST /api/quant/alerts/rules
PUT /api/quant/alerts/{id}/read
```

告警规则 Request Body (BaseModel):
```json
{
  "stockCode": "600519",
  "alertType": "price_breakout",
  "condition": "price > 1900",
  "message": "价格突破1900元"
}
```

## 数据模型

### stock_indicators 表
- id, stock_code, trade_date
- ma5/10/20/60, rsi6/12/24
- macd_dif/dea/bar
- kdj_k/d/j
- boll_upper/mid/lower
- vol_ma5/10
- created_at

### stock_fundamentals 表
- id, stock_code, report_date
- pe_ttm, pb, ps
- roe, roa, gross_margin, net_margin
- revenue_growth, profit_growth
- debt_ratio, free_cash_flow
- created_at

### strategy_backtests 表
- id, strategy_name, stock_code
- start_date, end_date, initial_cash, final_value
- total_return, annualized_return, max_drawdown
- sharpe_ratio, win_rate, trade_count
- trades (JSON), equity_curve (JSON)
- created_at

### alerts 表
- id, stock_code, alert_type, condition
- triggered_at, message, is_read (Integer: 1/0)
- created_at

## 内置策略

| 策略名 | 说明 | 参数 |
|--------|------|------|
| ma_cross | MA金叉死叉 | short, long |
| rsi_oversold | RSI超买卖 | period, oversold, overbought |
| macd_signal | MACD金叉死叉 | fast, slow, signal |

## Scheduler Pipeline

每日 15:30 收盘后自动执行：
1. 拉取自选股行情 → stock_daily_prices
2. 计算指标 → stock_indicators
3. 扫描告警规则 → alerts
4. （季度）更新基本面 → stock_fundamentals

## 状态

✅ 已完成

## 已知问题

1. `POST /backtest` 返回 snake_case 字段 (`total_return`)，而 `GET /backtests` 返回 camelCase (`totalReturn`)，两者不一致。
2. `industryDistribution` 为占位实现，始终返回 `{"其他": 100}`。
3. `create_alert_rule` 当前直接将规则保存为已触发告警，未实现真正的规则扫描引擎。