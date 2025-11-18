import React from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/Components/ui/hover-card';
import { Star } from 'lucide-react';

interface CatViewTooltipProps {
  children: React.ReactNode;
}

const CatViewTooltip = ({ children }: CatViewTooltipProps) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-gray-700 text-white border-gray-600 p-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Legend</h3>
          
          <div className="space-y-3">
            <h4 className="font-medium">Status</h4>
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 rounded-full bg-green-500 mt-1"></div>
              <p className="text-sm">Healthy, no anomalies detected</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500 mt-1"></div>
              <p className="text-sm">Alert, slightly unusual behavior</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500 mt-1"></div>
              <p className="text-sm">Critical, exhibits anomalous behavior</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Monitoring</h4>
            <div className="flex items-start space-x-2">
              <Star className="h-4 w-4 fill-white text-white mt-1" />
              <p className="text-sm">Marked cat, priority display</p>
            </div>
            <div className="flex items-start space-x-2">
              <Star className="h-4 w-4 text-white mt-1" />
              <p className="text-sm">Unmarked cat, no priority display</p>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default CatViewTooltip;