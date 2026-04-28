interface SidebarFooterProps {
  collapsed: boolean;
  children?: React.ReactNode;
}

export function SidebarFooter({ //collapsed,
 children }: SidebarFooterProps) {
  return (
    <div className="border-t border-sidebar-border p-3">
      {children}
    </div>
  );
}