import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  currentPage: 'home' | 'cats' | 'cameras' | 'stats' | 'reports';
  onNavigate?: (page: 'home' | 'cats' | 'cameras' | 'stats' | 'reports') => void;
}

const Layout = ({ children, onNavigate }: LayoutProps) => {
  const location = useLocation();
  
  const getCurrentPageFromPath = (): 'home' | 'cats' | 'cameras' | 'stats' | 'reports' => {
    const path = location.pathname.split('/')[1];
    
    switch (path) {
      case 'home':
        return 'home';
      case 'cats':
        return 'cats';
      case 'cameras':
        return 'cameras';
      case 'stats':
        return 'stats';
      case 'reports':
        return 'reports';
      default:
        if (path === 'streaming') {
          return 'cameras';
        }
        return 'home';
    }
  };
  
  const activePage = getCurrentPageFromPath();

  return (
    <div className="flex h-screen bg-black text-white">
      <AppSidebar currentPage={activePage} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-black">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;