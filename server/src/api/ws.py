import asyncio
import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["realtime"])


class ConnectionManager:
    def __init__(self):
        self.connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, codes: list[str]):
        await websocket.accept()
        for code in codes:
            self.connections.setdefault(code, []).append(websocket)

    def disconnect(self, websocket: WebSocket):
        for _code, ws_list in self.connections.items():
            if websocket in ws_list:
                ws_list.remove(websocket)

    async def broadcast(self, code: str, data: dict):
        ws_list = self.connections.get(code, [])
        dead = []
        for ws in ws_list:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            ws_list.remove(ws)

    def broadcast_sync(self, code: str, data: dict):
        """Synchronous wrapper for broadcast."""
        try:
            loop = asyncio.get_running_loop()
            asyncio.run_coroutine_threadsafe(self.broadcast(code, data), loop)
        except RuntimeError:
            # No running loop; create a new one
            asyncio.run(self.broadcast(code, data))


manager = ConnectionManager()


@router.websocket("/market")
async def market_websocket(websocket: WebSocket):
    await websocket.accept()
    subscribed_codes: list[str] = []
    try:
        while True:
            message = await websocket.receive_text()
            try:
                data = json.loads(message)
                action = data.get("action")
                codes = data.get("codes", [])
                if action == "subscribe" and codes:
                    for code in codes:
                        manager.connections.setdefault(code, []).append(websocket)
                    subscribed_codes.extend(codes)
                    await websocket.send_json(
                        {"type": "system", "message": "subscribed", "codes": codes}
                    )
                elif action == "unsubscribe" and codes:
                    for code in codes:
                        if code in manager.connections and websocket in manager.connections[code]:
                            manager.connections[code].remove(websocket)
                    await websocket.send_json(
                        {"type": "system", "message": "unsubscribed", "codes": codes}
                    )
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "message": "Invalid JSON"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)
