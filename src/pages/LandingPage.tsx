import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, BarChart3, CheckCircle, Layers, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="text-blue-600" size={32} />
            <h1 className="text-2xl font-bold text-blue-800 logo">EduTrack 360</h1>
          </div>
          <div>
            {currentUser ? (
              <Link
                to={`/${currentUser.role}`}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition duration-300"
              >
                Ir al Panel
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition duration-300 font-semibold shadow-md hover:shadow-lg"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-md">
            La Solución Completa para Gestión Educativa
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto subtitle text-blue-100">
            Optimiza tu institución educativa con nuestro sistema integral de seguimiento y gestión
          </p>
          <Link
            to="/login"
            className="get-started-btn inline-flex items-center"
          >
            Comenzar <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-blue-800">Características Principales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="feature-card p-8 rounded-xl">
              <div className="feature-icon p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 bg-blue-100">
                <Users className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-blue-800">Gestión de Usuarios</h3>
              <p className="text-gray-700">
                Administra fácilmente administradores, profesores y estudiantes con control de acceso basado en roles.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="feature-card p-8 rounded-xl">
              <div className="feature-icon p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 bg-green-100">
                <CheckCircle className="text-green-600" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-blue-800">Control de Asistencia</h3>
              <p className="text-gray-700">
                Registra y monitorea la asistencia de los estudiantes con informes detallados y notificaciones.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="feature-card p-8 rounded-xl">
              <div className="feature-icon p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 bg-purple-100">
                <Award className="text-purple-600" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-blue-800">Gestión de Calificaciones</h3>
              <p className="text-gray-700">
                Crea tareas, califica entregas de estudiantes y realiza seguimiento del progreso académico a lo largo del tiempo.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="feature-card p-8 rounded-xl">
              <div className="feature-icon p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 bg-red-100">
                <BookOpen className="text-red-600" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-blue-800">Gestión de Cursos</h3>
              <p className="text-gray-700">
                Crea y organiza cursos, asigna profesores y matricula estudiantes de manera eficiente.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="feature-card p-8 rounded-xl">
              <div className="feature-icon p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 bg-amber-100">
                <BarChart3 className="text-amber-600" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-blue-800">Análisis de Rendimiento</h3>
              <p className="text-gray-700">
                Visualiza el rendimiento de estudiantes y clases con informes y paneles personalizables.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="feature-card p-8 rounded-xl">
              <div className="feature-icon p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 bg-cyan-100">
                <Layers className="text-cyan-600" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-blue-800">Informes Completos</h3>
              <p className="text-gray-700">
                Genera informes detallados sobre asistencia, calificaciones y rendimiento para una mejor toma de decisiones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <BookOpen size={28} className="text-blue-300" />
              <span className="text-2xl font-bold text-white">EduTrack 360</span>
            </div>
            <div className="text-blue-200 text-sm">
              &copy; {new Date().getFullYear()} EduTrack 360. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;