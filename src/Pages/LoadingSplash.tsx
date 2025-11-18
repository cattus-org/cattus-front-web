import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoadingSplash: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate('/home');
    }, 2000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black">
      <div className="mb-8">
        <img src="/imgs/logo_extended.png" alt="Cattus" className="h-20" />
      </div>
      
      <p className="text-white mb-6">Loading the Admin Panel</p>
      
      <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSplash;