# AI 诊断主规格

## 功能概述

AI 驱动的股票诊断与投资建议生成。

## API 接口

### AI 股票诊断
```
POST /api/ai/analyze
```
Request:
```json
{
  "code": "600519",
  "dimensions": ["fundamental", "technical", "risk"]
}
```
Response:
```json
{
  "code": "600519",
  "fundamentalAnalysis": "基本面分析...",
  "technicalAnalysis": "技术面分析...",
  "riskAnalysis": "风险评估...",
  "finalReport": "最终建议..."
}
```

### AI 问答
```
GET /api/ai/chat?question={text}
```
Response:
```json
{
  "answer": "根据当前市场分析..."
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

## 状态

⚠️ 需要配置 AI_API_KEY 才能使用