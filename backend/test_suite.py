import sys
import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestSmartWaterPDSPlatform(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_01_root_and_health(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "ONLINE")

        health = self.client.get("/api/health")
        self.assertEqual(health.status_code, 200)
        self.assertEqual(health.json()["status"], "healthy")

    def test_02_auth_and_demo_accounts(self):
        demos = self.client.get("/api/auth/demo-accounts")
        self.assertEqual(demos.status_code, 200)
        accounts = demos.json()
        self.assertGreaterEqual(len(accounts), 6)

        # Test login
        login_res = self.client.post("/api/auth/login", json={
            "email": "waterop@smartpanchayat.gov.in",
            "password": "password123"
        })
        self.assertEqual(login_res.status_code, 200)
        token_data = login_res.json()
        self.assertIn("access_token", token_data)
        self.assertEqual(token_data["user"]["role"], "WATER_OPERATOR")

    def test_03_water_monitoring_and_pumps(self):
        tanks = self.client.get("/api/water/tanks")
        self.assertEqual(tanks.status_code, 200)
        t_list = tanks.json()
        self.assertGreater(len(t_list), 0)

        tank_id = t_list[0]["id"]
        detail = self.client.get(f"/api/water/tanks/{tank_id}")
        self.assertEqual(detail.status_code, 200)
        self.assertIn("capacity_liters", detail.json())

        history = self.client.get(f"/api/water/tanks/{tank_id}/history?hours=24")
        self.assertEqual(history.status_code, 200)
        self.assertGreater(len(history.json()), 0)

        # Test pump toggle
        pumps = self.client.get("/api/water/pumps")
        self.assertEqual(pumps.status_code, 200)
        p_list = pumps.json()
        self.assertGreater(len(p_list), 0)
        p_id = p_list[0]["id"]

        toggle_res = self.client.post(f"/api/water/pumps/{p_id}/toggle", json={"is_running": False})
        self.assertEqual(toggle_res.status_code, 200)
        self.assertEqual(toggle_res.json()["is_running"], False)

    def test_04_pds_verification_and_atomic_distribution(self):
        # 1. Verification
        verify_res = self.client.get("/api/pds/verify?query=MH-27-010042")
        self.assertEqual(verify_res.status_code, 200)
        v_data = verify_res.json()
        self.assertTrue(v_data["verified"])
        self.assertEqual(v_data["beneficiary"]["name"], "Anandrao Tukaram Kadam")

        ben_id = v_data["beneficiary"]["id"]
        v_id = v_data["beneficiary"]["village_id"]
        items = v_data["items"]
        rice_item = next(i for i in items if i["commodity_code"] == "RICE")

        # 2. Atomic distribution
        dist_res = self.client.post("/api/pds/distribute", json={
            "beneficiary_id": ben_id,
            "village_id": v_id,
            "operator_name": "Vilas Namdeo Jadhav",
            "items": [
                {"commodity_id": rice_item["commodity_id"], "quantity": 2.0}
            ]
        })
        self.assertEqual(dist_res.status_code, 200)
        receipt = dist_res.json()
        self.assertTrue(receipt["success"])
        self.assertIn("TXN-", receipt["transaction_code"])
        self.assertEqual(receipt["total_amount"], 6.0)

    def test_05_stock_reconciliation(self):
        stocks = self.client.get("/api/pds/stocks?village_id=v-shiva").json()
        self.assertGreater(len(stocks), 0)
        target = stocks[0]

        reconcile_res = self.client.post("/api/pds/stocks/reconcile", json={
            "village_id": "v-shiva",
            "commodity_id": target["commodity_id"],
            "physical_stock": target["current_stock"] - 15.0, # Intentional 15kg variance
            "explanation": "Test auditor weighment discrepancy: humidity evaporation.",
            "operator_name": "Auditor"
        })
        self.assertEqual(reconcile_res.status_code, 200)
        r_data = reconcile_res.json()
        self.assertTrue(r_data["has_mismatch"])

    def test_06_hardware_simulation_scenarios(self):
        # Trigger Low Tank scenario
        sc_res = self.client.post("/api/simulation/scenario", json={"scenario": "TANK_LOW"})
        self.assertEqual(sc_res.status_code, 200)

        # Check status
        st_res = self.client.get("/api/simulation/status")
        self.assertEqual(st_res.status_code, 200)
        self.assertEqual(st_res.json()["active_scenario"], "TANK_LOW")

        # Reset back to normal
        ctrl_res = self.client.post("/api/simulation/control", json={"action": "RESET"})
        self.assertEqual(ctrl_res.status_code, 200)

if __name__ == "__main__":
    unittest.main()
