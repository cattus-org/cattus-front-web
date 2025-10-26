import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import Notification from './Notification';
import ProfilePopup from './ProfilePopup';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { useLocation } from 'react-router-dom';

interface JwtPayload {
  name?: string;
  id?: number;
  companyName?: string;
  company?: string | { id: number; name?: string };
  picture?: string;
  [key: string]: any;
}

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState<string>('/imgs/profile_sample.png');
  const [userCompany, setUserCompany] = useState<string>('')
  const [userCompanyId, setUserCompanyId] = useState<string>('')
  const profileBtnRef = useRef<HTMLButtonElement>(null);
 
  const location = useLocation();
  const isHomePage = location.pathname === '/home' || location.pathname === '/';
 
  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);        
        const name = decoded.name || 'Usuário';
        setUserName(name);
        if (decoded.picture){
          setProfilePicture(decoded.picture);
        }
        // Handle both old (string) and new (object) company structure
        if (decoded.company) {
          if (typeof decoded.company === 'object' && decoded.company.id) {
            setUserCompany(decoded.company.name || '');
            setUserCompanyId(decoded.company.id.toString());
          } else if (typeof decoded.company === 'string') {
            setUserCompany(decoded.company);
            setUserCompanyId(decoded.company);
          }
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);
 
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
   
    const searchEvent = new CustomEvent('cat-search', {
      detail: { query: searchQuery }
    });
   
    document.dispatchEvent(searchEvent);
  };
 
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu && 
          profileBtnRef.current && 
          !profileBtnRef.current.contains(event.target as Node)) {

        const popupElement = document.querySelector('[data-profile-popup="true"]');
        if (popupElement && !popupElement.contains(event.target as Node)) {
          setShowProfileMenu(false);
        }
      }
    };
   
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);
  
  const toggleProfileMenu = () => {
    setShowProfileMenu(prev => !prev);
  };
 
  const closeProfileMenu = () => {
    setShowProfileMenu(false);
  };
 
  return (
    <header
      className={`h-16 flex items-center justify-between px-6 ${
        isHomePage ? 'bg-transparent' : 'bg-black border-b border-gray-800'
      }`}
      style={isHomePage ? {
        background: 'linear-gradient(to bottom, rgb(60, 128, 84) 0%, rgb(55, 113, 75) 100%)'
      } : {}}
    >
      <form onSubmit={handleSearch}>
        <div className="relative w-1/2 max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            className="w-100 bg-gray-800 border-gray-700 text-white pl-10 rounded-md"
            placeholder="Pesquisar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>
     
      <div className="flex items-center space-x-4">
        {userCompanyId && (
          <Notification token={Cookies.get('token') || ''} companyId={userCompanyId} />
        )}

        <div className="relative">
          <Button
            ref={profileBtnRef}
            variant="ghost"
            className="p-0 h-auto hover:bg-transparent"
            onClick={toggleProfileMenu}
          >
            <img
              src={profilePicture}
              alt="Profile picture"
              className="w-8 h-9 rounded-full"
            />
          </Button>
         
          <ProfilePopup
            isOpen={showProfileMenu}
            onClose={closeProfileMenu}
            userName={userName}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;