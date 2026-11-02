import datetime
import random
from app.db.session import SessionLocal, Base, engine
from app.db.models import (
    Village, User, Device, WaterTank, Pump, Sensor, SensorReading,
    MaintenanceTask, MaintenanceHistory, Complaint,
    Commodity, RationCard, Beneficiary, BeneficiaryEntitlement,
    PdsStock, StockReceipt, PdsTransaction, PdsTransactionItem,
    Alert, AuditLog, SystemSetting
)
from app.core.security import hash_password

def seed_database():
    # Create tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Village).first():
            print("Database already contains data. Skipping initial seed.")
            return

        print("Seeding database with realistic Gram Panchayat demonstration data...")

        # 1. Villages
        villages_data = [
            {
                "id": "v-shiva",
                "name": "Shivajinagar Gram Panchayat",
                "name_mr": "शिवाजीनगर ग्रामपंचायत",
                "name_hi": "शिवाजीनगर ग्राम पंचायत",
                "district": "Pune",
                "taluka": "Haveli",
                "state": "Maharashtra",
                "population": 4200,
                "households": 840
            },
            {
                "id": "v-ramgarh",
                "name": "Ramgarh Khurd",
                "name_mr": "रामगड खुर्द",
                "name_hi": "रामगढ़ खुर्द",
                "district": "Pune",
                "taluka": "Shirur",
                "state": "Maharashtra",
                "population": 2950,
                "households": 590
            },
            {
                "id": "v-kisanpur",
                "name": "Kisanpur Village",
                "name_mr": "किसानपूर",
                "name_hi": "किसानपुर",
                "district": "Pune",
                "taluka": "Purandar",
                "state": "Maharashtra",
                "population": 3600,
                "households": 720
            },
            {
                "id": "v-sundar",
                "name": "Sundarnagar Panchayat",
                "name_mr": "सुंदरनगर पंचायत",
                "name_hi": "सुंदरनगर पंचायत",
                "district": "Pune",
                "taluka": "Baramati",
                "state": "Maharashtra",
                "population": 5100,
                "households": 1020
            }
        ]

        villages = []
        for vd in villages_data:
            v = Village(**vd)
            db.add(v)
            villages.append(v)
        db.commit()

        v_main = villages[0] # Shivajinagar is default

        # 2. Users (Role-Based Demo Accounts)
        default_pwd_hash = hash_password("password123")
        users_data = [
            {
                "id": "u-superadmin",
                "email": "superadmin@smartpanchayat.gov.in",
                "full_name": "Dr. Rajeshwar Deshmukh",
                "role": "SUPER_ADMIN",
                "phone": "+91 98220 11223",
                "hashed_password": default_pwd_hash,
                "village_id": None
            },
            {
                "id": "u-gpadmin",
                "email": "gpadmin@smartpanchayat.gov.in",
                "full_name": "Sarpanch Sunita Tai Patil",
                "role": "GP_ADMIN",
                "phone": "+91 98221 44556",
                "hashed_password": default_pwd_hash,
                "village_id": v_main.id
            },
            {
                "id": "u-waterop",
                "email": "waterop@smartpanchayat.gov.in",
                "full_name": "Ganesh Maruti Shinde",
                "role": "WATER_OPERATOR",
                "phone": "+91 98222 77889",
                "hashed_password": default_pwd_hash,
                "village_id": v_main.id
            },
            {
                "id": "u-pdsop",
                "email": "pdsop@smartpanchayat.gov.in",
                "full_name": "Vilas Namdeo Jadhav",
                "role": "PDS_OPERATOR",
                "phone": "+91 98223 99001",
                "hashed_password": default_pwd_hash,
                "village_id": v_main.id
            },
            {
                "id": "u-district",
                "email": "districtofficer@smartpanchayat.gov.in",
                "full_name": "Amit Kumar Sharma (IAS, District Collectorate)",
                "role": "DISTRICT_OFFICER",
                "phone": "+91 98224 33445",
                "hashed_password": default_pwd_hash,
                "village_id": None
            },
            {
                "id": "u-citizen",
                "email": "citizen@smartpanchayat.gov.in",
                "full_name": "Anandrao Tukaram Kadam",
                "role": "CITIZEN",
                "phone": "+91 98225 66778",
                "hashed_password": default_pwd_hash,
                "village_id": v_main.id
            }
        ]

        users = []
        for ud in users_data:
            u = User(**ud)
            db.add(u)
            users.append(u)
        db.commit()

        # 3. Devices (ESP32 IoT Nodes)
        devices_data = [
            {
                "id": "dev-01",
                "device_uid": "ESP32-NODE-01-SHIVA",
                "device_type": "ESP32_CONTROLLER",
                "firmware_version": "v2.4.1",
                "ip_address": "192.168.1.101",
                "mac_address": "24:6F:28:B1:C4:E0",
                "mqtt_topic": "smartpanchayat/v1/shiva/node1/telemetry",
                "status": "ONLINE",
                "is_simulated": True,
                "village_id": v_main.id
            },
            {
                "id": "dev-02",
                "device_uid": "ESP32-NODE-02-RAMGARH",
                "device_type": "ESP32_CONTROLLER",
                "firmware_version": "v2.4.1",
                "ip_address": "192.168.1.102",
                "mac_address": "24:6F:28:C2:D5:F1",
                "mqtt_topic": "smartpanchayat/v1/ramgarh/node1/telemetry",
                "status": "ONLINE",
                "is_simulated": True,
                "village_id": villages[1].id
            }
        ]

        for dd in devices_data:
            db.add(Device(**dd))
        db.commit()

        # 4. Water Tanks
        tanks_data = [
            {
                "id": "tank-01",
                "name": "Main Elevated Storage Reservoir (ESR-1)",
                "location_desc": "Near Gram Panchayat Bhavan, North Hill",
                "capacity_liters": 25000.0,
                "current_level_liters": 17500.0,
                "current_level_pct": 70.0,
                "height_meters": 5.0,
                "status": "NORMAL",
                "village_id": v_main.id
            },
            {
                "id": "tank-02",
                "name": "South Ward Ground Service Reservoir (GSR-2)",
                "location_desc": "Zilla Parishad Primary School compound",
                "capacity_liters": 12000.0,
                "current_level_liters": 4200.0,
                "current_level_pct": 35.0,
                "height_meters": 3.8,
                "status": "MEDIUM",
                "village_id": v_main.id
            },
            {
                "id": "tank-03",
                "name": "East Wasti Header Tank (ESR-3)",
                "location_desc": "Kisan Vasti Water Works",
                "capacity_liters": 8000.0,
                "current_level_liters": 1600.0,
                "current_level_pct": 20.0,
                "height_meters": 3.2,
                "status": "LOW",
                "village_id": v_main.id
            },
            {
                "id": "tank-04",
                "name": "Ramgarh Central Overhead Tank",
                "location_desc": "Village Center, Water Works",
                "capacity_liters": 18000.0,
                "current_level_liters": 14400.0,
                "current_level_pct": 80.0,
                "height_meters": 4.5,
                "status": "NORMAL",
                "village_id": villages[1].id
            }
        ]

        for td in tanks_data:
            db.add(WaterTank(**td))
        db.commit()

        # 5. Pumps
        pumps_data = [
            {
                "id": "pump-01",
                "name": "River Intake Pump #1 (Submersible 10HP)",
                "hp_rating": 10.0,
                "is_running": True,
                "current_amperes": 13.8,
                "normal_current_min": 10.0,
                "normal_current_max": 16.5,
                "daily_runtime_hours": 5.4,
                "starts_today": 3,
                "fault_status": "NORMAL",
                "village_id": v_main.id,
                "tank_id": "tank-01"
            },
            {
                "id": "pump-02",
                "name": "Booster Pump Station #2 (Centrifugal 7.5HP)",
                "hp_rating": 7.5,
                "is_running": False,
                "current_amperes": 0.0,
                "normal_current_min": 8.0,
                "normal_current_max": 13.0,
                "daily_runtime_hours": 2.2,
                "starts_today": 2,
                "fault_status": "NORMAL",
                "village_id": v_main.id,
                "tank_id": "tank-02"
            },
            {
                "id": "pump-03",
                "name": "Borewell Feeder Pump #3 (5HP)",
                "hp_rating": 5.0,
                "is_running": True,
                "current_amperes": 4.2, # abnormally low current (dry run warning demo)
                "normal_current_min": 6.5,
                "normal_current_max": 10.0,
                "daily_runtime_hours": 6.1,
                "starts_today": 4,
                "fault_status": "DRY_RUN_WARNING",
                "village_id": v_main.id,
                "tank_id": "tank-03"
            }
        ]

        for pd in pumps_data:
            db.add(Pump(**pd))
        db.commit()

        # 6. Sensors & Historical Telemetry
        sensors_data = [
            {
                "id": "sens-lvl-01",
                "sensor_uid": "ULTRASONIC-ESR1",
                "sensor_type": "ULTRASONIC_LEVEL",
                "model": "JSN-SR04T Waterproof",
                "current_value": 70.0,
                "unit": "%",
                "status": "ONLINE",
                "device_id": "dev-01",
                "tank_id": "tank-01",
                "pump_id": None
            },
            {
                "id": "sens-curr-01",
                "sensor_uid": "CT-PUMP-01",
                "sensor_type": "CURRENT_CT",
                "model": "SCT-013-030 Non-Invasive",
                "current_value": 13.8,
                "unit": "A",
                "status": "ONLINE",
                "device_id": "dev-01",
                "tank_id": None,
                "pump_id": "pump-01"
            },
            {
                "id": "sens-flow-01",
                "sensor_uid": "FLOW-MAIN-01",
                "sensor_type": "FLOW_PULSE",
                "model": "YF-DN50 Flanged Hall-Effect",
                "current_value": 145.0,
                "unit": "L/min",
                "status": "ONLINE",
                "device_id": "dev-01",
                "tank_id": "tank-01",
                "pump_id": None
            },
            {
                "id": "sens-lvl-02",
                "sensor_uid": "ULTRASONIC-GSR2",
                "sensor_type": "ULTRASONIC_LEVEL",
                "model": "JSN-SR04T Waterproof",
                "current_value": 35.0,
                "unit": "%",
                "status": "ONLINE",
                "device_id": "dev-01",
                "tank_id": "tank-02",
                "pump_id": None
            },
            {
                "id": "sens-curr-03",
                "sensor_uid": "CT-PUMP-03",
                "sensor_type": "CURRENT_CT",
                "model": "SCT-013-030 Non-Invasive",
                "current_value": 4.2,
                "unit": "A",
                "status": "ONLINE",
                "device_id": "dev-01",
                "tank_id": None,
                "pump_id": "pump-03"
            }
        ]

        for sd in sensors_data:
            db.add(Sensor(**sd))
        db.commit()

        # Seed 24 hours of telemetry for charts
        now = datetime.datetime.utcnow()
        readings = []
        for h in range(24, 0, -1):
            ts = now - datetime.timedelta(hours=h)
            # Tank 1 water level cycle
            cycle_pct = 65.0 + 15.0 * (1 if (h % 8 < 4) else -1) * (random.uniform(0.7, 1.0))
            readings.append(SensorReading(
                sensor_id="sens-lvl-01",
                value=round(max(10.0, min(95.0, cycle_pct)), 1),
                unit="%",
                timestamp=ts,
                is_simulated=True
            ))
            # Pump 1 current
            is_p_on = (h % 6 > 2)
            c_val = round(random.uniform(13.2, 14.5), 2) if is_p_on else 0.0
            readings.append(SensorReading(
                sensor_id="sens-curr-01",
                value=c_val,
                unit="A",
                timestamp=ts,
                is_simulated=True
            ))
            # Flow rate
            f_val = round(random.uniform(140.0, 160.0), 1) if is_p_on else 0.0
            readings.append(SensorReading(
                sensor_id="sens-flow-01",
                value=f_val,
                unit="L/min",
                timestamp=ts,
                is_simulated=True
            ))
        db.bulk_save_objects(readings)
        db.commit()

        # 7. Maintenance Tasks
        maintenance_data = [
            {
                "id": "mnt-01",
                "task_code": "MNT-2026-001",
                "title": "Borewell Feeder Pump #3 Low Current Inspection",
                "description": "CT Sensor detected current at 4.2A vs expected 8.5A. Suspected water table depletion causing dry run or loose impeller coupler.",
                "asset_type": "PUMP",
                "priority": "HIGH",
                "status": "IN_PROGRESS",
                "village_id": v_main.id,
                "assigned_to_id": "u-waterop",
                "due_date": now + datetime.timedelta(days=1),
                "inspection_notes": "First inspection showed minor cavitation vibrations. Checking suction foot valve.",
                "created_at": now - datetime.timedelta(days=1)
            },
            {
                "id": "mnt-02",
                "task_code": "MNT-2026-002",
                "title": "Quarterly ESR-1 Tank Desiltation & Bleaching",
                "description": "Routine public health maintenance: drain bottom sediment and apply food-grade chlorine bleaching powder.",
                "asset_type": "TANK",
                "priority": "MEDIUM",
                "status": "COMPLETED",
                "village_id": v_main.id,
                "assigned_to_id": "u-waterop",
                "due_date": now - datetime.timedelta(days=3),
                "completed_at": now - datetime.timedelta(days=2),
                "inspection_notes": "Completed successfully. Residual chlorine tested at 0.4 ppm at tap outlets.",
                "created_at": now - datetime.timedelta(days=7)
            },
            {
                "id": "mnt-03",
                "task_code": "MNT-2026-003",
                "title": "East Wasti Feeder Pipeline Joint Leakage Repair",
                "description": "Subtle pressure drop observed in distribution manifold near lane 4 crossroad. Soil moisture detected.",
                "asset_type": "PIPELINE",
                "priority": "CRITICAL",
                "status": "ASSIGNED",
                "village_id": v_main.id,
                "assigned_to_id": "u-waterop",
                "due_date": now + datetime.timedelta(hours=12),
                "inspection_notes": None,
                "created_at": now - datetime.timedelta(hours=6)
            }
        ]

        for md in maintenance_data:
            db.add(MaintenanceTask(**md))
        db.commit()

        # 8. Complaints
        complaints_data = [
            {
                "id": "cmp-01",
                "complaint_code": "CMP-2026-081",
                "category": "WATER_SUPPLY",
                "title": "Low water pressure during morning hours in Lane 3",
                "description": "Water pressure drops after 7:30 AM making it difficult to fill household vessels.",
                "status": "ACTION_TAKEN",
                "priority": "MEDIUM",
                "citizen_name": "Anandrao Tukaram Kadam",
                "citizen_phone": "+91 98225 66778",
                "citizen_id": "u-citizen",
                "village_id": v_main.id,
                "resolution_notes": "Booster pump timing adjusted by 45 minutes; tested at terminal end.",
                "created_at": now - datetime.timedelta(days=2)
            },
            {
                "id": "cmp-02",
                "complaint_code": "CMP-2026-082",
                "category": "LEAKAGE",
                "title": "Puddle forming near community tap #4",
                "description": "Tap valve stem is worn out and continuously leaking clean potable water.",
                "status": "SUBMITTED",
                "priority": "HIGH",
                "citizen_name": "Ramesh Vitthal Shinde",
                "citizen_phone": "+91 98230 44112",
                "citizen_id": None,
                "village_id": v_main.id,
                "created_at": now - datetime.timedelta(hours=14)
            },
            {
                "id": "cmp-03",
                "complaint_code": "CMP-2026-083",
                "category": "PDS_DISTRIBUTION",
                "title": "Ration shop machine biometric delay",
                "description": "Fingerprint scanner took 4 attempts for elderly father. Please check device sensor.",
                "status": "RESOLVED",
                "priority": "LOW",
                "citizen_name": "Kamlabai Ghadge",
                "citizen_phone": "+91 98231 88990",
                "citizen_id": None,
                "village_id": v_main.id,
                "resolution_notes": "Sensor glass cleaned with isopropyl alcohol. Alternative OTP verification demonstrated to operator.",
                "resolved_at": now - datetime.timedelta(days=1),
                "created_at": now - datetime.timedelta(days=4)
            }
        ]

        for cd in complaints_data:
            db.add(Complaint(**cd))
        db.commit()

        # ==================== PDS SEEDING ====================

        # 9. Commodities
        commodities_data = [
            {
                "id": "comm-rice",
                "code": "RICE",
                "name": "Fortified Rice",
                "name_mr": "फोर्टिफाइड तांदूळ",
                "name_hi": "फोर्टिफाइड चावल",
                "unit": "kg",
                "subsidized_price": 3.0,
                "min_stock_alert_threshold": 400.0,
                "is_active": True
            },
            {
                "id": "comm-wheat",
                "code": "WHEAT",
                "name": "Quality Wheat",
                "name_mr": "दर्जेदार गहू",
                "name_hi": "गुणवत्तापूर्ण गेहूँ",
                "unit": "kg",
                "subsidized_price": 2.0,
                "min_stock_alert_threshold": 500.0,
                "is_active": True
            },
            {
                "id": "comm-sugar",
                "code": "SUGAR",
                "name": "Refined Sugar",
                "name_mr": "साखर",
                "name_hi": "चीनी",
                "unit": "kg",
                "subsidized_price": 13.50,
                "min_stock_alert_threshold": 150.0,
                "is_active": True
            },
            {
                "id": "comm-oil",
                "code": "OIL",
                "name": "Fortified Sunflower Cooking Oil",
                "name_mr": "सूर्यफूल खाद्यतेल",
                "name_hi": "सूर्यमुखी खाद्य तेल",
                "unit": "L",
                "subsidized_price": 25.0,
                "min_stock_alert_threshold": 100.0,
                "is_active": True
            },
            {
                "id": "comm-kerosene",
                "code": "KEROSENE",
                "name": "Subsidized Kerosene",
                "name_mr": "अनुदानित रॉकेल",
                "name_hi": "सब्सिडी वाला केरोसिन",
                "unit": "L",
                "subsidized_price": 18.0,
                "min_stock_alert_threshold": 80.0,
                "is_active": True
            }
        ]

        commodities = []
        for cmd in commodities_data:
            c = Commodity(**cmd)
            db.add(c)
            commodities.append(c)
        db.commit()

        # 10. PDS Stocks
        stocks_data = [
            {
                "village_id": v_main.id,
                "commodity_id": "comm-rice",
                "opening_stock": 2500.0,
                "current_stock": 1820.0,
                "received_stock_month": 1000.0,
                "distributed_stock_month": 1680.0,
                "adjusted_stock_month": 0.0,
                "physical_stock_verified": 1820.0,
                "last_reconciliation_date": now - datetime.timedelta(days=2)
            },
            {
                "village_id": v_main.id,
                "commodity_id": "comm-wheat",
                "opening_stock": 3200.0,
                "current_stock": 2150.0,
                "received_stock_month": 1200.0,
                "distributed_stock_month": 2250.0,
                "adjusted_stock_month": 0.0,
                "physical_stock_verified": 2150.0,
                "last_reconciliation_date": now - datetime.timedelta(days=2)
            },
            {
                "village_id": v_main.id,
                "commodity_id": "comm-sugar",
                "opening_stock": 600.0,
                "current_stock": 280.0,
                "received_stock_month": 200.0,
                "distributed_stock_month": 520.0,
                "adjusted_stock_month": 0.0,
                "physical_stock_verified": 280.0,
                "last_reconciliation_date": now - datetime.timedelta(days=2)
            },
            {
                "village_id": v_main.id,
                "commodity_id": "comm-oil",
                "opening_stock": 400.0,
                "current_stock": 85.0, # Below threshold (100) -> triggers low stock alert!
                "received_stock_month": 100.0,
                "distributed_stock_month": 415.0,
                "adjusted_stock_month": 0.0,
                "physical_stock_verified": 85.0,
                "last_reconciliation_date": now - datetime.timedelta(days=5)
            },
            {
                "village_id": v_main.id,
                "commodity_id": "comm-kerosene",
                "opening_stock": 300.0,
                "current_stock": 190.0,
                "received_stock_month": 100.0,
                "distributed_stock_month": 210.0,
                "adjusted_stock_month": 0.0,
                "physical_stock_verified": 190.0,
                "last_reconciliation_date": now - datetime.timedelta(days=3)
            }
        ]

        for st in stocks_data:
            db.add(PdsStock(**st))
        db.commit()

        # 11. 60+ Realistic Beneficiaries with Ration Cards & Entitlements
        first_names = [
            ("Anandrao", "आनंदराव"), ("Vitthal", "विठ्ठल"), ("Tukaram", "तुकाराम"),
            ("Pandurang", "पांडुरंग"), ("Dnyaneshwar", "ज्ञानेश्वर"), ("Savitribai", "सावित्रीबाई"),
            ("Laxmibai", "लक्ष्मीबाई"), ("Kashinath", "काशीनाथ"), ("Babasaheb", "बाबासाहेब"),
            ("Mahadu", "महादू"), ("Shantabai", "शांताबाई"), ("Eknath", "एकनाथ"),
            ("Subhash", "सुभाष"), ("Parvatibai", "पार्वतीबाई"), ("Govind", "गोविंद"),
            ("Bhausaheb", "भाऊसाहेब"), ("Muktabai", "मुक्ताबाई"), ("Namdeo", "नामदेव"),
            ("Chandrakant", "चंद्रकांत"), ("Janabai", "जनाबाई")
        ]
        last_names = [
            ("Kadam", "कदम"), ("Patil", "पाटील"), ("Shinde", "शिंदे"),
            ("Jadhav", "जाधव"), ("Pawar", "पवार"), ("Ghadge", "घाडगे"),
            ("Bhosale", "भोसले"), ("Gaikwad", "गायकवाड"), ("Chavan", "चव्हाण"),
            ("More", "मोरे"), ("Mane", "माने"), ("Salunkhe", "साळुंखे")
        ]

        current_month = now.strftime("%Y-%m")
        beneficiaries_created = []

        # Citizen demo account link: Anandrao Kadam
        rc_demo = RationCard(
            id="rc-demo-01",
            card_number="MH-27-010042",
            category="PHH", # Priority Household / BPL
            color="YELLOW",
            is_active=True
        )
        db.add(rc_demo)
        db.flush()

        ben_demo = Beneficiary(
            id="ben-demo-01",
            beneficiary_code="BEN-SHIVA-0001",
            name="Anandrao Tukaram Kadam",
            name_mr="आनंदराव तुकाराम कदम",
            head_of_family="Anandrao Tukaram Kadam",
            family_members_count=4,
            contact_phone="+91 98225 66778",
            address="House No. 42, North Lane, Shivajinagar",
            status="ACTIVE",
            village_id=v_main.id,
            ration_card_id=rc_demo.id
        )
        db.add(ben_demo)
        db.flush()

        # Entitlements for demo beneficiary
        db.add(BeneficiaryEntitlement(beneficiary_id=ben_demo.id, commodity_id="comm-rice", monthly_quota=12.0, current_month_consumed=0.0, quota_month=current_month))
        db.add(BeneficiaryEntitlement(beneficiary_id=ben_demo.id, commodity_id="comm-wheat", monthly_quota=8.0, current_month_consumed=0.0, quota_month=current_month))
        db.add(BeneficiaryEntitlement(beneficiary_id=ben_demo.id, commodity_id="comm-sugar", monthly_quota=2.0, current_month_consumed=0.0, quota_month=current_month))
        db.add(BeneficiaryEntitlement(beneficiary_id=ben_demo.id, commodity_id="comm-oil", monthly_quota=1.0, current_month_consumed=0.0, quota_month=current_month))
        beneficiaries_created.append(ben_demo)

        # Generate 64 more realistic beneficiaries across categories
        cat_choices = [("AAY", "YELLOW", 35.0, 15.0), ("PHH", "YELLOW", 15.0, 10.0), ("APL", "ORANGE", 10.0, 5.0)]

        for idx in range(2, 65):
            fn_en, fn_mr = random.choice(first_names)
            ln_en, ln_mr = random.choice(last_names)
            full_name_en = f"{fn_en} {ln_en}"
            full_name_mr = f"{fn_mr} {ln_mr}"
            cat, color, r_quota, w_quota = random.choices(cat_choices, weights=[0.25, 0.55, 0.20])[0]
            family_size = random.randint(2, 7)
            card_no = f"MH-27-{idx:06d}"
            code = f"BEN-SHIVA-{idx:04d}"

            rc = RationCard(
                card_number=card_no,
                category=cat,
                color=color,
                is_active=True
            )
            db.add(rc)
            db.flush()

            v_assigned = v_main.id if idx <= 50 else random.choice(villages[1:]).id

            ben = Beneficiary(
                beneficiary_code=code,
                name=full_name_en,
                name_mr=full_name_mr,
                head_of_family=full_name_en,
                family_members_count=family_size,
                contact_phone=f"+91 98{random.randint(10000000, 99999999)}",
                address=f"Plot {idx}, Ward {random.randint(1, 5)}, Rural Post Office",
                status="ACTIVE",
                village_id=v_assigned,
                ration_card_id=rc.id
            )
            db.add(ben)
            db.flush()

            # Entitlements
            is_already_distributed = (idx % 3 == 0) # 33% received ration already this month
            r_consumed = r_quota if is_already_distributed else 0.0
            w_consumed = w_quota if is_already_distributed else 0.0

            db.add(BeneficiaryEntitlement(beneficiary_id=ben.id, commodity_id="comm-rice", monthly_quota=r_quota, current_month_consumed=r_consumed, quota_month=current_month))
            db.add(BeneficiaryEntitlement(beneficiary_id=ben.id, commodity_id="comm-wheat", monthly_quota=w_quota, current_month_consumed=w_consumed, quota_month=current_month))
            db.add(BeneficiaryEntitlement(beneficiary_id=ben.id, commodity_id="comm-sugar", monthly_quota=2.0, current_month_consumed=2.0 if is_already_distributed else 0.0, quota_month=current_month))
            db.add(BeneficiaryEntitlement(beneficiary_id=ben.id, commodity_id="comm-oil", monthly_quota=1.0, current_month_consumed=1.0 if is_already_distributed else 0.0, quota_month=current_month))

            beneficiaries_created.append(ben)

            # Record realistic past transactions for distributed beneficiaries
            if is_already_distributed:
                txn_code = f"TXN-{current_month.replace('-', '')}-{idx:04d}"
                txn = PdsTransaction(
                    transaction_code=txn_code,
                    beneficiary_id=ben.id,
                    village_id=v_assigned,
                    operator_name="Vilas Namdeo Jadhav",
                    total_amount=round((r_quota * 3.0) + (w_quota * 2.0) + (2.0 * 13.50) + (1.0 * 25.0), 2),
                    month_period=current_month,
                    verification_mode="BIOMETRIC_SIMULATED",
                    status="SUCCESS",
                    created_at=now - datetime.timedelta(days=random.randint(1, 6), hours=random.randint(1, 8))
                )
                db.add(txn)
                db.flush()

                db.add(PdsTransactionItem(transaction_id=txn.id, commodity_id="comm-rice", commodity_name="Fortified Rice", quantity=r_quota, unit="kg", unit_price=3.0, subtotal=r_quota * 3.0))
                db.add(PdsTransactionItem(transaction_id=txn.id, commodity_id="comm-wheat", commodity_name="Quality Wheat", quantity=w_quota, unit="kg", unit_price=2.0, subtotal=w_quota * 2.0))
                db.add(PdsTransactionItem(transaction_id=txn.id, commodity_id="comm-sugar", commodity_name="Refined Sugar", quantity=2.0, unit="kg", unit_price=13.50, subtotal=27.0))
                db.add(PdsTransactionItem(transaction_id=txn.id, commodity_id="comm-oil", commodity_name="Sunflower Cooking Oil", quantity=1.0, unit="L", unit_price=25.0, subtotal=25.0))

        db.commit()

        # 12. Stock Receipts (Goods Receipt Notes)
        receipts_data = [
            {
                "receipt_no": "GRN-202611-001",
                "village_id": v_main.id,
                "commodity_id": "comm-rice",
                "quantity": 1000.0,
                "supplier_challan_no": "FCI-PUN-8842",
                "batch_no": "BATCH-NOV-R01",
                "received_by": "Vilas Namdeo Jadhav",
                "notes": "Food Corporation of India state buffer stock supply. Moisture certified < 12%.",
                "received_date": now - datetime.timedelta(days=7)
            },
            {
                "receipt_no": "GRN-202611-002",
                "village_id": v_main.id,
                "commodity_id": "comm-wheat",
                "quantity": 1200.0,
                "supplier_challan_no": "FCI-PUN-8843",
                "batch_no": "BATCH-NOV-W01",
                "received_by": "Vilas Namdeo Jadhav",
                "notes": "Grade-A wheat bags received in sealed gunny bags.",
                "received_date": now - datetime.timedelta(days=7)
            }
        ]
        for rc_d in receipts_data:
            db.add(StockReceipt(**rc_d))
        db.commit()

        # 13. System Alerts
        alerts_data = [
            {
                "module": "WATER",
                "severity": "CRITICAL",
                "title": "East Wasti Tank Level Critically Low (20%)",
                "message": "Water level dropped to 1,600 L. Scheduled distribution starts in 4 hours. Automated pump cycle recommended.",
                "source_asset": "East Wasti Header Tank (ESR-3)",
                "village_id": v_main.id,
                "is_acknowledged": False
            },
            {
                "module": "WATER",
                "severity": "WARNING",
                "title": "Borewell Pump #3 Abnormal Low Current Detected",
                "message": "CT sensor reading 4.2A is below normal range [6.5A - 10.0A]. Possible dry-run or electrical under-current condition.",
                "source_asset": "Borewell Feeder Pump #3",
                "village_id": v_main.id,
                "is_acknowledged": True,
                "acknowledged_by": "Ganesh Maruti Shinde"
            },
            {
                "module": "PDS",
                "severity": "WARNING",
                "title": "Sunflower Oil Stock Below Safety Threshold",
                "message": "Available stock (85 L) is below minimum threshold (100 L). Please indent emergency supply from Taluka godown.",
                "source_asset": "PDS Fair Price Shop #1",
                "village_id": v_main.id,
                "is_acknowledged": False
            }
        ]

        for ald in alerts_data:
            db.add(Alert(**ald))
        db.commit()

        # 14. Audit Logs
        audit_data = [
            {
                "module": "AUTH",
                "action": "SYSTEM_INITIALIZATION",
                "description": "Smart Water & Digital Gram Panchayat Platform database initialized and verified.",
                "performed_by": "System Daemon",
                "role": "SYSTEM"
            },
            {
                "module": "WATER",
                "action": "PUMP_AUTOMATION_TRIGGER",
                "description": "Pump #1 automated start triggered by reservoir ESR-1 dropping to low limit threshold.",
                "performed_by": "IoT Controller Daemon",
                "role": "SYSTEM"
            },
            {
                "module": "PDS",
                "action": "STOCK_RECEIPT_LOGGED",
                "description": "Logged 1000 kg Rice and 1200 kg Wheat from FCI Pune buffer under GRN-202611-001.",
                "performed_by": "Vilas Namdeo Jadhav",
                "role": "PDS_OPERATOR"
            }
        ]

        for aud in audit_data:
            db.add(AuditLog(**aud))
        db.commit()

        # 15. System Settings
        settings_data = [
            {"key": "SYSTEM_VERSION", "value": "2.4.0-Production", "description": "Platform Build Version"},
            {"key": "SIMULATION_ENABLED", "value": "true", "description": "ESP32 Hardware Simulation Engine Status"},
            {"key": "DEFAULT_LANGUAGE", "value": "en", "description": "Default Portal Language"},
            {"key": "ENABLE_SMS_ALERTS", "value": "true", "description": "Send critical SMS notifications to operators"}
        ]
        for s in settings_data:
            db.add(SystemSetting(**s))
        db.commit()

        print("Database seeding completed successfully with 4 villages, 6 role accounts, 4 tanks, 3 pumps, 5 sensors, 65 beneficiaries, and complete PDS ledger.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
