import { useState, useEffect } from 'react';
import CameraCard from '@/Components/CameraCard';
import CatViewFilter from '@/Components/CatViewFilter';
import CameraViewTooltip from '@/Components/CameraViewTooltip';
import { Button } from '@/Components/ui/button';
import { Filter, HelpCircle } from 'lucide-react';
import { CameraService } from '@/Services';
import { Camera } from '@/Services/types';

const CamerasView = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        setLoading(true);
        
        const response = await CameraService.getAll(0, 50);
        // Filter out deleted cameras
        const activeCameras = response.filter(camera => !camera.deleted);

        setCameras(activeCameras);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cameras:', error);
        setError('Error loading cameras');
        setLoading(false);
      }
    };
    
    fetchCameras();
  }, []);

  const handleApplyFilters = (selectedFilters: Record<string, string[]>) => {
    console.log('Applied filters:', selectedFilters);
    // Placeholder pro filtro
  };

  if (loading) {
    return <div className="p-6 flex justify-center">
      <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
    </div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cameras on site</h1>
          <p className="text-gray-400">{cameras.length} total cameras</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="text-black flex gap-2 items-center"
            onClick={() => setFilterOpen(true)}
          >
            <Filter size={16} />
            Filters
          </Button>
          
          <CameraViewTooltip>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-white hover:bg-transparent">
              <HelpCircle size={16} />
            </Button>
          </CameraViewTooltip>
        </div>
      </div>

      <CatViewFilter 
        open={filterOpen} 
        onOpenChange={setFilterOpen}
        onApplyFilters={handleApplyFilters}
      />

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {cameras.map((camera) => (
          <CameraCard
            key={camera.id || camera._id}
            id={camera.id?.toString() || camera._id || ''}
            name={camera.name || camera.cameraLocation || 'Unknown Location'}
            imageUrl={camera.thumbnail || camera.cameraPicture || '/imgs/camera_sample.jpg'}
          />
        ))}
      </div>
    </div>
  );
};

export default CamerasView;