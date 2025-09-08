import { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  ArrowUp, 
  ArrowDown,
  Utensils,
  Moon,
  ClipboardList,
  Layers
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/Components/ui/select';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/Components/ui/hover-card';

interface StatusSubsection {
  id: string;
  title: string;
  icon: React.ReactNode;
  tooltip: string;
  status: 'healthy' | 'attention' | 'critical';
  activityType: string;
  activityQuantity: string;
  period: number;
  activityQuantityPeriod: string | number;
  activityStatusChange: {
    date: string;
    direction: 'up' | 'down' | 'none';
  } | null;
  statusMessage: string;
}

interface CatStatusProps {
  catId: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const CatStatus = ({ catId, isExpanded, onToggleExpand }: CatStatusProps) => {
  const [statusData, setStatusData] = useState<StatusSubsection[]>([]);
  const [periods, setPeriods] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchStatusData = async () => {
      const mockData: StatusSubsection[] = [
        {
          id: 'food',
          title: 'ALIMENTAÇÃO',
          icon: <Utensils className="h-4 w-4 text-white" />,
          tooltip: 'Tempo que o gato passou se alimentando no tempo fixado',
          status: 'healthy',
          activityType: 'Tempo comendo nos últimos',
          activityQuantity: '11h30min',
          period: 30,
          activityQuantityPeriod: '13h02min',
          activityStatusChange: {
            date: '29-04-2025',
            direction: 'up'
          },
          statusMessage: 'Dentro da média'
        },
        {
          id: 'sleep',
          title: 'SONECA',
          icon: <Moon className="h-4 w-4 text-white" />,
          tooltip: 'Tempo que o gato passou dormindo no tempo fixado',
          status: 'attention',
          activityType: 'Tempo dormindo nos últimos',
          activityQuantity: '27h30min',
          period: 15,
          activityQuantityPeriod: '25h02min',
          activityStatusChange: {
            date: '27-04-2025',
            direction: 'down'
          },
          statusMessage: 'Ligeiramente fora da média'
        },
        {
          id: 'bathroom',
          title: 'NECESSIDADES',
          icon: <ClipboardList className="h-4 w-4 text-white" />,
          tooltip: 'Frequência com que o gato foi ao banheiro no tempo fixado',
          status: 'healthy',
          activityType: 'Idas ao banheiro no período de',
          activityQuantity: '82',
          period: 7,
          activityQuantityPeriod: '75',
          activityStatusChange: null,
          statusMessage: 'Dentro da média'
        },
        {
          id: 'activity',
          title: 'VARIADO',
          icon: <Layers className="h-4 w-4 text-white" />,
          tooltip: 'Aparições em diferentes áreas do abrigo',
          status: 'critical',
          activityType: 'Aparições no quintal dos fundos',
          activityQuantity: '17',
          period: 15,
          activityQuantityPeriod: '30',
          activityStatusChange: {
            date: '28-04-2025',
            direction: 'down'
          },
          statusMessage: 'Comportamento destoante. Verifique o gato imediatamente'
        }
      ];
      
      setStatusData(mockData);
      
      const initialPeriods: Record<string, number> = {};
      mockData.forEach(item => {
        initialPeriods[item.id] = item.period;
      });
      setPeriods(initialPeriods);
    };

    fetchStatusData();
  }, [catId]);

  const handlePeriodChange = (id: string, value: number) => {
    setPeriods({
      ...periods,
      [id]: value
    });
    
    console.log(`Period changed for ${id} to ${value} days`);
  };

  const getStatusColor = (status: 'healthy' | 'attention' | 'critical'): string => {
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

  if (!isExpanded) {
    return (
      <div className="bg-gray-900 rounded-md overflow-hidden">
        <div 
          className="p-3 bg-[#3c8054] flex justify-between items-center cursor-pointer"
          onClick={onToggleExpand}
        >
          <h2 className="text-lg font-semibold text-white">Status</h2>
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
        <h2 className="text-lg font-semibold text-white">Status</h2>
        <ChevronUp className="text-white" size={20} />
      </div>

      <div className="bg-[#324250]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px">
          {statusData.map((section) => (
            <div key={section.id} className="bg-[#404c5a] p-4">
              <div className="flex justify-between items-center mb-2">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white hover:bg-transparent">
                      <HelpCircle size={16} />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 bg-gray-700 text-white border-gray-600 p-4">
                    <p>{section.tooltip}</p>
                  </HoverCardContent>
                </HoverCard>

                {/* Status indicator and icon */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-gray-600 px-2 py-1 rounded">
                    {section.icon}
                    <span className="ml-2 text-white font-medium text-sm">{section.title}</span>
                  </div>
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getStatusColor(section.status) }}
                  ></div>
                </div>
              </div>

              {/* Activity quantity */}
              <div className="text-center my-3">
                <h3 className="text-3xl font-bold text-white">{section.activityQuantity}</h3>
                <p className="text-sm text-gray-400">{section.activityType}</p>
                
                {/* Period selector */}
                <div className="my-2">
                  <Select 
                    defaultValue={section.period.toString()} 
                    onValueChange={(value) => handlePeriodChange(section.id, parseInt(value))}
                  >
                    <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-600">
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="15">15 dias</SelectItem>
                      <SelectItem value="30">30 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Activity metrics */}
              <div className="text-center mb-3">
                <p className="text-sm text-gray-300">Média nesse período: {section.activityQuantityPeriod}</p>
                <p 
                  className="text-sm font-medium"
                  style={{ 
                    color: section.status === 'healthy' ? '#42AA49' : 
                           section.status === 'attention' ? '#FED400' : '#FF0200' 
                  }}
                >
                  {section.statusMessage}
                </p>
              </div>

              {/* Status change info */}
              <div className="text-center text-sm text-gray-400">
                {section.activityStatusChange ? (
                  <div className="flex items-center justify-center">
                    {section.activityStatusChange.direction === 'up' ? (
                      <ArrowUp size={14} className="text-green-500 mr-1" />
                    ) : section.activityStatusChange.direction === 'down' ? (
                      <ArrowDown size={14} className={`${section.status === 'critical' ? 'text-red-500' : 'text-yellow-500'} mr-1`} />
                    ) : (
                      <span>→</span>
                    )}
                    <span>Última mudança em: {section.activityStatusChange.date}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>Nenhuma mudança registrada</span>
                  </div>
                )}
              </div>

              {/* Fix period button */}
              <div className="mt-4 text-center">
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white w-full"
                  onClick={() => {
                    console.log(`Fixing period of ${periods[section.id]} days for ${section.title}`);
                    
                    alert(`Período de ${periods[section.id]} dias fixado para ${section.title}!`);
                  }}
                >
                  FIXAR PERÍODO
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatStatus;