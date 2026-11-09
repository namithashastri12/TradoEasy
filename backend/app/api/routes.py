from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.models.catalog import UNIVERSES, INSTRUMENTS_MAP, SECTORS
from app.models.market import SystemStatusResponse, MarketStatusInfo, AlertRule
from app.services.fyers_auth import fyers_auth_manager
from app.utils.market_timing import evaluate_market_status
from app.utils.logger import logger

router = APIRouter()

# Market engine instance reference will be injected at startup
market_engine_instance = None


def set_market_engine(engine):
    global market_engine_instance
    market_engine_instance = engine


class SelectUniverseRequest(BaseModel):
    universe_id: str


class AuthCodeRequest(BaseModel):
    auth_code: str


class DirectTokenRequest(BaseModel):
    token: str


class CredentialsRequest(BaseModel):
    client_id: Optional[str] = None
    secret_key: Optional[str] = None
    redirect_uri: Optional[str] = None


class ModeRequest(BaseModel):
    mode: str


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "tradoeasy-backend",
        "version": "1.0.0"
    }


@router.get("/api/status", response_model=SystemStatusResponse)
def get_system_status():
    if not market_engine_instance:
        raise HTTPException(status_code=503, detail="Market engine not ready")
    return market_engine_instance.get_system_status()


@router.get("/api/market-status")
def get_market_status():
    return evaluate_market_status()


@router.get("/api/universes")
def get_universes():
    result = []
    for uid, u in UNIVERSES.items():
        result.append({
            "id": u.id,
            "name": u.name,
            "category": u.category,
            "description": u.description,
            "symbols_count": len(u.symbols)
        })
    return {
        "universes": result,
        "sectors": SECTORS,
        "default": "nifty_500"
    }


@router.get("/api/instruments")
def get_instruments():
    return [meta.model_dump() for meta in INSTRUMENTS_MAP.values()]


@router.get("/api/snapshot")
def get_snapshot():
    """
    Returns current in-memory market snapshot for the active universe.
    Used for initial load and 1-minute auto-refresh.
    """
    if not market_engine_instance:
        raise HTTPException(status_code=503, detail="Market engine not ready")
    return market_engine_instance.get_snapshot()


@router.post("/api/universe/select")
def select_universe(payload: SelectUniverseRequest):
    if not market_engine_instance:
        raise HTTPException(status_code=503, detail="Market engine not ready")
    success = market_engine_instance.set_active_universe(payload.universe_id)
    if not success:
        raise HTTPException(status_code=400, detail=f"Universe '{payload.universe_id}' not found")
    return {
        "success": True,
        "universe_id": payload.universe_id,
        "snapshot": market_engine_instance.get_snapshot()
    }


# =============================================================================
# FYERS Authentication Routes (OAuth2 code flow & token management)
# =============================================================================

@router.post("/api/auth/url")
def get_auth_url():
    """Generates official FYERS OAuth 2.0 authorization URL."""
    try:
        return fyers_auth_manager.get_login_url()
    except Exception as e:
        logger.error(f"Failed to generate FYERS auth URL: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/auth/token")
def exchange_token(payload: AuthCodeRequest):
    """Exchanges user's authorization code for FYERS access token."""
    result = fyers_auth_manager.exchange_auth_code(payload.auth_code)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message"))

    # Automatically activate LIVE mode with FYERS streaming
    if market_engine_instance:
        market_engine_instance.set_mode("live")

    return result


@router.post("/api/auth/direct-token")
def set_direct_token(payload: DirectTokenRequest):
    """Allows setting an active FYERS access token directly."""
    result = fyers_auth_manager.set_direct_token(payload.token)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message"))

    # Automatically activate LIVE mode with FYERS streaming
    if market_engine_instance:
        market_engine_instance.set_mode("live")

    return result


@router.post("/api/auth/credentials")
def update_fyers_credentials(payload: CredentialsRequest):
    """Updates FYERS API App ID (Client ID) and Secret Key at runtime."""
    result = fyers_auth_manager.update_credentials(
        client_id=payload.client_id or "",
        secret_key=payload.secret_key or "",
        redirect_uri=payload.redirect_uri
    )
    return result


@router.post("/api/mode")
def set_application_mode(payload: ModeRequest):
    """Switches system runtime mode dynamically between LIVE and DEMO."""
    if not market_engine_instance:
        raise HTTPException(status_code=503, detail="Market engine not ready")
    success = market_engine_instance.set_mode(payload.mode)
    if not success and payload.mode.upper() == "LIVE":
        raise HTTPException(
            status_code=400,
            detail="Cannot switch to LIVE mode: Valid FYERS authentication token required."
        )
    return {
        "success": True,
        "mode": market_engine_instance.get_current_mode_label()
    }


@router.get("/api/auth/status")
def get_auth_status():
    """Checks if FYERS authentication is valid and profile accessible."""
    is_auth = fyers_auth_manager.is_authenticated()
    if not is_auth:
        return {
            "authenticated": False,
            "mode": market_engine_instance.get_current_mode_label() if market_engine_instance else "DEMO",
            "message": "Not authenticated with FYERS"
        }
    validation = fyers_auth_manager.validate_connection()
    return {
        "authenticated": validation.get("valid", False),
        "mode": market_engine_instance.get_current_mode_label() if market_engine_instance else "DEMO",
        "user": validation.get("name"),
        "fy_id": validation.get("fy_id")
    }


# =============================================================================
# Informational Alerts Routes
# =============================================================================

@router.get("/api/alerts")
def get_alerts():
    if not market_engine_instance:
        return []
    return [r.model_dump() for r in market_engine_instance.alerts.get_rules()]


@router.post("/api/alerts")
def create_alert(rule: AlertRule):
    if not market_engine_instance:
        raise HTTPException(status_code=503, detail="Market engine not ready")
    created = market_engine_instance.alerts.add_rule(rule)
    return created.model_dump()


@router.delete("/api/alerts/{rule_id}")
def delete_alert(rule_id: str):
    if not market_engine_instance:
        raise HTTPException(status_code=503, detail="Market engine not ready")
    removed = market_engine_instance.alerts.remove_rule(rule_id)
    return {"success": removed}


# =============================================================================
# Expired F&O Contracts Data Endpoints (Modular architecture for future use)
# =============================================================================

@router.get("/api/fno/expiry-dates")
def get_expired_fno_expiry_dates(symbol: str, range_from: str, range_to: str):
    if not market_engine_instance:
        raise HTTPException(status_code=503, detail="Market engine not ready")
    return market_engine_instance.historical_data.get_expired_fno_expiry_dates(symbol, range_from, range_to)


@router.get("/api/fno/contracts")
def get_expired_fno_contracts(symbol: str, expiry_date: str):
    if not market_engine_instance:
        raise HTTPException(status_code=503, detail="Market engine not ready")
    return market_engine_instance.historical_data.get_expired_fno_contracts(symbol, expiry_date)


@router.get("/api/fno/historical-data")
def get_expired_fno_historical_data(
    symbol: str, resolution: str, range_from: str, range_to: str, greeks: str = "1"
):
    if not market_engine_instance:
        raise HTTPException(status_code=503, detail="Market engine not ready")
    return market_engine_instance.historical_data.get_expired_fno_historical_data(
        symbol, resolution, range_from, range_to, greeks
    )


# =============================================================================
# 15-Day Rolling Daily History Endpoints
# =============================================================================

@router.get("/api/history/summary")
def get_daily_history_summary():
    """Returns status and date coverage of the 15-day rolling daily history."""
    from app.services.daily_history import daily_history_manager
    return daily_history_manager.get_summary()


@router.get("/api/history/dates")
def get_daily_history_dates():
    """Returns all available dates in the 15-day rolling history window."""
    from app.services.daily_history import daily_history_manager
    return {"dates": daily_history_manager.get_available_dates()}


@router.get("/api/history/day/{date_str}")
def get_daily_history_day(date_str: str):
    """Returns the full 208-stock records for a specific saved date."""
    from app.services.daily_history import daily_history_manager
    records = daily_history_manager.get_day_snapshot(date_str)
    return {
        "date": date_str,
        "count": len(records),
        "records": records,
        "stocks": records
    }


@router.get("/api/history/symbol/{symbol}")
def get_daily_history_symbol(symbol: str, limit: int = Query(default=15, ge=1, le=30)):
    """Returns daily history performance for a single stock up to the 15-day limit."""
    from app.services.daily_history import daily_history_manager
    records = daily_history_manager.get_symbol_history(symbol, limit=limit)
    return {
        "symbol": symbol,
        "count": len(records),
        "history": records
    }


@router.post("/api/history/save-now")
def save_daily_history_now():
    """Forces an immediate save of the current 208 stocks to daily history."""
    if not market_engine_instance:
        raise HTTPException(status_code=503, detail="Market engine not ready")
    saved_count = market_engine_instance.save_daily_history()
    return {
        "success": True,
        "saved_count": saved_count,
        "message": f"Successfully archived {saved_count} stocks to 15-day rolling daily history."
    }
