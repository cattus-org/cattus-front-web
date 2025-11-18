import { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { ActivityService } from '@/Services';
import { Activity } from '@/Services/types';
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  ArrowUp, 
  ArrowDown,
  Utensils
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
  activityQuantity2: string;
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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize default periods
    if (Object.keys(periods).length === 0) {
      setPeriods({ food: 7 }); // hydration: 7
    }
  }, [periods]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        // Fetch with the maximum allowed limit
        const fetchedActivities = await ActivityService.getByCat(catId, 0, 50);
        setActivities(fetchedActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (catId) {
      fetchActivities();
    }
  }, [catId]);

  useEffect(() => {
    const calculateMetrics = () => {
      if (activities.length === 0 || isLoading) return;

      const calculateSectionMetrics = (activityTitle: 'eat' | 'drink', period: number) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - period);

        const filteredActivities = activities.filter(activity => {
          const activityDate = new Date(activity.startedAt);
          return activity.title === activityTitle && activityDate >= cutoffDate;
        });

        // Count number of activities
        const count = filteredActivities.length;

        // Calculate total duration
        let totalDurationMs = 0;
        filteredActivities.forEach(activity => {
          if (activity.endedAt) {
            const start = new Date(activity.startedAt).getTime();
            const end = new Date(activity.endedAt).getTime();
            totalDurationMs += (end - start);
          }
        });

        // Format duration
        const totalMinutes = Math.floor(totalDurationMs / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const formattedDuration = `${hours}h${minutes}min`;

        // Calculate daily average
        const avgPerDay = count / period;
        const avgMinutesPerDay = totalMinutes / period;
        const avgHoursPerDay = Math.floor(avgMinutesPerDay / 60);
        const avgRemainingMinutesPerDay = Math.floor(avgMinutesPerDay % 60);
        const formattedAvgDuration = `${avgHoursPerDay}h${avgRemainingMinutesPerDay}min`;

        return {
          count,
          duration: formattedDuration,
          dailyAvg: `${avgPerDay.toFixed(1)} vezes / ${formattedAvgDuration}`
        };
      };

      const foodMetrics = calculateSectionMetrics('eat', periods['food'] || 7);
      // const hydrationMetrics = calculateSectionMetrics('drink', periods['hydration'] || 7);

      const updatedData: StatusSubsection[] = [
        {
          id: 'food',
          title: 'ALIMENTAÇÃO',
          icon: <Utensils className="h-4 w-4 text-white" />,
          tooltip: 'Tempo e frequência que o gato passou se alimentando',
          status: 'healthy',
          activityType: 'Nos últimos',
          activityQuantity: `Alimentou-se ${foodMetrics.count} vezes`,
          activityQuantity2: `Usou o pote de ração por ${foodMetrics.duration}`,
          period: periods['food'] || 7,
          activityQuantityPeriod: foodMetrics.dailyAvg,
          activityStatusChange: null,
          statusMessage: 'Dentro da média'
        }
        // {
        //   id: 'hydration',
        //   title: 'HIDRATAÇÃO',
        //   icon: <Droplet className="h-4 w-4 text-white" />,
        //   tooltip: 'Tempo e frequência que o gato passou bebendo água',
        //   status: 'healthy',
        //   activityType: 'Nos últimos',
        //   activityQuantity: `Bebeu água ${hydrationMetrics.count} vezes`,
        //   activityQuantity2: `Usou o pote de água por ${hydrationMetrics.duration}`,
        //   period: periods['hydration'] || 7,
        //   activityQuantityPeriod: hydrationMetrics.dailyAvg,
        //   activityStatusChange: null,
        //   statusMessage: 'Dentro da média'
        // }
      ];

      setStatusData(updatedData);
    };

    calculateMetrics();
  }, [activities, periods, isLoading]);

  const handlePeriodChange = (id: string, value: number) => {
    setPeriods({
      ...periods,
      [id]: value
    });
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
        <div className="grid grid-cols-1 gap-px">
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
                <div className="mb-2">
                  <p className="text-sm text-gray-400">{section.activityType}</p>
                  
                  {/* Period selector */}
                  <div className="my-2">
                    <Select 
                      defaultValue={section.period.toString()} 
                      onValueChange={(value) => handlePeriodChange(section.id, parseInt(value))}
                    >
                      <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select the period" />
                      </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-600">
                      <SelectItem value="3">3 dias</SelectItem>
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="15">15 dias</SelectItem>
                    </SelectContent>
                    </Select>
                  </div>

                  <h3 className="text-3xl font-bold text-white mt-1">{section.activityQuantity}</h3>
                  <p className="text-lg text-gray-300 mt-1">{section.activityQuantity2}</p>
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
                    <span>No changes recorded</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatStatus;