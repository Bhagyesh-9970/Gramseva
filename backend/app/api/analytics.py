from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
import datetime
from app.db.session import get_db
from app.db.models import (
    WaterTank, Pump, Sensor, Beneficiary, PdsStock,
    PdsTransaction, MaintenanceTask, Complaint, Alert, AuditLog
)

router = APIRouter(prefix="/analytics", tags=["Analytics & Reports"])

@router.get("/overview")
def get_overview_metrics(village_id: Optional[str] = None, db: Session = Depends(get_db)):
    t_q = db.query(WaterTank)
    p_q = db.query(Pump)
    b_q = db.query(Beneficiary)
    s_q = db.query(PdsStock)
    a_q = db.query(Alert)
    m_q = db.query(MaintenanceTask)
    c_q = db.query(Complaint)

    if village_id:
        t_q = t_q.filter(WaterTank.village_id == village_id)
        p_q = p_q.filter(Pump.village_id == village_id)
        b_q = b_q.filter(Beneficiary.village_id == village_id)
        s_q = s_q.filter(PdsStock.village_id == village_id)
        a_q = a_q.filter(Alert.village_id == village_id)
        m_q = m_q.filter(MaintenanceTask.village_id == village_id)
        c_q = c_q.filter(Complaint.village_id == village_id)

    total_tanks = t_q.count()
    low_water_tanks = t_q.filter(WaterTank.status.in_(["LOW", "CRITICAL"])).count()
    pumps_total = p_q.count()
    pumps_running = p_q.filter(Pump.is_running == True).count()
    pump_anomalies = p_q.filter(Pump.fault_status != "NORMAL").count()

    total_beneficiaries = b_q.count()
    active_beneficiaries = b_q.filter(Beneficiary.status == "ACTIVE").count()

    stocks = s_q.all()
    low_stock_count = sum(1 for s in stocks if s.current_stock <= s.commodity.min_stock_alert_threshold)

    critical_alerts = a_q.filter(Alert.severity == "CRITICAL", Alert.is_resolved == False).count()
    total_active_alerts = a_q.filter(Alert.is_resolved == False).count()

    open_maintenance = m_q.filter(MaintenanceTask.status.in_(["OPEN", "ASSIGNED", "IN_PROGRESS", "OVERDUE"])).count()
    open_complaints = c_q.filter(Complaint.status.in_(["SUBMITTED", "IN_REVIEW", "ACTION_TAKEN"])).count()

    # Total distributed this month
    total_monthly_dist_qty = sum(s.distributed_stock_month for s in stocks)

    return {
        "water": {
            "total_tanks": total_tanks,
            "low_water_tanks": low_water_tanks,
            "pumps_total": pumps_total,
            "pumps_running": pumps_running,
            "pump_anomalies": pump_anomalies,
            "sensor_connectivity_pct": 98.4
        },
        "pds": {
            "total_beneficiaries": total_beneficiaries,
            "active_beneficiaries": active_beneficiaries,
            "low_stock_count": low_stock_count,
            "monthly_distribution_total_qty": round(total_monthly_dist_qty, 1),
            "pending_transactions_count": 0
        },
        "system": {
            "critical_alerts": critical_alerts,
            "total_active_alerts": total_active_alerts,
            "open_maintenance_tasks": open_maintenance,
            "open_complaints": open_complaints,
            "overall_health_score": 96.5
        }
    }

@router.get("/reports/water")
def get_water_report(village_id: Optional[str] = None, db: Session = Depends(get_db)):
    t_q = db.query(WaterTank)
    p_q = db.query(Pump)
    if village_id:
        t_q = t_q.filter(WaterTank.village_id == village_id)
        p_q = p_q.filter(Pump.village_id == village_id)

    tanks = t_q.all()
    pumps = p_q.all()

    return {
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "tanks": [
            {
                "name": t.name,
                "capacity": t.capacity_liters,
                "current_level": t.current_level_liters,
                "percentage": t.current_level_pct,
                "status": t.status,
                "village_name": t.village.name if t.village else "Unknown"
            } for t in tanks
        ],
        "pumps": [
            {
                "name": p.name,
                "hp_rating": p.hp_rating,
                "status": "RUNNING" if p.is_running else "STOPPED",
                "current_amperes": p.current_amperes,
                "runtime_hours": p.daily_runtime_hours,
                "starts_today": p.starts_today,
                "fault": p.fault_status
            } for p in pumps
        ],
        "total_water_stored_liters": sum(t.current_level_liters for t in tanks),
        "total_capacity_liters": sum(t.capacity_liters for t in tanks),
        "average_storage_pct": round(sum(t.current_level_pct for t in tanks) / max(1, len(tanks)), 1)
    }

@router.get("/reports/pds")
def get_pds_report(village_id: Optional[str] = None, db: Session = Depends(get_db)):
    v_id = village_id or "v-shiva"
    stocks = db.query(PdsStock).filter(PdsStock.village_id == v_id).all()
    txns = db.query(PdsTransaction).filter(PdsTransaction.village_id == v_id).all()

    return {
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "stocks": [
            {
                "commodity": s.commodity.name,
                "unit": s.commodity.unit,
                "opening_stock": s.opening_stock,
                "received_month": s.received_stock_month,
                "distributed_month": s.distributed_stock_month,
                "closing_stock": s.current_stock,
                "threshold": s.commodity.min_stock_alert_threshold,
                "is_low": s.current_stock <= s.commodity.min_stock_alert_threshold
            } for s in stocks
        ],
        "total_transactions_count": len(txns),
        "total_distributed_value": sum(t.total_amount for t in txns)
    }

@router.get("/audit-logs")
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "module": l.module,
            "action": l.action,
            "description": l.description,
            "performed_by": l.performed_by,
            "role": l.role,
            "timestamp": l.timestamp
        } for l in logs
    ]
