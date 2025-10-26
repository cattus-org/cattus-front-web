import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';
import { AnimalService } from '@/Services';
import { toast } from 'react-toastify';

interface Cat {
  id: string;
  name: string;
  gender: string;
  birthDate: string;
  age: number;
  description: string;
  profilePicture: string;
  weight: number;
  comorbidities: string[];
  vaccines: string[];
  marked: boolean;
  status: 'healthy' | 'attention' | 'critical';
}

interface CatProfileProps {
  cat: Cat;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const CatProfile = ({ cat, isExpanded, onToggleExpand }: CatProfileProps) => {
  const navigate = useNavigate();
  const [isMarked, setIsMarked] = useState(cat.marked);
  
  const handleEditClick = () => {
    navigate(`/cats/edit/${cat.id}`);
  };

  const getFurColorHex = (colorName: string): string => {
  switch (colorName.toLowerCase()) {
    case 'preta':
      return '#000000';
    case 'branca':
      return '#FFFFFF';
    case 'cinza':
      return '#808080';
    case 'laranja':
      return '#FFA500';
    case 'marrom':
      return '#8B4513';
    case 'mesclada':
      return 'linear-gradient(45deg, #000000 25%, #FFFFFF 25%, #FFFFFF 50%, #000000 50%, #000000 75%, #FFFFFF 75%)';
    default:
      return '#CCCCCC';
  }
};

  const handleMarkToggle = async () => {
    const newMarkedState = !isMarked;
    setIsMarked(newMarkedState);
    
    try {
      const response = await AnimalService.update(cat.id, {
        favorite: newMarkedState
      });
      
      if (response.success) {
        toast.success(newMarkedState ? 'Gato marcado com sucesso!' : 'Gato desmarcado com sucesso!');
      } else {
        setIsMarked(!newMarkedState);
        toast.error('Erro ao atualizar marcação');
      }
    } catch (error) {
      console.error('Error updating mark status:', error);
      setIsMarked(!newMarkedState);
      toast.error('Erro ao atualizar marcação');
    }
  };

  const handleVaccineUpload = () => {
    console.log('Opening file picker for vaccine upload');
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  if (!isExpanded) {
    return (
      <div className="bg-gray-900 rounded-md overflow-hidden">
        <div 
          className="p-3 bg-[#3c8054] flex justify-between items-center cursor-pointer"
          onClick={onToggleExpand}
        >
          <h2 className="text-lg font-semibold text-white">Perfil</h2>
          <ChevronDown className="text-white" size={20} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-md overflow-hidden">
      <div 
        className="p-3 bg-[#3c8054] flex justify-between items-center cursor-pointer"
        onClick={onToggleExpand}
      >
        <h2 className="text-lg font-semibold text-white">Perfil</h2>
        <ChevronUp className="text-white" size={20} />
      </div>

      <div className="p-6 bg-[#324250]">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4">
            <div className="bg-[#3c8054] h-100 w-full rounded-md overflow-hidden flex items-center justify-center">
              <img 
                src={cat.profilePicture} 
                alt={cat.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '';
                }}
              />
            </div>
          </div>

          <div className="md:w-1/2 space-y-4">
            <h2 className="text-2xl font-bold text-white">{cat.name}</h2>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 w-1/3">Sexo:</span>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-white">
                    <path d="M12 8a2 2 0 0 1 0 4 2 2 0 0 1 0-4z"/>
                    <path d="M12 2v2"/>
                    <path d="M12 14v8"/>
                    <path d="M9 18h6"/>
                  </svg>
                  <span className="text-white">{cat.gender}</span>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-gray-400 w-1/3">Data de nascimento:</span>
                <div className="flex items-center">
                  <span className="text-white">{cat.birthDate} • {cat.age} anos</span>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-gray-400 w-1/3">Descrição:</span>
                <p className="text-white text-sm">{cat.description}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-400 w-1/3">Peso:</span>
                <span className="text-white">{cat.weight} kg</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-white">Comorbidades</h3>
                <div className="flex flex-wrap gap-2">
                  {cat.comorbidities.length > 0 ? (
                    cat.comorbidities.map((comorbidity, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-white text-gray-800 rounded-full text-sm"
                      >
                        {comorbidity}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">Nenhuma comorbidade registrada</span>
                  )}
                </div>
              </div>
            
              <div className="space-y-2">
                <h3 className="text-white">Vacinas</h3>
                <div className="flex flex-wrap gap-2">
                  {cat.vaccines && cat.vaccines.length > 0 ? (
                    cat.vaccines.map((vaccine, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-green-600 text-white rounded-full text-sm"
                      >
                        {vaccine}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">Nenhuma vacina registrada</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-1/2 space-y-4">
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-white text-lg">Marcador:</h3>
              <div className="bg-white p-3 rounded-md">
                <img 
                  src="/imgs/ArUco_marker_sample.png" 
                  alt="ArUco Marker"
                  className="w-full h-auto max-w-xs"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/imgs/cat_sample.jpg';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-8">
          <div className="text-xs text-gray-400">
            <p>Status: <span className={`font-semibold ${cat.status === 'healthy' ? 'text-green-500' : cat.status === 'attention' ? 'text-yellow-500' : 'text-red-500'}`}>
              {cat.status === 'healthy' ? 'Saudável' : cat.status === 'attention' ? 'Em atenção' : 'Crítico'}
            </span></p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleMarkToggle}
              className={`px-8 ${isMarked ? 'bg-purple-700 hover:bg-purple-800' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
            >
              <Star className="mr-2" size={16} fill={isMarked ? "white" : "none"} />
              {isMarked ? 'DESMARCAR' : 'MARCAR'}
            </Button>
            
            <Button 
              onClick={handleEditClick}
              className="px-8 bg-green-600 hover:bg-green-700 text-white"
            >
              EDITAR
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatProfile;