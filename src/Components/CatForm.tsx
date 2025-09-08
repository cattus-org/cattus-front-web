import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import ProgressBar from './ProgressBar';
import SegmentOne from './catform-segments/SegmentOne';
import SegmentTwo from './catform-segments/SegmentTwo';
import SegmentThree from './catform-segments/SegmentThree';
import SegmentFour from './catform-segments/SegmentFour';
import { AnimalService } from '@/Services';
import { Animal } from '@/Services/types';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/Components/ui/hover-card';

interface JwtPayload {
  company?: string;
  [key: string]: any;
}

const defaultFormData: Partial<Animal> = {
  petName: '',
  petBirth: undefined,
  petGender: '',
  petObs: '',
  petPicture: '',
  petCharacteristics: {
    petCastrated: '',
    petBreed: '',
    petSize: '',
  },
  physicalCharacteristics: {
    furColor: '',
    furLength: '',
    eyeColor: '',
    size: 0,
    weight: 0,
  },
  behavioralCharacteristics: {
    personality: '',
    activityLevel: '',
    socialBehavior: '',
    meow: '',
  },
  petComorbidities: '',
  petVaccines: [],
  company: '',
  petStatus: {
    petCurrentStatus: '0',
    petOccurrencesQuantity: 0,
    petLastOccurrence: null,
  },
  petFavorite: false
};

type SegmentType = 'basic' | 'physical' | 'behavioral' | 'medical';

const CatForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<Animal>>(defaultFormData);
  const [activeSegment, setActiveSegment] = useState<SegmentType>('basic');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [completedSegments, setCompletedSegments] = useState<Record<SegmentType, boolean>>({
    basic: false,
    physical: false,
    behavioral: false,
    medical: false,
  });
  const [progress, setProgress] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(Boolean(id));

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        if (decoded.company) {
          setFormData(prev => ({
            ...prev,
            company: decoded.company
          }));
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    
    if (id) {
      const fetchCatData = async () => {
        try {
          setIsLoading(true);
          const catData = await AnimalService.getOne(id);
          setFormData(catData);
          setIsEditing(true);
          
          const completed = {
            basic: Boolean(catData.petName && catData.petGender),
            physical: Boolean(
              catData.physicalCharacteristics?.furColor || 
              catData.physicalCharacteristics?.furLength
            ),
            behavioral: Boolean(
              catData.behavioralCharacteristics?.personality || 
              catData.behavioralCharacteristics?.activityLevel
            ),
            medical: Boolean(
              catData.petVaccines?.length || 
              catData.petComorbidities
            ),
          };
          
          setCompletedSegments(completed);
          calculateProgress(catData);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching cat data:', error);
          toast.error('Erro ao carregar dados do gato');
          setIsLoading(false);
        }
      };

      fetchCatData();
    }
  }, [id]);

  const calculateProgress = (data: Partial<Animal> = formData) => {
    let filledFields = 0;
    let totalFields = 0;

    const basicFields = ['petName', 'petGender', 'petPicture', 'petBirth'];
    basicFields.forEach(field => {
      totalFields++;
      if (data[field as keyof typeof data]) filledFields++;
    });

    if (data.physicalCharacteristics) {
      const physicalFields = ['furColor', 'furLength', 'eyeColor', 'size', 'weight'];
      physicalFields.forEach(field => {
        totalFields++;
        if (data.physicalCharacteristics?.[field as keyof typeof data.physicalCharacteristics]) 
          filledFields++;
      });
    }

    if (data.behavioralCharacteristics) {
      const behavioralFields = ['personality', 'activityLevel', 'socialBehavior', 'meow'];
      behavioralFields.forEach(field => {
        totalFields++;
        if (data.behavioralCharacteristics?.[field as keyof typeof data.behavioralCharacteristics]) 
          filledFields++;
      });
    }

    totalFields += 2;
    if (data.petVaccines?.length) filledFields++;
    if (data.petComorbidities) filledFields++;

    const calculatedProgress = Math.round((filledFields / totalFields) * 100);
    setProgress(calculatedProgress);
  };

  const handleFormDataChange = (newData: Partial<Animal>, segment: SegmentType) => {
    const updatedData = { ...formData, ...newData };
    setFormData(updatedData);
    
    const isCompleted = 
      segment === 'basic' ? Boolean(updatedData.petName && updatedData.petGender) :
      segment === 'physical' ? Boolean(updatedData.physicalCharacteristics?.furColor) :
      segment === 'behavioral' ? Boolean(updatedData.behavioralCharacteristics?.personality) :
      Boolean(updatedData.petVaccines?.length || updatedData.petComorbidities);
    
    const updatedSegments = { ...completedSegments, [segment]: isCompleted };
    setCompletedSegments(updatedSegments);

    calculateProgress(updatedData);
  };

  const saveFormData = async (andContinue: boolean = false) => {
    try {
      setIsLoading(true);
      
      if (activeSegment === 'basic' && !isEditing) {
        const formDataToSubmit = new FormData();
        
        if (formData.petName) formDataToSubmit.append('petName', formData.petName);
        if (formData.petGender) formDataToSubmit.append('petGender', formData.petGender);
        if (formData.petObs) formDataToSubmit.append('petObs', formData.petObs);
        
        if (formData.company) {
          formDataToSubmit.append('company', formData.company);
        } else {
          const token = Cookies.get('token');
          if (token) {
            try {
              const decoded = jwtDecode<JwtPayload>(token);
              if (decoded.company) {
                formDataToSubmit.append('company', decoded.company);
              } else {
                toast.error('ID da empresa não encontrado');
                setIsLoading(false);
                return;
              }
            } catch (error) {
              console.error('Error decoding token:', error);
              toast.error('Erro ao obter ID da empresa');
              setIsLoading(false);
              return;
            }
          } else {
            toast.error('Token não encontrado');
            setIsLoading(false);
            return;
          }
        }
        
        formDataToSubmit.append('petStatus.petCurrentStatus', '0'); 
        formDataToSubmit.append('petStatus.petOccurrencesQuantity', '0');
        
        if (formData.petBirth) {
          const birthDate = new Date(formData.petBirth);
          formDataToSubmit.append('petBirth', birthDate.toISOString().split('T')[0]);
        }
        
        const pictureInput = document.getElementById('pet-picture') as HTMLInputElement;
        if (pictureInput?.files?.length) {
        const { uploadImageFile } = await import('@/utils/imageUpload');
        const imageUrl = await uploadImageFile(pictureInput.files[0]);
        
        if (imageUrl) {
          formDataToSubmit.append('petPicture', imageUrl);
        }
      }
        
        const response = await AnimalService.create(formDataToSubmit);
        
        if (response.ok && response._id) {
          toast.success('Gato cadastrado com sucesso!');       
          setIsEditing(true);          
          navigate(`/cats/edit/${response._id}`, { replace: true });
          
          setFormData(prev => ({ ...prev, _id: response._id }));
          
          if (andContinue) {
            setActiveSegment('physical');
          } else {
            navigate(`/cats/${response._id}`);
          }
        } else {
          toast.error(response.message || 'Erro ao cadastrar gato');
        }
      } 
      else if (id || formData._id) {
        const catId = (id || formData._id) as string;
        let patchData: Partial<Animal> = {};
        
        if (activeSegment === 'basic') {
          patchData = {
            petName: formData.petName,
            petGender: formData.petGender,
            petObs: formData.petObs
          };
          
          if (formData.petBirth) {
            patchData.petBirth = formData.petBirth;
          }
          
          const pictureInput = document.getElementById('pet-picture') as HTMLInputElement;
          if (pictureInput?.files?.length) {
            setIsLoading(true);
            try {
              const { uploadImageFile } = await import('@/utils/imageUpload');
              const imageUrl = await uploadImageFile(pictureInput.files[0]);
              
              if (imageUrl) {
                console.log('Setting petPicture URL:', imageUrl);
                patchData.petPicture = imageUrl;
              }
            } catch (error) {
              console.error('Error uploading image during update:', error);
              toast.error('Erro ao fazer upload da imagem');
              setIsLoading(false);
              return;
            }
          }
        } 
        else if (activeSegment === 'physical') {
          patchData = {
            petCharacteristics: formData.petCharacteristics,
            physicalCharacteristics: formData.physicalCharacteristics
          };
        } 
        else if (activeSegment === 'behavioral') {
          patchData = {
            behavioralCharacteristics: formData.behavioralCharacteristics
          };
        } 
        else if (activeSegment === 'medical') {
          patchData = {
            petComorbidities: formData.petComorbidities
          };
          
          const vaccineInput = document.getElementById('pet-vaccine') as HTMLInputElement;
          if (vaccineInput?.files?.length) {
            setIsLoading(true);
            try {
              const { uploadImageFile } = await import('@/utils/imageUpload');
              const imageUrl = await uploadImageFile(vaccineInput.files[0]);
              
              if (imageUrl) {
                console.log('Setting petVaccines URL:', imageUrl);
                patchData.petVaccines = [imageUrl];
              }
            } catch (error) {
              console.error('Error uploading vaccine during update:', error);
              toast.error('Erro ao fazer upload do documento de vacinação');
              setIsLoading(false);
              return;
            }
          }
        }
        
        console.log('Sending PATCH data:', patchData);
        
        try {
          const response = await AnimalService.update(catId, patchData);
          
          if (response.ok) {
            toast.success('Gato atualizado com sucesso!');
            
            if (andContinue) {
              if (activeSegment === 'basic') setActiveSegment('physical');
              else if (activeSegment === 'physical') setActiveSegment('behavioral');
              else if (activeSegment === 'behavioral') setActiveSegment('medical');
              else navigate(`/cats/${response._id}`);
            } else {
              navigate(`/cats/${response._id}`);
            }
          } else {
            toast.error(response.message || 'Erro ao atualizar gato');
          }
        } catch (error) {
          console.error('Error updating cat:', error);
          toast.error('Erro ao atualizar gato');
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error saving cat data:', error);
      toast.error('Erro ao salvar dados do gato');
      setIsLoading(false);
    }
  };

  const handleSegmentChange = (segment: SegmentType) => {
    if (segment !== 'basic' && !isEditing) {
      toast.warn('Salve as informações básicas primeiro');
      return;
    }
    
    setActiveSegment(segment);
  };

  if (isLoading && !formData.petName) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">{isEditing ? 'Editar gato' : 'Adicionar gato'}</h1>
        <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white hover:bg-transparent">
                      <HelpCircle size={16} />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 bg-gray-700 text-white border-gray-600 p-4">
                    <p>{isEditing ? 'A edição de gatos permite preencher novos dados ou alterar os existentes' : 'O cadastro de gato possui 4 etapas, porém só a primeira é obrigatória para listar o gato no sistema. As demais podem ser preenchidas posteriormente.'}</p>
                  </HoverCardContent>
                </HoverCard>
      </div>

      <div className="mb-6">
        <p className="text-white mb-2">Progresso:</p>
        <ProgressBar progress={progress} />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 bg-gray-900 rounded-md overflow-hidden">
          <div className="p-4 bg-gray-800">
            <h2 className="text-white font-semibold">SEGMENTOS:</h2>
          </div>
          
          <button
            className={`w-full text-left p-4 transition-colors ${
              activeSegment === 'basic' 
                ? 'bg-[#3c8054] text-white font-semibold' 
                : 'text-white hover:bg-gray-800'
            } ${
              completedSegments.basic 
                ? 'text-green-500' 
                : 'font-italic'
            }`}
            onClick={() => handleSegmentChange('basic')}
          >
            Dados básicos e foto de perfil
          </button>
          
          <button
            className={`w-full text-left p-4 transition-colors ${
              activeSegment === 'physical' 
                ? 'bg-[#3c8054] text-white font-semibold' 
                : 'text-white hover:bg-gray-800'
            } ${
              completedSegments.physical 
                ? 'text-green-500' 
                : 'font-italic'
            } ${
              !isEditing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => handleSegmentChange('physical')}
            disabled={!isEditing}
          >
            Características físicas
          </button>
          
          <button
            className={`w-full text-left p-4 transition-colors ${
              activeSegment === 'behavioral' 
                ? 'bg-[#3c8054] text-white font-semibold' 
                : 'text-white hover:bg-gray-800'
            } ${
              completedSegments.behavioral 
                ? 'text-green-500' 
                : 'font-italic'
            } ${
              !isEditing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => handleSegmentChange('behavioral')}
            disabled={!isEditing}
          >
            Comportamento social
          </button>
          
          <button
            className={`w-full text-left p-4 transition-colors ${
              activeSegment === 'medical' 
                ? 'bg-[#3c8054] text-white font-semibold' 
                : 'text-white hover:bg-gray-800'
            } ${
              completedSegments.medical 
                ? 'text-green-500' 
                : 'font-italic'
            } ${
              !isEditing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => handleSegmentChange('medical')}
            disabled={!isEditing}
          >
            Carteira de vacinação e comorbidades
          </button>
        </div>

        <div className="flex-1">
          {activeSegment === 'basic' && (
            <SegmentOne
              formData={formData}
              onChange={(data) => handleFormDataChange(data, 'basic')}
              onSaveAndFinalize={() => saveFormData(false)}
              onSaveAndContinue={() => saveFormData(true)}
              isLoading={isLoading}
            />
          )}
          
          {activeSegment === 'physical' && (
            <SegmentTwo
              formData={formData}
              onChange={(data) => handleFormDataChange(data, 'physical')}
              onSaveAndFinalize={() => saveFormData(false)}
              onSaveAndContinue={() => saveFormData(true)}
              isLoading={isLoading}
            />
          )}
          
          {activeSegment === 'behavioral' && (
            <SegmentThree
              formData={formData}
              onChange={(data) => handleFormDataChange(data, 'behavioral')}
              onSaveAndFinalize={() => saveFormData(false)}
              onSaveAndContinue={() => saveFormData(true)}
              isLoading={isLoading}
            />
          )}
          
          {activeSegment === 'medical' && (
            <SegmentFour
              formData={formData}
              onChange={(data) => handleFormDataChange(data, 'medical')}
              onSaveAndFinalize={() => saveFormData(false)}
              onSaveAndContinue={() => saveFormData(true)}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CatForm;