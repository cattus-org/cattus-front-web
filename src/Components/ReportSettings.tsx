import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/Components/ui/dialog';
import { Switch } from '@/Components/ui/switch';
import { Button } from '@/Components/ui/button';

interface ReportSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateReport: (options: string[]) => void;
}

const ReportSettings: React.FC<ReportSettingsProps> = ({
  open,
  onOpenChange,
  onGenerateReport
}) => {
  const [options, setOptions] = useState({
    profile: true,
    status: true,
    activities: true
  });

  const handleToggle = (option: 'profile' | 'status' | 'activities') => {
    if (option === 'profile') return;

    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleGenerate = () => {
    const selectedOptions = Object.entries(options)
      .filter(([_, value]) => value)
      .map(([key]) => key);
    
    onGenerateReport(selectedOptions);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-md">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="text-xl font-semibold">Report</DialogTitle>
        </DialogHeader>

        <div className="mt-4 mb-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">Perfil</span>
              <Switch
                checked={options.profile}
                disabled={true}
                onCheckedChange={() => handleToggle('profile')}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white">Status</span>
              <Switch
                checked={options.status}
                onCheckedChange={() => handleToggle('status')}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white">Atividades</span>
              <Switch
                checked={options.activities}
                onCheckedChange={() => handleToggle('activities')}
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          GERAR
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ReportSettings;