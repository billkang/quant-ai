## 1. 修改 AI 诊断服务返回详细结果

- [x] 1.1 修改 `AIDiagnosticService.analyze()` 返回 dict 包含所有分析字段
- [x] 1.2 更新 `/api/ai/analyze` 端点处理新的返回结构

## 2. 新增历史详情 API

- [x] 2.1 新增 `GET /api/ai/history/{id}` 端点
- [x] 2.2 在 crud.py 添加 `get_diagnostic_history_by_id` 方法

## 3. 测试验证

- [x] 3.1 构建并测试新 API 响应
- [x] 3.2 验证历史记录正确保存各维度分析结果

## 4. 前端展示

- [x] 4.1 更新 History 接口类型包含详情字段
- [x] 4.2 添加详情弹窗 Modal
- [x] 4.3 历史列表点击查看详情
- [x] 4.4 详情弹窗展示四个维度分析结果