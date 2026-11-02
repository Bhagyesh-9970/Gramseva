from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.simulator import simulator
from app.schemas.schemas import SimulatorControl, ScenarioSelect, ManualSensorAdjust

router = APIRouter(prefix="/simulation", tags=["Hardware Simulation"])

@router.get("/status")
def get_simulation_status():
    return {
        "mode": simulator.mode,
        "is_running": simulator.is_running,
        "speed": simulator.speed_multiplier,
        "active_scenario": simulator.active_scenario,
        "hardware_panel": {
            "esp32_device_id": "ESP32-NODE-01-SHIVA",
            "esp32_status": "ONLINE",
            "ip_address": "192.168.1.101",
            "mac_address": "24:6F:28:B1:C4:E0",
            "mqtt_broker": "broker.hivemq.com:1883",
            "mqtt_status": "CONNECTED",
            "active_topic": "smartpanchayat/v1/shiva/node1/telemetry",
            "firmware_version": "v2.4.1-Build2026",
            "sensors_connected": 5
        }
    }

@router.post("/control")
def control_simulation(req: SimulatorControl):
    if req.action == "START":
        simulator.set_running(True)
    elif req.action == "PAUSE":
        simulator.set_running(False)
    elif req.action == "RESET":
        simulator.set_running(True)
        simulator.set_speed(1.0)
        simulator.set_scenario("NORMAL")
    if req.speed is not None:
        simulator.set_speed(req.speed)
    return {"message": f"Simulator action {req.action} applied", "is_running": simulator.is_running, "speed": simulator.speed_multiplier}

@router.post("/scenario")
def trigger_scenario(req: ScenarioSelect):
    simulator.set_scenario(req.scenario)
    return {"message": f"Scenario '{req.scenario}' triggered successfully", "active_scenario": req.scenario}

@router.post("/sensor-manual")
def manual_sensor_adjust(req: ManualSensorAdjust):
    simulator.update_sensor_manual(req.sensor_type, req.asset_id, req.value)
    return {"message": f"Sensor manual adjustment applied for {req.sensor_type} to {req.value}"}

@router.post("/mode")
def toggle_mode(mode: str):
    if mode not in ["SIMULATION", "LIVE_HARDWARE"]:
        raise HTTPException(status_code=400, detail="Mode must be SIMULATION or LIVE_HARDWARE")
    simulator.mode = mode
    return {"message": f"System operational mode switched to {mode}", "mode": mode}
