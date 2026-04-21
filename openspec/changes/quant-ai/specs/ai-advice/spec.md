# AI 诊断

## 功能概述

AI 驱动的股票诊断与投资建议。

## API 接口

### AI 股票诊断
```
GET /api/ai/analyze?code={stock_code}
```
- 需要配置 AI_API_KEY 环境变量

### AI 问答
```
GET /api/ai/chat?question={text}
```

## 场景

### 诊断请求
- **WHEN** 用户选择自选股进行 AI 诊断
- **THEN** 系统返回包含基本面、技术面、风险评估和建议的综合分析

### 错误处理
- 返回 API 错误信息给用户

## 环境变量

```bash
AI_API_KEY=your_api_key
AI_MODEL=deepseek-chat
```

## 状态

⚠️ 需要配置 AI API Key 才能使用