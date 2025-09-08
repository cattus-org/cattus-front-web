import { ReactNode } from 'react';

interface SidebarFooterProps {
  children: ReactNode;
}

export function SidebarFooter({ children }: SidebarFooterProps) {
  return <div className="p-4 sticky bottom-0 bg-black">{children}</div>;
}