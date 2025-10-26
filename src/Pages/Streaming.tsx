import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/Components/ui/badge';
import VideoPlayer from '@/Components/VideoPlayer';
import ActivityList, { ActivityItem } from '@/Components/ActivityList';
import { CameraService, ActivityService } from '@/Services';
import { Camera, Animal } from '@/Services/types';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface JwtPayload {
  accessLevel?: number;
  [key: string]: any;
}

const Streaming = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  
  const [camera, setCamera] = useState<Camera | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catActivities, setCatActivities] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  
  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setIsUserAdmin(decoded.accessLevel !== undefined && decoded.accessLevel >= 1);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    const fetchCamera = async () => {
      if (!id) {
        setError('ID da câmera não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const cameraData = await CameraService.getOne(id);
        setCamera(cameraData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching camera data:', error);
        setError('Erro ao carregar dados da câmera');
        setLoading(false);
      }
    };

    fetchCamera();
  }, [id]);

  useEffect(() => {
    const fetchCameraActivities = async () => {
      if (!id) return;
      
      try {
        setLoadingActivities(true);
        // TODO: Implement camera-specific activities endpoint
        // For now, fetch all activities and filter client-side or use a placeholder
        setCatActivities([]);
        setLoadingActivities(false);
      } catch (error) {
        console.error('Error fetching camera activities:', error);
        setLoadingActivities(false);
      }
    };
    
    if (camera) {
      fetchCameraActivities();
    }
  }, [camera, id]);

  const toggleCameraStatus = async () => {
    if (!camera || !isUserAdmin) return;

    try {
      // TODO: Implement camera activation/deactivation logic with new API
      const newDeleted = !camera.deleted;
      await CameraService.update(camera.id || camera._id || '', {
        deleted: newDeleted
      });

      setCamera({
        ...camera,
        deleted: newDeleted
      });
    } catch (error) {
      console.error('Error updating camera status:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !camera) {
    return (
      <div className="p-6">
        <p className="text-xl text-gray-400">{error || 'Câmera não encontrada.'}</p>
        <Button 
          onClick={() => navigate('/cameras')}
          className="mt-4 bg-green-600 hover:bg-green-700"
        >
          Voltar para lista de câmeras
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Streaming</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="mb-4">
            <VideoPlayer 
              isActive={!camera.deleted} 
              imageUrl={camera.url || camera.thumbnail || camera.cameraPicture || '/imgs/camera_sample.jpg'} 
              title={camera.name || camera.cameraLocation || 'Unknown Camera'} 
            />
          </div>

          <div className="bg-gray-900 rounded-md p-4 mb-4 w-[90%] mx-auto">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-bold text-white">Câmera {camera.name || camera.cameraLocation || 'Unknown'}</h2>
              <Button
                className={`${
                  !camera.deleted ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                } text-white`}
                disabled={!isUserAdmin}
                onClick={toggleCameraStatus}
              >
                {!isUserAdmin && <Lock size={16} className="mr-2" />}
                {!camera.deleted ? 'DESATIVAR' : 'ATIVAR'}
              </Button>
            </div>
            {/* Description field commented out - not available in new DB */}
            {/* <p className="text-gray-300 mb-2">{camera.description || 'Sem descrição disponível'}</p> */}
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">Estado:</span>
              <Badge 
                className={`${
                  !camera.deleted ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                } hover:bg-opacity-20`}
              >
                {!camera.deleted ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80">
          <ActivityList 
            title="Atividades nesta câmera"
            items={catActivities}
            maxHeight="500px"
            loading={loadingActivities}
            emptyMessage="Não há atividades registradas nesta câmera"
          />
        </div>
      </div>
    </div>
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

const getStatusText = (status?: string): string => {
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
};

export default Streaming;