import React from 'react';
import { Animal } from '@/Services/types';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';

interface SegmentThreeProps {
  formData: Partial<Animal>;
  onChange: (data: Partial<Animal>) => void;
  onSaveAndFinalize: () => void;
  onSaveAndContinue: () => void;
  isLoading: boolean;
}

const SegmentThree: React.FC<SegmentThreeProps> = ({
  formData,
  onChange,
  onSaveAndFinalize,
  onSaveAndContinue,
  isLoading
}) => {
  const behavioralCharacteristics = formData.behavioralCharacteristics || {
    personality: '',
    activityLevel: '',
    socialBehavior: '',
    meow: '',
  };

  const catName = formData.petName || 'Nome do gato';
  const catGender = formData.petGender || '';
  const catAge = calculateAge(formData.petBirth);

  const handleBehavioralCharacteristicsChange = (field: keyof typeof behavioralCharacteristics, value: string) => {
    const updatedCharacteristics = {
      ...behavioralCharacteristics,
      [field]: value,
    };
    
    onChange({
      ...formData,
      behavioralCharacteristics: updatedCharacteristics,
    });
  };

  return (
    <div className="bg-gray-900 rounded-md overflow-hidden">
      <div className="p-3 bg-[#3c8054] flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Comportamento social</h2>
      </div>

      <div className="p-6 bg-[#324250]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="bg-[#6c1482] rounded-md overflow-hidden p-4">
              <h2 className="text-2xl font-bold text-white mb-1">{catName}</h2>
              <p className="text-white text-sm mb-2">{catGender} • {catAge} anos</p>
              
              <div className="h-72 w-full">
                <img 
                  src={formData.petPicture || '/imgs/cat_sample.jpg'} 
                  alt={`Foto de ${catName}`}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-white mb-2">Personalidade*:</p>
                <Select
                  value={behavioralCharacteristics.personality}
                  onValueChange={(value) => handleBehavioralCharacteristicsChange('personality', value)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-gray-600">
                    <SelectItem value="amigável">Amigável</SelectItem>
                    <SelectItem value="reservado">Reservado</SelectItem>
                    <SelectItem value="brincalhão">Brincalhão</SelectItem>
                    <SelectItem value="independente">Independente</SelectItem>
                    <SelectItem value="arisco">Arisco</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-white mb-2">Nível de atividade*:</p>
                <Select
                  value={behavioralCharacteristics.activityLevel}
                  onValueChange={(value) => handleBehavioralCharacteristicsChange('activityLevel', value)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-gray-600">
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="moderado">Moderado</SelectItem>
                    <SelectItem value="calmo">Calmo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-white mb-2">Miado:</p>
                <Select
                  value={behavioralCharacteristics.meow}
                  onValueChange={(value) => handleBehavioralCharacteristicsChange('meow', value)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-gray-600">
                    <SelectItem value="silencioso">Silencioso</SelectItem>
                    <SelectItem value="ocasional">Ocasional</SelectItem>
                    <SelectItem value="frequente">Frequente</SelectItem>
                    <SelectItem value="muito vocal">Muito vocal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <p className="text-white mb-2">Peculiaridades:</p>
              <Textarea
                className="bg-gray-700 border-gray-600 text-white h-24 resize-none"
                value={behavioralCharacteristics.socialBehavior}
                onChange={(e) => handleBehavioralCharacteristicsChange('socialBehavior', e.target.value)}
                placeholder="Descreva comportamentos específicos, preferências ou outras peculiaridades do gato..."
              />
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-300 text-right">
          <p>Itens com * são OBRIGATÓRIOS</p>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <Button
            onClick={onSaveAndFinalize}
            className="px-8 py-2 bg-gray-700 hover:bg-gray-600 text-white"
            disabled={isLoading}
          >
            SALVAR E FINALIZAR
          </Button>
          <Button
            onClick={onSaveAndContinue}
            className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white"
            disabled={isLoading}
          >
            SALVAR E PROSSEGUIR
          </Button>
        </div>
      </div>
    </div>
  );
};

const calculateAge = (birthDate?: Date): number => {
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

export default SegmentThree;