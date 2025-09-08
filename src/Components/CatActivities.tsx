import { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/Components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Activity } from '@/Services/types';

interface CatActivitiesProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  activities: Activity[];

}

const CatActivities = ({ isExpanded, onToggleExpand, activities = [] }: CatActivitiesProps) => {
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>(activities);
  const [filterType, setFilterType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{start: string; end: string}>({
    start: '',
    end: ''
  });

  useEffect(() => {
    let filtered = [...activities];

    if (filterType !== 'all') {
      filtered = filtered.filter(activity => 
        activity.activityData.activityName === filterType
      );
    }

    if (dateRange.start) {
      filtered = filtered.filter(activity => 
        new Date(activity.activityData.activityStart) >= new Date(dateRange.start)
      );
    }
    
    if (dateRange.end) {
      filtered = filtered.filter(activity => 
        new Date(activity.activityData.activityStart) <= new Date(dateRange.end)
      );
    }
    
    setFilteredActivities(filtered);
  }, [activities, filterType, dateRange]);

  const handleFilterTypeChange = (value: string) => {
    setFilterType(value);
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const resetFilters = () => {
    setFilterType('all');
    setDateRange({ start: '', end: '' });
  };

  const activityTypes = ['all', ...new Set(activities.map(a => a.activityData.activityName))];
  
  if (!isExpanded) {
    return (
      <div className="bg-gray-900 rounded-md overflow-hidden">
        <div 
          className="p-3 bg-[#3c8054] flex justify-between items-center cursor-pointer"
          onClick={onToggleExpand}
        >
          <h2 className="text-lg font-semibold text-white">Atividades</h2>
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
        <h2 className="text-lg font-semibold text-white">Atividades</h2>
        <ChevronUp className="text-white" size={20} />
      </div>

      <div className="p-4 bg-[#324250]">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="w-full md:w-1/4">
            <Select value={filterType} onValueChange={handleFilterTypeChange}>
              <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Tipo de atividade" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white border-gray-600">
                <SelectItem value="all">Todas as atividades</SelectItem>
                {activityTypes.filter(type => type !== 'all').map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center">
              <input 
                type="date" 
                className="bg-gray-700 border-gray-600 text-white rounded-md p-2"
                value={dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
              />
              <span className="mx-2 text-white">até</span>
              <input 
                type="date" 
                className="bg-gray-700 border-gray-600 text-white rounded-md p-2"
                value={dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
              />
            </div>
            <Button 
              variant="ghost" 
              className="ml-2 text-white bg-[#6C1482] hover:bg-[#5a1069]"
              onClick={resetFilters}
            >
              Limpar
            </Button>
          </div>
        </div>

        <div className="rounded-md border border-gray-700 overflow-hidden">
          <Table>
            <TableHeader className="bg-[#375a3c]">
              <TableRow>
                <TableHead className="text-white w-40">Tipo</TableHead>
                <TableHead className="text-white w-32">Data de início</TableHead>
                <TableHead className="text-white w-32">Hora de início</TableHead>
                <TableHead className="text-white w-32">Data de término</TableHead>
                <TableHead className="text-white w-32">Hora de término</TableHead>
                <TableHead className="text-white w-24">Duração</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-[#324250]">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => {
                  const startDate = new Date(activity.activityData.activityStart);
                  const endDate = new Date(activity.activityData.activityEnd);
                  const duration = calculateDuration(startDate, endDate);
                  
                  return (
                    <TableRow key={activity._id} className="border-gray-600 hover:bg-[#3c4e5a]">
                      <TableCell className="text-white">{activity.activityData.activityName}</TableCell>
                      <TableCell className="text-white">{formatDate(startDate)}</TableCell>
                      <TableCell className="text-white">{formatTime(startDate)}</TableCell>
                      <TableCell className="text-white">{formatDate(endDate)}</TableCell>
                      <TableCell className="text-white">{formatTime(endDate)}</TableCell>
                      <TableCell className="text-white">{duration}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-400">
                    Nenhuma atividade encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

const formatDate = (date: Date): string => {
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

const formatTime = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const calculateDuration = (start: Date, end: Date): string => {
  const diff = end.getTime() - start.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  } else {
    return `${minutes} min`;
  }
};

export default CatActivities;