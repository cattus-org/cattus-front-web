import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import CatCard from '@/Components/CatCard';
import CatViewFilter from '@/Components/CatViewFilter';
import CatViewTooltip from '@/Components/CatViewTooltip';
import { Button } from '@/Components/ui/button';
import { Filter, HelpCircle } from 'lucide-react';
import { AnimalService } from '@/Services';
import { Animal } from '@/Services/types';
import { toast } from 'react-toastify';

const CatsView = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [cats, setCats] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoading(true);
        const token = Cookies.get('token');
        
        if (!token) {
          setError('Você precisa estar autenticado');
          setLoading(false);
          return;
        }
        
        // Backend handles authentication via JWT, no need to pass companyId
        const response = await AnimalService.getAll();
        console.log('Fetched cats:', response);
        setCats(response);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cats:', error);
        setError('Error loading cats');
        setLoading(false);
      }
    };
    
    fetchCats();
  }, []);

  useEffect(() => {
    const searchHandler = (e: CustomEvent) => {
      handleSearch(e.detail.query);
    };

    document.addEventListener('cat-search', searchHandler as EventListener);

    return () => {
      document.removeEventListener('cat-search', searchHandler as EventListener);
    };
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      // Just fetch all cats without filters
      const response = await AnimalService.getAll();
      setCats(response);
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement search functionality with new API
      // For now, filter clientside
      const allCats = await AnimalService.getAll();
      const searchLower = query.toLowerCase();
      const filtered = allCats.filter(cat => {
        const name = (cat.name || cat.petName || '').toLowerCase();
        const gender = (cat.sex == 'macho' ? 'male' : 'female').toLowerCase();
        return name.includes(searchLower) || gender.includes(searchLower);
      });
      setCats(filtered);
      setLoading(false);
    } catch (error) {
      console.error('Error searching cats:', error);
      setError('Error searching cats');
      setLoading(false);
    }
  }


  const handleMarkToggle = async (id: string, marked: boolean) => {
    try {
      const response = await AnimalService.update(id, {
        favorite: marked
      });

      if (response.success) {
        toast.success('Mark updated!');
      }
    } catch (error) {
      console.error('Error updating mark:', error);
      toast.error('Error updating mark');
    }
  };

  const handleApplyFilters = (selectedFilters: Record<string, string[]>) => {
    if (selectedFilters.gender && selectedFilters.gender.length > 0) {
      AnimalService.getAll().then(allCats => {
        const filtered = allCats.filter(cat => {
          const genderMap: Record<string, string> = {
            "Macho": "male",
            "Fêmea": "female"
          };
          
          // Support both old and new field structures
          const petGender = cat.sex == 'macho' ? 'male' : 'female';
          const mappedGender = genderMap[petGender];
          return selectedFilters.gender.includes(mappedGender);
        });
        
        setCats(filtered);
      });
    }
  };

  const mapCatStatus = (status?: string): 'healthy' | 'attention' | 'critical' => {
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

  if (loading) {
    return <div className="p-6 flex justify-center"><div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div></div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Registered cats</h1>
          <p className="text-gray-400">{cats.length} cats total</p>
        </div>
        <div className="flex gap-2">

          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => navigate('/cats/add')}
          >
          ADD CAT
          </Button>

          <Button 
            variant="outline" 
            className="text-black flex gap-2 items-center"
            onClick={() => setFilterOpen(true)}
          >
            <Filter size={16} />
            Filters
          </Button>
          
          <CatViewTooltip>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-white hover:bg-transparent">
              <HelpCircle size={16} />
            </Button>
          </CatViewTooltip>
        </div>
      </div>

      <CatViewFilter 
        open={filterOpen} 
        onOpenChange={setFilterOpen}
        onApplyFilters={handleApplyFilters}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
        {cats.map((cat) => (
          <CatCard
            key={cat.id || cat._id || ''}
            id={cat.id?.toString() || cat._id || ''}
            name={cat.name || cat.petName || 'Unknown'}
            gender={cat.sex == 'macho' ? 'male' : 'female'}
            age={getAge(cat.birthDate || cat.petBirth)}
            imageUrl={cat.picture || cat.petPicture || 'imgs/cat_sample.jpg'}
            status={mapCatStatus(cat.status || cat.petStatus?.petCurrentStatus)}
            initialMarked={cat.favorite || false}
            onMarkToggle={handleMarkToggle}
          />
        ))}
      </div>
    </div>
  );
};

const getAge = (birthDate?: Date | string): number => {
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

export default CatsView;