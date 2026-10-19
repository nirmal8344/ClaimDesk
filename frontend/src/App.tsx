import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

// Auth
import { Login } from './pages/auth/Login';

// Customer
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CustomerPolicies } from './pages/customer/CustomerPolicies';
import { NewClaimWizard } from './pages/customer/NewClaimWizard';
import { CustomerClaims } from './pages/customer/CustomerClaims';
import { CustomerClaimDetails } from './pages/customer/CustomerClaimDetails';
import { CustomerNotifications } from './pages/customer/CustomerNotifications';
import { CustomerProfile } from './pages/customer/CustomerProfile';

// Officer
import { OfficerDashboard } from './pages/officer/OfficerDashboard';
import { OfficerAssignedClaims } from './pages/officer/OfficerAssignedClaims';
import { OfficerClaimWorkspace } from './pages/officer/OfficerClaimWorkspace';

// Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminClaims } from './pages/admin/AdminClaims';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminOfficers } from './pages/admin/AdminOfficers';
import { AdminPolicies } from './pages/admin/AdminPolicies';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminSettings } from './pages/admin/AdminSettings';

const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'CLAIM_OFFICER') return <Navigate to="/officer/dashboard" replace />;
  return <Navigate to="/customer/dashboard" replace />;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Customer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
            <Route element={<AppLayout />}>
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/policies" element={<CustomerPolicies />} />
              <Route path="/customer/new-claim" element={<NewClaimWizard />} />
              <Route path="/customer/claims" element={<CustomerClaims />} />
              <Route path="/customer/claims/:id" element={<CustomerClaimDetails />} />
              <Route path="/customer/notifications" element={<CustomerNotifications />} />
              <Route path="/customer/profile" element={<CustomerProfile />} />
            </Route>
          </Route>

          {/* Claim Officer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['CLAIM_OFFICER']} />}>
            <Route element={<AppLayout />}>
              <Route path="/officer/dashboard" element={<OfficerDashboard />} />
              <Route path="/officer/claims" element={<OfficerAssignedClaims />} />
              <Route path="/officer/claims/:id" element={<OfficerClaimWorkspace />} />
              <Route path="/officer/pending-documents" element={<OfficerAssignedClaims />} />
              <Route path="/officer/under-review" element={<OfficerAssignedClaims />} />
              <Route path="/officer/assessment" element={<OfficerAssignedClaims />} />
              <Route path="/officer/completed" element={<OfficerAssignedClaims />} />
              <Route path="/officer/notifications" element={<CustomerNotifications />} />
              <Route path="/officer/profile" element={<CustomerProfile />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<AppLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/claims" element={<AdminClaims />} />
              <Route path="/admin/claims/:id" element={<OfficerClaimWorkspace />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/officers" element={<AdminOfficers />} />
              <Route path="/admin/policies" element={<AdminPolicies />} />
              <Route path="/admin/categories" element={<AdminSettings />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/notifications" element={<CustomerNotifications />} />
              <Route path="/admin/profile" element={<CustomerProfile />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
