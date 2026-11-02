export type UserRole =
  | 'SUPER_ADMIN'
  | 'GP_ADMIN'
  | 'WATER_OPERATOR'
  | 'PDS_OPERATOR'
  | 'DISTRICT_OFFICER'
  | 'CITIZEN';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  village_id?: string;
  village_name?: string;
}

export interface Village {
  id: string;
  name: string;
  name_mr?: string;
  name_hi?: string;
  district: string;
  taluka: string;
  state: string;
  population: number;
  households: number;
  stats?: {
    tanks_count: number;
    pumps_count: number;
    beneficiaries_count: number;
  };
}

export interface WaterTank {
  id: string;
  name: string;
  location_desc?: string;
  capacity_liters: number;
  current_level_liters: number;
  current_level_pct: number;
  height_meters: number;
  status: 'NORMAL' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  village_id: string;
  village_name?: string;
  updated_at?: string;
}

export interface Pump {
  id: string;
  name: string;
  hp_rating: number;
  is_running: boolean;
  current_amperes: number;
  normal_current_min: number;
  normal_current_max: number;
  daily_runtime_hours: number;
  starts_today: number;
  fault_status: 'NORMAL' | 'DRY_RUN_WARNING' | 'OVERLOAD_WARNING' | 'ELECTRICAL_FAULT' | 'TRIP';
  last_maintenance_date?: string;
  village_id: string;
  tank_id?: string;
  updated_at?: string;
}

export interface Sensor {
  id: string;
  sensor_uid: string;
  sensor_type: 'ULTRASONIC_LEVEL' | 'CURRENT_CT' | 'FLOW_PULSE' | 'PRESSURE';
  model: string;
  current_value: number;
  unit: string;
  status: 'ONLINE' | 'OFFLINE' | 'CALIBRATING';
  device_id?: string;
  tank_id?: string;
  pump_id?: string;
}

export interface MaintenanceTask {
  id: string;
  task_code: string;
  title: string;
  description: string;
  asset_type: 'PUMP' | 'TANK' | 'PIPELINE' | 'SENSOR' | 'ELECTRICAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  village_id: string;
  village_name?: string;
  assigned_to_id?: string;
  assigned_to_name?: string;
  due_date?: string;
  completed_at?: string;
  inspection_notes?: string;
  created_at: string;
}

export interface Complaint {
  id: string;
  complaint_code: string;
  category: 'WATER_SUPPLY' | 'PUMP_FAILURE' | 'LEAKAGE' | 'LOW_PRESSURE' | 'PDS_DISTRIBUTION' | 'OTHER';
  title: string;
  description: string;
  status: 'SUBMITTED' | 'IN_REVIEW' | 'ACTION_TAKEN' | 'RESOLVED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  citizen_name: string;
  citizen_phone?: string;
  citizen_id?: string;
  village_id: string;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
}

export interface Commodity {
  id: string;
  code: string;
  name: string;
  name_mr?: string;
  name_hi?: string;
  unit: string;
  subsidized_price: number;
  min_stock_alert_threshold: number;
  is_active: boolean;
}

export interface BeneficiaryEntitlement {
  commodity_id: string;
  commodity_name: string;
  unit: string;
  monthly_quota: number;
  current_month_consumed: number;
  remaining_quota: number;
  unit_price: number;
}

export interface Beneficiary {
  id: string;
  beneficiary_code: string;
  name: string;
  name_mr?: string;
  head_of_family: string;
  family_members_count: number;
  contact_phone?: string;
  address?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRANSFERRED';
  village_id: string;
  village_name?: string;
  ration_card_number: string;
  ration_card_category: 'AAY' | 'PHH' | 'APL';
  ration_card_color: string;
  entitlements?: BeneficiaryEntitlement[];
}

export interface PdsStock {
  id: string;
  village_id: string;
  commodity_id: string;
  commodity_name: string;
  commodity_code: string;
  unit: string;
  subsidized_price: number;
  opening_stock: number;
  current_stock: number;
  received_stock_month: number;
  distributed_stock_month: number;
  adjusted_stock_month: number;
  physical_stock_verified?: number;
  min_threshold: number;
  is_low_stock: boolean;
  last_reconciliation_date?: string;
}

export interface TransactionItem {
  commodity_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  subtotal: number;
}

export interface PdsTransaction {
  id: string;
  transaction_code: string;
  beneficiary_id: string;
  beneficiary_name: string;
  beneficiary_code: string;
  ration_card_number: string;
  village_id: string;
  village_name: string;
  operator_name: string;
  total_amount: number;
  month_period: string;
  verification_mode: string;
  status: string;
  created_at: string;
  items: TransactionItem[];
}

export interface Alert {
  id: string;
  module: 'WATER' | 'PDS' | 'SYSTEM';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  source_asset?: string;
  village_id: string;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  is_resolved: boolean;
  resolved_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  module: string;
  action: string;
  description: string;
  performed_by: string;
  role?: string;
  timestamp: string;
}

export type SupportedLanguage = 'en' | 'mr' | 'hi';
