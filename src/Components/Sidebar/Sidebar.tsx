import { ReactNode } from 'react';
import { useSidebar } from './SidebarProvider';

interface SidebarProps {
  children: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const { collapsed } = useSidebar();

  return (
    <aside
      className={`bg-black text-white flex flex-col h-screen transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {children}
    </aside>
  );
}