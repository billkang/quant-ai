# Portfolio 持仓管理主规格

## 功能概述

持仓记账、盈亏分析、仓位管理。

## API 接口

### 获取持仓列表（虚拟持仓）
```
GET /api/portfolio?backtest_task_id={optional}
```
> 持仓现在为虚拟持仓，关联回测任务。支持按 `backtest_task_id` 过滤。

Response (success_response 包装):
```json
{
  "code": 0,
  "data": {
    "positions": [
      {
        "id": 1,
        "backtestTaskId": 12,
        "strategyId": 3,
        "code": "600519",
        "name": "贵州茅台",
        "quantity": 100,
        "avgCost": 1800.00,
        "currentPrice": 1850.00,
        "unrealizedPnl": 5000.00,
        "profit": 5000.00,
        "profitPercent": 2.78,
        "isActive": 1
      }
    ],
    "totalValue": 185000.00,
    "totalCost": 180000.00,
    "totalProfit": 5000.00
  },
  "message": "ok"
}
```
> **注意**: `currentPrice` 使用最新收盘价，非实时行情。

### 获取交易记录
```
GET /api/portfolio/transactions?limit=50
```
Response: 直接返回数组 (无 success_response 包装)
```json
[
  {
    "code": "600519",
    "name": "贵州茅台",
    "type": "buy",
    "quantity": 100,
    "price": 1800.00,
    "commission": 5.00,
    "date": "2024-01-10"
  }
]
```

## 数据模型

### strategy_positions 表
- id (Integer, PK)
- user_id (Integer, index)
- backtest_task_id (Integer, FK → backtest_tasks.id, index)
- strategy_id (Integer, FK → strategies.id)
- stock_code (String(20), index)
- stock_name (String(100))
- quantity (Integer)
- avg_cost (Float)
- unrealized_pnl (Float)
- is_active (Integer, default=1)
- buy_date (DateTime)
- created_at (DateTime)
- updated_at (DateTime)

### transactions 表
- id (Integer, PK)
- stock_code (String(20), index)
- stock_name (String(100))
- type (String(10))
- quantity (Integer)
- price (Float)
- commission (Float, default=0)
- trade_date (DateTime)
- created_at (DateTime)

## 统计指标

| 指标 | 计算方式 |
|------|----------|
| 持仓市值 | 数量 × 收盘价 |
| 持仓成本 | 数量 × 平均成本 |
| 盈亏金额 | 持仓市值 - 持仓成本 |
| 盈亏比例 | (盈亏金额 / 持仓成本) × 100% |

## 状态

✅ 已完成

## 已知问题

1. `GET /api/portfolio/transactions` 直接返回数据，未统一使用 success_response 包装。
2. 虚拟持仓目前需要手动从回测 trades 生成，后续可改为自动创建。