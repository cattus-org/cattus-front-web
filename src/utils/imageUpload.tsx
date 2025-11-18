import { toast } from 'react-toastify';
import { api } from '@/Services';

interface ImageUploadResponse {
  success: boolean;
  message: string;
  data?: {
    url: string;
    key?: string;
    filename?: string;
  };
}

export const uploadImageFile = async (file: File): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.uploadImage<ImageUploadResponse>(formData);
    
    if (response.success && response.data?.url) {
      console.log('Image uploaded successfully, URL:', response.data.url);
      return response.data.url;
    } else {
      toast.error(response.message || 'Error uploading image');
      console.error('Error uploading image:', response);
      return null;
    }
  } catch (error) {
    console.error('Error uploading image: ', error);
    toast.error('Error uploading image. Try again.');
    return null;
  }
};