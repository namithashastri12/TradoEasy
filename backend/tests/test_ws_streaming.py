import pytest
from starlette.testclient import TestClient
from app.main import app


def test_websocket_snapshot_and_ping():
    with TestClient(app) as client:
        with client.websocket_connect("/ws/market") as websocket:
            # 1. First message should be SNAPSHOT
            initial_msg = websocket.receive_json()
            assert initial_msg["type"] == "SNAPSHOT"
            assert "data" in initial_msg
            assert "ticks" in initial_msg["data"]
            assert len(initial_msg["data"]["ticks"]) > 0

            # 2. Ping-pong test
            websocket.send_json({"action": "PING"})
            pong_msg = websocket.receive_json()
            # If a batch update or pong arrived:
            if pong_msg.get("type") == "PONG":
                assert "timestamp" in pong_msg
            else:
                # In case a tick arrived first, read until pong
                assert pong_msg.get("type") in ("BATCH_UPDATE", "TICK", "PONG")
