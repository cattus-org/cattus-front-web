import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { AnimalService, CameraService, ActivityService } from '@/Services';
import { Animal, Camera } from '@/Services/types';
import CatCard from '@/Components/CatCard';
import CameraCard from '@/Components/CameraCard';
import ActivityList, { ActivityItem } from '@/Components/ActivityList';
import { Plus, FileText, BarChart2, DollarSign } from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface JwtPayload {
  id?: number;
  email?: string;
  name?: string;
  company?: {
    id: number;
    name?: string;
  };
  access_level?: string;
  [key: string]: any;
}

const HomePage = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [employeeName, setEmployeeName] = useState<string>('');
  const [markedCats, setMarkedCats] = useState<Animal[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState({
    cats: true,
    cameras: true,
    activities: true
  });



  const calculateAge = useCallback((birthDate?: Date | string): number => {
    if (!birthDate) return 0;
    
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }, []);

  const getStatusText = useCallback((status?: string): string => {
    if (!status) return 'Saudável';
    
    // Handle both old numeric values and new enum values
    switch (status) {
      // Old numeric values (legacy support)
      case '0': return 'Saudável';
      case '1': return 'Em atenção';
      case '2': return 'Crítico';
      // New enum values
      case 'ok': return 'Saudável';
      case 'alert': return 'Em atenção';
      case 'danger': return 'Crítico';
      default: return 'Saudável';
    }
  }, []);

  const fetchRecentActivities = useCallback(async (): Promise<ActivityItem[]> => {
    try {
      // Fetch all cameras
      const allCameras = await CameraService.getAll();
      const activeCameras = allCameras.filter(camera => !camera.deleted);
      
      if (activeCameras.length === 0) {
        return [];
      }

      // Fetch activities from all cameras
      let allActivities: ActivityItem[] = [];
      
      for (const camera of activeCameras) {
        try {
          const cameraId = camera.id || camera._id;
          if (!cameraId) {
            continue;
          }
          
          const activities = await ActivityService.getByCamera(cameraId, 0, 50);
          allActivities = [...allActivities, ...activities];
        } catch (error) {
          // Silently skip cameras with errors
        }
      }
      
      if (!allActivities || allActivities.length === 0) {
        return [];
      }

      const activityTitles: Record<string, string> = {
        'eat': 'Alimentação',
        'sleep': 'Soneca',
        'defecate': 'Defecando',
        'urinate': 'Urinando'
      };

      const locations = ['Área comum', 'Área de descanso', 'Quintal', 'Cozinha'];

      const formattedActivities: ActivityItem[] = allActivities
        .filter((activity) => !!activity.cat)
        .map((activity) => {
          return {
            id: activity.id.toString(),
            title: activity.cat.name || activity.cat.petName || 'Unknown Cat',
            subtitle: `${activity.cat.sex || activity.cat.petGender} · ${calculateAge(activity.cat.birthDate || activity.cat.petBirth)} anos`,
            imageUrl: activity.cat.picture || activity.cat.petPicture || '/imgs/cat_sample.jpg',
            startedAt: activity.startedAt?.toString() || new Date().toISOString(),
            endedAt: activity.endedAt?.toString(),
            cat: activity.cat,
            camera: activity.camera || { id: 0, url: '', name: '' },
            metadata: {
              status: getStatusText(activity.cat.status || activity.cat.petStatus?.petCurrentStatus),
              location: locations[Math.floor(Math.random() * locations.length)],
              activityName: activityTitles[activity.title] || activity.title
            }
          };
        })
        // Sort by most recent first
        .sort((a, b) => {
          const dateA = new Date(a.startedAt || 0).getTime();
          const dateB = new Date(b.startedAt || 0).getTime();
          return dateB - dateA;
        })
        // Take only the first 10
        .slice(0, 10);

      return formattedActivities;
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }, [calculateAge, getStatusText]);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setEmployeeName(decoded.name || 'Funcionário');
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const recentActivities = await fetchRecentActivities();
        setActivities(recentActivities);
        setLoading(prev => ({ ...prev, activities: false }));
      } catch (error) {
        console.error('Error fetching activities:', error);
        setLoading(prev => ({ ...prev, activities: false }));
      }
    };

    fetchActivities();
  }, [fetchRecentActivities]);

  useEffect(() => {
    const fetchMarkedCats = async () => {
      try {
        const cats = await AnimalService.getMarkedAnimals();
        setMarkedCats(cats);
        setLoading(prev => ({ ...prev, cats: false }));
      } catch (error) {
        console.error('Error fetching marked cats:', error);
        setLoading(prev => ({ ...prev, cats: false }));
      }
    };

    const fetchCameras = async () => {
      try {
        const allCameras = await CameraService.getAll(0, 3);
        const activeCameras = allCameras.filter(camera => !camera.deleted);
        setCameras(activeCameras);
        setLoading(prev => ({ ...prev, cameras: false }));
      } catch (error) {
        console.error('Error fetching cameras:', error);
        setLoading(prev => ({ ...prev, cameras: false }));
      }
    };

    fetchMarkedCats();
    fetchCameras();
  }, []);


  const mapCatStatus = (status?: string): 'healthy' | 'attention' | 'critical' => {
    if (!status) return 'healthy';
    
    // Handle both old numeric values and new enum values
    switch (status) {
      // Old numeric values (legacy support)
      case '0': return 'healthy';
      case '1': return 'attention';
      case '2': return 'critical';
      // New enum values
      case 'ok': return 'healthy';
      case 'alert': return 'attention';
      case 'danger': return 'critical';
      default: return 'healthy';
    }
  };

  const handleMarkToggle = async (id: string, marked: boolean) => {
    try {
      const response = await AnimalService.update(id, {
        favorite: marked
      });

      if (response.success) {
        if (marked) {
          const cat = await AnimalService.getOne(id);
          setMarkedCats(prev => [...prev, cat]);
        } else {
          setMarkedCats(prev => prev.filter(cat => (cat.id?.toString() || cat._id) !== id));
        }
      }
    } catch (error) {
      console.error('Error updating mark status:', error);
    }
  };

  const actionButtons = [
    {
      icon: <Plus size={20} />,
      label: 'ADICIONAR GATO',
      path: '/cats/add',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      icon: <FileText size={20} />,
      label: 'GERIR RELATÓRIOS',
      path: '/reports',
      color: 'bg-gray-700 hover:bg-gray-600'
    },
    {
      icon: <BarChart2 size={20} />,
      label: 'VER ESTATÍSTICAS',
      path: '/stats',
      color: 'bg-gray-700 hover:bg-gray-600'
    },
    {
      icon: <DollarSign size={20} />,
      label: 'GERENCIAR ASSINATURA',
      path: '/membership',
      color: 'bg-gray-700 hover:bg-gray-600'
    }
  ];

  return (
    <div className="relative">
      <div 
        className="absolute top-0 left-0 right-0 h-[50vh] z-0 pointer-events-none"
        style={{ 
          background: 'linear-gradient(to bottom, rgb(55, 113, 75) 0%, rgb(28, 37, 32) 50%, rgb(0, 0, 0) 100%)' 
        }}
      ></div>
      
      <div className="p-6 relative z-10">
        <div className="mb-8 pr-80">
          <h1 className="text-3xl font-bold text-white mb-4">Bem vindo, {employeeName}</h1>
          <p className="text-gray-400 mb-4">Use o menu lateral para navegar, a barra de pesquisa ou as opções abaixo:</p>
          
          <div className="flex flex-wrap gap-4">
            {actionButtons.map((button, index) => (
              <Button
                key={index}
                className={`flex items-center gap-2 ${button.color} text-white`}
                onClick={() => navigate(button.path)}
              >
                {button.icon}
                {button.label}
              </Button>
            ))}
          </div>
        </div>
      
      <div className="mb-8 pr-80">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Gatos marcados</h2>
        </div>
        
        {loading.cats ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : markedCats.length > 0 ? (
          <div className="relative">
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto pb-4 space-x-4 hide-scrollbar right-6"
              style={{ scrollbarWidth: 'none' }}
            >
              {markedCats.map((cat) => (
                <CatCard
                  key={cat.id || cat._id || ''}
                  id={cat.id?.toString() || cat._id || ''}
                  name={cat.name || cat.petName || 'Unknown'}
                  gender={cat.sex || cat.petGender || ''}
                  age={calculateAge(cat.birthDate || cat.petBirth)}
                  imageUrl={cat.picture || cat.petPicture || '/imgs/cat_sample.jpg'}
                  status={mapCatStatus(cat.status || cat.petStatus?.petCurrentStatus)}
                  initialMarked={true}
                  onMarkToggle={handleMarkToggle}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-md p-6 text-center">
            <p className="text-gray-400">
              Para ver gatos aqui, marque um gato clicando na estrela no canto superior direito ou dentro da página de perfil de cada gato.
            </p>
          </div>
        )}
        
        <div className="flex justify-end mt-2">
          <button 
            onClick={() => navigate('/cats')} 
            className="text-gray-400 hover:text-white text-sm"
          >
            Ver todos os gatos →
          </button>
        </div>
      </div>
      
      <div className="mb-8 pr-80">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Câmeras instaladas</h2>
        </div>
        
        {loading.cameras ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : cameras.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {cameras.map((camera) => (
              <CameraCard
                key={camera.id || camera._id || ''}
                id={camera.id?.toString() || camera._id || ''}
                name={camera.name || camera.cameraLocation || 'Camera'}
                imageUrl={camera.thumbnail || camera.cameraPicture || '/imgs/camera_sample.jpg'}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-md p-6 text-center">
            <p className="text-gray-400">
              Nenhuma câmera ativa encontrada.
            </p>
          </div>
        )}
        
        <div className="flex justify-end mt-2">
          <button 
            onClick={() => navigate('/cameras')} 
            className="text-gray-400 hover:text-white text-sm"
          >
            Ver todas as câmeras →
          </button>
        </div>
      </div>
      
      <div className="fixed top-24 right-6 bottom-6 w-72">
        <div className="bg-gray-900 rounded-md h-full overflow-hidden flex flex-col">
          
          {loading.activities ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : activities.length > 0 ? (
            <ActivityList
              items={activities}
              maxHeight="calc(100vh - 180px)"
              emptyMessage="Nenhuma atividade recente"
              loading={false}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <p className="text-gray-400 text-center">
                Nenhuma atividade recente registrada.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

export default HomePage;