from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.db.models import Village, WaterTank, Pump, Beneficiary
from app.schemas.schemas import VillageOut

router = APIRouter(prefix="/villages", tags=["Villages"])

@router.get("", response_model=List[VillageOut])
def get_villages(db: Session = Depends(get_db)):
    return db.query(Village).all()

@router.get("/{village_id}")
def get_village(village_id: str, db: Session = Depends(get_db)):
    v = db.query(Village).filter(Village.id == village_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Village not found")
    tanks_count = db.query(WaterTank).filter(WaterTank.village_id == village_id).count()
    pumps_count = db.query(Pump).filter(Pump.village_id == village_id).count()
    beneficiaries_count = db.query(Beneficiary).filter(Beneficiary.village_id == village_id).count()
    return {
        "id": v.id,
        "name": v.name,
        "name_mr": v.name_mr,
        "name_hi": v.name_hi,
        "district": v.district,
        "taluka": v.taluka,
        "state": v.state,
        "population": v.population,
        "households": v.households,
        "stats": {
            "tanks_count": tanks_count,
            "pumps_count": pumps_count,
            "beneficiaries_count": beneficiaries_count
        }
    }
