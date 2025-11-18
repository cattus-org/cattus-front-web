import React, { useState, useRef } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { toast } from 'react-toastify';
import { CompanyService } from '@/Services';
import { DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CompanyDataProps {
  _id: string;
  cnpj: string;
  name: string;
  logo: string;
  phone: string;
  color: string;
}

const CompanyData: React.FC<CompanyDataProps> = ({ _id, cnpj, name, logo, phone, color }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: phone,
  });
  const [newLogo, setNewLogo] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewLogo(file);
      const previewUrl = URL.createObjectURL(file);
      setPreviewLogo(previewUrl);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      const updateData: any = {};
      
      if (formData.phone !== phone) {
        updateData['companyDetails.companyPhone'] = formData.phone;
      }

      if (newLogo) {
        const formDataToSubmit = new FormData();
        formDataToSubmit.append('companyLogo', newLogo);
        
        Object.keys(updateData).forEach(key => {
          formDataToSubmit.append(key, updateData[key]);
        });


        await CompanyService.update(_id, formDataToSubmit);
      } else if (Object.keys(updateData).length > 0) {
        await CompanyService.update(_id, updateData);
      }

      toast.success('Company data updated successfully');
      setIsEditing(false);
      setIsLoading(false);
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Error updating company data');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      phone: phone,
    });
    setNewLogo(null);
    setPreviewLogo(null);
  };

  const handleMembershipClick = () => {
    navigate('/membership');
  };

  return (
    <div className="bg-[#324250] rounded-md overflow-hidden">
      <div 
        className="p-3 flex justify-between items-center"
        style={{ backgroundColor: color || '#3c8054' }}
      >
        <h2 className="text-lg font-semibold text-white">{name}</h2>
      </div>

      <div className="p-6">
        <div className="flex flex-col items-center mb-6">
          <div 
            className="w-40 h-40 relative rounded-md overflow-hidden cursor-pointer bg-white"
            onClick={isEditing ? handleLogoClick : undefined}
          >
            <img 
              src={previewLogo || logo} 
              alt={name} 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/imgs/logo_compact.png';
              }}
            />
            {isEditing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium">Change logo</span>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">CNPJ</label>
            <Input
              value={cnpj}
              disabled
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div>
            <label className="block text-white mb-2">Phone</label>
            <Input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-center space-x-3">
          {isEditing ? (
            <div className="flex gap-3">
              <Button 
                onClick={handleCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white"
                disabled={isLoading}
              >
                CANCEL
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          ) : (
            <>
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                EDIT
              </Button>
              <Button 
                onClick={handleMembershipClick}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <DollarSign size={18} />
                SUBSCRIPTION
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyData;