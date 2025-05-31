import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  ClipboardList, 
  BarChart3, 
  Calendar, 
  Settings, 
  LogOut 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, isActive }) => (
  <Link
    to={to}
    className={`flex items-center py-3 px-4 space-x-3 rounded-md transition-colors duration-200 ${
      isActive
        ? 'bg-white bg-opacity-20 text-white'
        : 'text-white text-opacity-70 hover:bg-white hover:bg-opacity-10 hover:text-white'
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const renderLinks = () => {
    if (!currentUser) return null;
    
    const baseUrl = `/${currentUser.role}`;
    
    // Common links
    const commonLinks = [
      { to: baseUrl, icon: <LayoutDashboard size={20} />, label: 'Panel Principal' },
      { to: `${baseUrl}/profile`, icon: <Settings size={20} />, label: 'Perfil' },
    ];
    
    // Role-specific links
    let roleLinks: {to: string; icon: React.ReactNode; label: string}[] = [];
    
    switch (currentUser.role) {
      case 'admin':
        roleLinks = [
          { to: `${baseUrl}/users`, icon: <Users size={20} />, label: 'Usuarios' },
          { to: `${baseUrl}/courses`, icon: <BookOpen size={20} />, label: 'Cursos' },
          { to: `${baseUrl}/students`, icon: <GraduationCap size={20} />, label: 'Estudiantes' },
          { to: `${baseUrl}/teachers`, icon: <Users size={20} />, label: 'Profesores' },
          { to: `${baseUrl}/reports`, icon: <BarChart3 size={20} />, label: 'Informes' },
        ];
        break;
      case 'teacher':
        roleLinks = [
          { to: `${baseUrl}/courses`, icon: <BookOpen size={20} />, label: 'Mis Cursos' },
          { to: `${baseUrl}/attendance`, icon: <Calendar size={20} />, label: 'Asistencia' },
          { to: `${baseUrl}/assignments`, icon: <ClipboardList size={20} />, label: 'Tareas' },
          { to: `${baseUrl}/students`, icon: <GraduationCap size={20} />, label: 'Estudiantes' },
        ];
        break;
      case 'student':
        roleLinks = [
          { to: `${baseUrl}/courses`, icon: <BookOpen size={20} />, label: 'Mis Cursos' },
          { to: `${baseUrl}/attendance`, icon: <Calendar size={20} />, label: 'Mi Asistencia' },
          { to: `${baseUrl}/assignments`, icon: <ClipboardList size={20} />, label: 'Tareas' },
          { to: `${baseUrl}/grades`, icon: <BarChart3 size={20} />, label: 'Calificaciones y Progreso' },
        ];
        break;
      default:
        roleLinks = [];
    }
    
    return [...commonLinks, ...roleLinks].map((link, index) => (
      <SidebarLink
        key={index}
        to={link.to}
        icon={link.icon}
        label={link.label}
        isActive={isActive(link.to)}
      />
    ));
  };
  
  return (
    <div
      className={`sidebar fixed top-0 left-0 h-full z-10 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
      style={{ width: '250px' }}
    >
      {/* Sidebar Brand */}
      <div className="sidebar-brand flex items-center justify-center py-4 border-b border-primary-dark">
        <BookOpen className="text-white mr-2" size={24} />
        <h2 className="text-white text-xl font-bold">EduTrack 360</h2>
      </div>
      
      {/* Sidebar Links */}
      <div className="mt-6 px-3 flex flex-col space-y-1">
        {renderLinks()}
      </div>
      
      {/* Logout */}
      <div className="absolute bottom-0 w-full px-3 pb-5">
        <button
          onClick={logout}
          className="w-full flex items-center py-3 px-4 space-x-3 text-white text-opacity-70 hover:bg-white hover:bg-opacity-10 hover:text-white rounded-md transition-colors duration-200"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;