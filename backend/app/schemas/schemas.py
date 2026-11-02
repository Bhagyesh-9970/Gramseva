from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ================= AUTH =================
class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    phone: Optional[str] = None
    village_id: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

# ================= VILLAGES =================
class VillageOut(BaseModel):
    id: str
    name: str
    name_mr: Optional[str] = None
    name_hi: Optional[str] = None
    district: str
    taluka: str
    state: str
    population: int
    households: int

    class Config:
        from_attributes = True

# ================= WATER & IOT =================
class WaterTankOut(BaseModel):
    id: str
    name: str
    location_desc: Optional[str] = None
    capacity_liters: float
    current_level_liters: float
    current_level_pct: float
    height_meters: float
    status: str
    village_id: str
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PumpOut(BaseModel):
    id: str
    name: str
    hp_rating: float
    is_running: bool
    current_amperes: float
    normal_current_min: float
    normal_current_max: float
    daily_runtime_hours: float
    starts_today: int
    fault_status: str
    last_maintenance_date: Optional[datetime] = None
    village_id: str
    tank_id: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PumpToggleRequest(BaseModel):
    is_running: bool

class SensorOut(BaseModel):
    id: str
    sensor_uid: str
    sensor_type: str
    model: str
    current_value: float
    unit: str
    status: str
    device_id: Optional[str] = None
    tank_id: Optional[str] = None
    pump_id: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SensorReadingOut(BaseModel):
    id: int
    sensor_id: str
    value: float
    unit: str
    timestamp: datetime
    is_simulated: bool

    class Config:
        from_attributes = True

# ================= DIGITAL O&M =================
class MaintenanceTaskCreate(BaseModel):
    title: str
    description: str
    asset_type: str = "PUMP"
    priority: str = "MEDIUM"
    village_id: str
    assigned_to_id: Optional[str] = None
    due_date: Optional[datetime] = None

class MaintenanceTaskUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to_id: Optional[str] = None
    inspection_notes: Optional[str] = None
    completed_at: Optional[datetime] = None

class MaintenanceTaskOut(BaseModel):
    id: str
    task_code: str
    title: str
    description: str
    asset_type: str
    priority: str
    status: str
    village_id: str
    assigned_to_id: Optional[str] = None
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    inspection_notes: Optional[str] = None
    created_at: datetime
    assigned_to_name: Optional[str] = None

    class Config:
        from_attributes = True

class ComplaintCreate(BaseModel):
    category: str
    title: str
    description: str
    citizen_name: str
    citizen_phone: Optional[str] = None
    village_id: str
    priority: str = "MEDIUM"

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    resolution_notes: Optional[str] = None

class ComplaintOut(BaseModel):
    id: str
    complaint_code: str
    category: str
    title: str
    description: str
    status: str
    priority: str
    citizen_name: str
    citizen_phone: Optional[str] = None
    citizen_id: Optional[str] = None
    village_id: str
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ================= PDS MODULE =================
class CommodityOut(BaseModel):
    id: str
    code: str
    name: str
    name_mr: Optional[str] = None
    name_hi: Optional[str] = None
    unit: str
    subsidized_price: float
    min_stock_alert_threshold: float
    is_active: bool

    class Config:
        from_attributes = True

class BeneficiaryEntitlementOut(BaseModel):
    commodity_id: str
    commodity_name: str
    unit: str
    monthly_quota: float
    current_month_consumed: float
    remaining_quota: float
    unit_price: float

class BeneficiaryOut(BaseModel):
    id: str
    beneficiary_code: str
    name: str
    name_mr: Optional[str] = None
    head_of_family: str
    family_members_count: int
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    status: str
    village_id: str
    ration_card_number: str
    ration_card_category: str
    ration_card_color: str
    entitlements: Optional[List[BeneficiaryEntitlementOut]] = None

class BeneficiaryCreate(BaseModel):
    name: str
    name_mr: Optional[str] = None
    head_of_family: str
    family_members_count: int = 4
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    village_id: str
    ration_card_number: str
    ration_card_category: str = "PHH" # AAY, PHH, APL
    ration_card_color: str = "YELLOW"

class PdsStockOut(BaseModel):
    id: str
    village_id: str
    commodity_id: str
    commodity_name: str
    commodity_code: str
    unit: str
    opening_stock: float
    current_stock: float
    received_stock_month: float
    distributed_stock_month: float
    adjusted_stock_month: float
    physical_stock_verified: Optional[float] = None
    min_threshold: float
    is_low_stock: bool
    last_reconciliation_date: Optional[datetime] = None

class StockReceiptCreate(BaseModel):
    village_id: str
    commodity_id: str
    quantity: float
    supplier_challan_no: Optional[str] = None
    batch_no: Optional[str] = None
    received_by: str = "PDS Operator"
    notes: Optional[str] = None

class StockReconcileRequest(BaseModel):
    village_id: str
    commodity_id: str
    physical_stock: float
    explanation: str
    operator_name: str = "PDS Operator"

class DistributionItemInput(BaseModel):
    commodity_id: str
    quantity: float

class DistributionRequest(BaseModel):
    beneficiary_id: str
    village_id: str
    operator_name: str = "PDS Operator"
    items: List[DistributionItemInput]

class TransactionItemOut(BaseModel):
    commodity_name: str
    quantity: float
    unit: str
    unit_price: float
    subtotal: float

class TransactionOut(BaseModel):
    id: str
    transaction_code: str
    beneficiary_id: str
    beneficiary_name: str
    beneficiary_code: str
    ration_card_number: str
    village_id: str
    village_name: str
    operator_name: str
    total_amount: float
    month_period: str
    verification_mode: str
    status: str
    created_at: datetime
    items: List[TransactionItemOut]

# ================= ALERTS & SIMULATION =================
class AlertOut(BaseModel):
    id: str
    module: str
    severity: str
    title: str
    message: str
    source_asset: Optional[str] = None
    village_id: str
    is_acknowledged: bool
    acknowledged_by: Optional[str] = None
    is_resolved: bool
    resolved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SimulatorControl(BaseModel):
    action: str # START, PAUSE, RESET
    speed: Optional[float] = None

class ScenarioSelect(BaseModel):
    scenario: str # NORMAL, TANK_LOW, PUMP_ANOMALY, PUMP_FAILURE, LEAKAGE, SENSOR_OFFLINE

class ManualSensorAdjust(BaseModel):
    sensor_type: str # WATER_LEVEL, CURRENT, FLOW
    asset_id: str
    value: float
