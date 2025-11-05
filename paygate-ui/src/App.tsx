import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
  AuthProvider,
  useAuth,
  AppDataProvider,
  ThemeProvider,
  UserPreferencesProvider,
  NotificationProvider,
  ToastProvider,
} from './contexts';
import { LanguageProvider } from './contexts/LanguageContext';
import { MobileOptimizationProvider } from './contexts/MobileOptimizationContext';
import useDevLogger from './hooks/useDevLogger';
import Navigation from './components/Navigation';
import SimpleDashboard from './components/SimpleDashboard';
import EnhancedDashboard from './components/EnhancedDashboard';
import EnhancedPaywallCreator from './components/EnhancedPaywallCreator';
import PaywallDetails from './components/PaywallDetails';
import EditPaywall from './components/EditPaywall';
import PaywallsManagement from './components/PaywallsManagement';
import Login from './components/Login';
import Signup from './components/Signup';
import CheckoutPage from './components/CheckoutPage';
import CustomerPaywallView from './components/CustomerPaywallView';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ContentManagementDashboard from './components/ContentManagementDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import EmailVerification from './components/EmailVerification';
import PaywallDemo from './components/paywall/PaywallDemo';
import MockPaywallCreator from './components/MockPaywallCreator';

// Lazy load less frequently used components
const AnalyticsPage = React.lazy(() => import('./components/AnalyticsPage'));
const SimpleAnalyticsDashboard = React.lazy(() => import('./components/SimpleAnalyticsDashboard'));
const Settings = React.lazy(() => import('./components/Settings'));
const MarketingHub = React.lazy(() => import('./components/MarketingHub'));
const CustomersPage = React.lazy(() => import('./components/CustomersPage'));
const PricingPage = React.lazy(() => import('./components/PricingPage'));
const SubscriptionPage = React.lazy(() => import('./components/SubscriptionPage'));
const PaywallSuccess = React.lazy(() => import('./components/PaywallSuccess'));
const Profile = React.lazy(() => import('./components/Profile'));
const NotificationsPage = React.lazy(() => import('./components/NotificationsPage'));
const Help = React.lazy(() => import('./components/Help'));

// Loading component for suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
  </div>
);

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, isAuthenticated, authInitialized } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading || !authInitialized) {
    return <LoadingSpinner />;
  }

  // If not authenticated, redirect to login with the return URL
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={`/login`} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  return <>{children}</>;
};

// Public route component (redirects authenticated users)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Lazy component wrapper
const LazyComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
);

import MainLayout from './components/MainLayout';

const AppContent: React.FC = () => {
  return (
    <AuthProvider>
      <UserPreferencesProvider>
        <AppDataProvider>
          <LanguageProvider>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password/:resetToken"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/verify-email"
              element={
                <PublicRoute>
                  <EmailVerification />
                </PublicRoute>
              }
            />

            {/* Routes with MainLayout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <LazyComponent>
                    <EnhancedDashboard />
                  </LazyComponent>
                }
              />
              <Route
                path="paywall/:id"
                element={
                  <LazyComponent>
                    <PaywallDetails />
                  </LazyComponent>
                }
              />
              <Route
                path="edit-paywall/:id"
                element={
                  <LazyComponent>
                    <EditPaywall />
                  </LazyComponent>
                }
              />
              <Route
                path="create-paywall"
                element={
                  <LazyComponent>
                    <EnhancedPaywallCreator />
                  </LazyComponent>
                }
              />
              <Route
                path="paywalls"
                element={
                  <LazyComponent>
                    <PaywallsManagement />
                  </LazyComponent>
                }
              />
              <Route
                path="content-management"
                element={
                  <LazyComponent>
                    <ContentManagementDashboard />
                  </LazyComponent>
                }
              />
              <Route
                path="paywall-demo"
                element={
                  <LazyComponent>
                    <PaywallDemo />
                  </LazyComponent>
                }
              />
              <Route
                path="mock-paywalls"
                element={
                  <LazyComponent>
                    <MockPaywallCreator />
                  </LazyComponent>
                }
              />
              <Route
                path="customers"
                element={
                  <LazyComponent>
                    <CustomersPage />
                  </LazyComponent>
                }
              />
              <Route
                path="analytics"
                element={
                  <LazyComponent>
                    <AnalyticsPage />
                  </LazyComponent>
                }
              />
              <Route
                path="marketing"
                element={
                  <LazyComponent>
                    <MarketingHub />
                  </LazyComponent>
                }
              />
              <Route
                path="pricing"
                element={
                  <LazyComponent>
                    <PricingPage />
                  </LazyComponent>
                }
              />
              <Route
                path="subscription"
                element={
                  <LazyComponent>
                    <SubscriptionPage />
                  </LazyComponent>
                }
              />
              <Route
                path="settings"
                element={
                  <LazyComponent>
                    <Settings />
                  </LazyComponent>
                }
              />
              <Route
                path="profile"
                element={
                  <LazyComponent>
                    <Profile />
                  </LazyComponent>
                }
              />
              <Route
                path="checkout"
                element={
                  <LazyComponent>
                    <CheckoutPage />
                  </LazyComponent>
                }
              />
              <Route
                path="paywall-success"
                element={
                  <LazyComponent>
                    <PaywallSuccess />
                  </LazyComponent>
                }
              />
              <Route
                path="notifications"
                element={
                  <LazyComponent>
                    <NotificationsPage />
                  </LazyComponent>
                }
              />
              <Route
                path="help"
                element={
                  <LazyComponent>
                    <Help />
                  </LazyComponent>
                }
              />
            </Route>

            {/* Public customer view route */}
            <Route path="/p/:id" element={<CustomerPaywallView />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </LanguageProvider>
        </AppDataProvider>
      </UserPreferencesProvider>
    </AuthProvider>
  );
};

const App: React.FC = () => {
  // Initialize development logger to silence unwanted logs
  useDevLogger();

  // Register service worker for offline support (production only)
  useEffect(() => {
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
