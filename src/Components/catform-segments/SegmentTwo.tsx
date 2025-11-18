import React, { useState, useEffect } from 'react';
import { Animal } from '@/Services/types';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

interface SegmentTwoProps {
  formData: Partial<Animal>;
  onChange: (data: Partial<Animal>) => void;
  onSaveAndFinalize: () => void;
  isLoading: boolean;
}

const SegmentTwo: React.FC<SegmentTwoProps> = ({
  formData,
  onChange,
  onSaveAndFinalize,
  isLoading
}) => {
  const catName = formData.name || formData.petName || 'Cat name';
  const catGender = formData.sex || formData.petGender || '';
  const catAge = calculateAge(formData.birthDate || formData.petBirth);
  
  const [selectedComorbidities, setSelectedComorbidities] = useState<string[]>(() => {
    if (!formData.comorbidities) return [];
    
    if (Array.isArray(formData.comorbidities)) {
      // If array contains comma-separated strings, flatten them
      const flattened = formData.comorbidities.flatMap((item: any) => 
        typeof item === 'string' && item.includes(',') 
          ? item.split(',').map((c: string) => c.trim())
          : [item]
      );
      return flattened;
    }
    
    // If it's a string
    const comorbiditiesString = formData.comorbidities as string;
    if (typeof comorbiditiesString === 'string') {
      return comorbiditiesString.split(',').map((c: string) => c.trim());
    }
    
    return [];
  });

  const [selectedVaccines, setSelectedVaccines] = useState<string[]>(() => {
    if (!formData.vaccines) return [];
    
    if (Array.isArray(formData.vaccines)) {
      // If array contains comma-separated strings, flatten them
      const flattened = formData.vaccines.flatMap((item: any) => 
        typeof item === 'string' && item.includes(',') 
          ? item.split(',').map((c: string) => c.trim())
          : [item]
      );
      return flattened;
    }
    
    // If it's a string
    const vaccinesString = formData.vaccines as string;
    if (typeof vaccinesString === 'string') {
      return vaccinesString.split(',').map((c: string) => c.trim());
    }
    
    return [];
  });

  // Sync selected items when formData changes (e.g., when editing)
  useEffect(() => {
    if (!formData.comorbidities) {
      setSelectedComorbidities([]);
    } else if (Array.isArray(formData.comorbidities)) {
      const flattened = formData.comorbidities.flatMap((item: any) => 
        typeof item === 'string' && item.includes(',') 
          ? item.split(',').map((c: string) => c.trim())
          : [item]
      );
      setSelectedComorbidities(flattened);
    } else if (typeof formData.comorbidities === 'string') {
      const comorbiditiesString = formData.comorbidities as string;
      setSelectedComorbidities(comorbiditiesString.split(',').map((c: string) => c.trim()));
    }

    if (!formData.vaccines) {
      setSelectedVaccines([]);
    } else if (Array.isArray(formData.vaccines)) {
      const flattened = formData.vaccines.flatMap((item: any) => 
        typeof item === 'string' && item.includes(',') 
          ? item.split(',').map((c: string) => c.trim())
          : [item]
      );
      setSelectedVaccines(flattened);
    } else if (typeof formData.vaccines === 'string') {
      const vaccinesString = formData.vaccines as string;
      setSelectedVaccines(vaccinesString.split(',').map((c: string) => c.trim()));
    }
  }, [formData.comorbidities, formData.vaccines]);

  const comorbidities = [
    'ADHD',
    'Obese',
    'Diabetes',
    'Urinary Incontinence',
    'Chronic Kidney Disease',
    'Arthritis',
    'Lymphoma',
    'Inflammatory Bowel Disease',
    'FIV Infection',
    'Feline Leukemia (Felv)',
    'Heart Failure',
    'Hypertension',
    'Asthma',
    'Panleukopenia',
    'Feline Herpes'
  ];

  const vaccines = [
    'Rabies',
    'Feline Flu',
    'Felv',
    'Feline Triple',
    'Feline Quadruple',
    'Panleukopenia',
    'Feline Herpes',
    'Calicivirus'
  ];

  const toggleComorbidity = (comorbidity: string) => {
    setSelectedComorbidities(prev => {
      const isSelected = prev.includes(comorbidity);
      if (isSelected) {
        const updated = prev.filter(c => c !== comorbidity);
        onChange({ 
          ...formData, 
          comorbidities: updated
        });
        return updated;
      } else {
        const updated = [...prev, comorbidity];
        onChange({ 
          ...formData, 
          comorbidities: updated
        });
        return updated;
      }
    });
  };

  const toggleVaccine = (vaccine: string) => {
    setSelectedVaccines(prev => {
      const isSelected = prev.includes(vaccine);
      if (isSelected) {
        const updated = prev.filter(v => v !== vaccine);
        onChange({ 
          ...formData, 
          vaccines: updated
        });
        return updated;
      } else {
        const updated = [...prev, vaccine];
        onChange({ 
          ...formData, 
          vaccines: updated
        });
        return updated;
      }
    });
  };

  return (
    <div className="bg-gray-900 rounded-md overflow-hidden">
      <div className="p-3 bg-[#3c8054] flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Weight, Comorbidities and Vaccines</h2>
      </div>

      <div className="p-6 bg-[#324250]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="bg-[#6c1482] rounded-md overflow-hidden p-4">
              <h2 className="text-2xl font-bold text-white mb-1">{catName}</h2>
              <p className="text-white text-sm mb-2">{catGender} • {catAge} years old</p>
              
              <div className="h-72 w-full">
                <img 
                  src={formData.picture || formData.petPicture || '/imgs/cat_sample.jpg'} 
                  alt={`Photo of ${catName}`}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="col-span-2 space-y-6">
            {/* Weight */}
            <div>
              <p className="text-white mb-2">Weight (kg)</p>
              <Input
                type="number"
                className="bg-gray-700 border-gray-600 text-white"
                value={formData.weight || ''}
                onChange={(e) => onChange({ ...formData, weight: Number(e.target.value) })}
                min="0"
                step="0.1"
              />
            </div>

            {/* Neutering - commented out temporarily */}
            {/* <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="castrated" 
                checked={formData.isCastrated || false}
                onChange={(e) => onChange({ ...formData, isCastrated: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="castrated" className="text-white">Castrado/a?</label>
            </div> */}

            {/* Comorbidities */}
            <div>
              <p className="text-white mb-4">Comorbidities:</p>
              <div className="flex flex-wrap gap-2">
                {comorbidities.map((comorbidity) => {
                  const isSelected = selectedComorbidities.includes(comorbidity);
                  return (
                    <Badge
                      key={comorbidity}
                      variant="outline"
                      className={`cursor-pointer py-2 px-4 rounded-full ${
                        isSelected 
                          ? 'bg-purple-800 text-white border-purple-700' 
                          : 'bg-white text-gray-800 border-gray-300'
                      }`}
                      onClick={() => toggleComorbidity(comorbidity)}
                    >
                      {comorbidity}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Vaccines */}
            <div>
              <p className="text-white mb-4">Vaccines:</p>
              <div className="flex flex-wrap gap-2">
                {vaccines.map((vaccine) => {
                  const isSelected = selectedVaccines.includes(vaccine);
                  return (
                    <Badge
                      key={vaccine}
                      variant="outline"
                      className={`cursor-pointer py-2 px-4 rounded-full ${
                        isSelected 
                          ? 'bg-green-600 text-white border-green-500' 
                          : 'bg-white text-gray-800 border-gray-300'
                      }`}
                      onClick={() => toggleVaccine(vaccine)}
                    >
                      {vaccine}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        </div>



        <div className="mt-6 flex justify-end space-x-4">
          <Button
            onClick={onSaveAndFinalize}
            className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white"
            disabled={isLoading}
          >
            SAVE AND FINALIZE
          </Button>
        </div>
      </div>
    </div>
  );
};

const calculateAge = (birthDate?: Date | string): number => {
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

export default SegmentTwo;
