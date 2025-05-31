import { useState, useEffect } from 'react';
import { User, UserPlus, Edit, Trash2, Search, Award, BookOpen, Eye, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import AddTeacherForm from '../../components/AddTeacherForm';
import EditTeacherForm from '../../components/EditTeacherForm';
import Chart from '../../components/Chart';

const TeacherManagement = () => {
  // Data for teachers
  const [teachers, setTeachers] = useState<Array<{
    id: string;
    name: string;
    email: string;
    teacherId: string;
    department: string;
    joinDate: string;
    courses: any[];
    status: string;
  }>>([]);
  
  const [totalCourses, setTotalCourses] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  
  // Cargar profesores y cursos reales desde la API
  useEffect(() => {
    fetchTeachers();
    fetchTotalCourses();
  }, []);
  
  const fetchTeachers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/teachers');
      if (response.status === 200) {
        console.log('Datos de profesores recibidos:', response.data);
        
        // Transformar los datos de la API al formato que espera el componente
        const formattedTeachers = response.data.map((teacher: any) => ({
          id: teacher._id,
          name: teacher.user?.name || 'Sin nombre',
          email: teacher.user?.email || 'Sin email',
          teacherId: teacher.teacherId,
          department: teacher.specialization || 'General', // Usamos specialization como department
          qualification: teacher.qualification || 'PhD',
          joinDate: teacher.joinDate ? new Date(teacher.joinDate).toISOString().split('T')[0] : 'N/A',
          status: 'active', // Asumimos que todos los profesores están activos
          courses: teacher.courses || [] // Guardamos los cursos completos para poder mostrarlos
        }));
        setTeachers(formattedTeachers);
      }
    } catch (error) {
      console.error('Error al cargar profesores:', error);
      toast.error('No se pudieron cargar los profesores');
    }
  };
  
  // Obtener el total de cursos desde la API
  const fetchTotalCourses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/courses');
      if (response.status === 200) {
        setTotalCourses(response.data.length);
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      // No mostramos toast para no sobrecargar al usuario con mensajes
    }
  };

  // Filter teachers based on search term and department
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.teacherId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || teacher.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Delete teacher handler
  const handleDeleteTeacher = async (id: string) => {
    try {
      const confirmed = window.confirm('¿Está seguro que desea eliminar este profesor?');
      if (!confirmed) return;
      
      const response = await axios.delete(`http://localhost:5000/api/teachers/${id}`);
      if (response.status === 200) {
        toast.success('Profesor eliminado exitosamente');
        fetchTeachers(); // Recargar la lista de profesores
      }
    } catch (error) {
      console.error('Error al eliminar profesor:', error);
      toast.error('Error al eliminar profesor');
    }
  };
  
  // Edit teacher handler
  const handleEditTeacher = (id: string) => {
    setSelectedTeacherId(id);
    setIsEditModalOpen(true);
  };
  
  // View teacher details handler
  const handleViewTeacher = (teacher: any) => {
    setSelectedTeacher(teacher);
    setIsViewModalOpen(true);
  };
  
  // View course details handler
  const handleViewCourse = async (courseId: string) => {
    try {
      console.log('Obteniendo detalles del curso con ID:', courseId);
      const response = await axios.get(`http://localhost:5000/api/courses/${courseId}`);
      console.log('Respuesta de la API de cursos:', response.data);
      
      if (response.status === 200) {
        // Establecemos el curso seleccionado y abrimos el modal
        setSelectedCourse(response.data);
        console.log('Curso seleccionado:', response.data);
        setShowCourseDetails(true);
      }
    } catch (error) {
      console.error('Error al obtener detalles del curso:', error);
      toast.error('No se pudieron cargar los detalles del curso');
    }
  };

  // Calcular estadísticas de departamentos a partir de los datos reales
  const calculateDepartmentStats = () => {
    // Contar profesores por departamento
    const departmentCounts = teachers.reduce((acc: Record<string, number>, teacher) => {
      const dept = teacher.department || 'Sin departamento';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    
    // Ordenar departamentos por cantidad de profesores (de mayor a menor)
    const sortedDepartments = Object.entries(departmentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Tomar los 5 departamentos con más profesores
    
    // Preparar datos para el gráfico
    return {
      labels: sortedDepartments.map(([dept]) => dept),
      datasets: [
        {
          label: 'Profesores por Departamento',
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

  // Calcular estadísticas de carga de cursos a partir de los datos reales
  const calculateCourseLoadStats = () => {
    // Contar profesores por número de cursos asignados
    const courseLoadCounts = {
      '1 Curso': 0,
      '2 Cursos': 0,
      '3 Cursos': 0,
      '4+ Cursos': 0
    };
    
    teachers.forEach(teacher => {
      const courseCount = Array.isArray(teacher.courses) ? teacher.courses.length : 0;
      
      if (courseCount === 1) {
        courseLoadCounts['1 Curso']++;
      } else if (courseCount === 2) {
        courseLoadCounts['2 Cursos']++;
      } else if (courseCount === 3) {
        courseLoadCounts['3 Cursos']++;
      } else if (courseCount >= 4) {
        courseLoadCounts['4+ Cursos']++;
      }
    });
    
    // Preparar datos para el gráfico
    return {
      labels: Object.keys(courseLoadCounts),
      datasets: [
        {
          label: 'Distribución de Carga de Cursos',
          data: Object.values(courseLoadCounts),
          backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'],
          hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#dda20a'],
          hoverBorderColor: 'rgba(234, 236, 244, 1)',
        },
      ],
    };
  };
  
  // Chart data for course load distribution
  const courseLoadData = calculateCourseLoadStats();

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Teacher Management</h1>

      {/* Teacher Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Teachers by Department</h2>
          <Chart type="doughnut" data={departmentData} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Course Load Distribution</h2>
          <Chart type="doughnut" data={courseLoadData} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Teacher Statistics</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total Profesores</p>
                  <h3 className="text-2xl font-bold text-blue-700">{teachers.length}</h3>
                </div>
                <User size={24} className="text-blue-500" />
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Profesores Activos</p>
                  <h3 className="text-2xl font-bold text-green-700">{teachers.filter(teacher => teacher.status === 'active').length}</h3>
                </div>
                <Award size={24} className="text-green-500" />
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">Total Cursos</p>
                  <h3 className="text-2xl font-bold text-yellow-700">{totalCourses}</h3>
                </div>
                <BookOpen size={24} className="text-yellow-500" />
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
              placeholder="Search teachers..."
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
            <UserPlus size={18} className="mr-2" />
            Add Teacher
          </button>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cursos
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
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={20} className="text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                        <div className="text-sm text-gray-500">{teacher.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {teacher.teacherId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {teacher.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {teacher.joinDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => handleViewTeacher(teacher)}
                      title="Ver detalles del profesor"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => handleEditTeacher(teacher.id)}
                      title="Editar profesor"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteTeacher(teacher.id)}
                      title="Eliminar profesor"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {Array.isArray(teacher.courses) && teacher.courses.length > 0 ? (
                      <div className="flex flex-col space-y-1">
                        {teacher.courses.map((course: any) => (
                          <button
                            key={typeof course === 'object' ? course._id : course}
                            className="text-sm text-blue-600 hover:text-blue-900 flex items-center"
                            onClick={() => {
                              // Si el curso es un objeto completo, usamos su _id, de lo contrario usamos el ID directamente
                              const courseId = typeof course === 'object' ? course._id : course;
                              console.log('ID del curso a ver:', courseId);
                              handleViewCourse(courseId);
                            }}
                          >
                            <BookOpen size={14} className="mr-1" />
                            {typeof course === 'object' ? course.name : `Curso ID: ${course}`}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">Sin cursos asignados</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(teacher.status)}`}>
                      {teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-green-600 hover:text-green-900 mr-3"
                      onClick={() => handleViewTeacher(teacher)}
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => handleEditTeacher(teacher.id)}
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteTeacher(teacher.id)}
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
      {/* Modal para agregar profesor */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Agregar Nuevo Profesor"
      >
        <AddTeacherForm
          onClose={() => setIsAddModalOpen(false)}
          onTeacherAdded={() => {
            fetchTeachers();
            setIsAddModalOpen(false);
          }}
        />
      </Modal>

      {/* Modal para editar profesor */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Profesor"
      >
        <EditTeacherForm
          teacherId={selectedTeacherId}
          onClose={() => setIsEditModalOpen(false)}
          onTeacherUpdated={() => {
            fetchTeachers();
            setIsEditModalOpen(false);
          }}
        />
      </Modal>

      {/* Diálogo para ver detalles del curso */}
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
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Código: {selectedCourse.code}</p>
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
                          {selectedCourse.teacher && selectedCourse.teacher.user ? selectedCourse.teacher.user.name : 'Sin asignar'}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Fecha de inicio</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {selectedCourse.startDate ? new Date(selectedCourse.startDate).toLocaleDateString() : 'No definida'}
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Fecha de finalización</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {selectedCourse.endDate ? new Date(selectedCourse.endDate).toLocaleDateString() : 'No definida'}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Estudiantes inscritos</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {selectedCourse.students ? selectedCourse.students.length : 0}
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Estado</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            selectedCourse.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
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
      
      {/* Modal para ver detalles del profesor */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del Profesor"
      >
        {selectedTeacher && (
          <div className="p-4">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedTeacher.name}</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">ID: {selectedTeacher.teacherId}</p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedTeacher.email}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Departamento</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedTeacher.department}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Fecha de Incorporación</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedTeacher.joinDate}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Cursos Asignados</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {Array.isArray(selectedTeacher.courses) ? (
                        selectedTeacher.courses.length > 0 ? (
                          <div className="flex flex-col space-y-1">
                            {selectedTeacher.courses.map((course: any, index: number) => (
                              <span key={index} className="text-sm">
                                {typeof course === 'object' ? course.name || course.code : `Curso ID: ${course}`}
                              </span>
                            ))}
                          </div>
                        ) : (
                          'Sin cursos asignados'
                        )
                      ) : (
                        typeof selectedTeacher.courses === 'number' ? `${selectedTeacher.courses} cursos` : 'Sin información de cursos'
                      )}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Estado</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedTeacher.status)}`}>
                        {selectedTeacher.status.charAt(0).toUpperCase() + selectedTeacher.status.slice(1)}
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

export default TeacherManagement;
