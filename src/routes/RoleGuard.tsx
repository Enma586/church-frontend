import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import type { UserRole } from '@/constants';

interface RoleGuardProps {
  roles: UserRole[];
}

export function RoleGuard({ roles }: RoleGuardProps) {
  const user = useAppSelector((s) => s.auth.user);

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}