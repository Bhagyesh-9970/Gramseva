from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
import random
from app.db.session import get_db
from app.db.models import Complaint, AuditLog
from app.schemas.schemas import ComplaintCreate, ComplaintUpdate, ComplaintOut

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.get("", response_model=List[ComplaintOut])
def get_complaints(village_id: Optional[str] = None, category: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Complaint)
    if village_id:
        q = q.filter(Complaint.village_id == village_id)
    if category and category != "ALL":
        q = q.filter(Complaint.category == category)
    if status and status != "ALL":
        q = q.filter(Complaint.status == status)
    return q.order_by(Complaint.created_at.desc()).all()

@router.post("")
def submit_complaint(req: ComplaintCreate, db: Session = Depends(get_db)):
    code_num = random.randint(100, 999)
    code = f"CMP-{datetime.datetime.utcnow().year}-{code_num}"
    comp = Complaint(
        complaint_code=code,
        category=req.category,
        title=req.title,
        description=req.description,
        citizen_name=req.citizen_name,
        citizen_phone=req.citizen_phone,
        village_id=req.village_id,
        priority=req.priority,
        status="SUBMITTED"
    )
    db.add(comp)
    db.add(AuditLog(
        module="COMPLAINTS",
        action="COMPLAINT_FILED",
        description=f"Complaint '{code}' submitted by citizen '{req.citizen_name}' under category '{req.category}'.",
        performed_by=req.citizen_name
    ))
    db.commit()
    return {"message": "Grievance submitted successfully", "complaint_code": code, "id": comp.id}

@router.put("/{complaint_id}")
def update_complaint(complaint_id: str, req: ComplaintUpdate, db: Session = Depends(get_db)):
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if req.status:
        c.status = req.status
        if req.status == "RESOLVED":
            c.resolved_at = datetime.datetime.utcnow()
    if req.resolution_notes:
        c.resolution_notes = req.resolution_notes
    db.commit()
    return {"message": "Complaint updated", "status": c.status}
