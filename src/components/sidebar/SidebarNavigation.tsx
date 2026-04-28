import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BookOpen,
  ScrollText,
  Settings,
  Shield,
  //type //LucideIcon,
} from 'lucide-react';
import { SidebarNavGroup, type NavGroupData } from './SidebarNavGroup';
import { //SidebarNavItem, 
    type NavItemData } from './SidebarNavItem';
import { useAppSelector } from '@/store/hooks';

const navigationGroups: NavGroupData[] = [
  {
    label: 'Principal',
    icon: LayoutDashboard,
    roles: ['Coordinador', 'Subcoordinador'],
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Miembros',
    icon: Users,
    roles: ['Coordinador', 'Subcoordinador'],
    items: [
      { label: 'Todos los miembros', path: '/members', icon: Users },
    ],
  },
  {
    label: 'Agenda',
    icon: CalendarDays,
    roles: ['Coordinador', 'Subcoordinador'],
    items: [
      { label: 'Citas', path: '/appointments', icon: CalendarDays },
    ],
  },
  {
    label: 'Vida Espiritual',
    icon: BookOpen,
    roles: ['Coordinador', 'Subcoordinador'],
    items: [
      { label: 'Sacramentos', path: '/sacraments', icon: BookOpen },
      { label: 'Notas Pastorales', path: '/pastoral-notes', icon: ScrollText },
    ],
  },
];

const adminItems: NavItemData[] = [
  { label: 'Usuarios', path: '/users', icon: Users, roles: ['Coordinador'] },
  { label: 'Roles', path: '/roles', icon: Shield, roles: ['Coordinador'] },
  { label: 'Configuración', path: '/config', icon: Settings, roles: ['Coordinador'] },
];

interface SidebarNavigationProps {
  collapsed: boolean;
}

export function SidebarNavigation({ collapsed }: SidebarNavigationProps) {
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.role;

  const filteredGroups = navigationGroups.filter(
    (g) => !g.roles || (role && g.roles.includes(role)),
  );

  const filteredAdmin = adminItems.filter(
    (item) => !item.roles || (role && item.roles.includes(role)),
  );

  return (
    <nav className="flex flex-col gap-4 p-3">
      {filteredGroups.map((group) => (
        <SidebarNavGroup key={group.label} group={group} collapsed={collapsed} />
      ))}

      {filteredAdmin.length > 0 && (
        <SidebarNavGroup
          group={{
            label: 'Administración',
            icon: Shield,
            items: filteredAdmin,
            roles: ['Coordinador'],
          }}
          collapsed={collapsed}
        />
      )}
    </nav>
  );
}