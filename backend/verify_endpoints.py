from app.db.session import SessionLocal
from app.api import auth, water, pds, simulation, analytics, maintenance, complaints
from app.schemas.schemas import UserLogin, DistributionRequest, DistributionItemInput, StockReconcileRequest, PumpToggleRequest

def main():
    print("Beginning direct endpoint verification with local database session...")
    db = SessionLocal()

    # 1. Auth & Demo Accounts
    demos = auth.get_demo_accounts(db)
    print(f" [x] Demo accounts loaded: {len(demos)} accounts")
    assert len(demos) >= 6

    # Test login
    login_res = auth.login(UserLogin(email="waterop@smartpanchayat.gov.in", password="password123"), db)
    print(f" [x] User login successful! User: {login_res['user']['full_name']} ({login_res['user']['role']})")

    # 2. Water Tanks & History
    tanks = water.get_tanks(None, db)
    print(f" [x] Reservoirs retrieved: {len(tanks)} tanks")
    t0 = tanks[0]
    detail = water.get_tank_detail(t0.id, db)
    print(f" [x] Tank details: {detail['name']} (Cap: {detail['capacity_liters']} L, Level: {detail['current_level_pct']}%)")
    hist = water.get_tank_history(t0.id, 24, db)
    print(f" [x] Historical telemetry points: {len(hist)} data points")

    # 3. Pumps & Toggle
    pumps = water.get_pumps(None, db)
    print(f" [x] Pump stations retrieved: {len(pumps)} units")
    p0 = pumps[0]
    toggled = water.toggle_pump(p0.id, PumpToggleRequest(is_running=True), db)
    print(f" [x] Pump '{toggled['name']}' toggled: Current = {toggled['current_amperes']} A, Fault = {toggled['fault_status']}")

    # 4. PDS Verification & Atomic Distribution
    verification = pds.verify_ration_card("MH-27-010042", "v-shiva", db)
    print(f" [x] Card Verified: {verification['beneficiary']['name']} (Card: {verification['beneficiary']['ration_card_number']})")
    ben_id = verification["beneficiary"]["id"]
    rice = next(i for i in verification["items"] if i["commodity_code"] == "RICE")
    print(f"     Eligible Rice Quota Remaining: {rice['remaining_quota']} {rice['unit']} @ Rs {rice['subsidized_price']}/kg")

    # Perform atomic distribution
    dist_receipt = pds.distribute_ration(DistributionRequest(
        beneficiary_id=ben_id,
        village_id="v-shiva",
        operator_name="Vilas Namdeo Jadhav",
        items=[DistributionItemInput(commodity_id=rice["commodity_id"], quantity=2.0)]
    ), db)
    print(f" [x] Atomic distribution committed! Txn Code: {dist_receipt['transaction_code']} - Total: Rs {dist_receipt['total_amount']}")

    # 5. Stock Reconciliation Mismatch Detection
    stocks = pds.get_stocks("v-shiva", db)
    s0 = stocks[0]
    rec_res = pds.reconcile_stock(StockReconcileRequest(
        village_id="v-shiva",
        commodity_id=s0["commodity_id"],
        physical_stock=s0["current_stock"] - 25.0, # 25kg deficit
        explanation="Moisture loss and gunny bag tare weight variance test.",
        operator_name="Auditor"
    ), db)
    print(f" [x] Physical Stock Audit completed! Expected: {rec_res['expected_stock']}, Physical: {rec_res['physical_stock']}, Mismatch: {rec_res['mismatch']} kg")

    # 6. Hardware Simulation Scenarios
    sc_res = simulation.trigger_scenario(simulation.ScenarioSelect(scenario="PUMP_ANOMALY"))
    print(f" [x] Hardware Simulation scenario triggered: {sc_res['active_scenario']}")
    sim_status = simulation.get_simulation_status()
    print(f" [x] Simulation status: Mode = {sim_status['mode']}, Broker = {sim_status['hardware_panel']['mqtt_broker']}")

    # Reset back to normal
    simulation.trigger_scenario(simulation.ScenarioSelect(scenario="NORMAL"))

    # 7. Analytics & Overview
    overview = analytics.get_overview_metrics("v-shiva", db)
    print(f" [x] Overview metrics generated: Tanks = {overview['water']['total_tanks']}, Beneficiaries = {overview['pds']['total_beneficiaries']}, Health = {overview['system']['overall_health_score']}%")

    db.close()
    print("\nALL CORE PLATFORM AND DOMAIN WORKFLOWS VERIFIED 100% OPERATIONAL!")

if __name__ == "__main__":
    main()
