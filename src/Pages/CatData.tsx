import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CatProfile from '@/Components/CatProfile';
import CatStatus from '@/Components/CatStatus';
import CatActivities from '@/Components/CatActivities';
import ReportSettings from '@/Components/ReportSettings';
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
  const [reportModalOpen, setReportModalOpen] = useState(false);
  // const [reportLoading, setReportLoading] = useState(false); // Removed unused state
  
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

  const generateReport = async (options: string[] = ['profile', 'status', 'activities']) => {
    if (!cat?._id) {
      toast.error('ID do gato não encontrado para gerar relatório.');
      return;
    }
    try {
      // setReportLoading(true); // Removed since reportLoading state is no longer used
      await ReportService.getAnimalReport(cat._id, options);
      toast.success('Relatório gerado com sucesso!');
      setReportModalOpen(false);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      // setReportLoading(false); // Removed since reportLoading state is no longer used
    }
  };

  useEffect(() => {
    const fetchCatData = async () => {
      if (!id) {
        setError('ID do gato não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const catData = await AnimalService.getOne(id);
        setCat(catData);
        
        const activitiesData = await ActivityService.getAll(id);
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
        <p className="text-xl text-gray-400">{error || 'Gato não encontrado.'}</p>
        <Button 
          onClick={() => navigate('/cats')}
          className="mt-4 bg-green-600 hover:bg-green-700"
        >
          Voltar para lista de gatos
        </Button>
      </div>
    );
  }

  const formatCatForProfile = () => {
    return {
      id: cat._id,
      name: cat.petName,
      gender: cat.petGender,
      birthDate: formatDate(cat.petBirth),
      age: calculateAge(cat.petBirth),
      description: cat.petObs || 'Sem descrição disponível',
      profilePicture: cat.petPicture || 'imgs/cat_sample.jpg',
      isCastrated: cat.petCharacteristics?.petCastrated === 'Sim',
      race: cat.petCharacteristics?.petBreed || 'Não especificado',
      color: cat.physicalCharacteristics?.furColor || 'Não especificado',
      fur: cat.physicalCharacteristics?.furLength || 'Não especificado',
      size: cat.physicalCharacteristics?.size || 0,
      weight: cat.physicalCharacteristics?.weight || 0,
      personality: cat.behavioralCharacteristics?.personality || 'Não especificado',
      activityLevel: cat.behavioralCharacteristics?.activityLevel || 'Não especificado',
      behaviour: cat.behavioralCharacteristics?.socialBehavior || 'Não especificado',
      meowLevel: cat.behavioralCharacteristics?.meow || 'Não especificado',
      comorbidities: cat.petComorbidities ? cat.petComorbidities.split(',').map(c => c.trim()) : [],
      vaccine: cat.petVaccines && cat.petVaccines.length > 0 ? cat.petVaccines[0] : '',
      marked: cat.petFavorite || false,
      status: mapStatus(cat.petStatus?.petCurrentStatus),
      lastEditedBy: cat.lastEditedBy,
      updatedAt: cat.updatedAt
    };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Perfil do gato - {cat.petName}</h1>
        <Button 
          onClick={() => setReportModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          GERAR RELATÓRIO
        </Button>
      </div>

      <div className="space-y-4">
        <CatProfile 
          cat={formatCatForProfile()}
          isExpanded={sectionsState.profile}
          onToggleExpand={() => toggleSection('profile')}
        />
        
        <CatStatus 
          catId={cat._id}
          isExpanded={sectionsState.status}
          onToggleExpand={() => toggleSection('status')}
        />
        
        <CatActivities
          isExpanded={sectionsState.activities}
          onToggleExpand={() => toggleSection('activities')}
          activities={activities}
        />
      </div>

      <ReportSettings
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        onGenerateReport={generateReport}
      />
    </div>
  );
};

const formatDate = (date?: Date): string => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const calculateAge = (birthDate?: Date): number => {
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
  
  switch (status) {
    case '0': return 'healthy';
    case '1': return 'attention';
    case '2': return 'critical';
    default: return 'healthy';
  }
};

export default CatData;