import React from 'react';
import { Users, ClipboardCheck, FileCheck, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import Chart from '../../components/Chart';
import UpcomingClassesCard from '../../components/UpcomingClassesCard';

const TeacherHome = () => {
  // Mock data for charts
  const attendanceData = {
    labels: ['Presentes', 'Ausentes', 'Tardanzas'],
    datasets: [
      {
        label: 'Resumen de Asistencia',
        data: [85, 10, 5],
        backgroundColor: ['#1cc88a', '#e74a3b', '#f6c23e'],
        hoverBackgroundColor: ['#17a673', '#d03b2f', '#dca834'],
        hoverBorderColor: 'rgba(234, 236, 244, 1)',
      },
    ],
  };

  const performanceData = {
    labels: ['Matemáticas 101', 'Ciencias 202', 'Historia 303', 'Lenguaje 404'],
    datasets: [
      {
        label: 'Calificación Promedio',
        data: [78, 82, 75, 88],
        backgroundColor: [
          'rgba(78, 115, 223, 0.8)',
          'rgba(28, 200, 138, 0.8)',
          'rgba(246, 194, 62, 0.8)',
          'rgba(54, 185, 204, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Panel del Profesor</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total de Estudiantes"
          value="120"
          icon={<Users size={24} className="text-primary" />}
          bgColor="bg-primary"
          link="/teacher/students"
        />
        <StatCard 
          title="Clases Hoy"
          value="4"
          icon={<ClipboardCheck size={24} className="text-success" />}
          bgColor="bg-success"
          link="/teacher/courses"
        />
        <StatCard 
          title="Tareas Pendientes"
          value="12"
          icon={<FileCheck size={24} className="text-warning" />}
          bgColor="bg-warning"
          link="/teacher/assignments"
        />
        <StatCard 
          title="Asistencia Promedio"
          value="85%"
          icon={<BarChart3 size={24} className="text-info" />}
          bgColor="bg-info"
          link="/teacher/attendance"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Resumen de Asistencia</h2>
          <Chart type="doughnut" data={attendanceData} />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Rendimiento por Curso</h2>
          <Chart type="bar" data={performanceData} />
        </div>
      </div>
      
      {/* Upcoming Classes */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-700">Próximas Clases</h2>
          <Link to="/teacher/courses" className="text-primary hover:text-primary-dark text-sm font-medium">
            Ver Todas
          </Link>
        </div>
        <UpcomingClassesCard />
      </div>
    </div>
  );
};

export default TeacherHome;