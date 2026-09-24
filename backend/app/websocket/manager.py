import asyncio
import json
import time
from typing import Set, Dict, Any, Optional
from fastapi import WebSocket, WebSocketDisconnect
from app.utils.logger import logger


class MarketWebSocketManager:
    """
    Centralized FastAPI WebSocket connection manager.
    Handles browser client connections, subscriptions, heartbeats,
    and batched tick broadcasts.
    """

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self._market_engine = None
        self._loop: Optional[asyncio.AbstractEventLoop] = None
        self._batch_queue: list = []
        self._flush_task: Optional[asyncio.Task] = None
        self._lock = asyncio.Lock()

    def set_market_engine(self, engine) -> None:
        self._market_engine = engine

    def set_event_loop(self, loop: asyncio.AbstractEventLoop) -> None:
        self._loop = loop

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"Client connected to WebSocket. Total active clients: {len(self.active_connections)}")

        # Send initial snapshot immediately upon connect
        if self._market_engine:
            snapshot = self._market_engine.get_snapshot()
            await websocket.send_json({
                "type": "SNAPSHOT",
                "data": snapshot
            })

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Client disconnected. Active clients remaining: {len(self.active_connections)}")

    async def broadcast_json(self, message: Dict[str, Any]) -> None:
        """Broadcasts a JSON message to all connected clients."""
        if not self.active_connections:
            return

        dead_connections = set()
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.add(connection)

        for dead in dead_connections:
            self.disconnect(dead)

    def queue_broadcast_tick(self, payload: Dict[str, Any]) -> None:
        """
        Thread-safe entrypoint called by MarketEngine to queue updates.
        Schedules broadcast on the asyncio event loop.
        """
        if not self.active_connections or not self._loop:
            return

        if self._loop.is_running():
            asyncio.run_coroutine_threadsafe(self._process_queue_item(payload), self._loop)

    async def _process_queue_item(self, payload: Dict[str, Any]) -> None:
        async with self._lock:
            self._batch_queue.append(payload)
            if not self._flush_task or self._flush_task.done():
                self._flush_task = asyncio.create_task(self._flush_batch())

    async def _flush_batch(self) -> None:
        """Throttles tick delivery to 60ms batch window to preserve browser frame rate."""
        await asyncio.sleep(0.06)
        async with self._lock:
            items_to_send = list(self._batch_queue)
            self._batch_queue.clear()

        if not items_to_send or not self.active_connections:
            return

        # Deduplicate to send only latest tick per symbol in this batch
        latest_ticks: Dict[str, Dict] = {}
        all_alerts = []

        for item in items_to_send:
            tick = item.get("tick")
            if tick and "symbol" in tick:
                latest_ticks[tick["symbol"]] = tick
            alerts = item.get("alerts", [])
            if alerts:
                all_alerts.extend(alerts)

        batch_msg = {
            "type": "BATCH_UPDATE",
            "ticks": list(latest_ticks.values()),
            "alerts": all_alerts,
            "timestamp": int(time.time())
        }

        await self.broadcast_json(batch_msg)

    async def handle_client_message(self, websocket: WebSocket, data: str) -> None:
        """Processes incoming client command over WebSocket."""
        try:
            msg = json.loads(data)
            action = msg.get("action")

            if action == "PING":
                await websocket.send_json({"type": "PONG", "timestamp": int(time.time())})

            elif action == "CHANGE_UNIVERSE":
                universe_id = msg.get("universe_id")
                if universe_id and self._market_engine:
                    success = self._market_engine.set_active_universe(universe_id)
                    if success:
                        snapshot = self._market_engine.get_snapshot()
                        await self.broadcast_json({
                            "type": "SNAPSHOT",
                            "data": snapshot
                        })

            elif action == "REQUEST_SNAPSHOT":
                if self._market_engine:
                    snapshot = self._market_engine.get_snapshot()
                    await websocket.send_json({
                        "type": "SNAPSHOT",
                        "data": snapshot
                    })

        except Exception as e:
            logger.error(f"Error handling WebSocket client message: {e}")


ws_manager = MarketWebSocketManager()
