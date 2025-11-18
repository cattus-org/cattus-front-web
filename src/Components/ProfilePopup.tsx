import { useRef, useEffect, useState } from 'react';
import { User, MessageSquare, LogOut, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { AuthService } from '../Services';
import FeedbackModal from './FeedbackModal';
import CommentsView from './CommentsView';

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

const ProfilePopup = ({ isOpen, onClose, userName = 'Usuário' }: ProfilePopupProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [commentsViewOpen, setCommentsViewOpen] = useState(false);

    const handleProfileClick = () => {
    onClose();
    navigate('/profile');
  };
  
  useEffect(() => {
    if (!isOpen) {
    } else {
      setFeedbackModalOpen(false);
      setCommentsViewOpen(false);
    }
  }, [isOpen]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);

      Cookies.remove("token");
      navigate('/login');
    }
  };

  const handleOpenFeedback = () => {
    onClose();
    setTimeout(() => {
      setFeedbackModalOpen(true);
    }, 50);
  };

  const handleViewComments = () => {
    onClose();
    setTimeout(() => {
      setCommentsViewOpen(true);
    }, 50);
  };
  
  if (!isOpen) return null;
  
  return (
    <>
      <div 
        ref={menuRef}
        data-profile-popup="true"
        className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg z-50 overflow-hidden border border-gray-800"
      >
        <div className="px-4 py-3 border-b border-gray-800">
          <p className="text-sm font-medium text-white truncate">{userName}</p>
        </div>
        
        <div className="py-1">
          <button 
              className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
              onClick={handleProfileClick}
            >
              <User size={16} className="mr-2" />
              <span>Profile</span>
            </button>
          <button 
            className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
            onClick={handleViewComments}
          >
            <MessageSquare size={16} className="mr-2" />
            <span>Comments</span>
          </button>
          <button 
            className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
            onClick={handleOpenFeedback}
          >
            <HelpCircle size={16} className="mr-2" />
            <span>Send Feedback</span>
          </button>
          <div className="border-t border-gray-800 my-1"></div>
          <button 
            className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Only render these components when they are open */}
      {feedbackModalOpen && (
        <FeedbackModal 
          open={feedbackModalOpen} 
          onOpenChange={setFeedbackModalOpen} 
        />
      )}

      {commentsViewOpen && (
        <CommentsView
          open={commentsViewOpen}
          onOpenChange={setCommentsViewOpen}
        />
      )}
    </>
  );
};

export default ProfilePopup;