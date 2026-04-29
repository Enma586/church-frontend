import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BookOpen,
  ScrollText,
  Settings,
  Shield,
} from 'lucide-react';
import { SidebarNavGroup, type NavGroupData } from './SidebarNavGroup';
import { SidebarNavItem, type NavItemData } from './SidebarNavItem';
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

/**
 * Renders the sidebar navigation.
 *
 * When expanded: displays groups with expandable subcategories (start collapsed).
 * When collapsed: flattens ALL items into a single evenly-spaced icon-only list.
 */
export function SidebarNavigation({ collapsed }: SidebarNavigationProps) {
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.role;

  const filteredGroups = navigationGroups.filter(
    (g) => !g.roles || (role && g.roles.includes(role)),
  );

  const filteredAdmin = adminItems.filter(
    (item) => !item.roles || (role && item.roles.includes(role)),
  );

  // When collapsed, flatten every item into one list with uniform spacing
  if (collapsed) {
    const allItems: NavItemData[] = [
      ...filteredGroups.flatMap((g) => g.items),
      ...filteredAdmin,
    ];

    return (
      <nav className="flex flex-col gap-0.5 p-2">
        {allItems.map((item) => (
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

      {filteredAdmin.length > 0 && (
        <SidebarNavGroup
          group={{
            label: 'Administración',
            icon: Shield,
            items: filteredAdmin,
            roles: ['Coordinador'],
          }}
          collapsed={false}
        />
      )}
    </nav>
  );
}