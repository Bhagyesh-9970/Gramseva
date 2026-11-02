import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.seed import seed_database
from app.services.simulator import simulator
from app.api import (
    auth, villages, water, pds, maintenance, complaints,
    alerts, simulation, analytics
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize and seed database if empty
    try:
        seed_database()
    except Exception as e:
        print("Database seed check error:", e)

    # Start IoT simulation loop background task if not running unit test
    sim_task = None
    if not getattr(app.state, "testing", False):
        sim_task = asyncio.create_task(simulator.simulation_loop())
    try:
        yield
    finally:
        if sim_task:
            sim_task.cancel()
            try:
                await sim_task
            except asyncio.CancelledError:
                pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Smart Water, Stronger Villages — Integrated Digital Gram Panchayat Platform",
    version="2.4.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(villages.router, prefix=settings.API_V1_STR)
app.include_router(water.router, prefix=settings.API_V1_STR)
app.include_router(pds.router, prefix=settings.API_V1_STR)
app.include_router(maintenance.router, prefix=settings.API_V1_STR)
app.include_router(complaints.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(simulation.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

# Real-time WebSocket endpoint for telemetry and live alerts
@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await websocket.accept()
    simulator.connected_websockets.append(websocket)
    try:
        # Send initial status
        await websocket.send_json({
            "type": "CONNECTION_ESTABLISHED",
            "mode": simulator.mode,
            "message": "Connected to Smart Water IoT Telemetry Stream"
        })
        while True:
            # Keep-alive receive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in simulator.connected_websockets:
            simulator.connected_websockets.remove(websocket)
    except Exception:
        if websocket in simulator.connected_websockets:
            simulator.connected_websockets.remove(websocket)

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "status": "ONLINE",
        "docs_url": "/docs",
        "api_prefix": settings.API_V1_STR,
        "mode": simulator.mode
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "simulator": "active" if simulator.is_running else "paused",
        "connected_clients": len(simulator.connected_websockets)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
