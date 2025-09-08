import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 
import Cookies from 'js-cookie';
import CatCard from '@/Components/CatCard';
import CatViewFilter from '@/Components/CatViewFilter';
import CatViewTooltip from '@/Components/CatViewTooltip';
import { Button } from '@/Components/ui/button';
import { Filter, HelpCircle } from 'lucide-react';
import { AnimalService } from '@/Services';
import { Animal } from '@/Services/types';
import { toast } from 'react-toastify';

interface JwtPayload {
  company?: string;
  [key: string]: any;
}

const CatsView = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [cats, setCats] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [searchQuery, setSearchQuery] = useState<string>(''); // Removed unused state
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
        
        const decoded = jwtDecode<JwtPayload>(token);
        const companyId = decoded.company;
        
        if (!companyId) {
          setError('ID da empresa não encontrado');
          setLoading(false);
          return;
        }
        
        const response = await AnimalService.getAll(companyId);
        console.log('Fetched cats:', response);
        setCats(response);
        
        // setMarkedCats(response.petFavorite);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cats:', error);
        setError('Erro ao carregar os gatos');
        setLoading(false);
      }
    };
    
    fetchCats();
  }, []);

  useEffect(() => {
    const searchHandler = (e: CustomEvent) => {
      // setSearchQuery(e.detail.query); // Removed since searchQuery state is no longer used
      handleSearch(e.detail.query);
    };

    document.addEventListener('cat-search', searchHandler as EventListener);

    return () => {
      document.removeEventListener('cat-search', searchHandler as EventListener);
    };
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      const token = Cookies.get('token');
      const decoded = jwtDecode<JwtPayload>(token || '');
      const companyId = decoded.company;

      if (!companyId) return;

      const response = await AnimalService.getAll(companyId);
      setCats(response);
      return;
    }

    try {
      setLoading(true);
      const fields = ['petName', 'petGender', 'petBreed', 'petComorbidities'];
      const results = await AnimalService.search(query, fields);
      setCats(results);
      setLoading(false);
    } catch (error) {
      console.error('Error searching cats:', error);
      setError('Erro ao pesquisar gatos');
      setLoading(false);
    }
  }


  const handleMarkToggle = async (id: string, marked: boolean) => {

    let patchData = {
      petFavorite: marked
    };
    const response = await AnimalService.update(id, patchData);

    if (response.ok) {
              toast.success('Marcação atualizada!');
    }
  };

  const handleApplyFilters = (selectedFilters: Record<string, string[]>) => {
    // console.log('Applied filters:', selectedFilters);
    if (selectedFilters.gender && selectedFilters.gender.length > 0) {
      const token = Cookies.get('token');
      if (!token) return;
      
      const decoded = jwtDecode<JwtPayload>(token);
      const companyId = decoded.company;
      if (!companyId) return;
      
      AnimalService.getAll(companyId).then(allCats => {
        const filtered = allCats.filter(cat => {
          const genderMap: Record<string, string> = {
            "Macho": "male",
            "Fêmea": "female"
          };
          
          const mappedGender = genderMap[cat.petGender];
          return selectedFilters.gender.includes(mappedGender);
        });
        
        setCats(filtered);
      });
    }
  };

  const mapCatStatus = (status?: string): 'healthy' | 'attention' | 'critical' => {
    if (!status) return 'healthy';
    
    switch (status) {
      case '0': return 'healthy';
      case '1': return 'attention';
      case '2': return 'critical';
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
          <h1 className="text-3xl font-bold text-white mb-2">Gatos cadastrados</h1>
          <p className="text-gray-400">{cats.length} gatos ao todo</p>
        </div>
        <div className="flex gap-2">

          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => navigate('/cats/add')}
          >
          ADICIONAR GATO
          </Button>

          <Button 
            variant="outline" 
            className="text-black flex gap-2 items-center"
            onClick={() => setFilterOpen(true)}
          >
            <Filter size={16} />
            Filtros
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
            key={cat._id}
            id={cat._id}
            name={cat.petName}
            gender={cat.petGender}
            age={getAge(cat.petBirth)}
            imageUrl={cat.petPicture || 'imgs/cat_sample.jpg'}
            status={mapCatStatus(cat.petStatus?.petCurrentStatus)}
            initialMarked={cat.petFavorite}
            onMarkToggle={handleMarkToggle}
          />
        ))}
      </div>
    </div>
  );
};

const getAge = (birthDate?: Date): number => {
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