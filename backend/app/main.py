import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import routes
from app.services.market_engine import MarketEngine
from app.websocket.manager import ws_manager
from app.utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing TradoEasy Market Engine...")
    loop = asyncio.get_running_loop()
    ws_manager.set_event_loop(loop)

    engine = MarketEngine(broadcast_callback=ws_manager.queue_broadcast_tick)
    ws_manager.set_market_engine(engine)
    routes.set_market_engine(engine)

    engine.start()
    logger.info(f"TradoEasy backend started in {engine.get_current_mode_label()} mode.")

    yield

    # Shutdown
    logger.info("Shutting down TradoEasy Market Engine...")
    engine.stop()
    logger.info("TradoEasy backend stopped.")


app = FastAPI(
    title="TradoEasy Market Intelligence API",
    description="Real-time Indian Equity Market Monitoring and Stock-Scanning Terminal",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Vite dev server & production domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include REST routes
app.include_router(routes.router)


@app.websocket("/ws/market")
async def market_websocket_endpoint(websocket: WebSocket):
    """Central WebSocket endpoint for real-time market ticks, alerts, and snapshots."""
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await ws_manager.handle_client_message(websocket, data)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket endpoint error: {e}")
        ws_manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
