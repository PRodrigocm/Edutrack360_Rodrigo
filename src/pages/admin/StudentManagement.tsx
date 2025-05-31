import { useState, useEffect } from 'react';
import { User, UserPlus, Edit, Trash2, Search, GraduationCap, BookOpen, Eye } from 'lucide-react';
import Chart from '../../components/Chart';
import axios from 'axios';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import AddStudentForm from '../../components/AddStudentForm';
import EditStudentForm from '../../components/EditStudentForm';

const StudentManagement = () => {
  // Mock data for students
  const [students, setStudents] = useState<Array<{
    id: string;
    name: string;
    email: string;
    studentId: string;
    grade: string;
    department: string;
    enrollmentDate: string;
    status: string;
  }>>([]);
  
  const [totalCourses, setTotalCourses] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  // Cargar estudiantes y cursos reales desde la API
  useEffect(() => {
    fetchStudents();
    fetchTotalCourses();
  }, []);
  
  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/students');
      if (response.status === 200) {
        // Transformar los datos de la API al formato que espera el componente
        const formattedStudents = response.data.map((student: any) => ({
          id: student._id,
          name: student.user?.name || 'Sin nombre',
          email: student.user?.email || 'Sin email',
          studentId: student.studentId,
          grade: student.grade || '10th', // Valor por defecto si no existe
          department: student.department || 'Science', // Valor por defecto si no existe
          enrollmentDate: student.enrollmentDate ? new Date(student.enrollmentDate).toISOString().split('T')[0] : 'N/A',
          status: 'active' // Asumimos que todos los estudiantes están activos
        }));
        setStudents(formattedStudents);
      }
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      toast.error('No se pudieron cargar los estudiantes');
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

  // Filter students based on search term and grade
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || student.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  // Delete student handler
  const handleDeleteStudent = async (id: string) => {
    try {
      const confirmed = window.confirm('¿Está seguro que desea eliminar este estudiante?');
      if (!confirmed) return;
      
      const response = await axios.delete(`http://localhost:5000/api/students/${id}`);
      if (response.status === 200) {
        toast.success('Estudiante eliminado exitosamente');
        fetchStudents(); // Recargar la lista de estudiantes
      }
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      toast.error('Error al eliminar estudiante');
    }
  };
  
  // Edit student handler
  const handleEditStudent = (id: string) => {
    setSelectedStudentId(id);
    setIsEditModalOpen(true);
  };
  
  // View student details handler
  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  // Calcular estadísticas de grados a partir de los datos reales
  const calculateGradeStats = () => {
    // Contar estudiantes por grado
    const gradeCounts = students.reduce((acc: Record<string, number>, student) => {
      const grade = student.grade || 'Sin grado';
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});
    
    // Ordenar grados por cantidad de estudiantes (de mayor a menor)
    const sortedGrades = Object.entries(gradeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4); // Tomar los 4 grados con más estudiantes
    
    // Preparar datos para el gráfico
    return {
      labels: sortedGrades.map(([grade]) => grade),
      datasets: [
        {
          label: 'Estudiantes por Grado',
          data: sortedGrades.map(([, count]) => count),
          backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'],
          hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#dda20a'],
          hoverBorderColor: 'rgba(234, 236, 244, 1)',
        },
      ],
    };
  };
  
  // Chart data for grade distribution
  const gradeData = calculateGradeStats();

  // Calcular estadísticas de departamentos a partir de los datos reales
  const calculateDepartmentStats = () => {
    // Contar estudiantes por departamento
    const departmentCounts = students.reduce((acc: Record<string, number>, student) => {
      const dept = student.department || 'Sin departamento';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    
    // Ordenar departamentos por cantidad de estudiantes (de mayor a menor)
    const sortedDepartments = Object.entries(departmentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Tomar los 5 departamentos con más estudiantes
    
    // Preparar datos para el gráfico
    return {
      labels: sortedDepartments.map(([dept]) => dept),
      datasets: [
        {
          label: 'Estudiantes por Departamento',
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
      <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>

      {/* Student Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Students by Grade</h2>
          <Chart type="doughnut" data={gradeData} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Students by Department</h2>
          <Chart type="doughnut" data={departmentData} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Student Statistics</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total Estudiantes</p>
                  <h3 className="text-2xl font-bold text-blue-700">{students.length}</h3>
                </div>
                <GraduationCap size={24} className="text-blue-500" />
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Estudiantes Activos</p>
                  <h3 className="text-2xl font-bold text-green-700">{students.filter(student => student.status === 'active').length}</h3>
                </div>
                <User size={24} className="text-green-500" />
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">Total Cursos</p>
                  <h3 className="text-2xl font-bold text-yellow-700">
                    {totalCourses}
                  </h3>
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
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="all">All Grades</option>
              <option value="9th">9th Grade</option>
              <option value="10th">10th Grade</option>
              <option value="11th">11th Grade</option>
              <option value="12th">12th Grade</option>
            </select>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <UserPlus size={18} className="mr-2" />
            Add Student
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollment Date
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
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={20} className="text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.studentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.grade}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.enrollmentDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(student.status)}`}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-green-600 hover:text-green-900 mr-3"
                      onClick={() => handleViewStudent(student)}
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => handleEditStudent(student.id)}
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteStudent(student.id)}
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
      {/* Modal para agregar estudiante */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Agregar Nuevo Estudiante"
      >
        <AddStudentForm
          onClose={() => setIsAddModalOpen(false)}
          onStudentAdded={() => {
            fetchStudents();
            setIsAddModalOpen(false);
          }}
        />
      </Modal>

      {/* Modal para editar estudiante */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Estudiante"
      >
        <EditStudentForm
          studentId={selectedStudentId}
          onClose={() => setIsEditModalOpen(false)}
          onStudentUpdated={() => {
            fetchStudents();
            setIsEditModalOpen(false);
          }}
        />
      </Modal>

      {/* Modal para ver detalles del estudiante */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalles del Estudiante"
      >
        {selectedStudent && (
          <div className="p-4">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedStudent.name}</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">ID: {selectedStudent.studentId}</p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedStudent.email}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Grado</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedStudent.grade}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Departamento</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedStudent.department}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Fecha de Inscripción</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedStudent.enrollmentDate}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Estado</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedStudent.status)}`}>
                        {selectedStudent.status.charAt(0).toUpperCase() + selectedStudent.status.slice(1)}
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

export default StudentManagement;
