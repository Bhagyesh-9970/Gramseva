import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { VillageProvider } from './context/VillageContext';
import { TelemetryProvider } from './context/TelemetryContext';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { WaterMonitoringPage } from './pages/WaterMonitoringPage';
import { TankDetailsPage } from './pages/TankDetailsPage';
import { PumpMonitoringPage } from './pages/PumpMonitoringPage';
import { HardwareSimulationPage } from './pages/HardwareSimulationPage';
import { DigitalOMPage } from './pages/DigitalOMPage';
import { MaintenanceDetailsPage } from './pages/MaintenanceDetailsPage';
import { PDSDashboardPage } from './pages/PDSDashboardPage';
import { BeneficiariesPage } from './pages/BeneficiariesPage';
import { BeneficiaryProfilePage } from './pages/BeneficiaryProfilePage';
import { RationDistributionPage } from './pages/RationDistributionPage';
import { StockManagementPage } from './pages/StockManagementPage';
import { StockReconciliationPage } from './pages/StockReconciliationPage';
import { TransactionHistoryPage } from './pages/TransactionHistoryPage';
import { AlertsPage } from './pages/AlertsPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdministrationPage } from './pages/AdministrationPage';
import { MultilingualGuidePage } from './pages/MultilingualGuidePage';
import { UserProfilePage } from './pages/UserProfilePage';

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <VillageProvider>
            <TelemetryProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public Pages */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />

                  {/* Portal Dashboard Pages */}
                  <Route path="/app" element={<Navigate to="/app/overview" replace />} />
                  <Route path="/app/overview" element={<OverviewDashboard />} />
                  <Route path="/app/water" element={<WaterMonitoringPage />} />
                  <Route path="/app/water/tank/:tankId" element={<TankDetailsPage />} />
                  <Route path="/app/pumps" element={<PumpMonitoringPage />} />
                  <Route path="/app/simulation" element={<HardwareSimulationPage />} />
                  <Route path="/app/maintenance" element={<DigitalOMPage />} />
                  <Route path="/app/maintenance/task/:taskId" element={<MaintenanceDetailsPage />} />
                  <Route path="/app/pds" element={<PDSDashboardPage />} />
                  <Route path="/app/beneficiaries" element={<BeneficiariesPage />} />
                  <Route path="/app/beneficiaries/:id" element={<BeneficiaryProfilePage />} />
                  <Route path="/app/distribution" element={<RationDistributionPage />} />
                  <Route path="/app/stock" element={<StockManagementPage />} />
                  <Route path="/app/reconciliation" element={<StockReconciliationPage />} />
                  <Route path="/app/transactions" element={<TransactionHistoryPage />} />
                  <Route path="/app/alerts" element={<AlertsPage />} />
                  <Route path="/app/complaints" element={<ComplaintsPage />} />
                  <Route path="/app/reports" element={<ReportsPage />} />
                  <Route path="/app/admin" element={<AdministrationPage />} />
                  <Route path="/app/guide" element={<MultilingualGuidePage />} />
                  <Route path="/app/profile" element={<UserProfilePage />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </TelemetryProvider>
          </VillageProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
