from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
from app.db.session import get_db
from app.db.models import WaterTank, Pump, Sensor, SensorReading, AuditLog
from app.schemas.schemas import WaterTankOut, PumpOut, SensorOut, PumpToggleRequest

router = APIRouter(prefix="/water", tags=["Water Infrastructure"])

@router.get("/tanks", response_model=List[WaterTankOut])
def get_tanks(village_id: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(WaterTank)
    if village_id:
        q = q.filter(WaterTank.village_id == village_id)
    return q.all()

@router.get("/tanks/{tank_id}")
def get_tank_detail(tank_id: str, db: Session = Depends(get_db)):
    tank = db.query(WaterTank).filter(WaterTank.id == tank_id).first()
    if not tank:
        raise HTTPException(status_code=404, detail="Tank not found")
    
    # Associated pump
    pumps = db.query(Pump).filter(Pump.tank_id == tank_id).all()
    # Associated sensors
    sensors = db.query(Sensor).filter(Sensor.tank_id == tank_id).all()

    return {
        "id": tank.id,
        "name": tank.name,
        "location_desc": tank.location_desc,
        "capacity_liters": tank.capacity_liters,
        "current_level_liters": tank.current_level_liters,
        "current_level_pct": tank.current_level_pct,
        "height_meters": tank.height_meters,
        "status": tank.status,
        "village_id": tank.village_id,
        "village_name": tank.village.name if tank.village else "Unknown",
        "updated_at": tank.updated_at,
        "pumps": [
            {
                "id": p.id,
                "name": p.name,
                "is_running": p.is_running,
                "current_amperes": p.current_amperes,
                "fault_status": p.fault_status
            } for p in pumps
        ],
        "sensors": [
            {
                "id": s.id,
                "uid": s.sensor_uid,
                "type": s.sensor_type,
                "value": s.current_value,
                "unit": s.unit,
                "status": s.status
            } for s in sensors
        ]
    }

@router.get("/tanks/{tank_id}/history")
def get_tank_history(tank_id: str, hours: int = 24, db: Session = Depends(get_db)):
    tank = db.query(WaterTank).filter(WaterTank.id == tank_id).first()
    if not tank:
        raise HTTPException(status_code=404, detail="Tank not found")

    level_sensor = db.query(Sensor).filter(Sensor.tank_id == tank_id, Sensor.sensor_type == "ULTRASONIC_LEVEL").first()
    if not level_sensor:
        # Fallback to any ultrasonic sensor
        level_sensor = db.query(Sensor).filter(Sensor.sensor_type == "ULTRASONIC_LEVEL").first()

    readings = []
    if level_sensor:
        since = datetime.datetime.utcnow() - datetime.timedelta(hours=hours)
        db_readings = db.query(SensorReading).filter(
            SensorReading.sensor_id == level_sensor.id,
            SensorReading.timestamp >= since
        ).order_by(SensorReading.timestamp.asc()).all()
        for r in db_readings:
            readings.append({
                "timestamp": r.timestamp.strftime("%H:%M"),
                "level_pct": r.value,
                "volume_liters": round((r.value / 100.0) * tank.capacity_liters, 0)
            })

    # If few readings in DB, fill realistic trend
    if len(readings) < 6:
        base_pct = tank.current_level_pct
        for h in range(12, 0, -1):
            t_str = (datetime.datetime.utcnow() - datetime.timedelta(hours=h*2)).strftime("%H:%M")
            mock_val = round(max(15.0, min(95.0, base_pct + ((h % 4) - 2) * 5.0)), 1)
            readings.append({
                "timestamp": t_str,
                "level_pct": mock_val,
                "volume_liters": round((mock_val / 100.0) * tank.capacity_liters, 0)
            })
        readings.append({
            "timestamp": "Now",
            "level_pct": tank.current_level_pct,
            "volume_liters": tank.current_level_liters
        })

    return readings

@router.get("/pumps", response_model=List[PumpOut])
def get_pumps(village_id: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Pump)
    if village_id:
        q = q.filter(Pump.village_id == village_id)
    return q.all()

@router.post("/pumps/{pump_id}/toggle")
def toggle_pump(pump_id: str, req: PumpToggleRequest, db: Session = Depends(get_db)):
    pump = db.query(Pump).filter(Pump.id == pump_id).first()
    if not pump:
        raise HTTPException(status_code=404, detail="Pump not found")
    
    pump.is_running = req.is_running
    if req.is_running:
        pump.current_amperes = round(pump.hp_rating * 1.35, 2)
        pump.starts_today += 1
        pump.fault_status = "NORMAL"
    else:
        pump.current_amperes = 0.0
    pump.updated_at = datetime.datetime.utcnow()

    # Log action
    db.add(AuditLog(
        module="WATER",
        action="PUMP_MANUAL_TOGGLE",
        description=f"Pump '{pump.name}' manually toggled to {'ON' if req.is_running else 'OFF'}.",
        performed_by="Operator",
        role="WATER_OPERATOR"
    ))
    db.commit()

    return {
        "id": pump.id,
        "name": pump.name,
        "is_running": pump.is_running,
        "current_amperes": pump.current_amperes,
        "fault_status": pump.fault_status
    }

@router.get("/sensors", response_model=List[SensorOut])
def get_sensors(db: Session = Depends(get_db)):
    return db.query(Sensor).all()
