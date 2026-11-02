import datetime
import uuid
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from app.db.session import Base

def gen_uuid():
    return str(uuid.uuid4())

class Village(Base):
    __tablename__ = "villages"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(100), nullable=False, unique=True)
    name_mr = Column(String(100), nullable=True) # Marathi name
    name_hi = Column(String(100), nullable=True) # Hindi name
    district = Column(String(100), nullable=False, default="Pune")
    taluka = Column(String(100), nullable=False, default="Haveli")
    state = Column(String(100), nullable=False, default="Maharashtra")
    population = Column(Integer, default=3200)
    households = Column(Integer, default=640)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="village")
    tanks = relationship("WaterTank", back_populates="village", cascade="all, delete-orphan")
    pumps = relationship("Pump", back_populates="village", cascade="all, delete-orphan")
    beneficiaries = relationship("Beneficiary", back_populates="village", cascade="all, delete-orphan")
    stocks = relationship("PdsStock", back_populates="village", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="village", cascade="all, delete-orphan")
    maintenance_tasks = relationship("MaintenanceTask", back_populates="village", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="village", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(120), unique=True, nullable=False, index=True)
    full_name = Column(String(120), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False) # SUPER_ADMIN, GP_ADMIN, WATER_OPERATOR, PDS_OPERATOR, DISTRICT_OFFICER, CITIZEN
    phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    village_id = Column(String(36), ForeignKey("villages.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    village = relationship("Village", back_populates="users")
    complaints_filed = relationship("Complaint", foreign_keys="Complaint.citizen_id", back_populates="citizen")
    assigned_maintenance = relationship("MaintenanceTask", foreign_keys="MaintenanceTask.assigned_to_id", back_populates="assigned_to")

class Device(Base):
    __tablename__ = "devices"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    device_uid = Column(String(64), unique=True, nullable=False, index=True) # e.g. ESP32-WTR-01
    device_type = Column(String(50), default="ESP32_CONTROLLER") # ESP32_CONTROLLER, FLOW_LOGGER, PUMP_RELAY
    firmware_version = Column(String(20), default="v2.4.1")
    ip_address = Column(String(45), default="192.168.1.105")
    mac_address = Column(String(30), default="24:6F:28:B1:C4:E0")
    mqtt_topic = Column(String(150), default="smartpanchayat/v1/esp32-01/telemetry")
    status = Column(String(20), default="ONLINE") # ONLINE, OFFLINE, WARNING
    last_ping = Column(DateTime, default=datetime.datetime.utcnow)
    is_simulated = Column(Boolean, default=True)
    village_id = Column(String(36), ForeignKey("villages.id", ondelete="CASCADE"), nullable=False)

    sensors = relationship("Sensor", back_populates="device", cascade="all, delete-orphan")

class WaterTank(Base):
    __tablename__ = "water_tanks"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(100), nullable=False)
    location_desc = Column(String(150), nullable=True)
    capacity_liters = Column(Float, nullable=False, default=10000.0)
    current_level_liters = Column(Float, nullable=False, default=6500.0)
    current_level_pct = Column(Float, nullable=False, default=65.0)
    height_meters = Column(Float, default=4.5)
    status = Column(String(20), default="NORMAL") # NORMAL, MEDIUM, LOW, CRITICAL
    village_id = Column(String(36), ForeignKey("villages.id", ondelete="CASCADE"), nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    village = relationship("Village", back_populates="tanks")
    pumps = relationship("Pump", back_populates="tank")
    sensors = relationship("Sensor", back_populates="tank", cascade="all, delete-orphan")

class Pump(Base):
    __tablename__ = "pumps"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(100), nullable=False)
    hp_rating = Column(Float, default=7.5) # Horsepower
    is_running = Column(Boolean, default=True)
    current_amperes = Column(Float, default=12.4)
    normal_current_min = Column(Float, default=9.0)
    normal_current_max = Column(Float, default=16.0)
    daily_runtime_hours = Column(Float, default=4.8)
    starts_today = Column(Integer, default=3)
    fault_status = Column(String(50), default="NORMAL") # NORMAL, DRY_RUN_WARNING, OVERLOAD_WARNING, ELECTRICAL_FAULT, TRIP
    last_maintenance_date = Column(DateTime, default=datetime.datetime.utcnow)
    village_id = Column(String(36), ForeignKey("villages.id", ondelete="CASCADE"), nullable=False)
    tank_id = Column(String(36), ForeignKey("water_tanks.id", ondelete="SET NULL"), nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    village = relationship("Village", back_populates="pumps")
    tank = relationship("WaterTank", back_populates="pumps")
    sensors = relationship("Sensor", back_populates="pump")

class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    sensor_uid = Column(String(64), unique=True, nullable=False)
    sensor_type = Column(String(40), nullable=False) # ULTRASONIC_LEVEL, CURRENT_CT, FLOW_PULSE, PRESSURE
    model = Column(String(50), default="JSN-SR04T") # JSN-SR04T, SCT-013, YF-DN50
    current_value = Column(Float, default=0.0)
    unit = Column(String(20), default="%")
    status = Column(String(20), default="ONLINE") # ONLINE, OFFLINE, CALIBRATING
    device_id = Column(String(36), ForeignKey("devices.id", ondelete="CASCADE"), nullable=True)
    tank_id = Column(String(36), ForeignKey("water_tanks.id", ondelete="SET NULL"), nullable=True)
    pump_id = Column(String(36), ForeignKey("pumps.id", ondelete="SET NULL"), nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    device = relationship("Device", back_populates="sensors")
    tank = relationship("WaterTank", back_populates="sensors")
    pump = relationship("Pump", back_populates="sensors")
    readings = relationship("SensorReading", back_populates="sensor", cascade="all, delete-orphan")

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sensor_id = Column(String(36), ForeignKey("sensors.id", ondelete="CASCADE"), nullable=False, index=True)
    value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    is_simulated = Column(Boolean, default=True)

    sensor = relationship("Sensor", back_populates="readings")

class MaintenanceTask(Base):
    __tablename__ = "maintenance_tasks"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    task_code = Column(String(30), unique=True, nullable=False) # e.g. MNT-2026-001
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    asset_type = Column(String(50), default="PUMP") # PUMP, TANK, PIPELINE, SENSOR, ELECTRICAL
    priority = Column(String(20), default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(20), default="OPEN") # OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, OVERDUE
    village_id = Column(String(36), ForeignKey("villages.id", ondelete="CASCADE"), nullable=False)
    assigned_to_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    inspection_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    village = relationship("Village", back_populates="maintenance_tasks")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id], back_populates="assigned_maintenance")
    history = relationship("MaintenanceHistory", back_populates="task", cascade="all, delete-orphan")

class MaintenanceHistory(Base):
    __tablename__ = "maintenance_history"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    task_id = Column(String(36), ForeignKey("maintenance_tasks.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False)
    performed_by = Column(String(100), default="System")
    remarks = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    task = relationship("MaintenanceTask", back_populates="history")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    complaint_code = Column(String(30), unique=True, nullable=False) # e.g. CMP-2026-089
    category = Column(String(50), nullable=False) # WATER_SUPPLY, PUMP_FAILURE, LEAKAGE, LOW_PRESSURE, PDS_DISTRIBUTION, OTHER
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), default="SUBMITTED") # SUBMITTED, IN_REVIEW, ACTION_TAKEN, RESOLVED, REJECTED
    priority = Column(String(20), default="MEDIUM")
    citizen_name = Column(String(100), nullable=False)
    citizen_phone = Column(String(20), nullable=True)
    citizen_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    village_id = Column(String(36), ForeignKey("villages.id", ondelete="CASCADE"), nullable=False)
    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    village = relationship("Village", back_populates="complaints")
    citizen = relationship("User", foreign_keys=[citizen_id], back_populates="complaints_filed")

# ==================== PDS MODULE MODELS ====================

class Commodity(Base):
    __tablename__ = "commodities"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    code = Column(String(20), unique=True, nullable=False) # RICE, WHEAT, SUGAR, OIL, KEROSENE
    name = Column(String(80), nullable=False)
    name_mr = Column(String(80), nullable=True) # तांदूळ
    name_hi = Column(String(80), nullable=True) # चावल
    unit = Column(String(20), default="kg")
    subsidized_price = Column(Float, default=3.0) # Rs per unit
    min_stock_alert_threshold = Column(Float, default=500.0)
    is_active = Column(Boolean, default=True)

    stocks = relationship("PdsStock", back_populates="commodity", cascade="all, delete-orphan")
    entitlements = relationship("BeneficiaryEntitlement", back_populates="commodity", cascade="all, delete-orphan")

class RationCard(Base):
    __tablename__ = "ration_cards"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    card_number = Column(String(30), unique=True, nullable=False, index=True) # e.g. MH-27-012948
    category = Column(String(30), nullable=False) # AAY (Antyodaya Anna Yojana), PHH (Priority Household/BPL), APL (Above Poverty Line)
    color = Column(String(20), default="YELLOW") # YELLOW (BPL), ORANGE (APL), WHITE
    issue_date = Column(DateTime, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)

    beneficiary = relationship("Beneficiary", back_populates="ration_card", uselist=False)

class Beneficiary(Base):
    __tablename__ = "beneficiaries"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    beneficiary_code = Column(String(30), unique=True, nullable=False, index=True) # e.g. BEN-00104
    name = Column(String(120), nullable=False)
    name_mr = Column(String(120), nullable=True)
    head_of_family = Column(String(120), nullable=False)
    family_members_count = Column(Integer, default=4)
    contact_phone = Column(String(20), nullable=True)
    address = Column(String(200), nullable=True)
    status = Column(String(20), default="ACTIVE") # ACTIVE, SUSPENDED, TRANSFERRED
    village_id = Column(String(36), ForeignKey("villages.id", ondelete="CASCADE"), nullable=False)
    ration_card_id = Column(String(36), ForeignKey("ration_cards.id", ondelete="RESTRICT"), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    village = relationship("Village", back_populates="beneficiaries")
    ration_card = relationship("RationCard", back_populates="beneficiary")
    entitlements = relationship("BeneficiaryEntitlement", back_populates="beneficiary", cascade="all, delete-orphan")
    transactions = relationship("PdsTransaction", back_populates="beneficiary")

class BeneficiaryEntitlement(Base):
    __tablename__ = "beneficiary_entitlements"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    beneficiary_id = Column(String(36), ForeignKey("beneficiaries.id", ondelete="CASCADE"), nullable=False)
    commodity_id = Column(String(36), ForeignKey("commodities.id", ondelete="CASCADE"), nullable=False)
    monthly_quota = Column(Float, nullable=False, default=15.0)
    current_month_consumed = Column(Float, default=0.0)
    quota_month = Column(String(7), nullable=False) # e.g. "2026-11"

    beneficiary = relationship("Beneficiary", back_populates="entitlements")
    commodity = relationship("Commodity", back_populates="entitlements")

class PdsStock(Base):
    __tablename__ = "pds_stock"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    village_id = Column(String(36), ForeignKey("villages.id", ondelete="CASCADE"), nullable=False)
    commodity_id = Column(String(36), ForeignKey("commodities.id", ondelete="CASCADE"), nullable=False)
    opening_stock = Column(Float, default=2000.0)
    current_stock = Column(Float, default=1750.0) # dynamically updated
    received_stock_month = Column(Float, default=500.0)
    distributed_stock_month = Column(Float, default=750.0)
    adjusted_stock_month = Column(Float, default=0.0)
    physical_stock_verified = Column(Float, nullable=True)
    last_reconciliation_date = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    village = relationship("Village", back_populates="stocks")
    commodity = relationship("Commodity", back_populates="stocks")

class StockReceipt(Base):
    __tablename__ = "stock_receipts"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    receipt_no = Column(String(40), unique=True, nullable=False) # GRN-2026-042
    village_id = Column(String(36), ForeignKey("villages.id", ondelete="CASCADE"), nullable=False)
    commodity_id = Column(String(36), ForeignKey("commodities.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Float, nullable=False)
    supplier_challan_no = Column(String(50), nullable=True)
    batch_no = Column(String(40), nullable=True)
    received_by = Column(String(100), default="PDS In-charge")
    notes = Column(Text, nullable=True)
    received_date = Column(DateTime, default=datetime.datetime.utcnow)

class StockAdjustment(Base):
    __tablename__ = "stock_adjustments"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    village_id = Column(String(36), ForeignKey("villages.id", ondelete="CASCADE"), nullable=False)
    commodity_id = Column(String(36), ForeignKey("commodities.id", ondelete="CASCADE"), nullable=False)
    expected_stock = Column(Float, nullable=False)
    physical_stock = Column(Float, nullable=False)
    mismatch_quantity = Column(Float, nullable=False) # physical - expected
    explanation = Column(Text, nullable=False)
    adjusted_by = Column(String(100), nullable=False)
    status = Column(String(20), default="APPROVED") # PENDING, APPROVED, FLAGGED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PdsTransaction(Base):
    __tablename__ = "pds_transactions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    transaction_code = Column(String(40), unique=True, nullable=False, index=True) # e.g. TXN-202611-0081
    beneficiary_id = Column(String(36), ForeignKey("beneficiaries.id", ondelete="RESTRICT"), nullable=False)
    village_id = Column(String(36), ForeignKey("villages.id", ondelete="CASCADE"), nullable=False)
    operator_name = Column(String(100), default="PDS Operator")
    total_amount = Column(Float, default=0.0)
    month_period = Column(String(7), nullable=False) # e.g. 2026-11
    verification_mode = Column(String(30), default="BIOMETRIC_SIMULATED") # BIOMETRIC_SIMULATED, OTP_VERIFIED, MANUAL_OVERRIDE
    status = Column(String(20), default="SUCCESS") # SUCCESS, VOIDED, FAILED
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    beneficiary = relationship("Beneficiary", back_populates="transactions")
    items = relationship("PdsTransactionItem", back_populates="transaction", cascade="all, delete-orphan")

class PdsTransactionItem(Base):
    __tablename__ = "pds_transaction_items"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    transaction_id = Column(String(36), ForeignKey("pds_transactions.id", ondelete="CASCADE"), nullable=False)
    commodity_id = Column(String(36), ForeignKey("commodities.id", ondelete="RESTRICT"), nullable=False)
    commodity_name = Column(String(80), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), default="kg")
    unit_price = Column(Float, default=0.0)
    subtotal = Column(Float, default=0.0)

    transaction = relationship("PdsTransaction", back_populates="items")

# ==================== ALERTS, NOTIFICATIONS, AUDIT ====================

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    module = Column(String(20), nullable=False) # WATER, PDS, SYSTEM
    severity = Column(String(20), default="WARNING") # INFO, WARNING, CRITICAL
    title = Column(String(120), nullable=False)
    message = Column(Text, nullable=False)
    source_asset = Column(String(100), nullable=True) # e.g. "Main Elevated Reservoir #1"
    village_id = Column(String(36), ForeignKey("villages.id", ondelete="CASCADE"), nullable=False)
    is_acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(String(100), nullable=True)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    village = relationship("Village", back_populates="alerts")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    module = Column(String(20), nullable=False) # WATER, PDS, AUTH, MAINTENANCE
    action = Column(String(80), nullable=False) # e.g. RATION_DISTRIBUTION, PUMP_TOGGLE, STOCK_RECONCILE
    description = Column(Text, nullable=False)
    performed_by = Column(String(100), nullable=False)
    role = Column(String(50), nullable=True)
    ip_address = Column(String(45), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)

class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String(80), primary_key=True)
    value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
