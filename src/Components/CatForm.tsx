import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import ProgressBar from './ProgressBar';
import SegmentOne from './catform-segments/SegmentOne';
import SegmentTwo from './catform-segments/SegmentTwo';
// SegmentThree and SegmentFour removed - functionality simplified
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

type SegmentType = 'basic' | 'additional';

const CatForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<Animal>>(defaultFormData);
  const [activeSegment, setActiveSegment] = useState<SegmentType>('basic');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [completedSegments, setCompletedSegments] = useState<Record<SegmentType, boolean>>({
    basic: false,
    additional: false,
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
            basic: Boolean(catData.name || catData.petName),
            additional: Boolean(
              catData.weight || 
              catData.comorbidities?.length || 
              catData.vaccines?.length
            ),
          };
          
          setCompletedSegments(completed);
          calculateProgress(catData);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching cat data:', error);
          toast.error('Error loading cat data');
          setIsLoading(false);
        }
      };

      fetchCatData();
    }
  }, [id]);

  const calculateProgress = (data: Partial<Animal> = formData) => {
    let filledFields = 0;
    let totalFields = 7; // Total optional fields we're tracking

    // Basic segment fields (all optional but we track them)
    if (data.name || data.petName) filledFields++;
    if (data.sex || data.petGender) filledFields++;
    if (data.picture || data.petPicture) filledFields++;
    if (data.birthDate || data.petBirth) filledFields++;
    
    // Additional segment fields
    if (data.weight) filledFields++;
    if (data.vaccines?.length || data.petVaccines?.length) filledFields++;
    if (data.comorbidities?.length || data.petComorbidities) filledFields++;

    const calculatedProgress = Math.round((filledFields / totalFields) * 100);
    setProgress(calculatedProgress);
  };

  const handleFormDataChange = (newData: Partial<Animal>, segment: SegmentType) => {
    const updatedData = { ...formData, ...newData };
    setFormData(updatedData);
    
    const isCompleted = 
      segment === 'basic' ? Boolean(updatedData.name || updatedData.petName) :
      Boolean(updatedData.weight || updatedData.vaccines?.length || updatedData.comorbidities?.length);
    
    const updatedSegments = { ...completedSegments, [segment]: isCompleted };
    setCompletedSegments(updatedSegments);

    calculateProgress(updatedData);
  };

  const saveFormData = async (andContinue: boolean = false) => {
    try {
      setIsLoading(true);
      
      if (activeSegment === 'basic' && !isEditing) {
        const formDataToSubmit: Record<string, any> = {};
        
        formDataToSubmit.name = formData.name || formData.petName;
        formDataToSubmit.sex = formData.sex || formData.petGender;
        formDataToSubmit.observations = formData.observations || formData.petObs;
        
        // Status is set automatically by backend with default 'ok'
        
        if (formData.birthDate || formData.petBirth) {
          const birthDate = formData.birthDate || formData.petBirth;
          formDataToSubmit.birthDate = new Date(birthDate).toISOString();
        }
        
        // Handle picture upload
        const pictureInput = document.getElementById('pet-picture') as HTMLInputElement;
        if (pictureInput?.files?.length) {
          try {
            const { uploadImageFile } = await import('@/utils/imageUpload');
            const imageUrl = await uploadImageFile(pictureInput.files[0]);
            
            if (imageUrl) {
              formDataToSubmit.picture = imageUrl;
              console.log('Picture uploaded and URL set:', imageUrl);
            } else {
              toast.error('Error uploading image');
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Error uploading image');
            setIsLoading(false);
            return;
          }
        } else {
          // Check if there's an existing picture URL in formData
          const existingPicture = formData.picture || formData.petPicture;
          if (existingPicture) {
            formDataToSubmit.picture = existingPicture;
            console.log('Using existing picture URL:', existingPicture);
          }
          // Picture is optional - no error if missing
        }
        
        console.log('Creating cat with data:', formDataToSubmit);
        
        const response = await AnimalService.create(formDataToSubmit);
        
        if (response.success && response.data) {
          const catData = Array.isArray(response.data) ? response.data[0] : response.data;
          const catId = catData.id;
          toast.success('Cat registered successfully!');       
          
          // Update formData with returned cat data to show picture immediately
          setFormData({
            ...formData,
            ...catData,
            id: catId,
            _id: catId.toString()
          });
          
          setIsEditing(true);          
          
          if (andContinue) {
            setActiveSegment('additional');
          } else {
            navigate(`/cats/${catId}`);
          }
        } else {
          toast.error(response.message || 'Error registering cat');
        }
      } 
      else if (id || formData._id) {
        const catId = (id || formData._id) as string;
        let patchData: Partial<Animal> = {};
        
        if (activeSegment === 'basic') {
          patchData = {
            name: formData.name || formData.petName,
            sex: formData.sex || formData.petGender,
            observations: formData.observations || formData.petObs
          };
          
          if (formData.birthDate || formData.petBirth) {
            patchData.birthDate = formData.birthDate || formData.petBirth;
          }
          
          const pictureInput = document.getElementById('pet-picture') as HTMLInputElement;
          if (pictureInput?.files?.length) {
            setIsLoading(true);
            try {
              const { uploadImageFile } = await import('@/utils/imageUpload');
              const imageUrl = await uploadImageFile(pictureInput.files[0]);
              
              if (imageUrl) {
                console.log('Setting picture URL:', imageUrl);
                patchData.picture = imageUrl;
              }
            } catch (error) {
              console.error('Error uploading image during update:', error);
              toast.error('Error uploading image');
              setIsLoading(false);
              return;
            }
          }
        } 
        else if (activeSegment === 'additional') {
          patchData = {
            weight: formData.weight,
            comorbidities: formData.comorbidities,
            vaccines: formData.vaccines
          };
        }
        
        console.log('Sending PATCH data:', patchData);
        
        try {
          const response = await AnimalService.update(catId, patchData);
          
          if (response.success) {
            const updatedData = Array.isArray(response.data) ? response.data[0] : response.data;
            const updatedId = updatedData?.id || catId;
            
            // Update formData with returned cat data to show picture immediately
            if (updatedData) {
              setFormData({
                ...formData,
                ...updatedData,
                id: updatedId,
                _id: updatedId.toString()
              });
            }
            
            toast.success('Cat updated successfully!');
            
            if (andContinue) {
              if (activeSegment === 'basic') setActiveSegment('additional');
              else navigate(`/cats/${updatedId}`);
            } else {
              navigate(`/cats/${updatedId}`);
            }
          } else {
            toast.error(response.message || 'Error updating cat');
          }
        } catch (error) {
          console.error('Error updating cat:', error);
          toast.error('Error updating cat');
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
      toast.warn('Save basic information first');
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
        <h1 className="text-3xl font-bold text-white">{isEditing ? 'Edit cat' : 'Add cat'}</h1>
        <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white hover:bg-transparent">
                      <HelpCircle size={16} />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 bg-gray-700 text-white border-gray-600 p-4">
                    <p>{isEditing ? 'Editing cats allows you to fill in new data or change existing data' : 'Cat registration has 4 steps, but only the first one is required to list the cat in the system. The others can be filled in later.'}</p>
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
            Basic information and profile photo
          </button>
          
          <button
            className={`w-full text-left p-4 transition-colors ${
              activeSegment === 'additional' 
                ? 'bg-[#3c8054] text-white font-semibold' 
                : 'text-white hover:bg-gray-800'
            } ${
              completedSegments.additional 
                ? 'text-green-500' 
                : 'font-italic'
            } ${
              !isEditing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => handleSegmentChange('additional')}
            disabled={!isEditing}
          >
            Weight, Comorbidities and Vaccines
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
          
          {activeSegment === 'additional' && (
            <SegmentTwo
              formData={formData}
              onChange={(data) => handleFormDataChange(data, 'additional')}
              onSaveAndFinalize={() => saveFormData(false)}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CatForm;