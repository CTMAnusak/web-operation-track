import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { routePaths } from './routePaths';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import CustomerSearchPage from '../pages/CustomerSearchPage';
import OpdDetailPage from '../pages/OpdDetailPage';
import HeaderScanPage from '../pages/HeaderScanPage';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routePaths.login} element={<LoginPage />} />
        <Route path={routePaths.dashboard} element={<DashboardPage />} />
        <Route path={routePaths.search} element={<CustomerSearchPage />} />
        <Route path={routePaths.opdDetail} element={<OpdDetailPage />} />
        <Route path={routePaths.headerScan} element={<HeaderScanPage />} />
        <Route path="*" element={<Navigate to={routePaths.login} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
