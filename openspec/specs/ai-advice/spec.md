# AI 诊断主规格

## 功能概述

AI 驱动的股票诊断与投资建议生成。

## API 接口

### AI 股票诊断 (遗留端点)
```
GET /api/ai/analyze?code=600519
```
> **遗留端点**: 直接返回原始 JSON，未使用 success_response 包装。

Response:
```json
{
  "code": "600519",
  "advice": "根据当前市场分析..."
}
```

### AI 股票诊断 (V2)
```
POST /api/ai/analyze
```
Request (BaseModel):
```json
{
  "code": "600519",
  "dimensions": ["fundamental", "technical", "risk"]
}
```
Response (success_response 包装):
```json
{
  "code": 0,
  "data": {
    "code": "600519",
    "fundamental_analysis": "基本面分析...",
    "technical_analysis": "技术面分析...",
    "risk_analysis": "风险评估...",
    "final_report": "最终建议..."
  },
  "message": "ok"
}
```
> **注意**: 成功时会自动保存诊断历史到 `diagnostic_history` 表。外层 `code: 0` 与 data 中的 `code` (股票代码) 命名相同，含义不同。

### 获取诊断历史列表
```
GET /api/ai/history?code={stock_code}&limit={limit}
```
Response: 直接返回数组 (无 success_response 包装)
```json
[
  {
    "id": 1,
    "stockCode": "600519",
    "stockName": "贵州茅台",
    "finalReport": "最终建议...",
    "score": "买入",
    "createdAt": "2024-01-15T10:00:00"
  }
]
```

### 获取单条诊断详情
```
GET /api/ai/history/{id}
```
Response: 直接返回 dict (无 success_response 包装)
```json
{
  "id": 1,
  "stockCode": "600519",
  "stockName": "贵州茅台",
  "fundamentalAnalysis": "基本面分析...",
  "technicalAnalysis": "技术面分析...",
  "riskAnalysis": "风险评估...",
  "finalReport": "最终建议...",
  "score": "买入",
  "createdAt": "2024-01-15T10:00:00"
}
```

### AI 问答
```
GET /api/ai/chat?question={text}
```
Response (success_response 包装):
```json
{
  "code": 0,
  "data": { "answer": "根据当前市场分析..." },
  "message": "ok"
}
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|-------|
| AI_API_KEY | AI 服务 API Key | - |
| AI_MODEL | AI 模型 | deepseek-chat |

## 提示词设计

### 股票诊断提示词

包含以下维度：
1. 基本面分析（营收、利润、市盈率等）
2. 技术面分析（均线、MACD、RSI等）
3. 资金面分析（主力资金流向）
4. 风险评估
5. 投资建议

### 问答提示词

结合上下文提供个性化回答。

## 错误处理

| 错误 | 说明 |
|------|------|
| AI_API_KEY 未配置 | 返回提示配置环境变量 |
| API 调用失败 | 返回错误信息给用户 |
| 股票不存在 | 返回 "股票不存在" |

## 数据模型

### diagnostic_history 表
- id (Integer, PK)
- stock_code (String(20), index)
- stock_name (String(100))
- fundamental_analysis (String)
- technical_analysis (String)
- risk_analysis (String)
- final_report (String)
- score (String(10))
- created_at (DateTime)

## 状态

✅ 已完成

## 已知问题

1. 同时存在 `GET /api/ai/analyze` 和 `POST /api/ai/analyze`。
2. `GET /history` 和 `GET /history/{id}` 直接返回数据，未统一使用 success_response 包装。
3. `POST /analyze` 的响应 data 中包含 `code` 字段（股票代码），与外层 `code: 0`（状态码）命名冲突。