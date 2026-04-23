# 模拟交易/虚拟盘规格

## 功能概述

提供完整的虚拟交易环境，用户可以用虚拟资金买卖股票，跟踪模拟盈亏。这是连接"分析"和"实战"的关键环节，让用户在零风险环境下验证策略。

## 设计决策

- 每个用户拥有独立的虚拟资金账户（默认 100万）。
- 买卖以当前实时价格成交（简化模型，不模拟滑点和延迟）。
- 交易记录写入 `paper_trades` 表，同时更新虚拟持仓 `paper_positions`。
- 与真实持仓 (`positions`) 表分离，避免混淆。

## API 接口

### 获取虚拟账户信息
```
GET /api/paper/account
```
Response (success_response):
```json
{
  "code": 0,
  "data": {
    "initialCash": 1000000,
    "availableCash": 350000,
    "totalMarketValue": 650000,
    "totalAssets": 1000000,
    "totalProfit": 0,
    "totalProfitPercent": 0
  },
  "message": "ok"
}
```

### 获取虚拟持仓
```
GET /api/paper/positions
```
Response (success_response):
```json
{
  "code": 0,
  "data": [
    {
      "code": "600519",
      "name": "贵州茅台",
      "quantity": 100,
      "costPrice": 1800,
      "currentPrice": 1850,
      "marketValue": 185000,
      "profit": 5000,
      "profitPercent": 2.78
    }
  ],
  "message": "ok"
}
```

### 下单（买入/卖出）
```
POST /api/paper/orders
```
Body (BaseModel):
```json
{
  "stock_code": "600519",
  "stock_name": "贵州茅台",
  "side": "buy",
  "quantity": 100,
  "order_type": "market"
}
```
Response (success_response):
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "stock_code": "600519",
    "side": "buy",
    "quantity": 100,
    "price": 1850,
    "amount": 185000,
    "status": "filled",
    "created_at": "2024-01-15T10:30:00"
  },
  "message": "下单成功"
}
```

### 获取交易记录
```
GET /api/paper/orders?limit=50
```

### 重置虚拟账户
```
POST /api/paper/reset
```
> 清空所有虚拟持仓和交易记录，资金重置为初始值。

## 数据模型

### paper_accounts 表
- id (Integer, PK)
- user_id (Integer, index)
- initial_cash (Float, default=1000000)
- available_cash (Float)
- created_at (DateTime)
- updated_at (DateTime)

### paper_positions 表
- id (Integer, PK)
- user_id (Integer, index)
- stock_code (String(20), index)
- stock_name (String(100))
- quantity (Integer)
- cost_price (Float)
- created_at (DateTime)

### paper_orders 表
- id (Integer, PK)
- user_id (Integer, index)
- stock_code (String(20))
- stock_name (String(100))
- side (String(10)) — buy / sell
- quantity (Integer)
- price (Float)
- amount (Float)
- status (String(20)) — filled / pending / cancelled
- created_at (DateTime)

## 前端设计

- 独立页面 `/paper-trading`
- 展示虚拟资金账户概览（总资产/可用资金/盈亏）
- 持仓列表（与真实持仓样式一致）
- 买卖下单弹窗（选择股票、方向、数量）
- 交易记录列表
- 重置账户按钮（带二次确认）

## Requirements

### Requirement: 用户可进行虚拟买卖
#### Scenario: 买入股票
- **GIVEN** 用户虚拟账户可用资金充足
- **WHEN** 用户提交买入 100 股 600519 的订单
- **THEN** 系统以当前价格成交，扣除资金，增加持仓

#### Scenario: 卖出股票
- **GIVEN** 用户持有 100 股 600519
- **WHEN** 用户提交卖出 50 股的订单
- **THEN** 系统以当前价格成交，增加资金，减少持仓

### Requirement: 用户可查看虚拟盈亏
- **WHEN** 用户访问虚拟盘页面
- **THEN** 系统显示总资产、持仓市值、累计盈亏

## 状态

🚧 计划中

## 优先级

**P0** — 实现交易闭环，验证分析结果。