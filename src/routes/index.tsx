import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { PageLoader } from "@/components/feedback/PageLoader";

// ─── Lazy pages ──────────────────────────────────────────────────────────────

const LoginPage = lazy(() => import("@/features/user/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/features/user/pages/RegisterPage"));

// Feature pages
const DashboardPage = lazy(
  () => import("@/features/dashboard/pages/DashboardPage"),
);
const MembersList = lazy(() => import("@/features/members/pages/MembersPage"));
const MemberProfile = lazy(
  () => import("@/features/members/pages/MemberProfilePage"),
);
const AppointmentsList = lazy(
  () => import("@/features/appointments/pages/AppointmentsPage"),
);
const SchedulePage = lazy(
  () => import("@/features/schedule/pages/AnnualSchedulePage"),
);
const SacramentsList = lazy(
  () => import("@/features/sacraments/pages/SacramentsPage"),
);
const PastoralNotesList = lazy(
  () => import("@/features/pastoral-notes/pages/PastoralNotesPage"),
);
const UsersList = lazy(() => import("@/features/users/pages/UsersPage"));
const RolesPage = lazy(() => import("@/features/roles/pages/RolesPage"));
const ConfigPage = lazy(() => import("@/features/config/pages/ConfigPage"));
const ProfilePage = lazy(() => import("@/features/user/pages/ProfilePage"));

// ─── Suspense fallback ───────────────────────────────────────────────────────

function SuspenseFallback() {
  return <PageLoader />;
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<SuspenseFallback />}>{children}</Suspense>;
}

// ─── Router ──────────────────────────────────────────────────────────────────

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <PublicRoute />,
    children: [
      {
        index: true,
        element: (
          <Lazy>
            <LoginPage />
          </Lazy>
        ),
      },
    ],
  },
  {
    path: "/register",
    element: <PublicRoute />,
    children: [
      {
        index: true,
        element: (
          <Lazy>
            <RegisterPage />
          </Lazy>
        ),
      },
    ],
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            /** Dashboard replaces the old PlaceholderPage */
            index: true,
            element: (
              <Lazy>
                <DashboardPage />
              </Lazy>
            ),
          },
          {
            path: "members",
            element: (
              <Lazy>
                <MembersList />
              </Lazy>
            ),
          },
          {
            path: "members/:id",
            element: (
              <Lazy>
                <MemberProfile />
              </Lazy>
            ),
          },
          {
            path: "appointments",
            element: (
              <Lazy>
                <AppointmentsList />
              </Lazy>
            ),
          },
          {
            path: "schedule",
            element: (
              <Lazy>
                <SchedulePage />
              </Lazy>
            ),
          },
          {
            path: "sacraments",
            element: (
              <Lazy>
                <SacramentsList />
              </Lazy>
            ),
          },
          {
            path: "pastoral-notes",
            element: (
              <Lazy>
                <PastoralNotesList />
              </Lazy>
            ),
          },
          {
            path: "users",
            element: (
              <Lazy>
                <UsersList />
              </Lazy>
            ),
          },
          {
            /** Activate the real RolesPage instead of PlaceholderPage */
            path: "roles",
            element: (
              <Lazy>
                <RolesPage />
              </Lazy>
            ),
          },
          {
            /** Activate the real ConfigPage instead of PlaceholderPage */
            path: "config",
            element: (
              <Lazy>
                <ConfigPage />
              </Lazy>
            ),
          },
          {
            path: "profile",
            element: (
              <Lazy>
                <ProfilePage />
              </Lazy>
            ),
          },
        ],
      },
    ],
  },
]);