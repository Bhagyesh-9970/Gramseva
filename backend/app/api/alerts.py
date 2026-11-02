from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
from app.db.session import get_db
from app.db.models import Alert
from app.schemas.schemas import AlertOut

router = APIRouter(prefix="/alerts", tags=["Alerts & Notifications"])

@router.get("", response_model=List[AlertOut])
def get_alerts(
    village_id: Optional[str] = None,
    module: Optional[str] = None,
    severity: Optional[str] = None,
    is_resolved: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Alert)
    if village_id:
        q = q.filter(Alert.village_id == village_id)
    if module and module != "ALL":
        q = q.filter(Alert.module == module)
    if severity and severity != "ALL":
        q = q.filter(Alert.severity == severity)
    if is_resolved is not None:
        q = q.filter(Alert.is_resolved == is_resolved)
    
    return q.order_by(Alert.created_at.desc()).all()

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str, operator_name: str = "Operator", db: Session = Depends(get_db)):
    a = db.query(Alert).filter(Alert.id == alert_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Alert not found")
    a.is_acknowledged = True
    a.acknowledged_by = operator_name
    db.commit()
    return {"message": "Alert acknowledged", "id": a.id}

@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: str, db: Session = Depends(get_db)):
    a = db.query(Alert).filter(Alert.id == alert_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Alert not found")
    a.is_resolved = True
    a.resolved_at = datetime.datetime.utcnow()
    db.commit()
    return {"message": "Alert resolved", "id": a.id}
