import { useState, useEffect } from 'react';
import { Clock, MapPin, Users } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Definición de tipo para las clases próximas
interface UpcomingClass {
  id: string;
  subject: string;
  time: string;
  location: string;
  students: number;
  day: string;
}

const UpcomingClassesCard = () => {
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const API_URL = 'http://localhost:5000/api';
  
  useEffect(() => {
    const fetchTeacherCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No se encontró token de autenticación');
          setIsLoading(false);
          return;
        }
        
        // Obtener el ID del profesor actual
        const userResponse = await axios.get(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (userResponse.status === 200 && userResponse.data) {
          const teacherId = userResponse.data.teacherId;
          
          if (teacherId) {
            console.log(`Obteniendo cursos para el profesor con ID: ${teacherId}`);
            
            // Obtener los cursos asignados al profesor
            const response = await axios.get(`${API_URL}/teachers/${teacherId}/courses`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            if (response.status === 200 && response.data && response.data.courses) {
              const teacherCourses = response.data.courses;
              console.log(`Se encontraron ${teacherCourses.length} cursos para el profesor`);
              
              // Convertir los cursos a formato de próximas clases
              const formattedClasses: UpcomingClass[] = teacherCourses.map((course: any) => {
                // Determinar si la clase es hoy o mañana basado en el horario del curso
                const today = new Date();
                const dayOfWeek = today.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
                
                // Extraer información de horario si está disponible
                let time = '9:00 AM - 10:30 AM'; // Horario predeterminado
                let location = 'Aula por asignar';
                let day = 'Próximamente';
                
                if (course.schedule) {
                  // Intentar extraer información real del horario
                  try {
                    const scheduleInfo = typeof course.schedule === 'string' 
                      ? JSON.parse(course.schedule) 
                      : course.schedule;
                      
                    if (scheduleInfo.time) {
                      time = scheduleInfo.time;
                    }
                    
                    if (scheduleInfo.location) {
                      location = scheduleInfo.location;
                    }
                    
                    // Determinar si la clase es hoy, mañana o próximamente
                    if (scheduleInfo.days && Array.isArray(scheduleInfo.days)) {
                      if (scheduleInfo.days.includes(dayOfWeek)) {
                        day = 'Hoy';
                      } else if (scheduleInfo.days.includes((dayOfWeek + 1) % 7)) {
                        day = 'Mañana';
                      }
                    }
                  } catch (e) {
                    console.warn('Error al procesar el horario del curso:', e);
                  }
                }
                
                return {
                  id: course._id,
                  subject: course.name,
                  time: time,
                  location: location,
                  students: course.students ? course.students.length : 0,
                  day: day
                };
              });
              
              // Ordenar las clases: primero las de hoy, luego las de mañana, luego el resto
              formattedClasses.sort((a, b) => {
                const dayOrder = { 'Hoy': 0, 'Mañana': 1, 'Próximamente': 2 };
                return (dayOrder[a.day as keyof typeof dayOrder] - dayOrder[b.day as keyof typeof dayOrder]);
              });
              
              setUpcomingClasses(formattedClasses);
            } else {
              setError('No se encontraron cursos');
            }
          } else {
            setError('No se pudo identificar al profesor');
          }
        } else {
          setError('Error al obtener datos del usuario');
        }
      } catch (err) {
        console.error('Error al obtener cursos:', err);
        setError('Error al cargar los cursos');
        toast.error('Error al cargar los cursos');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeacherCourses();
  }, []);
  
  return (
    <div className="overflow-hidden">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : upcomingClasses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No hay clases próximas programadas</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asignatura
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horario
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estudiantes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingClasses.map((classItem) => (
                <tr key={classItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{classItem.subject}</div>
                    <div className="text-xs text-gray-500">{classItem.day}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Clock size={16} className="text-gray-400 mr-2" />
                      {classItem.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin size={16} className="text-gray-400 mr-2" />
                      {classItem.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Users size={16} className="text-gray-400 mr-2" />
                      {classItem.students} estudiantes
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary hover:text-primary-dark mr-3">
                      Tomar Asistencia
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UpcomingClassesCard;