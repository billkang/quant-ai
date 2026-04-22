# 智能选股/股票筛选器规格

## 功能概述

基于多维度条件筛选股票，是量化投资平台的核心功能。用户通过组合基本面、技术面、市场表现等条件快速定位符合策略的股票池，替代手动翻看的低效方式。

## 设计决策

- 筛选条件由后端 SQL 查询实时计算（基于 stock_fundamentals + stock_indicators + stock_daily_prices）。
- 支持保存筛选模板，方便复用。
- 结果支持按任意字段排序。

## API 接口

### 执行筛选
```
POST /api/screener/run
```
Body (BaseModel):
```json
{
  "conditions": [
    { "field": "pe_ttm", "operator": "<", "value": 30 },
    { "field": "roe", "operator": ">", "value": 15 },
    { "field": "rsi6", "operator": "<", "value": 30 },
    { "field": "market_cap", "operator": ">", "value": 10000000000 }
  ],
  "sort_by": "pe_ttm",
  "sort_order": "asc",
  "limit": 50
}
```

支持的条件字段：
| 字段 | 类型 | 来源 |
|------|------|------|
| pe_ttm | Float | stock_fundamentals |
| pb | Float | stock_fundamentals |
| roe | Float | stock_fundamentals |
| revenue_growth | Float | stock_fundamentals |
| debt_ratio | Float | stock_fundamentals |
| rsi6/12/24 | Float | stock_indicators |
| ma5/10/20/60 | Float | stock_indicators |
| macd_dif | Float | stock_indicators |
| change_percent | Float | stock_daily_prices (最新日) |
| volume | Float | stock_daily_prices (最新日) |
| market_cap | Float | 计算字段 (price * total_shares) |

Response (success_response):
```json
{
  "code": 0,
  "data": {
    "count": 23,
    "stocks": [
      {
        "code": "000001",
        "name": "平安银行",
        "price": 10.5,
        "changePercent": 1.2,
        "peTtm": 5.2,
        "pb": 0.8,
        "roe": 15.5,
        "rsi6": 28.0
      }
    ]
  },
  "message": "ok"
}
```

### 保存筛选模板
```
POST /api/screener/templates
```
Body:
```json
{
  "name": "低估值高ROE",
  "conditions": [
    { "field": "pe_ttm", "operator": "<", "value": 20 },
    { "field": "roe", "operator": ">", "value": 15 }
  ]
}
```

### 获取筛选模板列表
```
GET /api/screener/templates
```

### 删除筛选模板
```
DELETE /api/screener/templates/{id}
```

## 数据模型

### screener_templates 表
- id (Integer, PK)
- user_id (Integer, index) — 关联 users.id (引入用户系统后)
- name (String(100))
- conditions (JSON) — 条件数组
- created_at (DateTime)

## 前端设计

- 独立页面 `/screener`
- 条件构建器：下拉选择字段 → 选择操作符 → 输入数值
- 实时预览结果表格
- 一键将筛选结果加入自选股
- 保存/加载筛选模板

## Requirements

### Requirement: 用户可通过条件筛选股票
#### Scenario: 筛选低估值股票
- **WHEN** 用户设置 PE < 20 且 ROE > 15
- **THEN** 系统返回符合条件的股票列表

### Requirement: 用户可保存筛选模板
#### Scenario: 保存常用筛选条件
- **WHEN** 用户点击保存模板并命名
- **THEN** 系统保存模板，下次可直接加载

## 状态

🚧 计划中

## 优先级

**P0** — 量化平台的核心功能。