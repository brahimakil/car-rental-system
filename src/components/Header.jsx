import React from 'react';
import { User, Menu } from 'lucide-react';
import { logoutAdmin } from '@/utils/auth';
import { useNavigate } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logoutAdmin();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="ml-4 text-lg font-bold text-gray-900 dark:text-white">Car Rental System</h1>
      </div>
      
      <div className="flex items-center">
        <div className="relative group">
          <button className="p-1 rounded-full border-2 border-gray-300 hover:border-primary transition-colors duration-200">
            <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 hidden group-hover:block border border-gray-200 dark:border-gray-700">
            <button 
              onClick={handleLogout} 
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
