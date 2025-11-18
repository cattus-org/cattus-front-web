import { useState } from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type CatStatus = 'healthy' | 'attention' | 'critical';

interface CatCardProps {
  id: string;
  name: string;
  gender: string;
  age: number;
  imageUrl: string;
  status: CatStatus;
  initialMarked?: boolean;
  onMarkToggle?: (id: string, marked: boolean) => void;
}

const getStatusColor = (status: CatStatus): string => {
  switch (status) {
    case 'healthy':
      return '#42AA49';
    case 'attention':
      return '#FED400';
    case 'critical':
      return '#FF0200';
    default:
      return '#42AA49';
  }
};

const getStatusText = (status: CatStatus): string => {
  switch (status) {
    case 'healthy':
      return 'HEALTHY';
    case 'attention':
      return 'ALERT';
    case 'critical':
      return 'CRITICAL';
    default:
      return 'HEALTHY';
  }
};

const CatCard = ({
  id,
  name,
  gender,
  age,
  imageUrl,
  status,
  initialMarked = false,
  onMarkToggle
}: CatCardProps) => {
  const [isMarked, setIsMarked] = useState(initialMarked);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  const statusColor = getStatusColor(status);
  const statusText = getStatusText(status);
  
  const handleMarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMarkedState = !isMarked;
    setIsMarked(newMarkedState);
    if (onMarkToggle) {
      onMarkToggle(id, newMarkedState);
    }
  };

  const handleCardClick = () => {
    navigate(`/cats/${id}`);
  };

  return (
    <div 
      className="relative rounded-md overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-lg hover:scale-105" 
      style={{ 
        width: '190px', 
        height: '250px',
        border: `2px solid ${statusColor}`
      }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`absolute top-2 left-2 rounded-full z-10 transition-all duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
        style={{ 
          width: '14px', 
          height: '14px', 
          backgroundColor: statusColor 
        }}
      />

      {isHovered && (
        <div 
          className="absolute top-2 left-2 z-10 rounded-full py-1 px-3 text-white text-xs font-bold text-center transition-all duration-300 inline-block"
          style={{
            backgroundColor: statusColor
          }}
        >
          {statusText}
        </div>
      )}
      
      <button
        onClick={handleMarkToggle}
        className="absolute top-2 right-2 z-10 bg-transparent border-none cursor-pointer"
        aria-label={isMarked ? "Unmark cat" : "Mark cat"}
      >
        <Star 
          size={20} 
          fill={isMarked ? "white" : "transparent"} 
          color="white"
        />
      </button>
      
      <div className="h-3/4 w-full bg-gray-300 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={`Foto de ${name}`}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
      </div>
      
      <div className="p-2 bg-black text-white">
        <h3 className="font-bold text-sm truncate">{name || "Nome do gato(a)"}</h3>
        <div className="flex justify-between items-center mt-1 text-xs">
          <span>{gender} • {age} y.o.</span>
          <span className="text-gray-400">CID: {id.substring(0, 4)}</span>
        </div>
      </div>
    </div>
  );
};

export default CatCard;