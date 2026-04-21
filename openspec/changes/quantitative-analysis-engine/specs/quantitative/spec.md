# 量化分析引擎规格

## 功能概述

提供量化投资所需的核心分析能力：技术指标计算、策略回测、组合风险分析、基本面数据、告警系统。是系统从"AI 文本助手"升级为"数据驱动量化平台"的关键模块。

## API 接口

### 技术指标

```
GET /api/quant/indicators/:code
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
  }
}
```

```
GET /api/quant/indicators/:code/history?limit=60
```
返回近 60 个交易日的指标历史，用于图表绘制。

### 策略回测

```
POST /api/quant/backtest
```
Body:
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
    "totalReturn": 15.5,
    "annualizedReturn": 12.3,
    "maxDrawdown": -8.2,
    "sharpeRatio": 1.15,
    "winRate": 55.0,
    "tradeCount": 12,
    "equityCurve": [
      {"date": "2025-01-02", "value": 100000},
      {"date": "2025-01-05", "value": 102000}
    ],
    "trades": [
      {"date": "2025-01-05", "action": "buy", "price": 1600, "shares": 62}
    ]
  }
}
```

```
GET /api/quant/backtests
GET /api/quant/backtests/:id
```

### 基本面数据

```
GET /api/quant/fundamentals/:code
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
    "roe": 25.5,
    "grossMargin": 91.5,
    "revenueGrowth": 15.2,
    "debtRatio": 25.0
  }
}
```

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
    "industryDistribution": {
      "白酒": 40,
      "新能源": 30,
      "银行": 30
    },
    "correlationMatrix": {
      "600519": {"600519": 1.0, "300750": 0.3, "000001": 0.1},
      "300750": {"600519": 0.3, "300750": 1.0, "000001": 0.2},
      "000001": {"600519": 0.1, "300750": 0.2, "000001": 1.0}
    }
  }
}
```

### 告警

```
GET /api/quant/alerts
POST /api/quant/alerts/rules
PUT /api/quant/alerts/:id/read
```

## 数据模型

参见 `design.md` 中的完整表结构。

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

🚧 计划中
