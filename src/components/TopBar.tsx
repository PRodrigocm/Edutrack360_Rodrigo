import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Menu, Bell, User } from 'lucide-react';

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar }) => {
  const { currentUser } = useAuth();

  return (
    <div className="bg-white shadow-sm py-2 px-4 flex justify-between items-center">
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 rounded-md hover:bg-gray-100"
      >
        <Menu size={24} />
      </button>
      
      <div className="hidden md:block">
        <h2 className="text-xl font-bold text-gray-800">
          {currentUser?.role === 'admin' && 'Panel de Administrador'}
          {currentUser?.role === 'teacher' && 'Panel de Profesor'}
          {currentUser?.role === 'student' && 'Panel de Estudiante'}
        </h2>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              3
            </span>
          </button>
        </div>
        
        {/* User Menu */}
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
            <User size={18} className="text-gray-600" />
          </div>
          <span className="hidden md:block font-medium text-gray-700">
            {currentUser?.name || 'User'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;