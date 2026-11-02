import asyncio
import datetime
import random
from typing import Dict, Any, List, Optional
from app.db.session import SessionLocal
from app.db.models import WaterTank, Pump, Sensor, SensorReading, Alert, AuditLog

class HardwareSimulator:
    def __init__(self):
        self.is_running: bool = True
        self.speed_multiplier: float = 1.0
        self.mode: str = "SIMULATION" # "SIMULATION" or "LIVE_HARDWARE"
        self.active_scenario: str = "NORMAL" # NORMAL, TANK_LOW, PUMP_ANOMALY, PUMP_FAILURE, LEAKAGE, SENSOR_OFFLINE
        self.connected_websockets: List[Any] = []
        self._task: Optional[asyncio.Task] = None

        # In-memory device telemetry cache
        self.telemetry_state: Dict[str, Any] = {
            "mode": "SIMULATION",
            "is_running": True,
            "speed": 1.0,
            "active_scenario": "NORMAL",
            "esp32_status": "ONLINE",
            "mqtt_broker_status": "CONNECTED",
            "last_packet_time": datetime.datetime.utcnow().isoformat(),
            "tanks": {},
            "pumps": {},
            "sensors": {},
            "recent_events": []
        }

    def set_running(self, running: bool):
        self.is_running = running
        self.telemetry_state["is_running"] = running

    def set_speed(self, speed: float):
        self.speed_multiplier = max(0.5, min(10.0, speed))
        self.telemetry_state["speed"] = self.speed_multiplier

    def set_scenario(self, scenario: str):
        self.active_scenario = scenario
        self.telemetry_state["active_scenario"] = scenario
        self._apply_scenario(scenario)

    def _apply_scenario(self, scenario: str):
        db = SessionLocal()
        try:
            now = datetime.datetime.utcnow()
            tank1 = db.query(WaterTank).filter(WaterTank.id == "tank-01").first()
            pump1 = db.query(Pump).filter(Pump.id == "pump-01").first()
            flow_sensor = db.query(Sensor).filter(Sensor.sensor_uid == "FLOW-MAIN-01").first()

            if scenario == "NORMAL":
                if tank1:
                    tank1.current_level_pct = 72.0
                    tank1.current_level_liters = tank1.capacity_liters * 0.72
                    tank1.status = "NORMAL"
                if pump1:
                    pump1.is_running = True
                    pump1.current_amperes = 13.5
                    pump1.fault_status = "NORMAL"
                if flow_sensor:
                    flow_sensor.current_value = 145.0
                    flow_sensor.status = "ONLINE"

            elif scenario == "TANK_LOW":
                if tank1:
                    tank1.current_level_pct = 18.0
                    tank1.current_level_liters = tank1.capacity_liters * 0.18
                    tank1.status = "LOW"
                    # Create alert
                    db.add(Alert(
                        module="WATER",
                        severity="WARNING",
                        title=f"{tank1.name} Level Low (18%)",
                        message="Reservoir level reached low reserve. Recommended to switch on standby feeder pump.",
                        source_asset=tank1.name,
                        village_id=tank1.village_id
                    ))

            elif scenario == "PUMP_ANOMALY":
                if pump1:
                    pump1.is_running = True
                    pump1.current_amperes = 4.1 # Dry run
                    pump1.fault_status = "DRY_RUN_WARNING"
                    db.add(Alert(
                        module="WATER",
                        severity="WARNING",
                        title=f"{pump1.name} Dry-Run / Low Current Warning",
                        message=f"Current consumption is 4.1A (normal: 10.0A-16.5A). Possible air suction or well water drawdown.",
                        source_asset=pump1.name,
                        village_id=pump1.village_id
                    ))

            elif scenario == "PUMP_FAILURE":
                if pump1:
                    pump1.is_running = False
                    pump1.current_amperes = 0.0
                    pump1.fault_status = "TRIP"
                    db.add(Alert(
                        module="WATER",
                        severity="CRITICAL",
                        title=f"{pump1.name} Thermal Overload Tripped",
                        message="Motor protection relay tripped. Inspection needed before manual reset.",
                        source_asset=pump1.name,
                        village_id=pump1.village_id
                    ))

            elif scenario == "LEAKAGE":
                if flow_sensor:
                    flow_sensor.current_value = 240.0 # Excess flow
                db.add(Alert(
                    module="WATER",
                    severity="WARNING",
                    title="Pipeline Flow Anomaly (Possible Burst/Leakage)",
                    message="Flow rate is 240 L/min, exceeding peak design threshold (160 L/min). Pressure loss detected.",
                    source_asset="Distribution Trunk Line A",
                    village_id=tank1.village_id if tank1 else "v-shiva"
                ))

            elif scenario == "SENSOR_OFFLINE":
                if flow_sensor:
                    flow_sensor.status = "OFFLINE"
                    flow_sensor.current_value = 0.0
                db.add(Alert(
                    module="WATER",
                    severity="INFO",
                    title="Flow Sensor #1 Offline / Timeout",
                    message="Heartbeat packets missing from Flow Sensor YF-DN50 on ESP32 Node 01.",
                    source_asset="Flow Sensor Node",
                    village_id=tank1.village_id if tank1 else "v-shiva"
                ))

            db.commit()
        except Exception as e:
            db.rollback()
            print("Error applying scenario:", e)
        finally:
            db.close()

    def update_sensor_manual(self, sensor_type: str, asset_id: str, value: float):
        db = SessionLocal()
        try:
            if sensor_type == "WATER_LEVEL":
                tank = db.query(WaterTank).filter(WaterTank.id == asset_id).first()
                if tank:
                    val = max(0.0, min(100.0, float(value)))
                    tank.current_level_pct = round(val, 1)
                    tank.current_level_liters = round((val / 100.0) * tank.capacity_liters, 1)
                    if val > 70.0:
                        tank.status = "NORMAL"
                    elif val > 30.0:
                        tank.status = "MEDIUM"
                    elif val > 10.0:
                        tank.status = "LOW"
                    else:
                        tank.status = "CRITICAL"
                    tank.updated_at = datetime.datetime.utcnow()
                    db.commit()
            elif sensor_type == "CURRENT":
                pump = db.query(Pump).filter(Pump.id == asset_id).first()
                if pump:
                    val = max(0.0, float(value))
                    pump.current_amperes = round(val, 2)
                    pump.is_running = val > 0.5
                    if val > pump.normal_current_max:
                        pump.fault_status = "OVERLOAD_WARNING"
                    elif val > 0.5 and val < pump.normal_current_min:
                        pump.fault_status = "DRY_RUN_WARNING"
                    else:
                        pump.fault_status = "NORMAL"
                    pump.updated_at = datetime.datetime.utcnow()
                    db.commit()
            elif sensor_type == "FLOW":
                sensor = db.query(Sensor).filter(Sensor.id == asset_id).first()
                if sensor:
                    sensor.current_value = round(float(value), 1)
                    sensor.updated_at = datetime.datetime.utcnow()
                    db.commit()
        except Exception as e:
            db.rollback()
            print("Error updating manual sensor:", e)
        finally:
            db.close()

    async def simulation_loop(self):
        """Asynchronous background loop generating live IoT telemetry pulses."""
        while True:
            try:
                delay = 2.5 / self.speed_multiplier
                await asyncio.sleep(delay)

                if not self.is_running:
                    continue

                db = SessionLocal()
                now = datetime.datetime.utcnow()
                tanks = db.query(WaterTank).all()
                pumps = db.query(Pump).all()
                sensors = db.query(Sensor).all()

                # Dynamic subtle variations
                for tank in tanks:
                    # If pump feeding tank is running, water level rises slowly
                    feeding_pump = next((p for p in pumps if p.tank_id == tank.id and p.is_running), None)
                    change = 0.0
                    if feeding_pump:
                        change += random.uniform(0.1, 0.3) * self.speed_multiplier
                    else:
                        # natural consumption drainage
                        change -= random.uniform(0.05, 0.15) * self.speed_multiplier

                    new_pct = max(5.0, min(98.0, tank.current_level_pct + change))
                    tank.current_level_pct = round(new_pct, 1)
                    tank.current_level_liters = round((new_pct / 100.0) * tank.capacity_liters, 1)
                    if new_pct > 70.0:
                        tank.status = "NORMAL"
                    elif new_pct > 30.0:
                        tank.status = "MEDIUM"
                    elif new_pct > 10.0:
                        tank.status = "LOW"
                    else:
                        tank.status = "CRITICAL"
                    tank.updated_at = now

                # Pump small fluctuations
                for pump in pumps:
                    if pump.is_running and pump.fault_status == "NORMAL":
                        fluctuation = random.uniform(-0.15, 0.15)
                        pump.current_amperes = round(max(9.5, min(15.5, pump.current_amperes + fluctuation)), 2)
                        pump.updated_at = now

                # Flow sensor fluctuations
                for s in sensors:
                    if s.sensor_type == "FLOW_PULSE" and s.status == "ONLINE":
                        fluc = random.uniform(-3.0, 3.0)
                        s.current_value = round(max(120.0, min(165.0, s.current_value + fluc)), 1)
                        s.updated_at = now
                    elif s.sensor_type == "ULTRASONIC_LEVEL" and s.tank:
                        s.current_value = s.tank.current_level_pct
                        s.updated_at = now

                db.commit()

                # Build snapshot to broadcast
                packet = {
                    "type": "TELEMETRY_UPDATE",
                    "timestamp": now.isoformat(),
                    "mode": self.mode,
                    "active_scenario": self.active_scenario,
                    "tanks": [
                        {
                            "id": t.id,
                            "name": t.name,
                            "capacity": t.capacity_liters,
                            "current_liters": t.current_level_liters,
                            "pct": t.current_level_pct,
                            "status": t.status,
                            "village_id": t.village_id
                        } for t in tanks
                    ],
                    "pumps": [
                        {
                            "id": p.id,
                            "name": p.name,
                            "is_running": p.is_running,
                            "current_amperes": p.current_amperes,
                            "fault_status": p.fault_status,
                            "daily_runtime": p.daily_runtime_hours,
                            "starts_today": p.starts_today,
                            "village_id": p.village_id
                        } for p in pumps
                    ],
                    "sensors": [
                        {
                            "id": s.id,
                            "uid": s.sensor_uid,
                            "type": s.sensor_type,
                            "value": s.current_value,
                            "unit": s.unit,
                            "status": s.status,
                            "model": s.model
                        } for s in sensors
                    ]
                }

                # Broadcast to connected websockets
                dead_sockets = []
                for ws in self.connected_websockets:
                    try:
                        await ws.send_json(packet)
                    except Exception:
                        dead_sockets.append(ws)

                for ds in dead_sockets:
                    if ds in self.connected_websockets:
                        self.connected_websockets.remove(ds)

                db.close()
            except Exception as e:
                print("Simulation loop error:", e)
                await asyncio.sleep(2)

simulator = HardwareSimulator()
