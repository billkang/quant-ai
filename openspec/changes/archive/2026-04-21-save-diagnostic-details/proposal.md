## Why

当前 AI 诊断结果只保存了 `final_report`，但基本面、技术面、风险面的详细分析内容在 API 调用完成后被丢弃，导致历史记录无法查看完整的诊断细节。用户在查看历史记录时只能看到最终建议，缺少分析过程。

## What Changes

1. 修改 `AIDiagnosticService.analyze()` 返回详细分析结果（包含 fundamental_analysis, technical_analysis, risk_analysis）
2. 修改 `/api/ai/analyze` 端点保存所有分析字段到数据库
3. 新增 `/api/ai/history/{id}` 接口获取单条诊断的完整详情

## Capabilities

### New Capabilities
- `diagnostic-history-detail`: 查看历史诊断的完整详情（基本面/技术面/风险面/最终报告）
- `save-diagnostic-details`: 保存完整诊断结果到数据库

### Modified Capabilities
- `ai-advice`: 现有 ai-advice spec 需要更新，history 返回的详情结构变化

## Impact

- `server/src/services/ai_diagnostic.py` - 修改返回结构
- `server/src/main.py` - 修改保存逻辑和新增 API
- `server/src/models/models.py` - DiagnosticHistory 模型已存在
- 前端 `/ai-advice` - 展示详情弹窗