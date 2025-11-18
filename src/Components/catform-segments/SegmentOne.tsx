import React, { useState, useRef, useEffect } from 'react';
import { Animal } from '@/Services/types';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';

interface SegmentOneProps {
  formData: Partial<Animal>;
  onChange: (data: Partial<Animal>) => void;
  onSaveAndFinalize: () => void;
  onSaveAndContinue: () => void;
  isLoading: boolean;
}

const SegmentOne: React.FC<SegmentOneProps> = ({
  formData,
  onChange,
  onSaveAndFinalize,
  onSaveAndContinue,
  isLoading
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(formData.picture || formData.petPicture || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Update image preview when formData changes (e.g., after save)
  useEffect(() => {
    const newPreview = formData.picture || formData.petPicture;
    if (newPreview) {
      setImagePreview(newPreview);
    }
  }, [formData.picture, formData.petPicture]);
  
  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-900 rounded-md overflow-hidden">
      <div className="p-3 bg-[#3c8054] flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Basic information and profile photo</h2>
      </div>

      <div className="p-6 bg-[#324250]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div 
              className="w-full h-100 relative flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-[#6C1482] rounded-md bg-[#6C1482]/20 text-white"
              onClick={handleImageClick}
            >
              {imagePreview ? (
                <>
                  <img 
                    src={imagePreview} 
                    alt="Cat photo preview" 
                    className="w-full h-full object-cover rounded-md"
                  />
                  <div className="absolute inset-0 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-90 text-white py-2 px-4 rounded-md">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="inline mr-2"
                      >
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                      Change image
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="48" 
                    height="48" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="mx-auto mb-4"
                  >
                    <path d="M7 10v12"></path>
                    <path d="M15 10v12"></path>
                    <path d="M3 6h18"></path>
                    <path d="M3 12h18"></path>
                    <path d="m5 16 14-4"></path>
                    <path d="M17 22H7"></path>
                    <path d="m15 6-3-4-3 4"></path>
                  </svg>
                  <p className="text-sm mb-2">Drag or click here</p>
                  <p className="text-sm">to upload a file</p>
                </div>
              )}
              <input
                id="pet-picture"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <p className="mt-2 text-center text-sm text-gray-400">Profile photo</p>
          </div>

          <div className="space-y-6">
            <div>
            <p className="text-white mb-2">Name*</p>
              <Input
                id="pet-name"
                placeholder="Cat name"
                className="bg-gray-700 border-gray-600 text-white"
                value={formData.name || formData.petName || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />           
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
              <p className="mt-1 text-sm text-gray-400">Birth Date*</p>
                <Input
                  id="pet-birth"
                  type="date"
                  className="bg-gray-700 border-gray-600 text-white"
                  value={formatDateForInput(formData.birthDate as Date | undefined)}
                  onChange={(e) => handleChange('birthDate', new Date(e.target.value))}
                  required
                />       
              </div>

              <div>
              <p className="mt-1 text-sm text-gray-400">Gender*</p>
                <Select
                  value={formData.sex || formData.petGender || ''}
                  onValueChange={(value) => handleChange('sex', value)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-gray-600">
                    <SelectItem value="macho">Male</SelectItem>
                    <SelectItem value="fêmea">Female</SelectItem>
                  </SelectContent>
                </Select>           
              </div>
            </div>

            <div>
            <p className="mt-1 text-sm text-gray-400">Observations</p>
              <Textarea
                id="pet-obs"
                placeholder="Type here any observations about the cat..."
                className="bg-gray-700 border-gray-600 text-white h-32 resize-none"
                value={formData.observations || ''}
                onChange={(e) => handleChange('observations', e.target.value)}
              />
              
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-300">
          <p>Fields marked with * are REQUIRED</p>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <Button
            onClick={onSaveAndFinalize}
            className="px-8 py-2 bg-gray-700 hover:bg-gray-600 text-white"
            disabled={isLoading}
          >
            SAVE AND FINALIZE
          </Button>
          <Button
            onClick={onSaveAndContinue}
            className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white"
            disabled={isLoading}
          >
            SAVE AND CONTINUE
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SegmentOne;