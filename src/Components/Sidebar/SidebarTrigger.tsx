import { ReactNode } from 'react';
import { useSidebar } from './SidebarProvider';

interface SidebarTriggerProps {
  children: ReactNode;
}

export function SidebarTrigger({ children }: SidebarTriggerProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <button 
      onClick={toggleSidebar}
      className="w-full flex justify-center text-white hover:bg-gray-800 p-2 rounded-md"
    >
      {children}
    </button>
  );
}