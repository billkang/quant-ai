# Portfolio 持仓管理主规格

## 功能概述

持仓记账、盈亏分析、仓位管理。

## API 接口

### 获取持仓列表
```
GET /api/portfolio
```
Response:
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
Body:
{
  "stock_code": "600519",
  "stock_name": "贵州茅台",
  "quantity": 100,
  "cost_price": 1800.00,
  "buy_date": "2024-01-10"
}
```

### 删除持仓
```
DELETE /api/portfolio/600519
```

### 获取交易记录
```
GET /api/transactions?limit=50
```
Response:
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