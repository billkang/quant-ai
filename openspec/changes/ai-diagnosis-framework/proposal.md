# AI 诊断框架升级

## Why

当前 AI 诊断使用简单的 API 调用方式，难以扩展。存在以下问题：
- 无法实现复杂的多步骤诊断流程
- 缺乏对诊断结果的标准化评估
- 难以添加新的分析维度
- 无法实现诊断历史追踪

## What Changes

- 将 AI 诊断模块重构为基于 LangChain/LangGraph 的框架
- 实现标准化的诊断工作流
- 支持多维度分析（基本面、技术面、资金面、风险评估）
- 添加诊断历史记录功能

## Capabilities

- `langchain-integration`: 使用 LangChain LCEL 定义诊断链
- `diagnostic-workflow`: 使用 LangGraph 实现有向无环图工作流
- `evaluation`: 诊断结果评分系统
- `history`: 诊断历史记录

## Impact

- 新增 `langchain`, `langgraph` 依赖
- 修改 `server/src/services/ai_analysis.py`
- 新增诊断历史表
- 需要配置 `AI_API_KEY`