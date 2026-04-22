## Context

AI 诊断接口 `POST /api/ai/analyze` 在调用 `AIDiagnosticService.analyze()` 时，错误地将 `news` list 作为位置参数传入。由于该方法签名中第三个位置参数是 `indicators: dict = None`，导致 `indicators` 被赋值为一个 list。在 LangGraph 工作流的 `technical_node` 中，代码执行 `indicators = state.get("indicators", {})` 后调用 `indicators.get("ma5")`，从而触发 `'list' object has no attribute 'get'` 异常。

此外，`ai.py` 当前并未从数据库获取真实的 `indicators` 和 `fundamentals` 数据，导致 AI 诊断的提示词中缺乏量化指标支撑，分析质量下降。

## Goals / Non-Goals

**Goals:**
- 修复参数传递错误，确保 `news` 通过关键字参数传入，避免类型错误。
- 在调用诊断服务前，从数据库获取最新的技术指标和基本面数据，并正确传入服务。
- 保证诊断流程在数据缺失时仍能优雅降级（空 dict 而非 list）。
- 补充测试覆盖该数据获取与参数传递路径。

**Non-Goals:**
- 不改变 AI 诊断的 API 契约（request/response 格式保持不变）。
- 不修改 LangGraph 工作流内部的提示词逻辑或 AI 模型调用方式。
- 不新增新的数据表或外部依赖。

## Decisions

- **参数修复方式**: 在 `ai.py` 中改为 `diagnostic_service.analyze(req.code, stock, indicators=indicators, fundamentals=fundamentals, news=news)`，全部使用关键字参数，消除位置参数错位风险。
- **数据获取方式**: 复用现有的 `crud.get_latest_indicator()` 和 `crud.get_latest_fundamental()`（与 `/api/quant/indicators/{code}` 和 `/api/quant/fundamentals/{code}` 使用相同的 CRUD 函数），保持代码一致性。
- **缺失数据处理**: 若数据库中无指标或基本面数据，传入 `{}` 空字典。`ai_diagnostic.py` 各节点中已有 `.get()` 的默认值处理，可自然降级。
- **测试策略**: 在 `tests/api/test_routes.py` 中增加对 POST `/api/ai/analyze` 的单元测试；在 `tests/e2e/test_quant.py` 或新建 `tests/e2e/test_ai.py` 中增加 E2E 测试，验证端到端流程。

## Risks / Trade-offs

- **[Risk] 数据库中无指标数据导致 AI 诊断提示词为空** → Mitigation: 传入 `{}` 后，提示词中指标值会显示为 "N/A"，服务仍可返回分析结果，不会崩溃。
- **[Risk] 修改现有 API 测试时破坏其他测试** → Mitigation: 仅添加新测试用例，不修改现有断言；在 E2E 测试中使用 mock 外部 AI API。
