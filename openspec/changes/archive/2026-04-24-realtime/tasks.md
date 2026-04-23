# Tasks: realtime

## Task 1: 创建 WebSocket 行情推送服务
- [x] 在 `server/src/api/ws.py` 中创建 WebSocket 路由 `/api/ws/market`
- [x] 实现订阅/取消订阅消息协议
- [x] 在 `server/src/main.py` 中注册 WebSocket 路由
- [x] 验证：客户端可连接并接收推送

## Task 2: Scheduler 集成 WebSocket 推送
- [x] 修改 `scheduler.py`，`daily_data_update` 价格更新后通过 WebSocket 推送
- [x] 添加 `broadcast_sync` 同步广播方法
- [x] 验证：价格变化时客户端收到推送

## Task 3: 前端 WebSocket 接入
- [x] 在 `client/src/services/websocket.ts` 中封装 WebSocket 客户端
- [x] `Dashboard.tsx` 优先使用 WebSocket 接收行情，失败时降级轮询
- [x] 验证：行情实时更新

## Task 4: 编写测试
- [x] 后端 API 路由已注册，代码通过语法检查
- [x] Docker 构建验证通过
