import { ReactNode, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useSidebar } from './SidebarProvider';

interface SidebarGroupProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
}

export function SidebarGroup({ 
  title, 
  icon, 
  children, 
  defaultExpanded = false 
}: SidebarGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { collapsed } = useSidebar();

  return (
    <div className="py-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center px-4 py-2 hover:bg-gray-800 transition-colors ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {!collapsed && <span>{title}</span>}
        {!collapsed && (
          <ChevronRight
            className={`transition-transform duration-200 ${
              expanded ? 'rotate-90' : ''
            }`}
            size={16}
          />
        )}
      </button>
      
      {!collapsed && expanded && <div className="py-1">{children}</div>}
    </div>
  );
}