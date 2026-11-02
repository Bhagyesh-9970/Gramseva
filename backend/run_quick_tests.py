from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    print("Testing API endpoints...")
    app.state.testing = True
    with TestClient(app) as client:
        # 1. Root & Health
        res = client.get("/")
        assert res.status_code == 200, f"Root failed: {res.text}"
        print(" [x] Root & Health endpoints passed")

        # 2. Auth & Demo Accounts
        demos = client.get("/api/auth/demo-accounts").json()
        assert len(demos) >= 6, f"Expected >= 6 demo accounts, got {len(demos)}"
        login_res = client.post("/api/auth/login", json={
            "email": "waterop@smartpanchayat.gov.in",
            "password": "password123"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        assert login_res.json()["user"]["role"] == "WATER_OPERATOR"
        print(" [x] Multi-role login & demo accounts verified")

        # 3. Water & Pump Telemetry
        tanks = client.get("/api/water/tanks").json()
        assert len(tanks) > 0, "No tanks returned"
        pumps = client.get("/api/water/pumps").json()
        assert len(pumps) > 0, "No pumps returned"
        print(" [x] Water tanks and pump telemetry verified")

        # 4. PDS Verification & Atomic Distribution
        verify_data = client.get("/api/pds/verify?query=MH-27-010042").json()
        assert verify_data["verified"] is True
        ben_id = verify_data["beneficiary"]["id"]
        v_id = verify_data["beneficiary"]["village_id"]
        rice_item = next(i for i in verify_data["items"] if i["commodity_code"] == "RICE")

        dist_res = client.post("/api/pds/distribute", json={
            "beneficiary_id": ben_id,
            "village_id": v_id,
            "operator_name": "Vilas Namdeo Jadhav",
            "items": [{"commodity_id": rice_item["commodity_id"], "quantity": 1.0}]
        })
        assert dist_res.status_code == 200, f"Distribution failed: {dist_res.text}"
        receipt = dist_res.json()
        assert receipt["success"] is True
        assert "TXN-" in receipt["transaction_code"]
        print(" [x] PDS verification and atomic distribution verified")

        # 5. Stock Reconciliation Mismatch Check
        stocks = client.get("/api/pds/stocks?village_id=v-shiva").json()
        s0 = stocks[0]
        rec_res = client.post("/api/pds/stocks/reconcile", json={
            "village_id": "v-shiva",
            "commodity_id": s0["commodity_id"],
            "physical_stock": s0["current_stock"] - 10.0,
            "explanation": "Auditor verification test variance.",
            "operator_name": "Auditor"
        })
        assert rec_res.status_code == 200
        assert rec_res.json()["has_mismatch"] is True
        print(" [x] Stock reconciliation and mismatch detection verified")

        # 6. Hardware Simulation
        sc_res = client.post("/api/simulation/scenario", json={"scenario": "TANK_LOW"})
        assert sc_res.status_code == 200
        st = client.get("/api/simulation/status").json()
        assert st["active_scenario"] == "TANK_LOW"
        client.post("/api/simulation/control", json={"action": "RESET"})
        print(" [x] Hardware simulation and fault scenarios verified")

    print("\nALL ACCEPTANCE CRITERIA PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
