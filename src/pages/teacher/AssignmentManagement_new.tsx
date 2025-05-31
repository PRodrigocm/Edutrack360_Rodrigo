import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FileText, Calendar, CheckCircle, XCircle, Clock, Search, Filter, PlusCircle, Edit, Trash2 } from 'lucide-react';
import Chart from '../../components/Chart';

interface Assignment {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  maxScore: number;
  status: string;
  submissionCount: number;
  gradedCount: number;
  averageScore: number;
}

interface Course {
  id: number;
  name: string;
}

interface StudentSubmission {
  id: number;
  student: string;
  studentId: string;
  submissionDate: string | null;
  status: 'submitted' | 'not_submitted' | 'late';
  score: number | null;
  feedback: string;
}

const AssignmentManagement = () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  
  // Estados para datos
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentSubmissions, setStudentSubmissions] = useState<StudentSubmission[]>([]);
  
  // Estados para filtros y selecciones
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  
  // Estados para formularios
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Partial<Assignment>>({
    title: '',
    course: '',
    dueDate: new Date().toISOString().split('T')[0],
    maxScore: 100,
    status: 'active'
  });
  
  // Estados para carga
  const [loading, setLoading] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  
  // Cargar cursos y tareas al iniciar
  useEffect(() => {
    fetchCourses();
    fetchAssignments();
  }, []);

  // Crear una nueva tarea
  const handleCreateAssignment = () => {
    setCurrentAssignment({
      title: '',
      course: courses.length > 0 ? courses[0].name : '',
      dueDate: new Date().toISOString().split('T')[0],
      maxScore: 100,
      status: 'active'
    });
    setShowCreateForm(true);
    setShowEditForm(false);
  };

  // Editar una tarea existente
  const handleEditAssignment = (assignment: Assignment) => {
    setCurrentAssignment({...assignment});
    setShowEditForm(true);
    setShowCreateForm(false);
  };

  // Eliminar una tarea
  const handleDeleteAssignment = (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      // En un entorno real, haríamos una llamada a la API para eliminar la tarea
      /* En un entorno real, usaríamos algo como esto:
      if (!token) {
        toast.error('No se encontró token de autenticación');
        return;
      }
      
      try {
        const response = await axios.delete(`${API_URL}/assignments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.status === 200) {
          setAssignments(assignments.filter(assignment => assignment.id !== id));
          toast.success('Tarea eliminada correctamente');
        }
      } catch (error) {
        console.error('Error al eliminar la tarea:', error);
        toast.error('Error al eliminar la tarea');
      }
      */
      
      // Por ahora, simplemente eliminamos la tarea del estado local
      setAssignments(assignments.filter(assignment => assignment.id !== id));
      toast.success('Tarea eliminada correctamente');
    }
  };

  // Ver las entregas de los estudiantes para una tarea específica
  const handleViewSubmissions = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    fetchSubmissions(assignment.id);
  };
  
  // Guardar una tarea (nueva o editada)
  const handleSaveAssignment = async () => {
    try {
      // Validar campos requeridos
      if (!currentAssignment.title || !currentAssignment.course || !currentAssignment.dueDate) {
        toast.error('Por favor completa todos los campos requeridos');
        return;
      }
      
      // En un entorno real, haríamos una llamada a la API para guardar la tarea
      /* En un entorno real, usaríamos algo como esto:
      if (!token) {
        toast.error('No se encontró token de autenticación');
        return;
      }
      
      let response;
      if (showEditForm) {
        // Actualizar tarea existente
        response = await axios.put(`${API_URL}/assignments/${currentAssignment.id}`, currentAssignment, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        // Crear nueva tarea
        response = await axios.post(`${API_URL}/assignments`, currentAssignment, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      if (response.status === 200 || response.status === 201) {
        fetchAssignments(); // Recargar tareas
        toast.success(showEditForm ? 'Tarea actualizada correctamente' : 'Tarea creada correctamente');
        setShowEditForm(false);
        setShowCreateForm(false);
      }
      */
      
      // Por ahora, simplemente actualizamos el estado local
      if (showEditForm && currentAssignment.id) {
        // Actualizar tarea existente
        setAssignments(
          assignments.map(assignment => 
            assignment.id === currentAssignment.id ? 
              { ...assignment, ...currentAssignment as Assignment } : 
              assignment
          )
        );
        toast.success('Tarea actualizada correctamente');
      } else {
        // Crear nueva tarea
        const newAssignment: Assignment = {
          ...currentAssignment as Assignment,
          id: Math.max(0, ...assignments.map(a => a.id)) + 1,
          submissionCount: 0,
          gradedCount: 0,
          averageScore: 0
        };
        setAssignments([...assignments, newAssignment]);
        toast.success('Tarea creada correctamente');
      }
      
      setShowEditForm(false);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error al guardar la tarea:', error);
      toast.error('Error al guardar la tarea');
    }
  };
  
  // Función para cargar los cursos del profesor
  const fetchCourses = async () => {
    try {
      setLoading(true);
      // En un entorno real, obtendríamos los cursos del profesor desde la API
      // Por ahora, usamos datos simulados
      const mockCourses = [
        { id: 1, name: 'Matemáticas 101' },
        { id: 2, name: 'Física 202' },
        { id: 3, name: 'Química 303' },
        { id: 4, name: 'Biología 404' },
      ];
      setCourses(mockCourses);
      
      /* En un entorno real, usaríamos algo como esto:
      if (!token) {
        toast.error('No se encontró token de autenticación');
        return;
      }
      
      const response = await axios.get(`${API_URL}/teachers/me/courses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        setCourses(response.data);
      }
      */
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      toast.error('Error al cargar los cursos');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para cargar las tareas
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      // En un entorno real, obtendríamos las tareas desde la API
      // Por ahora, usamos datos simulados
      const mockAssignments = [
        {
          id: 1,
          title: 'Ejercicios de Cálculo',
          course: 'Matemáticas 101',
          dueDate: '2025-06-15',
          maxScore: 100,
          status: 'active',
          submissionCount: 15,
          gradedCount: 10,
          averageScore: 85
        },
        {
          id: 2,
          title: 'Laboratorio de Mecánica',
          course: 'Física 202',
          dueDate: '2025-06-20',
          maxScore: 50,
          status: 'active',
          submissionCount: 12,
          gradedCount: 8,
          averageScore: 42
        },
        {
          id: 3,
          title: 'Ensayo sobre Química Orgánica',
          course: 'Química 303',
          dueDate: '2025-06-10',
          maxScore: 80,
          status: 'closed',
          submissionCount: 20,
          gradedCount: 20,
          averageScore: 75
        },
        {
          id: 4,
          title: 'Proyecto Final de Biología',
          course: 'Biología 404',
          dueDate: '2025-07-01',
          maxScore: 200,
          status: 'draft',
          submissionCount: 0,
          gradedCount: 0,
          averageScore: 0
        }
      ];
      setAssignments(mockAssignments);
      
      /* En un entorno real, usaríamos algo como esto:
      if (!token) {
        toast.error('No se encontró token de autenticación');
        return;
      }
      
      const response = await axios.get(`${API_URL}/teachers/me/assignments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        setAssignments(response.data);
      }
      */
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      toast.error('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para cargar las entregas de los estudiantes para una tarea específica
  const fetchSubmissions = async (assignmentId: number) => {
    try {
      setLoadingSubmissions(true);
      // En un entorno real, obtendríamos las entregas desde la API
      // Por ahora, usamos datos simulados
      const mockSubmissions = [
        {
          id: 1,
          student: 'Liam Johnson',
          studentId: 'ST-2025-001',
          submissionDate: '2025-06-02',
          status: 'submitted' as const,
          score: 90,
          feedback: '¡Excelente trabajo en las derivadas!',
        },
        {
          id: 2,
          student: 'Emma Williams',
          studentId: 'ST-2025-002',
          submissionDate: '2025-06-03',
          status: 'submitted' as const,
          score: 85,
          feedback: 'Buen trabajo, pero revisa tus métodos de integración.',
        },
        {
          id: 3,
          student: 'Noah Brown',
          studentId: 'ST-2025-003',
          submissionDate: '2025-06-04',
          status: 'late' as const,
          score: 75,
          feedback: 'Entrega tardía, pero trabajo decente.',
        },
        {
          id: 4,
          student: 'Olivia Davis',
          studentId: 'ST-2025-004',
          submissionDate: null,
          status: 'not_submitted' as const,
          score: null,
          feedback: '',
        },
        {
          id: 5,
          student: 'Sophia Miller',
          studentId: 'ST-2025-005',
          submissionDate: '2025-06-01',
          status: 'submitted' as const,
          score: 95,
          feedback: 'Trabajo excepcional, muy bien estructurado.',
        }
      ];
      setStudentSubmissions(mockSubmissions);
      
      /* En un entorno real, usaríamos algo como esto:
      if (!token) {
        toast.error('No se encontró token de autenticación');
        return;
      }
      
      const response = await axios.get(`${API_URL}/assignments/${assignmentId}/submissions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        setStudentSubmissions(response.data);
      }
      */
    } catch (error) {
      console.error('Error al cargar entregas:', error);
      toast.error('Error al cargar las entregas de los estudiantes');
    } finally {
      setLoadingSubmissions(false);
    }
  };
  
  // Filter assignments based on course, status, and search term
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesCourse = selectedCourse === 'all' || assignment.course === selectedCourse;
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        assignment.course.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCourse && matchesStatus && matchesSearch;
  });
  
  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      default:
        return '';
    }
  };
  
  // Get submission status badge class
  const getSubmissionStatusBadgeClass = (status: 'submitted' | 'not_submitted' | 'late' | string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'not_submitted':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return '';
    }
  };
  
  // Get submission status icon
  const getSubmissionStatusIcon = (status: 'submitted' | 'not_submitted' | 'late' | string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'not_submitted':
        return <XCircle size={20} className="text-red-500" />;
      case 'late':
        return <Clock size={20} className="text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Assignment Management</h1>

      {/* Assignment Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Assignment Status</h2>
          <Chart
            type="doughnut"
            data={{
              labels: ['Active', 'Closed', 'Draft'],
              datasets: [{
                data: [
                  assignments.filter(a => a.status === 'active').length,
                  assignments.filter(a => a.status === 'closed').length,
                  assignments.filter(a => a.status === 'draft').length
                ],
                backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
                hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf'],
              }]
            }}
            options={{
              maintainAspectRatio: false,
              cutout: '70%',
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }} />
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Average Scores</h2>
          <Chart
            type="bar"
            data={{
              labels: assignments.map(a => a.title),
              datasets: [{
                label: 'Average Score',
                data: assignments.map(a => a.averageScore),
                backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
                hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#dda20a', '#be2617'],
              }]
            }}
            options={{
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} />
        </div>
      </div>

      {/* Formulario de creación/edición de tareas */}
      {(showCreateForm || showEditForm) && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {showEditForm ? 'Editar Tarea' : 'Crear Nueva Tarea'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título de la Tarea *
              </label>
              <input
                type="text"
                id="title"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={currentAssignment.title}
                onChange={(e) => setCurrentAssignment({...currentAssignment, title: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                Curso *
              </label>
              <select
                id="course"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={currentAssignment.course}
                onChange={(e) => setCurrentAssignment({...currentAssignment, course: e.target.value})}
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.name}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Entrega *
              </label>
              <input
                type="date"
                id="dueDate"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={currentAssignment.dueDate}
                onChange={(e) => setCurrentAssignment({...currentAssignment, dueDate: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700 mb-1">
                Puntuación Máxima *
              </label>
              <input
                type="number"
                id="maxScore"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={currentAssignment.maxScore}
                onChange={(e) => setCurrentAssignment({...currentAssignment, maxScore: parseInt(e.target.value)})}
                min="1"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <select
                id="status"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={currentAssignment.status}
                onChange={(e) => setCurrentAssignment({...currentAssignment, status: e.target.value})}
              >
                <option value="active">Activa</option>
                <option value="closed">Cerrada</option>
                <option value="draft">Borrador</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => {
                setShowCreateForm(false);
                setShowEditForm(false);
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleSaveAssignment}
            >
              {showEditForm ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 items-center">
          <div className="w-full md:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.name}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-48">
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <button 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={handleCreateAssignment}
          >
            <PlusCircle size={18} className="mr-2" />
            Create Assignment
          </button>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-700">Assignments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submissions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Score
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText size={20} className="text-blue-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                        <div className="text-sm text-gray-500">Max Score: {assignment.maxScore}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">{assignment.dueDate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(assignment.status)}`}>
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.submissionCount}/{assignment.gradedCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assignment.averageScore > 0 ? (
                      <div className="flex items-center">
                        <span className="font-medium">{assignment.averageScore}</span>
                        <span className="ml-1 text-gray-500">/ {assignment.maxScore}</span>
                        <span className="ml-2 text-green-500">({Math.round((assignment.averageScore / assignment.maxScore) * 100)}%)</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Not graded</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => handleViewSubmissions(assignment)}
                    >
                      View
                    </button>
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => handleEditAssignment(assignment)}
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteAssignment(assignment.id)}
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

      {/* Student Submissions */}
      {selectedAssignment && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-700">
              Student Submissions: {selectedAssignment.title}
            </h2>
            <button 
              className="text-gray-400 hover:text-gray-500"
              onClick={() => setSelectedAssignment(null)}
            >
              Close
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feedback
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{submission.student}</div>
                      <div className="text-sm text-gray-500">{submission.studentId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getSubmissionStatusIcon(submission.status)}
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSubmissionStatusBadgeClass(submission.status)}`}>
                          {submission.status === 'not_submitted' ? 'Not Submitted' : submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.submissionDate || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.score !== null ? (
                        <div className="flex items-center">
                          <span className="font-medium">{submission.score}</span>
                          <span className="ml-1 text-gray-500">/ {selectedAssignment.maxScore}</span>
                          <span className="ml-2 text-green-500">({Math.round((submission.score / selectedAssignment.maxScore) * 100)}%)</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">Not graded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="max-w-xs truncate">{submission.feedback || 'No feedback'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        {submission.score !== null ? 'Edit Grade' : 'Grade'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;
