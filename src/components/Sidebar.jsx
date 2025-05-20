import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  MapPinIcon, 
  TagIcon, 
  CarIcon, 
  ClipboardList, 
  ChartBarIcon,
  UsersIcon,
  PaletteIcon,
  LogOut
} from 'lucide-react';
import { logoutAdmin } from '@/utils/auth';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logoutAdmin();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <HomeIcon className="h-5 w-5" /> },
    { name: 'Stations', path: '/stations', icon: <MapPinIcon className="h-5 w-5" /> },
    { name: 'Categories', path: '/categories', icon: <TagIcon className="h-5 w-5" /> },
    { name: 'Colors', path: '/colors', icon: <PaletteIcon className="h-5 w-5" /> },
    { name: 'Cars', path: '/cars', icon: <CarIcon className="h-5 w-5" /> },
    { name: 'Rents', path: '/rents', icon: <ClipboardList className="h-5 w-5" /> },
    { name: 'Reports', path: '/reports', icon: <ChartBarIcon className="h-5 w-5" /> },
    { name: 'Users', path: '/users', icon: <UsersIcon className="h-5 w-5" /> },
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-20 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 pt-16 transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
    >
      <div className="h-full flex flex-col justify-between overflow-y-auto">
        <nav className="px-3 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
