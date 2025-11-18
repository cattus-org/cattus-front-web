import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CatProfile from '@/Components/CatProfile';
import CatStatus from '@/Components/CatStatus';
import CatActivities from '@/Components/CatActivities';
import { Button } from '@/Components/ui/button';
import { AnimalService, ActivityService, ReportService } from '@/Services';
import { Animal, Activity } from '@/Services/types';
import { toast } from 'react-toastify';

const CatData = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [cat, setCat] = useState<Animal | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  const [sectionsState, setSectionsState] = useState({
    profile: true,
    status: false,
    activities: false
  });

  const toggleSection = (section: 'profile' | 'status' | 'activities') => {
    setSectionsState({
      ...sectionsState,
      [section]: !sectionsState[section]
    });
  };

  const generateReport = async () => {
    if (!cat?.id && !cat?._id) {
      toast.error('Cat ID not found to generate report.');
      return;
    }
    
    const catId = cat.id?.toString() || cat._id || '';
    if (!catId) {
      toast.error('Invalid cat ID');
      return;
    }

    try {
      setIsGeneratingReport(true);
      await ReportService.getAnimalReport(catId, 0, 50);
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error generating report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  useEffect(() => {
    const fetchCatData = async () => {
      if (!id) {
        setError('Cat ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const catData = await AnimalService.getOne(id);
        setCat(catData);
        
        const activitiesData = await ActivityService.getByCat(id);
        setActivities(activitiesData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cat data:', error);
        setError('Erro ao carregar dados do gato');
        setLoading(false);
      }
    };

    fetchCatData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !cat) {
    return (
      <div className="p-6">
        <p className="text-xl text-gray-400">{error || 'Cat not found.'}</p>
        <Button 
          onClick={() => navigate('/cats')}
          className="mt-4 bg-green-600 hover:bg-green-700"
        >
          Back to cat list
        </Button>
      </div>
    );
  }

  const formatCatForProfile = () => {
    return {
      id: cat.id?.toString() || cat._id || '',
      name: cat.name || cat.petName || 'Unknown',
      gender: cat.sex == 'macho' ? 'male' : 'female',
      birthDate: formatDate(cat.birthDate || cat.petBirth),
      age: calculateAge(cat.birthDate || cat.petBirth),
      description: cat.observations || 'No description available',
      profilePicture: cat.picture || cat.petPicture || 'imgs/cat_sample.jpg',
      weight: cat.weight || 0,
      comorbidities: cat.comorbidities || [],
      vaccines: cat.vaccines || [],
      marked: cat.favorite || false,
      status: mapStatus(cat.status || cat.petStatus?.petCurrentStatus)
    };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Cat profile - {cat.name || cat.petName}</h1>
        <Button 
          onClick={generateReport}
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={isGeneratingReport}
        >
          {isGeneratingReport ? 'GENERATING...' : 'GENERATE REPORT'}
        </Button>
      </div>

      <div className="space-y-4">
        <CatProfile 
          cat={formatCatForProfile()}
          isExpanded={sectionsState.profile}
          onToggleExpand={() => toggleSection('profile')}
        />
        
        <CatStatus 
          catId={cat.id?.toString() || cat._id || ''}
          isExpanded={sectionsState.status}
          onToggleExpand={() => toggleSection('status')}
        />
        
        <CatActivities 
          catId={cat.id?.toString() || cat._id || ''}
          isExpanded={sectionsState.activities}
          onToggleExpand={() => toggleSection('activities')}
          activities={activities}
        />
      </div>
    </div>
  );
};

const formatDate = (date?: Date | string): string => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
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

const mapStatus = (status?: string): 'healthy' | 'attention' | 'critical' => {
  if (!status) return 'healthy';
  
  // Handle both old numeric values and new enum values
  switch (status) {
    // Old numeric values (legacy support)
    case '0': return 'healthy';
    case '1': return 'attention';
    case '2': return 'critical';
    // New enum values
    case 'ok': return 'healthy';
    case 'alert': return 'attention';
    case 'danger': return 'critical';
    default: return 'healthy';
  }
};

export default CatData;