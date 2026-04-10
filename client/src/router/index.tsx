import { createBrowserRouter, Navigate, useRouteError } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/store/authStore';
import PageLoader from '@/components/ui/PageLoader';
import { Button } from '@/components/ui/Button';

// ─── Lazy-loaded pages ───────────────────────────────────────────────────────
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const MedicinesPage = lazy(() => import('@/pages/MedicinesPage'));
const VitalsPage = lazy(() => import('@/pages/VitalsPage'));
const RemindersPage = lazy(() => import('@/pages/RemindersPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SharedReportPage = lazy(() => import('@/pages/SharedReportPage'));
const MedicalHistoryPage = lazy(() => import('@/pages/MedicalHistoryPage'));

// ─── Guard components ─────────────────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireGuest({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

// ─── Error boundary page ──────────────────────────────────────────────────────
function ErrorPage() {
  const error = useRouteError() as { status?: number; statusText?: string; message?: string };
  const is404 = error?.status === 404;

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <p className="text-6xl font-bold text-primary">{is404 ? '404' : '500'}</p>
      <h1 className="text-xl font-semibold text-foreground">
        {is404 ? 'Page not found' : 'Something went wrong'}
      </h1>
      <p className="text-sm text-muted-foreground">
        {is404
          ? "The page you're looking for doesn't exist."
          : error?.message ?? 'An unexpected error occurred.'}
      </p>
      <Button onClick={() => (window.location.href = '/dashboard')}>Go to Dashboard</Button>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/shared-report/:token',
    element: <Lazy><SharedReportPage /></Lazy>,
  },
  {
    path: '/login',
    element: (
      <RequireGuest>
        <Lazy><LoginPage /></Lazy>
      </RequireGuest>
    ),
  },
  {
    path: '/register',
    element: (
      <RequireGuest>
        <Lazy><RegisterPage /></Lazy>
      </RequireGuest>
    ),
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    errorElement: <ErrorPage />,
    children: [
      { path: 'dashboard', element: <Lazy><DashboardPage /></Lazy> },
      { path: 'medicines', element: <Lazy><MedicinesPage /></Lazy> },
      { path: 'vitals',    element: <Lazy><VitalsPage /></Lazy> },
      { path: 'reminders', element: <Lazy><RemindersPage /></Lazy> },
      { path: 'reports',   element: <Lazy><ReportsPage /></Lazy> },
      { path: 'profile',         element: <Lazy><ProfilePage /></Lazy> },
      { path: 'medical-history', element: <Lazy><MedicalHistoryPage /></Lazy> },
    ],
  },
]);
