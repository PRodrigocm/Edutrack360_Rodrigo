import { useState, useEffect } from 'react';
import { Book, PlusCircle, Edit, Trash2, Search, Users, Calendar, Eye, UserPlus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import AddCourseForm from '../../components/AddCourseForm';
import EditCourseForm from '../../components/EditCourseForm';
import AssignStudentsForm from '../../components/AssignStudentsForm';
import Chart from '../../components/Chart';

interface Course {
  id: string;
  name: string;
  title: string;
  code: string;
  department: string;
  teacher: string;
  teacherId: string;
  students: number;
  startDate: string;
  endDate: string;
  schedule: string;
  status: string;
}

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAssignStudentsModalOpen, setIsAssignStudentsModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Cargar cursos reales desde la API
  useEffect(() => {
    fetchCourses();
  }, []);
  
  const fetchCourses = async () => {
    try {
      // Primero, obtenemos todos los profesores para tener sus datos completos
      const teachersResponse = await axios.get('http://localhost:5000/api/teachers');
      const teachersData = teachersResponse.status === 200 ? teachersResponse.data : [];
      
      console.log('Datos de profesores recibidos:', JSON.stringify(teachersData, null, 2));
      
      // Creamos un mapa de profesores para búsqueda rápida por ID
      const teachersMap = new Map();
      teachersData.forEach((teacher: any) => {
        if (teacher._id && teacher.user) {
          console.log('Agregando profesor al mapa:', teacher._id, teacher.user);
          teachersMap.set(teacher._id, {
            id: teacher._id,
            name: teacher.user.name || 'Nombre no disponible',
            email: teacher.user.email || '',
            teacherId: teacher.teacherId || ''
          });
        }
      });
      
      // Ahora obtenemos los cursos
      const response = await axios.get('http://localhost:5000/api/courses');
      if (response.status === 200) {
        console.log('Datos de cursos recibidos:', JSON.stringify(response.data, null, 2));
        
        // Transformar los datos de la API al formato que espera el componente
        const formattedCourses = response.data.map((course: any) => {
          console.log('Procesando curso:', course._id, 'Teacher:', course.teacher);
          
          // Determinar el nombre del profesor
          let teacherName = 'Sin asignar';
          let teacherId = '';
          
          // Caso 1: El objeto teacher viene completo con la información del usuario
          if (course.teacher && course.teacher.user && course.teacher.user.name) {
            teacherName = course.teacher.user.name;
            teacherId = course.teacher._id;
            console.log('Nombre del profesor encontrado en objeto completo:', teacherName);
          }
          // Caso 2: Solo tenemos el ID del profesor, usamos el mapa para obtener su información
          else if (course.teacher && typeof course.teacher === 'string') {
            const teacherInfo = teachersMap.get(course.teacher);
            if (teacherInfo) {
              teacherName = teacherInfo.name;
              teacherId = course.teacher;
              console.log('Nombre del profesor encontrado en mapa:', teacherName);
            }
          }
          // Caso 3: El objeto teacher existe pero no tiene la estructura esperada
          else if (course.teacher && typeof course.teacher === 'object') {
            teacherId = course.teacher._id || '';
            // Intentar buscar en el mapa usando el ID
            if (teacherId && teachersMap.has(teacherId)) {
              teacherName = teachersMap.get(teacherId).name;
              console.log('Nombre del profesor encontrado en mapa por ID:', teacherName);
            }
          }
          
          return {
            id: course._id,
            name: course.name,
            title: course.name, // Para compatibilidad con el componente existente
            code: course.code,
            department: course.department || 'General',
            teacher: teacherName,
            teacherId: teacherId, // Usamos el teacherId que hemos determinado arriba
            students: course.students?.length || 0,
            startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : 'N/A',
            endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : 'N/A',
            schedule: `${course.startDate ? new Date(course.startDate).toLocaleDateString() : 'N/A'} - ${course.endDate ? new Date(course.endDate).toLocaleDateString() : 'N/A'}`,
            status: course.status || 'active'
          };
        });
        
        setCourses(formattedCourses);
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      toast.error('No se pudieron cargar los cursos');
    }
  };
  // Filter courses based on search term and department
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = (course.title || course.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.teacher || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || course.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Función para manejar la asignación de estudiantes a un curso
  const handleAssignStudents = (courseId: string) => {
    setSelectedCourseId(courseId);
    setIsAssignStudentsModalOpen(true);
  };

  // Delete course handler
  const handleDeleteCourse = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/courses/${id}`);
        if (response.status === 200) {
          toast.success('Curso eliminado exitosamente');
          fetchCourses(); // Recargar la lista de cursos
        }
      } catch (error) {
        console.error('Error al eliminar el curso:', error);
        toast.error('No se pudo eliminar el curso');
      }
    }
  };
  
  // Edit course handler
  const handleEditCourse = (id: string) => {
    setSelectedCourseId(id);
    setIsEditModalOpen(true);
  };
  
  // View course details handler
  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsViewModalOpen(true);
  };
  // Calcular estadísticas de departamentos a partir de los datos reales
  const calculateDepartmentStats = () => {
    // Contar cursos por departamento
    const departmentCounts = courses.reduce((acc: Record<string, number>, course) => {
      const dept = course.department || 'Sin departamento';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    
    // Ordenar departamentos por cantidad de cursos (de mayor a menor)
    const sortedDepartments = Object.entries(departmentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Tomar los 5 departamentos con más cursos
    
    // Preparar datos para el gráfico
    return {
      labels: sortedDepartments.map(([dept]) => dept),
      datasets: [
        {
          label: 'Cursos por Departamento',
          data: sortedDepartments.map(([, count]) => count),
          backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
          hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#dda20a', '#be2617'],
          hoverBorderColor: 'rgba(234, 236, 244, 1)',
        },
      ],
    };
  };
  
  // Chart data for department distribution
  const departmentData = calculateDepartmentStats();

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Course Management</h1>

      {/* Department Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Courses by Department</h2>
          <Chart type="doughnut" data={departmentData} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Course Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total Cursos</p>
                  <h3 className="text-2xl font-bold text-blue-700">{courses.length}</h3>
                </div>
                <Book size={24} className="text-blue-500" />
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Cursos Activos</p>
                  <h3 className="text-2xl font-bold text-green-700">{courses.filter(course => course.status === 'active').length}</h3>
                </div>
                <Calendar size={24} className="text-green-500" />
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">Total Estudiantes</p>
                  <h3 className="text-2xl font-bold text-yellow-700">{courses.reduce((total, course) => total + course.students, 0)}</h3>
                </div>
                <Users size={24} className="text-yellow-500" />
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Promedio por Curso</p>
                  <h3 className="text-2xl font-bold text-purple-700">
                    {courses.length > 0 
                      ? Math.round(courses.reduce((total, course) => total + course.students, 0) / courses.length) 
                      : 0}
                  </h3>
                </div>
                <Users size={24} className="text-purple-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Computer Science">Computer Science</option>
            </select>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle size={18} className="mr-2" />
            Add Course
          </button>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Book size={20} className="text-blue-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{course.title}</div>
                        <div className="text-sm text-gray-500">{course.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{course.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{course.teacher}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.students}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.schedule}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(course.status)}`}>
                      {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-green-600 hover:text-green-900 mr-3"
                      onClick={() => handleViewCourse(course)}
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      className="text-purple-600 hover:text-purple-900 mr-3"
                      onClick={() => handleAssignStudents(course.id.toString())}
                      title="Asignar estudiantes"
                    >
                      <UserPlus size={18} />
                    </button>
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => handleEditCourse(course.id.toString())}
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteCourse(course.id.toString())}
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal para agregar curso */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Agregar Nuevo Curso"
      >
        <AddCourseForm
          onClose={() => setIsAddModalOpen(false)}
          onCourseAdded={() => {
            fetchCourses();
            setIsAddModalOpen(false);
          }}
        />
      </Modal>

      {/* Modal para editar curso */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Curso"
      >
        <EditCourseForm
          courseId={selectedCourseId}
          onClose={() => setIsEditModalOpen(false)}
          onCourseUpdated={() => {
            fetchCourses();
            setIsEditModalOpen(false);
          }}
        />
      </Modal>
      
      {/* Modal para asignar estudiantes */}
      <Modal
        isOpen={isAssignStudentsModalOpen}
        onClose={() => setIsAssignStudentsModalOpen(false)}
        title="Asignar Estudiantes al Curso"
      >
        <AssignStudentsForm
          courseId={selectedCourseId}
          onClose={() => setIsAssignStudentsModalOpen(false)}
          onStudentsAssigned={() => {
            fetchCourses();
            setIsAssignStudentsModalOpen(false);
          }}
        />
      </Modal>

      {/* Modal para ver detalles del curso */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del Curso"
      >
        {selectedCourse && (
          <div className="p-4">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedCourse.name}</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Código: {selectedCourse.code}</p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Departamento</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedCourse.department}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Docente</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedCourse.teacher}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Número de Estudiantes</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedCourse.students}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Fecha de Inicio</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedCourse.startDate}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Fecha de Finalización</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedCourse.endDate}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Estado</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedCourse.status)}`}>
                        {selectedCourse.status.charAt(0).toUpperCase() + selectedCourse.status.slice(1)}
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
                onClick={() => setIsViewModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CourseManagement;
