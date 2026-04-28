import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { PageLoader } from '@/components/feedback/PageLoader';

// ─── Lazy pages (placeholder hasta que existan en fases posteriores) ──────────

const PlaceholderPage = lazy(() =>
  import('@/components/feedback/EmptyState').then((m) => ({
    default: () => (
      <m.EmptyState title="Próximamente" description="Esta sección estará disponible pronto." />
    ),
  })),
);

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));

function SuspenseFallback() {
  return <PageLoader />;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute />
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <LoginPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/register',
    element: (
      <PublicRoute />
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <RegisterPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Suspense fallback={<SuspenseFallback />}><PlaceholderPage /></Suspense> },
          { path: 'members', element: <Suspense fallback={<SuspenseFallback />}><PlaceholderPage /></Suspense> },
          { path: 'members/:id', element: <Suspense fallback={<SuspenseFallback />}><PlaceholderPage /></Suspense> },
          { path: 'appointments', element: <Suspense fallback={<SuspenseFallback />}><PlaceholderPage /></Suspense> },
          { path: 'sacraments', element: <Suspense fallback={<SuspenseFallback />}><PlaceholderPage /></Suspense> },
          { path: 'pastoral-notes', element: <Suspense fallback={<SuspenseFallback />}><PlaceholderPage /></Suspense> },
          { path: 'users', element: <Suspense fallback={<SuspenseFallback />}><PlaceholderPage /></Suspense> },
          { path: 'roles', element: <Suspense fallback={<SuspenseFallback />}><PlaceholderPage /></Suspense> },
          { path: 'config', element: <Suspense fallback={<SuspenseFallback />}><PlaceholderPage /></Suspense> },
          { path: 'profile', element: <Suspense fallback={<SuspenseFallback />}><PlaceholderPage /></Suspense> },
        ],
      },
    ],
  },
]);