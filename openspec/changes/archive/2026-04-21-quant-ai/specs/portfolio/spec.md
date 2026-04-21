# Portfolio 持仓管理

## 功能概述

持仓记账、盈亏分析。

## API 接口

### 获取持仓列表
```
GET /api/portfolio
```
- 返回：股票代码、名称、持仓量、成本价、现价、盈亏、盈亏比例

### 添加持仓
```
POST /api/portfolio
Body: { stock_code, stock_name, quantity, cost_price, buy_date? }
```

### 删除持仓
```
DELETE /api/portfolio/{stock_code}
```

### 获取交易记录
```
GET /api/transactions?limit={50}
```

## 状态

✅ 已完成