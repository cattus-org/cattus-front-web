import { ReactNode } from 'react';

interface SidebarHeaderProps {
  children: ReactNode;
}

export function SidebarHeader({ children }: SidebarHeaderProps) {
  return <div className="p-4 sticky top-0 bg-black z-10">{children}</div>;
}