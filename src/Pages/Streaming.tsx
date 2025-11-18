import { useState, useEffect, useRef } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/Components/ui/badge';
import VideoPlayer from '@/Components/VideoPlayer';
import ActivityList, { ActivityItem } from '@/Components/ActivityList';
import { CameraService, ActivityService } from '@/Services';
import { Camera } from '@/Services/types';
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

  const socketRef = useRef<WebSocket | null>(null);
  
  
  const [camera, setCamera] = useState<Camera | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catActivities, setCatActivities] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreActivities, setHasMoreActivities] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
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
        setError('Camera ID not provided');
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
        setError('Error loading camera data');
        setLoading(false);
      }
    };

    fetchCamera();
  }, [id]);

  useEffect(() => {
    const fetchCameraActivities = async (showLoading = true, page = 0, append = false) => {      
      if (!id) return;
      try {
        if (showLoading) setLoadingActivities(true);
        if (append) setLoadingMore(true);
        
        const offset = page * 5;
        const cameraActivitiesData = await ActivityService.getByCamera(id, offset, 5);
        
        if (append) {
          setCatActivities(prev => [...prev, ...cameraActivitiesData]);
        } else {
          setCatActivities(cameraActivitiesData);
        }
        
        setHasMoreActivities(cameraActivitiesData.length === 5);
        setLoadingActivities(false);
        setLoadingMore(false);
      } catch (error) {
        console.error('Error fetching camera activities:', error);
        setLoadingActivities(false);
        setLoadingMore(false);
      }
    };
    
    if (camera) {
      // Carrega atividades iniciais com loading
      fetchCameraActivities(true, 0, false);
      setCurrentPage(0);

      const ws = new WebSocket(`ws://localhost:8001/ws/activities?cameraId=${camera.id}`);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] Conectado ao servidor');
      };

      ws.onmessage = async (event) => {
        console.log('[WS] Mensagem recebida:', event.data);
        try {
          // Updates activities without showing loading, always from the first page
          fetchCameraActivities(false, 0, false);
        } catch (error) {
          console.error('[WS] Error processing message:', error);
        }
      };

      ws.onclose = () => {
        console.log('[WS] Connection closed');
      };

      ws.onerror = (e) => {
        console.error('[WS] Error:', e);
      };

      return () => {
        ws.close();
      };
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
        <p className="text-xl text-gray-400">{error || 'Camera not found.'}</p>
        <Button 
          onClick={() => navigate('/cameras')}
          className="mt-4 bg-green-600 hover:bg-green-700"
        >
          Back to camera list
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
              <h2 className="text-2xl font-bold text-white">Camera {camera.name || camera.cameraLocation || 'Unknown'}</h2>
              <Button
                className={`${
                  !camera.deleted ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                } text-white`}
                disabled={!isUserAdmin}
                onClick={toggleCameraStatus}
              >
                {!isUserAdmin && <Lock size={16} className="mr-2" />}
                {!camera.deleted ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
            {/* Description field commented out - not available in new DB */}
            {/* <p className="text-gray-300 mb-2">{camera.description || 'No description available'}</p> */}
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">Status:</span>
              <Badge 
                className={`${
                  !camera.deleted ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                } hover:bg-opacity-20`}
              >
                {!camera.deleted ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80">
          <ActivityList 
            title="Activities on this camera"
            items={catActivities}
            maxHeight="500px"
            loading={loadingActivities}
            emptyMessage="No activities recorded on this camera"
            hasMore={hasMoreActivities}
            isLoadingMore={loadingMore}
            onLoadMore={() => {
              setLoadingMore(true);
              const nextPage = currentPage + 1;
              setCurrentPage(nextPage);
              
              const fetchCameraActivities = async () => {
                if (!id) return;
                try {
                  const offset = nextPage * 5;
                  const cameraActivitiesData = await ActivityService.getByCamera(id, offset, 5);
                  setCatActivities(prev => [...prev, ...cameraActivitiesData]);
                  setHasMoreActivities(cameraActivitiesData.length === 5);
                  setLoadingMore(false);
                } catch (error) {
                  console.error('Error fetching more activities:', error);
                  setLoadingMore(false);
                }
              };
              
              fetchCameraActivities();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Streaming;