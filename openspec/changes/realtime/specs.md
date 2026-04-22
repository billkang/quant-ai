# 实时行情推送规格

## 功能概述

当前系统通过 HTTP 轮询获取行情数据，效率低且实时性差。引入 WebSocket 实现服务器主动向客户端推送行情更新，提升自选股监控和告警的实时性。

## 设计决策

- 使用 **FastAPI + WebSocket** (`fastapi.WebSocket`) 实现推送服务。
- 行情数据变化频率高，使用 **Redis Pub/Sub** 作为消息总线，Scheduler 发布价格更新，WebSocket 服务订阅并推送给客户端。
- 客户端连接时订阅其关注的股票列表（基于自选股）。
- 为控制服务器负载，行情推送间隔限制为 **3秒**（非 tick 级别）。

## API 接口

### WebSocket 连接
```
WS /api/ws/market
```

连接建立后，客户端发送订阅消息：
```json
{ "action": "subscribe", "codes": ["600519", "000001"] }
```

服务端推送行情更新：
```json
{
  "type": "quote",
  "data": {
    "600519": {
      "code": "600519",
      "name": "贵州茅台",
      "price": 1852.00,
      "change": 2.00,
      "changePercent": 0.11,
      "volume": 1250000
    }
  }
}
```

### 告警推送
```json
{
  "type": "alert",
  "data": {
    "id": 1,
    "stockCode": "600519",
    "alertType": "price_breakout",
    "message": "贵州茅台价格突破 1900"
  }
}
```

### HTTP 轮询兜底
WebSocket 不可用时，前端自动降级为 HTTP 轮询（保持现有逻辑）。

## 后端架构

```
Scheduler Pipeline
    │
    ├─ 15:30 收盘后批量计算 ──→ Redis Pub/Sub (channel: market:batch)
    │                              │
    └─ 盘中实时行情 ───────────→ Redis Pub/Sub (channel: market:realtime)
                                   │
                                   ↓
                          WebSocket Manager
                                   │
                                   ↓
                          推送给订阅的客户端
```

### WebSocket 管理器
```python
class MarketWebSocketManager:
    def __init__(self):
        self.connections: dict[str, list[WebSocket]] = {}  # code -> [ws]
    
    async def connect(self, ws: WebSocket, codes: list[str]):
        await ws.accept()
        for code in codes:
            self.connections.setdefault(code, []).append(ws)
    
    async def broadcast(self, code: str, data: dict):
        for ws in self.connections.get(code, []):
            await ws.send_json(data)
```

## 前端适配

- `Dashboard.tsx` 优先使用 WebSocket 接收行情，失败时降级轮询。
- `StockDetail.tsx` 进入页面时订阅该股票实时行情。
- `Alerts.tsx` 通过 WebSocket 接收实时告警推送（右上角 toast 提示）。

## 数据流

1. Scheduler 定时抓取行情 → 存入 `stock_daily_prices`
2. Scheduler 发布价格更新到 Redis Pub/Sub
3. WebSocket 服务消费 Redis 消息 → 推送给客户端

## Requirements

### Requirement: 客户端可接收实时行情推送
#### Scenario: 自选股价格更新
- **GIVEN** 用户已登录且已添加 600519 到自选股
- **WHEN** 600519 价格发生变化
- **THEN** 用户在 Dashboard 看到价格实时更新

### Requirement: 客户端可接收实时告警
#### Scenario: 价格突破告警
- **GIVEN** 用户设置了 600519 价格突破 1900 的告警
- **WHEN** 600519 价格达到 1900
- **THEN** 用户收到 WebSocket 推送的告警消息

## 状态

🚧 计划中

## 优先级

**P1** — 大幅提升用户体验，但现有轮询可正常工作。