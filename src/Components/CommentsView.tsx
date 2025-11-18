import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';

interface FeedbackComment {
  id: string;
  text: string;
  date: string;
  status: 'pending' | 'in-progress' | 'resolved';
}

interface CommentsViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommentsView: React.FC<CommentsViewProps> = ({
  open,
  onOpenChange
}) => {
  const [comments] = useState<FeedbackComment[]>([
    {
      id: '1',
      text: 'It would be cool if there was a way to view multiple cats at the same time on different cameras.',
      date: '18/05/2025',
      status: 'pending'
    },
    {
      id: '2',
      text: 'The notification system is very useful, but I would like there to be options to customize which alerts I receive.',
      date: '14/05/2025',
      status: 'in-progress'
    },
    {
      id: '3',
      text: 'I found a bug on the statistics screen where the graphs don\'t load correctly on Firefox.',
      date: '10/05/2025',
      status: 'resolved'
    }
  ]);

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="text-xs py-1 px-2 bg-yellow-500/20 text-yellow-500 rounded-full">Pending</span>;
      case 'in-progress':
        return <span className="text-xs py-1 px-2 bg-blue-500/20 text-blue-500 rounded-full">In review</span>;
      case 'resolved':
        return <span className="text-xs py-1 px-2 bg-green-500/20 text-green-500 rounded-full">Resolved</span>;
      default:
        return <span className="text-xs py-1 px-2 bg-gray-500/20 text-gray-500 rounded-full">Unknown</span>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-2xl">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="text-xl font-semibold">Your Comments</DialogTitle>
        </DialogHeader>

        <div className="mt-4 mb-4">
          {comments.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <p>You haven't sent any feedback yet.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-700 rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <img
                        src="/imgs/profile_sample.png"
                        alt="Profile"
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span className="font-medium">You</span>
                    </div>
                    {getStatusBadge(comment.status)}
                  </div>
                  <p className="text-gray-200 mb-2">{comment.text}</p>
                  <p className="text-xs text-gray-400">Sent on {comment.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button 
            className="bg-gray-700 hover:bg-gray-600"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentsView;