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
> **实现方式**: 使用 query params 传递参数 (`stock_code`, `stock_name`, `quantity`, `cost_price`, `buy_date`)，未使用 BaseModel Request Body。
> 
> **注意**: 前端 `Portfolio.tsx` 实际发送 JSON body，与后端接收方式不匹配。

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
- id (Integer, PK)
- stock_code (String(20), index)
- stock_name (String(100))
- quantity (Integer)
- cost_price (Float)
- buy_date (DateTime)
- created_at (DateTime)

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
| 持仓市值 | 数量 × 现价 |
| 持仓成本 | 数量 × 成本价 |
| 盈亏金额 | 持仓市值 - 持仓成本 |
| 盈亏比例 | (盈亏金额 / 持仓成本) × 100% |

## 状态

✅ 已完成

## 已知问题

1. `POST /api/portfolio` 使用 query params，未使用 BaseModel Request Body。前端实际发送 JSON body，前后端不匹配。
2. `GET /api/portfolio` 和 `GET /api/portfolio/transactions` 直接返回数据，未统一使用 success_response 包装。