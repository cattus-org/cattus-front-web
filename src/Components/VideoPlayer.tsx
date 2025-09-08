import { Button } from '@/Components/ui/button';
import { Pause, Play, Maximize } from 'lucide-react';
import { useState, useEffect } from 'react';

interface VideoPlayerProps {
  isActive: boolean;
  imageUrl: string;
  title: string;
  className?: string;
}

const VideoPlayer = ({ isActive, imageUrl, title, className = "" }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  // const [isFullscreen, setIsFullscreen] = useState(false); // Removed unused state
  
  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (isActive) {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = () => {
    const videoContainer = document.getElementById('video-container');
    if (!videoContainer) return;

    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      // Removed since isFullscreen state is no longer used
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div 
      id="video-container"
      className={`relative bg-gray-800 rounded-md overflow-hidden aspect-video w-[90%] mx-auto ${className}`}
    >
      {isActive ? (
        <>
          {isPlaying ? (
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
              <Play size={64} className="text-white opacity-50" />
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 flex space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-black bg-opacity-40 text-white hover:bg-black hover:bg-opacity-60"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-black bg-opacity-40 text-white hover:bg-black hover:bg-opacity-60"
              onClick={toggleFullscreen}
            >
              <Maximize size={20} />
            </Button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400 p-6">
            <p className="text-xl font-semibold mb-2">Câmera desativada</p>
            <p>Esta câmera está atualmente desativada.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;