# Tasks: paper-trading

## Task 1: 创建虚拟盘数据模型和数据库迁移
- [ ] 在 `server/src/models/models.py` 中新增 `PaperAccount`, `PaperPosition`, `PaperOrder` 模型
- [ ] 创建 Alembic migration
- [ ] 验证：数据库表已创建

## Task 2: 实现虚拟盘账户 API
- [ ] 创建 `server/src/api/paper.py`
- [ ] `GET /api/paper/account` - 账户信息
- [ ] `GET /api/paper/positions` - 持仓列表
- [ ] `POST /api/paper/orders` - 下单（买入/卖出）
- [ ] `GET /api/paper/orders` - 交易记录
- [ ] `POST /api/paper/reset` - 重置账户
- [ ] 在 `server/src/main.py` 中注册 router
- [ ] 验证：下单、持仓、盈亏计算正确

## Task 3: 前端虚拟盘页面
- [ ] 创建 `client/src/pages/PaperTrading.tsx`
- [ ] 账户概览卡片（总资产/可用资金/盈亏）
- [ ] 持仓列表（同 Portfolio 样式）
- [ ] 买卖下单弹窗
- [ ] 交易记录列表
- [ ] 重置账户按钮（二次确认）
- [ ] 在 `Layout.tsx` 导航中添加 "虚拟盘" 入口
- [ ] 验证：页面功能完整

## Task 4: 编写测试
- [ ] 后端单元测试：订单撮合、盈亏计算
- [ ] E2E 测试：买入→持仓→卖出→盈亏完整流程
- [ ] 验证：所有测试通过
