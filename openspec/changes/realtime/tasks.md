# Tasks: realtime

## Task 1: 创建 WebSocket 行情推送服务
- [ ] 在 `server/src/api/ws.py` 中创建 WebSocket 路由 `/api/ws/market`
- [ ] 实现订阅/取消订阅消息协议
- [ ] 使用 Redis Pub/Sub 作为消息总线
- [ ] 在 `server/src/main.py` 中注册 WebSocket 路由
- [ ] 验证：客户端可连接并接收推送

## Task 2: Scheduler 集成 Redis Pub/Sub
- [ ] 修改 `scheduler.py`，价格更新时发布到 Redis
- [ ] WebSocket 服务订阅 Redis 频道并推送给客户端
- [ ] 控制推送频率（3秒间隔）
- [ ] 验证：价格变化时客户端收到推送

## Task 3: 前端 WebSocket 接入
- [ ] 在 `client/src/services/websocket.ts` 中封装 WebSocket 客户端
- [ ] `Dashboard.tsx` 优先使用 WebSocket，降级为轮询
- [ ] `StockDetail.tsx` 进入页面时订阅该股票行情
- [ ] 告警通过 WebSocket 推送（右上角 toast）
- [ ] 验证：行情实时更新

## Task 4: 编写测试
- [ ] 后端单元测试：WebSocket 连接和消息格式
- [ ] E2E 测试：WebSocket 推送流程
- [ ] 验证：所有测试通过
