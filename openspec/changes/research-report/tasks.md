# Tasks: research-report

## Task 1: 创建研报和公告数据模型和数据库迁移
- [x] 在 `server/src/models/models.py` 中新增 `ResearchReport`, `StockNotice` 模型
- [x] 创建 Alembic migration (`49079679cb0d_add_research_reports_and_notices.py`)
- [x] 验证：数据库表已创建

## Task 2: 实现研报和公告 API
- [x] 创建 `server/src/api/research.py`
- [x] `GET /api/research/reports?symbol={code}` - 研报列表
- [x] `GET /api/research/notices?symbol={code}` - 公告列表
- [x] `POST /api/research/fetch` - 手动拉取
- [x] 在 `server/src/main.py` 中注册 router
- [x] 验证：API 返回正确数据

## Task 3: Scheduler 集成研报公告抓取
- [x] 扩展 `scheduler.py`，每日 15:35 抓取研报和公告
- [x] 验证：Scheduler 任务已注册

## Task 4: 前端页面集成
- [x] `StockDetail.tsx` 新增 "研报" 和 "公告" Tab
- [x] 验证：页面展示正确

## Task 5: 编写测试
- [x] 后端单元测试：研报/公告 API (`tests/api/test_research.py`)
- [x] 验证：所有测试通过
