import { toast } from 'react-toastify';

interface FeedbackResponse {
  ok: boolean;
  message?: string;
  _id?: string;
}

interface FeedbackData {
  feedbackText: string;
  feedbackAuthor?: string;
  company?: string; 
}

const submitFeedback = async (_data: FeedbackData): Promise<FeedbackResponse> => {
  try {
    // Placeholder
    // return await postDataJSON<FeedbackResponse>('/feedback/create', data, "Feedback enviado com sucesso!");
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      ok: true,
      message: "Feedback enviado com sucesso!",
      _id: "placeholder-id"
    };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    toast.error('Erro ao enviar feedback. Tente novamente mais tarde.');
    throw error;
  }
};

export default {
  submitFeedback
};