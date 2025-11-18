import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarNavItem,
  SidebarFooter,
  SidebarTrigger,
  useSidebar
} from './Sidebar';
import { ChevronRight, Home, Cat, Camera, BarChart2, FileText, Star } from 'lucide-react';
import { AnimalService } from '@/Services';
import { Animal } from '@/Services/types';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  company?: string | { id: number; name?: string };
  [key: string]: any;
}



interface AppSidebarProps {
  currentPage: 'home' | 'cats' | 'cameras' | 'stats' | 'reports';
  onNavigate?: (page: 'home' | 'cats' | 'cameras' | 'stats' | 'reports') => void;
}

const AppSidebar = ({ currentPage, onNavigate }: AppSidebarProps) => {
  const navigate = useNavigate();
  const [markedCats, setMarkedCats] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  
  const menuItems = [
    { icon: <Home size={22} />, label: 'Home', page: 'home', path: '/home' },
    { icon: <Cat size={22} />, label: 'Cats', page: 'cats', path: '/cats' },
    { icon: <Camera size={22} />, label: 'Cameras', page: 'cameras', path: '/cameras' },
    { icon: <BarChart2 size={22} />, label: 'Statistics', page: 'stats', path: '/stats' },
    { icon: <FileText size={22} />, label: 'Reports', page: 'reports', path: '/reports' },
  ];

  useEffect(() => {
    const fetchMarkedCats = async () => {
      try {
        const cats = await AnimalService.getMarkedAnimals();
        setMarkedCats(cats);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch marked cats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkedCats();
  }, []);

  const handleNavigation = (page: string, path: string) => {
    if (onNavigate) {
      onNavigate(page as 'home' | 'cats' | 'cameras' | 'stats' | 'reports');
    }
    navigate(path);
  };

  const handleCatClick = (catId: string) => {
    navigate(`/cats/${catId}`);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <LogoSection />
        </SidebarHeader>
        
        <SidebarContent>
          <div className="py-2">
            {menuItems.map((item, index) => (
              <SidebarNavItem
                key={index}
                icon={item.icon}
                label={item.label}
                active={item.page === currentPage}
                onClick={() => handleNavigation(item.page, item.path)}
              />
            ))}
          </div>

          <QuickViewSection 
            markedCats={markedCats} 
            loading={loading}
            onCatClick={handleCatClick}
          />
        </SidebarContent>
        
        <SidebarFooter>
          <SidebarTrigger>
            <ChevronRight className="transition-transform duration-200" size={22} />
          </SidebarTrigger>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
};

const LogoSection = () => {
  const { collapsed } = useSidebar();
  
  return collapsed ? (
    <div className="flex justify-center w-full">
      <img
        src="/imgs/logo_compact.png"
        alt="Cattus"
        className="h-8 w-auto"
      />
    </div>
  ) : (
    <center>
    <img
      src="/imgs/logo_extended.png"
      alt="Cattus"
      className="h-8 w-auto"
    />
    </center>
  );
};

const calculateAge = (birthDate?: Date | string): number => {
  if (!birthDate) return 0;
  
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

const getStatusColor = (status?: string): string => {
  if (!status) return '#42AA49';
  
  // Handle both old numeric values and new enum values
  switch (status) {
    // Old numeric values (legacy support)
    case '0': return '#42AA49'; 
    case '1': return '#FED400';
    case '2': return '#FF0200';
    // New enum values
    case 'ok': return '#42AA49';
    case 'alert': return '#FED400';
    case 'danger': return '#FF0200';
    default: return '#42AA49'; 
  }
};

const getCatId = (cat: Animal): string => {
  return cat.id?.toString() || cat._id || '';
};

const getCatName = (cat: Animal): string => {
  return cat.name || cat.petName || 'Unknown';
};

const getCatGender = (cat: Animal): string => {
  return cat.sex == 'macho' ? 'male' : 'female';
};

const getCatPicture = (cat: Animal): string => {
  return cat.picture || cat.petPicture || '/imgs/cat_sample.jpg';
};

const getCatStatus = (cat: Animal): string => {
  return cat.status || cat.petStatus?.petCurrentStatus || '0';
};

interface QuickViewSectionProps {
  markedCats: Animal[];
  loading: boolean;
  onCatClick: (catId: string) => void;
}

const QuickViewSection = ({ markedCats, loading, onCatClick }: QuickViewSectionProps) => {
  const { collapsed } = useSidebar();
  
  return (
    <div className="mt-4">
      {!collapsed && (
        <div className="px-4 py-2 text-sm text-gray-400">
          Quick view
        </div>
      )}
      
      <SidebarGroup 
        title="Marked" 
        icon={collapsed ? <Star size={22} /> : undefined}
        defaultExpanded={true}
      >
        <div className="space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : markedCats.length > 0 ? (
              <>
                {markedCats.slice(0, 4).map((cat) => {
                  const catId = getCatId(cat);
                  const statusColor = getStatusColor(getCatStatus(cat));
                  const displayId = catId.length >= 4 ? catId.substring(0, 4) : catId;
                  
                  return (
                    <div
                      key={catId}
                      className="flex items-center px-4 py-2 hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => onCatClick(catId)}
                    >
                      <img
                        src={getCatPicture(cat)}
                        alt={getCatName(cat)}
                        className={`w-10 h-10 rounded-full mr-3 object-cover border-2`}
                        style={{ borderColor: statusColor }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/imgs/cat_sample.jpg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {getCatName(cat)}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {getCatGender(cat)} • {calculateAge(cat.birthDate || cat.petBirth)} years old
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          CID: {displayId}
                        </p>
                      </div>
                    </div>
                  );
                })}
              
              {markedCats.length > 4 && (
                <div
                  className="flex items-center px-4 py-2 hover:bg-gray-800 transition-colors text-gray-400 cursor-pointer"
                  onClick={() => onCatClick('')} // Futuramente implementar filtros e levar direto com filtro marked ativado
                >
                  <Star size={16} className="mr-2" />
                  <span className="text-sm">View {markedCats.length - 4} more marked cats</span>
                </div>
              )}
            </>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-400">
              No marked cats yet
            </div>
          )}
        </div>
      </SidebarGroup>
    </div>
  );
};  

export default AppSidebar;