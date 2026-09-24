import pytest
from starlette.testclient import TestClient
from app.main import app


def test_rest_endpoints_health_and_snapshot():
    # TestClient automatically executes the FastAPI lifespan context manager
    with TestClient(app) as client:
        # 1. Health check
        res_health = client.get("/health")
        assert res_health.status_code == 200
        assert res_health.json()["status"] == "healthy"

        # 2. Market status
        res_mstatus = client.get("/api/market-status")
        assert res_mstatus.status_code == 200
        assert "status" in res_mstatus.json()

        # 3. Universes list
        res_universes = client.get("/api/universes")
        assert res_universes.status_code == 200
        universes_data = res_universes.json()
        assert "universes" in universes_data
        assert any(u["id"] == "nifty_500" for u in universes_data["universes"])
        assert any(u["id"] == "nifty_bank" for u in universes_data["universes"])

        # 4. Status endpoint
        res_status = client.get("/api/status")
        assert res_status.status_code == 200
        status_data = res_status.json()
        assert status_data["mode"] in ("LIVE", "DEMO")
        assert status_data["connection_status"] in ("CONNECTED", "CONNECTING", "DISCONNECTED")

        # 5. Snapshot endpoint
        res_snap = client.get("/api/snapshot")
        assert res_snap.status_code == 200
        snap_data = res_snap.json()
        assert "ticks" in snap_data
        assert len(snap_data["ticks"]) > 0
        assert "summary" in snap_data
        assert snap_data["summary"]["stocks_monitored"] > 0
