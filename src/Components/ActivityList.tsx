import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Button } from '@/Components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Animal, Camera } from '@/Services';

export interface ActivityItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  startedAt?: string;
  endedAt?: string;
  metadata?: Record<string, string>;
  cat: Animal;
  camera: Camera
  onClick?: () => void;
}

interface ActivityListProps {
  title?: string;
  items: ActivityItem[];
  maxHeight?: string;
  onItemClick?: (item: ActivityItem) => void;
  emptyMessage?: string;
  loading?: boolean;
}

const ActivityList = ({
  title = "Atividades",
  items,
  maxHeight = "calc(100vh-260px)",
  onItemClick,
  emptyMessage = "Não há atividades para exibir",
  loading = false
}: ActivityListProps) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const toggleExpand = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleItemClick = (item: ActivityItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (onItemClick) {
      onItemClick(item);
    } else if (item.cat.id) {
      navigate(`/cats/${item.cat.id}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1A1B21] rounded-md h-full overflow-hidden flex flex-col">
        {title && (
          <div className="p-3 text-center bg-[#6c1482] border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center" style={{height: maxHeight}}>
          <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#181920] rounded-md h-full overflow-hidden flex flex-col">
      {title && (
        <div className="p-3 text-center bg-[#6c1482] border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      )}
      <ScrollArea className="flex-1" style={{height: maxHeight}}>
        <div className="divide-y divide-[#2c2d33]">
          {items.length > 0 ? (
            items.map((item, index) => (
              <div 
                key={`${item.id}-${index}`}
                className="bg-[#23242a] cursor-pointer border-b border-[#393a40]"
                onClick={() => handleItemClick(item)}
                style={{paddingTop: 0, paddingBottom: 0}}
              >
                <div className="flex items-center justify-between px-4 pt-4">
                  <span className="text-sm text-gray-300 font-medium flex items-center gap-2">
                    {(() => {
                      if (item.startedAt) {
                        const d = new Date(item.startedAt);
                        const pad = (n: number) => n.toString().padStart(2, '0');
                        const timeStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)} - ${pad(d.getHours())}h${pad(d.getMinutes())}`;
                        if (item.startedAt === item.endedAt) {
                          return <>
                            {timeStr}
                            <span className="ml-2 px-2 py-0.5 rounded bg-yellow-600 text-yellow-100 text-xs font-semibold">Em andamento</span>
                          </>;
                        }
                        return timeStr;
                      }
                      return '';
                    })()}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-gray-400"
                    onClick={(e) => toggleExpand(e, item.id)}
                  >
                    {expandedItems[item.id] ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </Button>
                </div>
                <div className="flex items-center px-4 pb-4 pt-2">
                  <div className="relative mr-3">
                    <img 
                      src={item.cat.picture} 
                      alt="Cat Picture"
                      className="w-14 h-14 rounded-lg object-cover border-2 border-[#393a40]" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-base leading-tight">{item.cat.name}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span>{item.cat.sex}</span>
                      <span>·</span>
                      <span>{(() => {
                        if (item.cat.birthDate) {
                          const birth = new Date(item.cat.birthDate);
                          const now = new Date();
                          let age = now.getFullYear() - birth.getFullYear();
                          const m = now.getMonth() - birth.getMonth();
                          if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
                            age--;
                          }
                          return `${age} anos`;
                        }
                        return '';
                      })()}</span>
                      <span>·</span>
                      <span>CID: {item.cat.id || 'CID desconhecido'}</span>
                    </div>
                  </div>
                </div>
                {expandedItems[item.id] && (
                  <div className="px-6 pb-4 text-sm text-gray-300">
                    <div className="pt-2">
                      <p className="mb-1">
                        Última aparição: {(() => {
                          if (item.endedAt) {
                            const d = new Date(item.endedAt);
                            const pad = (n: number) => n.toString().padStart(2, '0');
                            const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
                            const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
                            return `${dateStr} às ${timeStr}`;
                          }
                          return '';
                        })()}
                      </p>
                      {item.startedAt !== item.endedAt && item.startedAt && item.endedAt && (
                        <p className="mb-1">
                          Duração: {(() => {
                            const start = new Date(item.startedAt).getTime();
                            const end = new Date(item.endedAt).getTime();
                            const diffMs = end - start;
                            if (diffMs > 0) {
                              const totalSeconds = Math.floor(diffMs / 1000);
                              const hours = Math.floor(totalSeconds / 3600);
                              const minutes = Math.floor((totalSeconds % 3600) / 60);
                              const seconds = totalSeconds % 60;
                              const pad = (n: number) => n.toString().padStart(2, '0');
                              return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
                            }
                            return '00:00:00';
                          })()}
                        </p>
                      )}
                      <p className="mb-1">Estado: {item.cat.status || 'Status desconhecido'}</p>
                      <p className="mb-1">Localização: {item.camera.name || 'Localização desconhecida'}</p>
                      {item.title && (
                        <p>Atividade: {item.title}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-400">
              {emptyMessage}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ActivityList;