import { API_URL } from './api';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

const getAnimalReport = async (animalId: string, offset: number = 0, limit: number = 50): Promise<void> => {
  try {
    const token = Cookies.get('token');
    if (!token) {
      toast.error('Session expired. Please login again.');
      return;
    }
    
    const response = await fetch(`${API_URL}/cats/report/${animalId}?offset=${offset}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error generating report');
    }

    const data = await response.json();
    
    // The API now returns { success, data: { url } }
    const reportUrl = data.data?.url;
    
    if (!reportUrl) {
      throw new Error('Report URL not found in response');
    }

    // Open the S3 URL directly to download the PDF
    // Using a proxy through an anchor element to avoid CORS issues
    const link = document.createElement('a');
    link.href = reportUrl;
    link.target = '_blank';
    link.download = 'Relatorio.pdf';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return;
  } catch (error) {
    console.error('Error generating report:', error);
    toast.error(error instanceof Error ? error.message : 'Error generating report');
    throw error;
  }
};

export default {
  getAnimalReport
};