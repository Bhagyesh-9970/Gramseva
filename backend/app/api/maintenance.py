from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
import random
from app.db.session import get_db
from app.db.models import MaintenanceTask, MaintenanceHistory, User, AuditLog
from app.schemas.schemas import MaintenanceTaskCreate, MaintenanceTaskUpdate, MaintenanceTaskOut

router = APIRouter(prefix="/maintenance", tags=["Digital O&M"])

@router.get("/tasks")
def get_tasks(village_id: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(MaintenanceTask)
    if village_id:
        q = q.filter(MaintenanceTask.village_id == village_id)
    if status and status != "ALL":
        q = q.filter(MaintenanceTask.status == status)
    
    tasks = q.order_by(MaintenanceTask.created_at.desc()).all()
    results = []
    for t in tasks:
        results.append({
            "id": t.id,
            "task_code": t.task_code,
            "title": t.title,
            "description": t.description,
            "asset_type": t.asset_type,
            "priority": t.priority,
            "status": t.status,
            "village_id": t.village_id,
            "village_name": t.village.name if t.village else "Unknown",
            "assigned_to_id": t.assigned_to_id,
            "assigned_to_name": t.assigned_to.full_name if t.assigned_to else "Unassigned",
            "due_date": t.due_date,
            "completed_at": t.completed_at,
            "inspection_notes": t.inspection_notes,
            "created_at": t.created_at
        })
    return results

@router.post("/tasks")
def create_task(req: MaintenanceTaskCreate, db: Session = Depends(get_db)):
    code_num = random.randint(100, 999)
    task_code = f"MNT-{datetime.datetime.utcnow().year}-{code_num}"
    task = MaintenanceTask(
        task_code=task_code,
        title=req.title,
        description=req.description,
        asset_type=req.asset_type,
        priority=req.priority,
        status="ASSIGNED" if req.assigned_to_id else "OPEN",
        village_id=req.village_id,
        assigned_to_id=req.assigned_to_id,
        due_date=req.due_date or (datetime.datetime.utcnow() + datetime.timedelta(days=2))
    )
    db.add(task)
    db.flush()

    db.add(MaintenanceHistory(
        task_id=task.id,
        action="TASK_CREATED",
        status=task.status,
        performed_by="Operator / Admin",
        remarks="Task initiated via Digital O&M platform."
    ))

    db.add(AuditLog(
        module="MAINTENANCE",
        action="TASK_CREATED",
        description=f"Maintenance task '{task.task_code}: {task.title}' logged.",
        performed_by="Staff"
    ))

    db.commit()
    return {"message": "Task created successfully", "id": task.id, "task_code": task.task_code}

@router.put("/tasks/{task_id}")
def update_task(task_id: str, req: MaintenanceTaskUpdate, db: Session = Depends(get_db)):
    task = db.query(MaintenanceTask).filter(MaintenanceTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if req.status:
        task.status = req.status
        if req.status == "COMPLETED" and not task.completed_at:
            task.completed_at = datetime.datetime.utcnow()
    if req.priority:
        task.priority = req.priority
    if req.assigned_to_id:
        task.assigned_to_id = req.assigned_to_id
    if req.inspection_notes:
        task.inspection_notes = req.inspection_notes

    db.add(MaintenanceHistory(
        task_id=task.id,
        action=f"STATUS_UPDATED_TO_{task.status}",
        status=task.status,
        performed_by="Technician",
        remarks=req.inspection_notes
    ))

    db.commit()
    return {"message": "Task updated successfully", "status": task.status}
