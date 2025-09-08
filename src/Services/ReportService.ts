import { API_URL } from './api';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';



const getAnimalReport = async (animalId: string, options: string[] = ['profile']): Promise<void> => {
  try {
    const token = Cookies.get('token');
    if (!token) {
      toast.error('Sessão expirada. Faça login novamente.');
      return;
    }
    
    const response = await fetch(`${API_URL}/report/${animalId}`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ options })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error generating report');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relatorio.pdf`;
    document.body.appendChild(a);
    a.click();
    
    return;
  } catch (error) {
    console.error('Error generating report:', error);
    toast.error(error instanceof Error ? error.message : 'Erro ao gerar relatório');
    throw error;
  }
};

export default {
  getAnimalReport
};