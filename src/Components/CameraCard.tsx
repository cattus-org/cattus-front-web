import { useState } from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CameraCardProps {
  id: string;
  name: string;
  imageUrl: string;
}

const CameraCard = ({ id, name, imageUrl }: CameraCardProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/streaming/${id}`);
  };
  
  return (
    <div 
      className="relative rounded-md overflow-hidden cursor-pointer"
      style={{ width: '100%', height: '160px' }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClick}
    >
      <div className="h-full w-full bg-gray-800 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={`Camera ${name}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '';
          }}
        />
      </div>
      
      {isHovering && (
        <div className="absolute inset-0  bg-opacity-25 flex items-center justify-center">
          <div className="rounded-full bg-white bg-opacity-80 p-3">
            <Play size={36} color="black" />
          </div>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center">
        <h3 className="font-medium text-sm">Camera {name}</h3>
      </div>
    </div>
  );
};

export default CameraCard;