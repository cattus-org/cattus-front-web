import React from 'react';
import { Animal } from '@/Services/types';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';

interface SegmentTwoProps {
  formData: Partial<Animal>;
  onChange: (data: Partial<Animal>) => void;
  onSaveAndFinalize: () => void;
  onSaveAndContinue: () => void;
  isLoading: boolean;
}

const SegmentTwo: React.FC<SegmentTwoProps> = ({
  formData,
  onChange,
  onSaveAndFinalize,
  onSaveAndContinue,
  isLoading
}) => {
  const physicalCharacteristics = formData.physicalCharacteristics || {
    furColor: '',
    furLength: '',
    eyeColor: '',
    size: 0,
    weight: 0,
  };

  const petCharacteristics = formData.petCharacteristics || {
    petCastrated: '',
    petBreed: '',
    petSize: '',
  };

  const catName = formData.petName || 'Nome do gato';
  const catGender = formData.petGender || '';
  const catAge = calculateAge(formData.petBirth);

  const handlePetCharacteristicsChange = (field: keyof typeof petCharacteristics, value: string) => {
    const updatedCharacteristics = {
      ...petCharacteristics,
      [field]: value,
    };
    
    onChange({
      ...formData,
      petCharacteristics: updatedCharacteristics,
    });
  };

  const handlePhysicalCharacteristicsChange = (field: keyof typeof physicalCharacteristics, value: any) => {
    const updatedCharacteristics = {
      ...physicalCharacteristics,
      [field]: value,
    };
    
    onChange({
      ...formData,
      physicalCharacteristics: updatedCharacteristics,
    });
  };

  const handleCastratedChange = (checked: boolean) => {
    handlePetCharacteristicsChange('petCastrated', checked ? 'Sim' : 'Não');
  };

  return (
    <div className="bg-gray-900 rounded-md overflow-hidden">
      <div className="p-3 bg-[#3c8054] flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Características físicas</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-white mb-2">Raça</p>
                <Select
                  value={petCharacteristics.petBreed}
                  onValueChange={(value) => handlePetCharacteristicsChange('petBreed', value)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-gray-600">
                    <SelectItem value="Siamês">Siamês</SelectItem>
                    <SelectItem value="Persa">Persa</SelectItem>
                    <SelectItem value="Maine Coon">Maine Coon</SelectItem>
                    <SelectItem value="Bengal">Bengal</SelectItem>
                    <SelectItem value="Ragdoll">Ragdoll</SelectItem>
                    <SelectItem value="Sphynx">Sphynx</SelectItem>
                    <SelectItem value="British Shorthair">British Shorthair</SelectItem>
                    <SelectItem value="Abissínio">Abissínio</SelectItem>
                    <SelectItem value="SRD">SRD (Sem Raça Definida)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-white mb-2">Cor predominante</p>
                <Select
                  value={physicalCharacteristics.furColor}
                  onValueChange={(value) => handlePhysicalCharacteristicsChange('furColor', value)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-gray-600">
                    <SelectItem value="preta">Preta</SelectItem>
                    <SelectItem value="branca">Branca</SelectItem>
                    <SelectItem value="cinza">Cinza</SelectItem>
                    <SelectItem value="laranja">Laranja</SelectItem>
                    <SelectItem value="marrom">Marrom</SelectItem>
                    <SelectItem value="mesclada">Mesclada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-white mb-2">Tamanho (cm)</p>
                <Input
                  type="number"
                  className="bg-gray-700 border-gray-600 text-white"
                  value={physicalCharacteristics.size || ''}
                  onChange={(e) => handlePhysicalCharacteristicsChange('size', Number(e.target.value))}
                  min="0"
                  step="1"
                />
              </div>

              <div>
                <p className="text-white mb-2">Peso (kg)</p>
                <Input
                  type="number"
                  className="bg-gray-700 border-gray-600 text-white"
                  value={physicalCharacteristics.weight || ''}
                  onChange={(e) => handlePhysicalCharacteristicsChange('weight', Number(e.target.value))}
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <p className="text-white mb-2">Pelagem</p>
                <Select
                  value={physicalCharacteristics.furLength}
                  onValueChange={(value) => handlePhysicalCharacteristicsChange('furLength', value)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-gray-600">
                    <SelectItem value="curto">Curto</SelectItem>
                    <SelectItem value="médio">Médio</SelectItem>
                    <SelectItem value="longo">Longo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-white mb-2">Cor dos olhos</p>
                <Select
                  value={physicalCharacteristics.eyeColor}
                  onValueChange={(value) => handlePhysicalCharacteristicsChange('eyeColor', value)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-gray-600">
                    <SelectItem value="azul">Azul</SelectItem>
                    <SelectItem value="verde">Verde</SelectItem>
                    <SelectItem value="castanho">Castanho</SelectItem>
                    <SelectItem value="âmbar">Âmbar</SelectItem>
                    <SelectItem value="heterocromia">Heterocromia (olhos de cores diferentes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center">
                <div className="flex items-center space-x-2 mt-8">
                  <Checkbox 
                    id="castrated" 
                    checked={petCharacteristics.petCastrated === 'Sim'}
                    onCheckedChange={handleCastratedChange}
                    className="bg-white"
                  />
                  <Label htmlFor="castrated" className="text-white">Castrado/a?</Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-300 text-center">
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

export default SegmentTwo;