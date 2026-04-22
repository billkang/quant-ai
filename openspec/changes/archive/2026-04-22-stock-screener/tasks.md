# Tasks: stock-screener

## Task 1: 创建 screener_templates 数据模型和数据库迁移
- [x] 在 `server/src/models/models.py` 中新增 `ScreenerTemplate` 模型
- [x] 创建 Alembic migration
- [x] 验证：数据库表已创建

## Task 2: 实现股票筛选 API
- [x] 创建 `server/src/api/screener.py`，实现 `POST /api/screener/run`
- [x] 支持条件字段：pe_ttm, pb, roe, rsi6, change_percent, volume 等
- [x] 支持排序和分页
- [x] 在 `server/src/main.py` 中注册 scrouter router
- [x] 验证：API 返回符合条件的股票列表

## Task 3: 实现筛选模板 CRUD
- [x] `POST /api/screener/templates` - 保存模板
- [x] `GET /api/screener/templates` - 列表
- [x] `DELETE /api/screener/templates/{id}` - 删除
- [x] 验证：模板可保存和加载

## Task 4: 前端筛选器页面
- [x] 创建 `client/src/pages/Screener.tsx`
- [x] 条件构建器：下拉选择字段 + 操作符 + 数值输入
- [x] 结果表格展示，支持排序
- [x] 一键加入自选股按钮
- [x] 保存/加载模板功能
- [x] 在 `Layout.tsx` 导航中添加 "选股" 入口
- [x] 验证：页面功能完整

## Task 5: 编写测试
- [x] 后端 E2E 测试：`tests/e2e/test_screener.py`
- [x] 验证：测试通过
