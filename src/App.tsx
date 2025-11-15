import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import AuthPage from './pages/AuthPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import RegisterPage from './pages/RegisterPage';
import { ProtectedLayout } from './components/ProtectedLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './pages/HomePage';
import { RequestsPage } from './pages/RequestsPage';
import { EnhancedIdentitiesPage } from './pages/EnhancedIdentitiesPage';
import { RiskPage } from './pages/RiskPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Toaster } from './components/ui/sonner';
import { UserProvider } from './contexts/UserContext';
import { AuthProvider } from './contexts/AuthProvider';
import { AITestPage } from './pages/AITestPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { AccessPage } from './pages/AccessPage';
import { RoleDetailPage } from './pages/RoleDetailPage';
import { NewRolePage } from './pages/NewRolePage';
import { EntitlementDetailPage } from './pages/EntitlementDetailPage';
import { AddIntegrationWizard } from './components/AddIntegrationWizard';
import { IntegrationDetailPage } from './pages/IntegrationDetailPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ReviewsWorkbenchPage } from './pages/ReviewsWorkbenchPage';
import { CreateReviewWizard } from './components/reviews/CreateReviewWizard';
import { ReportsPage } from './pages/ReportsPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { LifecyclePage } from './pages/LifecyclePage';
import { JmlPage } from './pages/JmlPage';
import { ISRDemoPage } from './pages/ISRDemoPage';
import { SupabaseConnectionTest } from './components/SupabaseConnectionTest';
import AcceptInvitePage from './pages/AcceptInvitePage';
import TestIdentitiesPage from './pages/TestIdentitiesPage';
import { ApprovalsProvider } from './contexts/ApprovalsContext';

export default function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <AuthProvider>
        <ApprovalsProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              {/* Public */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/accept-invite" element={<AcceptInvitePage />} />

              {/* Protected */}
              <Route element={<ProtectedLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/requests" element={<RequestsPage />} />
                <Route path="/requests/new" element={<RequestsPage />} />
                <Route path="/requests/:id" element={<RequestsPage />} />
                <Route path="/approvals" element={<ApprovalsPage />} />
                <Route path="/approvals/:id" element={<ApprovalsPage />} />
                <Route path="/identities" element={<EnhancedIdentitiesPage />} />
                <Route path="/identities/:userId" element={<EnhancedIdentitiesPage />} />
                <Route path="/access" element={<Navigate to="/access/roles" replace />} />
                <Route path="/access/roles/new" element={<NewRolePage />} />
                <Route path="/access/roles/:roleId" element={<RoleDetailPage />} />
                <Route path="/access/roles" element={<AccessPage />} />
                <Route path="/access/entitlements/:entitlementId" element={<EntitlementDetailPage />} />
                <Route path="/access/entitlements" element={<AccessPage />} />
                <Route path="/access/apps/:appId" element={<AccessPage />} />
                <Route path="/access/apps" element={<AccessPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/reviews/new" element={<CreateReviewWizard />} />
                <Route path="/reviews/:campaignId/workbench" element={<ReviewsWorkbenchPage />} />
                <Route path="/risk" element={<RiskPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/policies" element={<PoliciesPage />} />
                <Route path="/lifecycle" element={<LifecyclePage />} />
                <Route path="/jml" element={<JmlPage />} />
                <Route path="/isr-demo" element={<ISRDemoPage />} />
                <Route path="/integrations" element={<IntegrationsPage />} />
                <Route path="/integrations/new" element={<AddIntegrationWizard onClose={() => window.location.href = '/integrations'} />} />
                <Route path="/integrations/:id" element={<IntegrationDetailPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                {/* Supabase connection test - remove after verifying connection */}
                <Route path="/test-connection" element={<SupabaseConnectionTest />} />
                {/* Test identities Edge Function */}
                <Route path="/test-identities" element={<TestIdentitiesPage />} />
				<Route path="/test-ai" element={<AITestPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          </ErrorBoundary>
          <Toaster />
        </BrowserRouter>
        </ApprovalsProvider>
        </AuthProvider>
      </UserProvider>
    </ErrorBoundary>
  );
}