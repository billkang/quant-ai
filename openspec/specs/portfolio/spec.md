# Portfolio 持仓管理主规格

## 功能概述

持仓记账、盈亏分析、仓位管理。

## API 接口

### 获取持仓列表
```
GET /api/portfolio
```
Response: 直接返回 dict (无 success_response 包装)
```json
{
  "positions": [
    {
      "code": "600519",
      "name": "贵州茅台",
      "quantity": 100,
      "costPrice": 1800.00,
      "currentPrice": 1850.00,
      "profit": 5000.00,
      "profitPercent": 2.78
    }
  ],
  "totalValue": 185000.00,
  "totalCost": 180000.00,
  "totalProfit": 5000.00
}
```

### 添加持仓
```
POST /api/portfolio
```
> **注意**: 当前使用 query params 传递参数，未使用 BaseModel Request Body。不符合项目规范。

Query params:
- `stock_code`: 股票代码
- `stock_name`: 股票名称
- `quantity`: 数量
- `cost_price`: 成本价
- `buy_date`: 买入日期 (可选, 格式: YYYY-MM-DD)

Response:
```json
{ "code": 0, "data": null, "message": "ok" }
```

### 删除持仓
```
DELETE /api/portfolio/{stock_code}
```
Response:
```json
{ "code": 0, "data": null, "message": "ok" }
```

### 获取交易记录
```
GET /api/portfolio/transactions?limit=50
```
> **注意**: 实际路径为 `/api/portfolio/transactions`，非 `/api/transactions`。

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

### positions 表
- id: 主键
- stock_code: 股票代码
- stock_name: 股票名称
- quantity: 持仓数量
- cost_price: 成本价
- buy_date: 买入日期
- created_at: 创建时间

### transactions 表
- id: 主键
- stock_code: 股票代码
- stock_name: 股票名称
- type: 类型 (buy/sell)
- quantity: 数量
- price: 价格
- commission: 佣金
- trade_date: 交易日期
- created_at: 创建时间

## 统计指标

| 指标 | 计算方式 |
|------|----------|
| 持仓市值 | 数量 × 现价 |
| 持仓成本 | 数量 × 成本价 |
| 盈亏金额 | 持仓市值 - 持仓成本 |
| 盈亏比例 | (盈亏金额 / 持仓成本) × 100% |

## 状态

✅ 已完成

## 遗留问题

1. `POST /api/portfolio` 应改为 BaseModel Request Body 以符合项目规范。
2. `GET /api/portfolio` 和 `GET /api/portfolio/transactions` 直接返回数据，未统一使用 success_response 包装。