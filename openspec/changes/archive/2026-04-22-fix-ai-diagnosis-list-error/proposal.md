## Why

AI 股票诊断（POST /api/ai/analyze）在调用诊断服务时存在参数传递错误，导致 `indicators` 参数被传入了一个 list（新闻列表），随后在技术面上节点调用 `.get()` 时触发 `AttributeError: 'list' object has no attribute 'get'`，前端显示"分析失败"。该错误使得 AI 诊断功能完全不可用，需要立即修复。

## What Changes

- 修复 `server/src/api/ai.py` 中 `diagnostic_service.analyze()` 的参数传递错误：将 `news` 改为关键字参数 `news=news` 传入。
- 在调用诊断服务前，从数据库获取该股票的最新技术指标 (`indicators`) 和基本面数据 (`fundamentals`)，并正确传入分析服务，使 AI 诊断拥有真实数据支撑。
- 为修复后的代码路径补充单元测试和 E2E 测试，确保参数传递和数据获取逻辑被覆盖。

## Capabilities

### New Capabilities
<!-- 无新增能力，仅为 bug 修复 -->
- (none)

### Modified Capabilities
<!-- 本变更为纯实现层 bug 修复，API 契约与行为规格不变，不涉及 spec 需求变更 -->
- (none)

## Impact

- **Backend**: `server/src/api/ai.py`, `server/src/services/ai_diagnostic.py`
- **Tests**: `server/tests/api/test_routes.py`, `server/tests/e2e/test_quant.py`（或新建 `test_ai.py`）
- **API 契约**: 无变化，POST /api/ai/analyze 的 request/response 格式保持不变
- **Dependencies**: 无新增依赖
