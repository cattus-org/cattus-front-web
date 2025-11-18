import React from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/Components/ui/hover-card';

interface CameraViewTooltipProps {
  children: React.ReactNode;
}

const CameraViewTooltip = ({ children }: CameraViewTooltipProps) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-gray-700 text-white border-gray-600 p-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Information</h3>
          
          <div className="space-y-3">
            <h4 className="font-medium">Cameras</h4>
            <p className="text-sm">
              Click on the thumbnail to expand the camera video. Cameras show live streaming with approximately 5 seconds delay.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Filters</h4>
            <p className="text-sm">
              Use the filter button to select cameras by location or view only cameras with presence detection.
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default CameraViewTooltip;