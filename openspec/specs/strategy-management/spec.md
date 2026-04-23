# Strategy Management 策略管理规格

## 功能概述

策略 CRUD、版本管理、结构化参数定义（JSON Schema），取代原有的硬编码策略注册表。内置策略（MA交叉、RSI超卖、MACD信号）以 `is_builtin: true` 存储在 `strategies` 表中。

## API 接口

所有端点使用 `success_response` 统一包装响应。

### 策略 CRUD
```
GET /api/strategies                -- 列出用户的策略 + 内置策略
GET /api/strategies/builtin        -- 仅列出内置策略
GET /api/strategies/{id}           -- 详情
POST /api/strategies               -- 创建
PUT /api/strategies/{id}           -- 更新（builtin 策略不可修改）
DELETE /api/strategies/{id}        -- 删除（builtin 策略不可删除）
```

### 版本管理
```
GET /api/strategies/{id}/versions
POST /api/strategies/{id}/versions
```

## 数据模型

### strategies 表
- id, user_id, name, description
- category (technical/event/combined)
- strategy_code (ma_cross, rsi_oversold, macd_signal, ...)
- params_schema (JSON Schema)
- is_builtin, is_active, created_at, updated_at

### strategy_versions 表
- id, strategy_id (FK), version_number
- params_schema (JSON), changelog, created_at

## 参数验证

策略参数通过 `jsonschema.Draft7Validator` 验证。Schema 示例（MA交叉）:
```json
{
  "type": "object",
  "properties": {
    "short": {"type": "integer", "minimum": 2, "maximum": 60, "default": 5},
    "long": {"type": "integer", "minimum": 5, "maximum": 120, "default": 20}
  },
  "required": ["short", "long"]
}
```

## 内置策略

| 策略代码 | 名称 | 类别 | 参数 |
|----------|------|------|------|
| ma_cross | 双均线交叉 | technical | short, long |
| rsi_oversold | RSI超卖反弹 | technical | period, oversold, overbought |
| macd_signal | MACD信号 | technical | fast, slow, signal |

## 状态

✅ 已完成
