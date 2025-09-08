import { ReactNode } from 'react';
import { useSidebar } from './SidebarProvider';

interface SidebarNavItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function SidebarNavItem({
  icon,
  label,
  active = false,
  onClick
}: SidebarNavItemProps) {
  const { collapsed } = useSidebar();

  return (
    <div 
      className={`flex items-center py-3 px-4 hover:bg-gray-800 transition-colors cursor-pointer ${
        active ? 'bg-gray-800' : ''
      }`}
      onClick={onClick}
    >
      <span className={collapsed ? '' : 'mr-3'}>{icon}</span>
      {!collapsed && <span>{label}</span>}
    </div>
  );
}