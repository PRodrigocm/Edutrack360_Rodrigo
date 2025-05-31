import React from 'react';
import { Users, BookOpen, GraduationCap, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import RecentActivitiesCard from '../../components/RecentActivitiesCard';
import Chart from '../../components/Chart';

const AdminHome = () => {
  // Mock data for charts
  const userDistributionData = {
    labels: ['Estudiantes', 'Profesores', 'Administradores'],
    datasets: [
      {
        label: 'Distribución de Usuarios',
        data: [350, 45, 5],
        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
        hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf'],
        hoverBorderColor: 'rgba(234, 236, 244, 1)',
      },
    ],
  };

  const enrollmentData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Inscripciones',
        lineTension: 0.3,
        backgroundColor: 'rgba(78, 115, 223, 0.05)',
        borderColor: 'rgba(78, 115, 223, 1)',
        pointRadius: 3,
        pointBackgroundColor: 'rgba(78, 115, 223, 1)',
        pointBorderColor: 'rgba(78, 115, 223, 1)',
        pointHoverRadius: 3,
        pointHoverBackgroundColor: 'rgba(78, 115, 223, 1)',
        pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
        pointHitRadius: 10,
        pointBorderWidth: 2,
        data: [0, 10000, 5000, 15000, 10000, 20000, 15000, 25000, 20000, 30000, 25000, 40000],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Panel Principal</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Estudiantes"
          value="350"
          icon={<GraduationCap size={24} className="text-primary" />}
          bgColor="bg-primary"
          link="/admin/students"
        />
        <StatCard 
          title="Total Profesores"
          value="45"
          icon={<Users size={24} className="text-success" />}
          bgColor="bg-success"
          link="/admin/teachers"
        />
        <StatCard 
          title="Total Cursos"
          value="28"
          icon={<BookOpen size={24} className="text-warning" />}
          bgColor="bg-warning"
          link="/admin/courses"
        />
        <StatCard 
          title="Tareas Activas"
          value="18"
          icon={<ClipboardList size={24} className="text-info" />}
          bgColor="bg-info"
          link="/admin/assignments"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Tendencia de Inscripciones</h2>
          <Chart type="line" data={enrollmentData} />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Distribución de Usuarios</h2>
          <Chart type="doughnut" data={userDistributionData} />
        </div>
      </div>
      
      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-700">Actividades Recientes</h2>
          <Link to="/admin/reports" className="text-primary hover:text-primary-dark text-sm font-medium">
            Ver Todo
          </Link>
        </div>
        <RecentActivitiesCard />
      </div>
    </div>
  );
};

export default AdminHome;