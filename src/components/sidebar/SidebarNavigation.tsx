import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BookOpen,
  ScrollText,
  Settings,
  Shield,
  Calendar1,
  Calculator
} from 'lucide-react';
import { SidebarNavGroup, type NavGroupData } from './SidebarNavGroup';
import { SidebarNavItem } from './SidebarNavItem';
import { usePermissions } from '@/hooks/usePermissions';


interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  permission: string;
}

const groups: { label: string; icon: LucideIcon; items: NavItem[] }[] = [
  {
    label: 'Principal',
    icon: LayoutDashboard,
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard, permission: 'dashboard:view' },
    ],
  },
  {
    label: 'Miembros',
    icon: Users,
    items: [
      { label: 'Todos los miembros', path: '/members', icon: Users, permission: 'members:read' },
    ],
  },
  {
    label: 'Agenda',
    icon: CalendarDays,
    items: [
      { label: 'Citas', path: '/appointments', icon: CalendarDays, permission: 'appointments:read' },
      { label: 'Cronograma', path: '/schedule', icon: Calendar1, permission: 'schedule:read' },
    ],
  },
  {
    label: 'Vida Espiritual',
    icon: BookOpen,
    items: [
      { label: 'Sacramentos', path: '/sacraments', icon: BookOpen, permission: 'sacraments:read' },
      { label: 'Notas', path: '/pastoral-notes', icon: ScrollText, permission: 'pastoral_notes:read' },
    ],
  },
      {
    label: 'Contabilidad',
    icon: Calculator,
    items: [
      { label: 'Cuentas', path: '/accounts', icon: Calculator, permission: 'accounting:read' },
      { label: 'Libro Diario', path: '/journal', icon: ScrollText, permission: 'accounting:read' },
      { label: 'Productos', path: '/products', icon: Calculator, permission: 'accounting:read' },
      { label: 'Reportes', path: '/reports', icon: Calculator, permission: 'accounting:read' },
    ],
  },
  {
    label: 'Administración',
    icon: Shield,
    items: [
      { label: 'Usuarios', path: '/users', icon: Users, permission: 'users:read' },
      { label: 'Roles', path: '/roles', icon: Shield, permission: 'roles:read' },
      { label: 'Configuración', path: '/config', icon: Settings, permission: 'config:read' },
    ],
  },

];

interface SidebarNavigationProps {
  collapsed: boolean;
}

export function SidebarNavigation({ collapsed }: SidebarNavigationProps) {
  const { can } = usePermissions();

  const filteredGroups: NavGroupData[] = groups
    .map((g) => ({
      ...g,
      items: g.items.filter((it) => can(it.permission as Parameters<typeof can>[0])),
    }))
    .filter((g) => g.items.length > 0);

  if (collapsed) {
    const all = filteredGroups.flatMap((g) => g.items);
    return (
      <nav className="flex flex-col gap-0.5 p-2">
        {all.map((item) => (
          <SidebarNavItem key={item.path} item={item} collapsed />
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-4 p-3">
      {filteredGroups.map((group) => (
        <SidebarNavGroup key={group.label} group={group} collapsed={false} />
      ))}
    </nav>
  );
}