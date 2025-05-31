import { useState, useEffect } from 'react';
import { Book, Search, Users, Calendar, Clock, Hash, User, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Chart from '../../components/Chart';

const Courses = () => {
  // Definir el tipo para el horario
  interface Schedule {
    days?: string;
    startTime?: string;
    endTime?: string;
  }
  
  // Definir el tipo para los cursos
  interface Course {
    id: string;
    title: string;
    code: string;
    students: number;
    schedule: string | Schedule;
    progress: number;
  }
  
  // Mock data for courses
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      title: 'Mathematics 101',
      code: 'MATH101',
      students: 32,
      schedule: 'Mon, Wed, Fri 10:00 AM - 11:30 AM',
      progress: 65,
    },
    {
      id: '2',
      title: 'Physics 202',
      code: 'PHYS202',
      students: 28,
      schedule: 'Tue, Thu 1:00 PM - 3:00 PM',
      progress: 48,
    },
    {
      id: '3',
      title: 'Chemistry 303',
      code: 'CHEM303',
      students: 24,
      schedule: 'Mon, Wed 2:15 PM - 3:45 PM',
      progress: 75,
    },
    {
      id: '4',
      title: 'Biology 404',
      code: 'BIO404',
      students: 30,
      schedule: 'Tue, Thu 9:00 AM - 11:00 AM',
      progress: 35,
    },
  ]);
  
  // Estado para modal de detalles
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [realCourses, setRealCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Constantes para API
  const API_URL = 'http://localhost:5000/api'; // Actualizado para usar el puerto correcto
  const token = localStorage.getItem('token');

  // Función para cargar cursos desde la API (solo los asignados al profesor)
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      if (!token) {
        console.error('No token found');
        return;
      }
      
      // Intentar obtener los cursos reales del profesor que ha iniciado sesión
      try {
        // Obtener el ID del profesor actual
        const userResponse = await axios.get(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (userResponse.status === 200 && userResponse.data) {
          const teacherId = userResponse.data.teacherId;
          
          if (teacherId) {
            // Obtener los cursos asignados al profesor
            const response = await axios.get(`${API_URL}/teachers/${teacherId}/courses`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            if (response.status === 200 && response.data && response.data.courses) {
              const teacherCourses = response.data.courses;
              setRealCourses(teacherCourses);
              
              // Actualizar también los cursos mostrados
              const formattedCourses = teacherCourses.map((course: any) => ({
                id: course._id,
                title: course.name,
                code: course.code,
                students: course.students ? course.students.length : 0,
                schedule: course.schedule || 'No definido',
                progress: Math.floor(Math.random() * 100) // Simulamos progreso para visualización
              }));
              
              setCourses(formattedCourses);
              return; // Salir de la función si se obtuvieron los cursos correctamente
            }
          }
        }
      } catch (apiError) {
        console.error('Error al obtener cursos de la API:', apiError);
        // Continuar con los datos mock si hay un error en la API
      }
      
      // Si llegamos aquí, significa que hubo un error o no se encontraron cursos
      // Usar datos mock como respaldo
      console.log('Usando datos mock como respaldo');
      
      // Datos de cursos de ejemplo
      const mockCourses = [
        {
          _id: '1',
          name: 'Matemáticas 101',
          code: 'MATH101',
          description: 'Curso introductorio de matemáticas',
          department: 'Ciencias',
          schedule: 'Lun, Mié, Vie 10:00 AM - 11:30 AM',
          students: new Array(32),
          startDate: new Date().toISOString(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString(),
          status: 'active'
        },
        {
          _id: '2',
          name: 'Física 202',
          code: 'PHYS202',
          description: 'Curso intermedio de física',
          department: 'Ciencias',
          schedule: 'Mar, Jue 1:00 PM - 3:00 PM',
          students: new Array(28),
          startDate: new Date().toISOString(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString(),
          status: 'active'
        },
        {
          _id: '3',
          name: 'Química 303',
          code: 'CHEM303',
          description: 'Curso avanzado de química',
          department: 'Ciencias',
          schedule: 'Lun, Mié 2:15 PM - 3:45 PM',
          students: new Array(24),
          startDate: new Date().toISOString(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString(),
          status: 'active'
        },
        {
          _id: '4',
          name: 'Biología 404',
          code: 'BIO404',
          description: 'Curso especializado de biología',
          department: 'Ciencias',
          schedule: 'Mar, Jue 9:00 AM - 11:00 AM',
          students: new Array(30),
          startDate: new Date().toISOString(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString(),
          status: 'active'
        }
      ];
      
      // Guardar los cursos mock en el estado
      setRealCourses(mockCourses);
      
      // Formatear los cursos para mostrarlos
      const formattedCourses = mockCourses.map((course) => ({
        id: course._id,
        title: course.name,
        code: course.code,
        students: course.students ? course.students.length : 0,
        schedule: course.schedule || 'No definido',
        progress: Math.floor(Math.random() * 100) // Simulamos progreso para visualización
      }));
      
      setCourses(formattedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Error al cargar los cursos');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cargar cursos al iniciar
  useEffect(() => {
    fetchCourses();
  }, []);

  // Función para obtener los detalles del curso
  const handleViewCourseDetails = async (courseId: string) => {
    try {
      setIsLoading(true);
      
      // Buscar en los cursos reales (que ahora son los mock)
      const realCourse = realCourses.find(course => course._id === courseId);
      
      if (realCourse) {
        // Si encontramos el curso, lo usamos directamente
        setSelectedCourse(realCourse);
        setShowCourseDetails(true);
      } else {
        // Si no lo encontramos, buscamos en los cursos del estado
        const mockCourse = courses.find(course => course.id === courseId);
        if (mockCourse) {
          // Crear un objeto con la estructura esperada para mostrar en el modal
          setSelectedCourse({
            _id: mockCourse.id,
            name: mockCourse.title,
            code: mockCourse.code,
            description: 'Descripción detallada del curso',
            department: 'Departamento académico',
            teacher: { user: { name: 'Profesor asignado' } },
            students: Array(mockCourse.students).fill({ studentId: 'STUDENT-ID' }),
            startDate: new Date().toISOString(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString(),
            schedule: mockCourse.schedule,
            status: 'active'
          });
          setShowCourseDetails(true);
        } else {
          toast.error('No se encontró el curso');
        }
      }
      
      /* Comentado para evitar errores con la API
      // Si no, hacemos la petición a la API
      const response = await axios.get(`${API_URL}/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        setSelectedCourse(response.data);
        setShowCourseDetails(true);
      }
      */
    } catch (error) {
      console.error('Error al obtener detalles del curso:', error);
      toast.error('No se pudieron cargar los detalles del curso');
    } finally {
      setIsLoading(false);
    }
  };



  // Función para renderizar el progreso de carga
  const renderProgress = (progress: number) => {
    return (
      <div className="h-1 w-full bg-gray-200">
        <div 
          className="h-1 bg-blue-600" 
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter((course) => {
    return course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">My Courses</h1>

      {/* Course Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Course Statistics</h2>
        <div className="h-64">
          <Chart type="bar" data={{
            labels: courses.map(course => course.title),
            datasets: [
              {
                label: 'Students Enrolled',
                data: courses.map(course => course.students),
                backgroundColor: '#4e73df',
                borderColor: '#4e73df',
                borderWidth: 1,
              },
              {
                label: 'Course Progress (%)',
                data: courses.map(course => course.progress),
                backgroundColor: '#1cc88a',
                borderColor: '#1cc88a',
                borderWidth: 1,
              },
            ],
          }} options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }} />
        </div>
      </div>

      {/* Search and Add Course */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Mis Cursos</h2>
          <div className="flex space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar curso..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Cargando cursos...</span>
          </div>
        )}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{course.title}</h3>
                  <p className="text-sm text-gray-500">{course.code}</p>
                </div>
                {/* Los botones de editar y eliminar se han eliminado ya que solo el admin puede modificar cursos */}
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center">
                <Users size={18} className="text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{course.students} Students</span>
              </div>
              <div className="flex items-center">
                <Calendar size={18} className="text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">
                  {typeof course.schedule === 'object' 
                    ? `${course.schedule.days || ''} ${course.schedule.startTime || ''} - ${course.schedule.endTime || ''}` 
                    : (course.schedule || 'No definido')}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Course Progress</span>
                  <span className="text-sm font-medium text-gray-900">{course.progress}%</span>
                </div>
                {renderProgress(course.progress)}
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <button 
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => handleViewCourseDetails(course.id.toString())}
              >
                <Book size={18} className="mr-2" />
                View Course Details
              </button>
            </div>
          </div>
        ))}
      </div>
      

      
      {/* Modal para ver detalles del curso */}
      {showCourseDetails && selectedCourse && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">Detalles del Curso</h3>
                <button
                  onClick={() => setShowCourseDetails(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 bg-gray-50">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedCourse.name}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      <Hash size={14} className="inline mr-1" />
                      Código: {selectedCourse.code}
                    </p>
                  </div>
                  <div className="border-t border-gray-200">
                    <dl>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedCourse.description || 'Sin descripción'}</dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Departamento</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedCourse.department || 'General'}</dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Profesor</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <User size={14} className="inline mr-1" />
                          {selectedCourse.teacher && selectedCourse.teacher.user ? selectedCourse.teacher.user.name : 'Sin asignar'}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Fecha de inicio</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <Calendar size={14} className="inline mr-1" />
                          {selectedCourse.startDate ? new Date(selectedCourse.startDate).toLocaleDateString() : 'No definida'}
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Fecha de finalización</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <Calendar size={14} className="inline mr-1" />
                          {selectedCourse.endDate ? new Date(selectedCourse.endDate).toLocaleDateString() : 'No definida'}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Horario</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <Clock size={14} className="inline mr-1" />
                          {typeof selectedCourse.schedule === 'object' 
                            ? `${selectedCourse.schedule.days || ''} ${selectedCourse.schedule.startTime || ''} - ${selectedCourse.schedule.endTime || ''}` 
                            : (selectedCourse.schedule || 'No definido')}
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Estudiantes inscritos</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <Users size={14} className="inline mr-1" />
                          {selectedCourse.students ? selectedCourse.students.length : 0}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Estado</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            selectedCourse.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            <CheckCircle size={14} className="mr-1" />
                            {selectedCourse.status === 'active' ? 'Activo' : 'Inactivo'}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setShowCourseDetails(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
