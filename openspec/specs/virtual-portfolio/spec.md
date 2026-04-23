# Virtual Portfolio 虚拟持仓规格

## 功能概述

持仓从真实交易记账改为虚拟/模拟持仓，关联回测任务 (`backtest_task_id`)。PnL 计算基于最新收盘价，反映策略回测后的模拟持仓状态。

## API 接口

### 获取虚拟持仓
```
GET /api/portfolio?backtest_task_id={optional}
```
返回 `success_response` 包装的数据：
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

## 数据模型

### strategy_positions 表
- id, user_id, backtest_task_id (FK), strategy_id (FK)
- stock_code, stock_name, quantity, avg_cost
- unrealized_pnl, is_active, buy_date
- created_at, updated_at

## 关键变更

- 移除手动持仓添加/删除 API（`POST /portfolio`, `DELETE /portfolio/{code}`）
- 持仓由回测 `trades` JSON 自动生成
- `currentPrice` 使用 `stock_daily_prices` 最新收盘价，非实时行情

## 状态

✅ 已完成
