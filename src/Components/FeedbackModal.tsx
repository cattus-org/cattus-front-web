import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/Components/ui/dialog';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { toast } from 'react-toastify';

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  open,
  onOpenChange
}) => {
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast.error('Please write your feedback before sending.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Feedback sent successfully!');
      setFeedback('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Error sending feedback. Try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-md">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="text-xl font-semibold">Send Feedback</DialogTitle>
        </DialogHeader>

        <div className="mt-4 mb-4">
          <label className="block text-white mb-2">
            Give us your feedback about the system:
          </label>
          <Textarea
            className="bg-gray-700 border-gray-600 text-white h-32 resize-none"
            placeholder="Write your suggestions, problems, or questions here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button 
              variant="outline" 
              className="text-black border-gray-600 hover:bg-purple-700 hover:text-white"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;