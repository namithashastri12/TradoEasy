import threading
import time
from typing import List, Callable, Optional, Dict, Any
from app.config import settings
from app.utils.logger import logger

try:
    from fyers_apiv3.FyersWebsocket import data_ws
except ImportError:
    data_ws = None


class FyersMarketDataService:
    """
    Manages the persistent FYERS Data WebSocket (FyersDataSocket) in SymbolUpdate mode.
    Subscribes to instruments, receives live ticks, handles reconnections,
    and forwards ticks to the market engine.
    """

    def __init__(self, auth_manager, on_tick_callback: Optional[Callable[[Dict[str, Any]], None]] = None):
        self.auth_manager = auth_manager
        self.on_tick_callback = on_tick_callback
        self.fyers_socket = None
        self._thread: Optional[threading.Thread] = None
        self._is_running = False
        self._connected = False
        self._subscribed_symbols: List[str] = []
        self._last_tick_time: Optional[float] = None
        self._connection_state = "DISCONNECTED"  # CONNECTING, CONNECTED, RECONNECTING, DISCONNECTED

    @property
    def is_connected(self) -> bool:
        return self._connected

    @property
    def connection_state(self) -> str:
        return self._connection_state

    @property
    def last_tick_time(self) -> Optional[float]:
        return self._last_tick_time

    def start(self, symbols: List[str]) -> bool:
        """Starts the FYERS Data WebSocket in a dedicated background thread."""
        if not data_ws:
            logger.error("fyers_apiv3 library not available for market data socket.")
            return False

        token = self.auth_manager.get_access_token()
        client_id = settings.FYERS_CLIENT_ID
        if token and not client_id:
            try:
                import json
                import base64
                parts = token.split(".")
                if len(parts) >= 2:
                    padding = "=" * (4 - (len(parts[1]) % 4))
                    payload = json.loads(base64.urlsafe_b64decode(parts[1] + padding))
                    fy_id = payload.get("fy_id")
                    app_type = payload.get("appType", 200)
                    if fy_id:
                        client_id = f"{fy_id}-{app_type}"
                        logger.info(f"Auto-resolved FYERS Client ID from token: {client_id}")
            except Exception as e:
                logger.warning(f"Could not auto-derive client_id from token: {e}")

        if not token or not client_id:
            logger.warning("Cannot start FYERS market data: Access token or Client ID missing.")
            self._connection_state = "DISCONNECTED"
            return False

        # Format required by FYERS v3: "client_id:access_token"
        composite_token = f"{client_id}:{token}"
        self._subscribed_symbols = symbols[:200]  # Respect FYERS 200 symbol socket limit
        self._is_running = True
        self._connection_state = "CONNECTING"
        logger.info(f"Initiating FYERS Data WebSocket for {len(self._subscribed_symbols)} symbols...")

        def _on_open():
            self._connected = True
            self._connection_state = "CONNECTED"
            logger.info(f"FYERS Data WebSocket connected! Subscribing to {len(self._subscribed_symbols)} symbols...")
            try:
                if self.fyers_socket and self._subscribed_symbols:
                    self.fyers_socket.subscribe(symbols=self._subscribed_symbols, data_type="SymbolUpdate")
            except Exception as e:
                logger.error(f"Error subscribing to symbols on open: {e}")

        def _on_close(message):
            self._connected = False
            self._connection_state = "DISCONNECTED"
            logger.warning(f"FYERS Data WebSocket closed: {message}")

        def _on_error(message):
            logger.error(f"FYERS Data WebSocket error: {message}")
            if isinstance(message, dict) and message.get("type") == "sub" and "invalid_symbols" in message:
                bad_syms = set(message.get("invalid_symbols", []))
                cleaned = [s for s in self._subscribed_symbols if s not in bad_syms]
                if cleaned and len(cleaned) < len(self._subscribed_symbols):
                    logger.info(f"Retrying FYERS subscription with {len(cleaned)} valid symbols (stripped {len(bad_syms)} invalid: {bad_syms})...")
                    self._subscribed_symbols = cleaned
                    self._connected = True
                    self._connection_state = "CONNECTED"
                    try:
                        if self.fyers_socket:
                            self.fyers_socket.subscribe(symbols=self._subscribed_symbols, data_type="SymbolUpdate")
                    except Exception as err:
                        logger.error(f"Retry subscribe error: {err}")
                    return

            self._connected = False
            self._connection_state = "RECONNECTING"

        def _on_message(message):
            if not isinstance(message, dict):
                return
            # Verify tick payload has necessary information
            if "ltp" in message and "symbol" in message:
                self._last_tick_time = time.time()
                self._tick_count = getattr(self, "_tick_count", 0) + 1
                if self._tick_count == 1:
                    logger.info(f"First FYERS tick received: {message.get('symbol')} @ {message.get('ltp')}")
                elif self._tick_count % 500 == 0:
                    logger.info(f"Received {self._tick_count} FYERS live ticks (latest: {message.get('symbol')} @ {message.get('ltp')})")

                if self.on_tick_callback:
                    try:
                        self.on_tick_callback(message)
                    except Exception as e:
                        logger.error(f"Error processing FYERS tick in callback: {e}")

        def _run_socket():
            while self._is_running:
                try:
                    logger.info(f"Initializing FYERS Data WebSocket for {len(self._subscribed_symbols)} symbols...")
                    self._connection_state = "CONNECTING"
                    self.fyers_socket = data_ws.FyersDataSocket(
                        access_token=composite_token,
                        log_path="",
                        litemode=False,
                        write_to_file=False,
                        reconnect=False,
                        on_connect=_on_open,
                        on_close=_on_close,
                        on_error=_on_error,
                        on_message=_on_message
                    )
                    self.fyers_socket.connect()

                    # Persistent watchdog loop: monitors health and keeps thread alive
                    while self._is_running:
                        time.sleep(2)
                        if not self._is_running:
                            break

                        if not self._connected:
                            logger.warning("FYERS Data WebSocket disconnected. Re-establishing connection...")
                            break

                        now = time.time()
                        # If stall reaches 25 seconds, force fresh socket reconnection
                        if self._last_tick_time and (now - self._last_tick_time > 25):
                            logger.warning("FYERS tick stall exceeded 25s. Forcing fresh socket connection...")
                            break

                except Exception as e:
                    self._connected = False
                    self._connection_state = "DISCONNECTED"
                    logger.error(f"FYERS Data WebSocket exception: {e}")

                if self.fyers_socket:
                    old_sock = self.fyers_socket
                    self.fyers_socket = None
                    def _async_close(sock):
                        try:
                            if hasattr(sock, "_FyersDataSocket__ws_object") and sock._FyersDataSocket__ws_object:
                                sock._FyersDataSocket__ws_object.close()
                        except Exception:
                            pass
                        try:
                            sock.close_connection()
                        except Exception:
                            pass
                    threading.Thread(target=_async_close, args=(old_sock,), daemon=True).start()

                if self._is_running:
                    time.sleep(3)

        self._thread = threading.Thread(target=_run_socket, daemon=True, name="FyersWebSocketWorker")
        self._thread.start()
        return True

    def update_subscriptions(self, new_symbols: List[str]) -> None:
        """Dynamically updates the subscribed symbols on the active socket."""
        capped_symbols = new_symbols[:200]
        if not self._connected or not self.fyers_socket:
            self._subscribed_symbols = capped_symbols
            return

        to_unsubscribe = [s for s in self._subscribed_symbols if s not in capped_symbols]
        to_subscribe = [s for s in capped_symbols if s not in self._subscribed_symbols]

        try:
            if to_unsubscribe:
                self.fyers_socket.unsubscribe(symbols=to_unsubscribe, data_type="SymbolUpdate")
            if to_subscribe:
                self.fyers_socket.subscribe(symbols=to_subscribe, data_type="SymbolUpdate")
            self._subscribed_symbols = capped_symbols
            logger.info(f"Updated FYERS subscriptions: +{len(to_subscribe)}, -{len(to_unsubscribe)}")
        except Exception as e:
            logger.error(f"Failed to update FYERS subscriptions: {e}")

    def stop(self) -> None:
        """Gracefully disconnects the WebSocket."""
        self._is_running = False
        self._connected = False
        self._connection_state = "DISCONNECTED"
        if self.fyers_socket:
            try:
                self.fyers_socket.close_connection()
            except Exception:
                pass
            self.fyers_socket = None
        logger.info("FYERS Data WebSocket stopped.")
