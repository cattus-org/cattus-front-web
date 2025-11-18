import React, { useState, useRef } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { toast } from 'react-toastify';
import { EmployeeService } from '@/Services';

interface EmployeeDataProps {
  _id: string;
  name: string;
  picture: string;
  email: string;
}

const EmployeeData: React.FC<EmployeeDataProps> = ({ _id, name, picture, email }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: email,
    password: '',
    confirmPassword: '',
  });
  const [newPicture, setNewPicture] = useState<File | null>(null);
  const [previewPicture, setPreviewPicture] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPicture(file);
      const previewUrl = URL.createObjectURL(file);
      setPreviewPicture(previewUrl);
    }
  };

  const handleSave = async () => {
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);

      const updateData: any = {};
      if (formData.email !== email) {
        updateData.employeeEmail = formData.email;
      }
      
      if (formData.password) {
        updateData.employeePassword = formData.password;
      }

      if (newPicture) {
        const formDataToSubmit = new FormData();
        formDataToSubmit.append('employeePicture', newPicture);
        
        Object.keys(updateData).forEach(key => {
          formDataToSubmit.append(key, updateData[key]);
        });

        await EmployeeService.update(_id, formDataToSubmit);
      } else if (Object.keys(updateData).length > 0) {
        await EmployeeService.update(_id, updateData);
      }

      toast.success('Profile updated successfully');
      setIsEditing(false);
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setIsLoading(false);
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      email: email,
      password: '',
      confirmPassword: '',
    });
    setNewPicture(null);
    setPreviewPicture(null);
  };

  return (
    <div className="bg-[#324250] rounded-md overflow-hidden">
      <div className="p-3 bg-[#3c8054] flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">{name}</h2>
      </div>

      <div className="p-6">
        <div className="flex flex-col items-center mb-6">
          <div 
            className="w-40 h-40 relative rounded-md overflow-hidden cursor-pointer"
            onClick={isEditing ? handlePictureClick : undefined}
          >
            <img 
              src={previewPicture || picture} 
              alt={name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/imgs/profile_sample.png';
              }}
            />
            {isEditing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium">Change photo</span>
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
            <label className="block text-white mb-2">Email</label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          {isEditing && (
            <>
              <div>
                <label className="block text-white mb-2">New Password</label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Leave blank to keep current"
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">Confirm New Password</label>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Confirm new password"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-center">
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
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              EDIT
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeData;