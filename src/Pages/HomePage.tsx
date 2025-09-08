import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { AnimalService, CameraService } from '@/Services';
import { Animal, Camera } from '@/Services/types';
import CatCard from '@/Components/CatCard';
import CameraCard from '@/Components/CameraCard';
import ActivityList, { ActivityItem } from '@/Components/ActivityList';
import { Plus, FileText, BarChart2, DollarSign } from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface JwtPayload {
  name?: string;
  company?: string;
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
  const [companyId, setCompanyId] = useState<string>('');

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setEmployeeName(decoded.name || 'Funcionário');
        if (decoded.company) {
          setCompanyId(decoded.company);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!companyId) return;

    const fetchMarkedCats = async () => {
      try {
        const cats = await AnimalService.getMarkedAnimals(companyId);
        setMarkedCats(cats);
        setLoading(prev => ({ ...prev, cats: false }));
      } catch (error) {
        console.error('Error fetching marked cats:', error);
        setLoading(prev => ({ ...prev, cats: false }));
      }
    };

    const fetchCameras = async () => {
      try {
        const allCameras = await CameraService.getAll(companyId);
        const activeCameras = allCameras.filter(camera => camera.cameraStatus === 1);
        setCameras(activeCameras.slice(0, 3));
        setLoading(prev => ({ ...prev, cameras: false }));
      } catch (error) {
        console.error('Error fetching cameras:', error);
        setLoading(prev => ({ ...prev, cameras: false }));
      }
    };

    const fetchActivities = async () => {
      try {
        const recentActivities = await fetchRecentActivities(companyId);
        setActivities(recentActivities);
        setLoading(prev => ({ ...prev, activities: false }));
      } catch (error) {
        console.error('Error fetching activities:', error);
        setLoading(prev => ({ ...prev, activities: false }));
      }
    };

    fetchMarkedCats();
    fetchCameras();
    fetchActivities();
  }, [companyId]);


  const fetchRecentActivities = async (companyId: string): Promise<ActivityItem[]> => {
    // MOCKADO - Precisa de endpoint na api
    const dummyActivities: ActivityItem[] = [];
    
    try {
      const cats = await AnimalService.getAll(companyId, 0, 5);
      
      if (cats.length > 0) {
        const activityTypes = ['Alimentação', 'Soneca', 'Brincadeira', 'Necessidades'];
        const dates = ['18/04', '17/04', '16/04'];
        const times = ['19:05', '17:41', '15:32', '14:45', '13:20'];
        const locations = ['Área comum', 'Área de descanso', 'Quintal', 'Cozinha'];
        
        cats.forEach((cat, index) => {
          for (let i = 0; i < 2; i++) {
            const date = dates[Math.floor(Math.random() * dates.length)];
            const time = times[Math.floor(Math.random() * times.length)];
            const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
            const location = locations[Math.floor(Math.random() * locations.length)];
            
            dummyActivities.push({
              id: `activity-${index}-${i}`,
              title: cat.petName,
              subtitle: `${cat.petGender} · ${calculateAge(cat.petBirth)} anos`,
              imageUrl: cat.petPicture || '/imgs/cat_sample.jpg',
              timestamp: {
                date,
                time
              },
              catId: cat._id,
              metadata: {
                status: getStatusText(cat.petStatus?.petCurrentStatus),
                location,
                activityName: activityType
              }
            });
          }
        });
        
        dummyActivities.sort((a, b) => {
          const dateA = parseInt(a.timestamp.date.split('/')[0]);
          const dateB = parseInt(b.timestamp.date.split('/')[0]);
          if (dateA !== dateB) return dateB - dateA;
          
          const timeA = a.timestamp.time.split(':').map(n => parseInt(n));
          const timeB = b.timestamp.time.split(':').map(n => parseInt(n));
          
          if (timeA[0] !== timeB[0]) return timeB[0] - timeA[0];
          return timeB[1] - timeA[1];
        });
      }
      
      return dummyActivities;
    } catch (error) {
      console.error('Error creating mock activities:', error);
      return [];
    }
  };

  const mapCatStatus = (status?: string): 'healthy' | 'attention' | 'critical' => {
    if (!status) return 'healthy';
    
    switch (status) {
      case '0': return 'healthy';
      case '1': return 'attention';
      case '2': return 'critical';
      default: return 'healthy';
    }
  };

  const getStatusText = (status?: string): string => {
    if (!status) return 'Saudável';
    
    switch (status) {
      case '0': return 'Saudável';
      case '1': return 'Em atenção';
      case '2': return 'Crítico';
      default: return 'Saudável';
    }
  };

  const calculateAge = (birthDate?: Date): number => {
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

  const handleMarkToggle = async (id: string, marked: boolean) => {
    try {
      const response = await AnimalService.update(id, {
        petFavorite: marked
      });

      if (response.ok) {
        if (marked) {
          const cat = await AnimalService.getOne(id);
          setMarkedCats(prev => [...prev, cat]);
        } else {
          setMarkedCats(prev => prev.filter(cat => cat._id !== id));
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
                  key={cat._id}
                  id={cat._id}
                  name={cat.petName}
                  gender={cat.petGender}
                  age={calculateAge(cat.petBirth)}
                  imageUrl={cat.petPicture || '/imgs/cat_sample.jpg'}
                  status={mapCatStatus(cat.petStatus?.petCurrentStatus)}
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
                key={camera._id}
                id={camera._id}
                name={camera.cameraLocation}
                imageUrl={camera.cameraPicture || '/imgs/camera_sample.jpg'}
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