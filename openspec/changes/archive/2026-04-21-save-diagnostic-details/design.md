## Context

当前 AI 诊断使用 LangGraph 工作流，分四个节点并行分析：
- fundamental_node → 基本面分析
- technical_node → 技术面分析  
- risk_node → 风险评估
- synthesize_node → 综合生成最终报告

`analyze()` 方法只返回 `final_report`，其他分析结果未返回给调用方。

数据库 DiagnosticHistory 模型已有 `fundamental_analysis`, `technical_analysis`, `risk_analysis` 字段，但当前只保存空字符串。

## Goals / Non-Goals

**Goals:**
- 修改 `AIDiagnosticService.analyze()` 返回完整分析结果（包含三个维度的分项）
- 保存所有分析字段到数据库
- 新增 API 获取单条历史详情

**Non-Goals:**
- 不修改前端展示逻辑（前端可在后续迭代中增强）
- 不添加新的分析维度

## Decisions

1. **返回结构**：修改 `analyze()` 返回 dict 而非 str，包含:
   ```python
   {
     "fundamental_analysis": "...",
     "technical_analysis": "...", 
     "risk_analysis": "...",
     "final_report": "..."
   }
   ```
   
   **Rationale**: 保持向后兼容，同时提供完整数据。

2. **数据库保存**：API 层直接调用返回的详细结果进行保存。

3. **新 API**: `/api/ai/history/{id}` 返回单条完整记录。

## Risks / Trade-offs

- [Risk] API 改动可能影响现有前端
  - **Mitigation**: API 响应新增字段 `fundamental_analysis` 等为可选，前端不依赖则忽略
- [Risk] 历史数据中旧记录的值可能为空
  - **Mitigation**: 展示时检查字段是否为空