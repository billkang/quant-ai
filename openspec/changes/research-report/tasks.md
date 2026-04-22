# Tasks: research-report

## Task 1: 创建研报和公告数据模型和数据库迁移
- [ ] 在 `server/src/models/models.py` 中新增 `ResearchReport`, `StockNotice` 模型
- [ ] 创建 Alembic migration
- [ ] 验证：数据库表已创建

## Task 2: 实现研报和公告 API
- [ ] 创建 `server/src/api/research.py`
- [ ] `GET /api/research/reports?symbol={code}` - 研报列表
- [ ] `GET /api/research/notices?symbol={code}` - 公告列表
- [ ] `POST /api/research/fetch` - 手动拉取
- [ ] 在 `server/src/main.py` 中注册 router
- [ ] 验证：API 返回正确数据

## Task 3: Scheduler 集成研报公告抓取
- [ ] 扩展 `scheduler.py`，每日 15:35 抓取研报和公告
- [ ] 使用 AkShare 获取数据
- [ ] 数据去重（按 url）
- [ ] 验证：Scheduler 正常抓取

## Task 4: 前端页面集成
- [ ] `StockDetail.tsx` 新增 "研报" 和 "公告" Tab
- [ ] `News.tsx` 的 "股票公告" 和 "宏观资讯" Tab 填充真实数据
- [ ] AI 诊断结果中展示相关研报和公告摘要
- [ ] 验证：页面展示正确

## Task 5: 编写测试
- [ ] 后端单元测试：研报/公告抓取和存储
- [ ] E2E 测试：API 返回数据完整
- [ ] 验证：所有测试通过
