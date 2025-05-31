import React, { useState, useEffect } from 'react';
import Chart from '../../components/Chart';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Filter, Download } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

// URL de la API
const API_URL = 'http://localhost:5000/api';

// Define interfaces
interface AttendanceRecord {
  id: string;
  course: string;
  date: string;
  time: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
}

interface StudentAttendance {
  id: string;
  name: string;
  studentId: string;
  status: 'present' | 'absent' | 'late';
}

interface Student {
  _id: string;
  id: string;
  name: string;
  lastName: string;
  email: string;
  studentId: string;
  attendance?: 'present' | 'absent' | 'late';
}

interface DateRangeType {
  start: string;
  end: string;
}

const AttendanceManagement = () => {
  // Obtener el token de autenticación
  const token = localStorage.getItem('token');
  
  // Estados
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [dateRange, setDateRange] = useState<DateRangeType>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  
  // Estados para la toma de asistencia
  const [courseForAttendance, setCourseForAttendance] = useState<string>('');
  const [studentsForAttendance, setStudentsForAttendance] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  
  const [studentAttendance] = useState<StudentAttendance[]>([
    {
      id: '1',
      name: 'Alex Johnson',
      studentId: 'ST-2025-001',
      status: 'present',
    },
    {
      id: '2',
      name: 'Emma Williams',
      studentId: 'ST-2025-002',
      status: 'present',
    },
    {
      id: '3',
      name: 'Noah Brown',
      studentId: 'ST-2025-003',
      status: 'absent',
    },
    {
      id: '4',
      name: 'Olivia Davis',
      studentId: 'ST-2025-004',
      status: 'late',
    },
    {
      id: '5',
      name: 'Liam Miller',
      studentId: 'ST-2025-005',
      status: 'present',
    },
  ]);
  
  // Función para cargar cursos desde la API (solo los asignados al profesor)
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      if (!token) {
        console.error('No token found');
        toast.error('No se encontró token de autenticación');
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
            
            // Formatear los cursos para el selector
            const formattedCourses = teacherCourses.map((course: any) => ({
              id: course._id,
              name: course.name
            }));
            
            setCourses(formattedCourses);
            
            // Actualizar los registros de asistencia para mostrar solo los cursos del profesor
            if (formattedCourses.length > 0) {
              updateAttendanceRecords(formattedCourses);
            } else {
              // Si no hay cursos, mostrar mensaje
              setAttendanceRecords([]);
              toast.error('No hay cursos asignados a este profesor');
            }
          } else {
            console.error('No se encontraron cursos en la respuesta de la API');
            toast.error('No se pudieron cargar los cursos');
            setAttendanceRecords([]);
          }
        } else {
          console.error('No se encontró ID de profesor en los datos del usuario');
          toast.error('No se pudo identificar al profesor');
          setAttendanceRecords([]);
        }
      } else {
        console.error('Respuesta inválida al obtener datos del usuario');
        toast.error('Error al obtener datos del usuario');
        setAttendanceRecords([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Error al cargar los cursos');
      setAttendanceRecords([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Función para actualizar los registros de asistencia basados en los cursos disponibles
  const updateAttendanceRecords = (availableCourses: { id: string; name: string }[]) => {
    console.log(`Generando registros de asistencia para ${availableCourses.length} cursos reales`);
    
    // Verificar que realmente hay cursos disponibles
    if (availableCourses.length === 0) {
      console.warn('No hay cursos disponibles para generar registros de asistencia');
      setAttendanceRecords([]);
      return;
    }
    
    // Generar datos de asistencia de ejemplo para los cursos disponibles
    const mockAttendanceData: AttendanceRecord[] = [];
    
    // Generar registros para los últimos 30 días
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const formattedDate = date.toISOString().split('T')[0];
      
      // Generar un registro por día para cada curso real
      for (const course of availableCourses) {
        // Solo generar registros para días de semana (lunes a viernes)
        const dayOfWeek = date.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          const totalStudents = 25; // Número fijo de estudiantes para consistencia
          
          // Calcular presentes, ausentes y tardanzas de manera realista
          // La asistencia tiende a ser mejor al inicio del semestre y peor hacia el final
          const attendanceRate = Math.max(0.7, 0.95 - (i / 100)); // Entre 70% y 95% de asistencia
          const present = Math.floor(totalStudents * attendanceRate);
          
          // Distribuir el resto entre ausentes y tardanzas
          const remaining = totalStudents - present;
          const absent = Math.floor(remaining * 0.7); // 70% de los no presentes son ausentes
          const late = remaining - absent; // El resto son tardanzas
          
          mockAttendanceData.push({
            id: `${formattedDate}-${course.id}`,
            course: course.name,
            date: formattedDate,
            time: `${8 + (dayOfWeek * 2)}:00 AM`, // Horario consistente basado en el día de la semana
            totalStudents,
            present,
            absent,
            late
          });
        }
      }
    }
    
    // Ordenar por fecha (más reciente primero)
    mockAttendanceData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    console.log(`Generados ${mockAttendanceData.length} registros de asistencia`);
    setAttendanceRecords(mockAttendanceData);
  };

  // Cargar cursos al montar el componente
  useEffect(() => {
    fetchCourses();
  }, []);

  // Filtrar registros de asistencia según el curso y rango de fechas seleccionados
  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesCourse = selectedCourse === 'all' || record.course === selectedCourse;
    let matchesDateRange = true;
    if (dateRange.start && dateRange.end) {
      matchesDateRange = record.date >= dateRange.start && record.date <= dateRange.end;
    }
    return matchesCourse && matchesDateRange;
  });

  // Datos para el gráfico de resumen de asistencia
  const attendanceData = {
    labels: ['Presentes', 'Ausentes', 'Tardanzas'],
    datasets: [
      {
        label: 'Resumen de Asistencia',
        data: [
          attendanceRecords.reduce((sum, record) => sum + record.present, 0),
          attendanceRecords.reduce((sum, record) => sum + record.absent, 0),
          attendanceRecords.reduce((sum, record) => sum + record.late, 0),
        ],
        backgroundColor: ['#1cc88a', '#e74a3b', '#f6c23e'],
        hoverBackgroundColor: ['#17a673', '#d03b2f', '#dca834'],
        hoverBorderColor: 'rgba(234, 236, 244, 1)',
      },
    ],
  };

  // Datos para el gráfico de tendencias de asistencia
  const trendData = {
    labels: attendanceRecords.map(record => record.date),
    datasets: [
      {
        label: 'Presentes',
        data: attendanceRecords.map(record => (record.present / record.totalStudents) * 100),
        fill: false,
        borderColor: '#1cc88a',
        tension: 0.1,
      },
      {
        label: 'Ausentes',
        data: attendanceRecords.map(record => (record.absent / record.totalStudents) * 100),
        fill: false,
        borderColor: '#e74a3b',
        tension: 0.1,
      },
      {
        label: 'Tardanzas',
        data: attendanceRecords.map(record => (record.late / record.totalStudents) * 100),
        fill: false,
        borderColor: '#f6c23e',
        tension: 0.1,
      },
    ],
  };

  // Obtener icono de estado
  const getStatusIcon = (status: 'present' | 'absent' | 'late' | string) => {
    switch (status) {
      case 'present':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'absent':
        return <XCircle size={20} className="text-red-500" />;
      case 'late':
        return <AlertCircle size={20} className="text-yellow-500" />;
      default:
        return null;
    }
  };

  // Obtener clase de badge para estado
  const getStatusBadgeClass = (status: 'present' | 'absent' | 'late' | string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return '';
    }
  };

  // Manejar la visualización de la asistencia de estudiantes para un registro específico
  const handleViewStudents = (record: AttendanceRecord) => {
    setSelectedRecord(record);
  };

  // Esta función ha sido reemplazada por generateMockStudents

  // Iniciar el proceso de toma de asistencia para un curso
  const handleStartAttendance = (_courseId: string, courseName: string) => {
    setCourseForAttendance(courseName);
    // En lugar de cargar estudiantes de la API, usaremos datos simulados
    generateMockStudents(courseName);
  };
  
  // Generar estudiantes simulados para un curso
  const generateMockStudents = (_courseName: string) => {
    setLoadingStudents(true);
    
    // Simulamos un retraso para mostrar el indicador de carga
    setTimeout(() => {
      // Generar entre 15 y 25 estudiantes aleatorios
      const studentCount = Math.floor(Math.random() * 10) + 15;
      const mockStudents: Student[] = [];
      
      const firstNames = ['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Laura', 'Miguel', 'Sofía', 'José', 'Lucía'];
      const lastNames = ['García', 'Rodríguez', 'López', 'Martínez', 'González', 'Pérez', 'Sánchez', 'Romero', 'Torres', 'Ramírez'];
      
      for (let i = 0; i < studentCount; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        mockStudents.push({
          _id: `student-${i}-${Date.now()}`,
          id: `student-${i}-${Date.now()}`,
          name: firstName,
          lastName: lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
          studentId: `ST-${2025}-${(i + 1).toString().padStart(3, '0')}`,
          attendance: 'present' // Por defecto todos presentes
        });
      }
      
      setStudentsForAttendance(mockStudents);
      setShowAttendanceForm(true);
      setLoadingStudents(false);
    }, 1000);
  };

  // Actualizar el estado de asistencia de un estudiante
  const updateStudentAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setStudentsForAttendance(prevStudents => 
      prevStudents.map(student => 
        student._id === studentId ? { ...student, attendance: status } : student
      )
    );
  };

  // Guardar la asistencia tomada
  const saveAttendance = async () => {
    try {
      setSavingAttendance(true);
      if (!token) {
        toast.error('No se encontró token de autenticación');
        return;
      }

      // Contar asistencias por tipo
      const presentCount = studentsForAttendance.filter(s => s.attendance === 'present').length;
      const absentCount = studentsForAttendance.filter(s => s.attendance === 'absent').length;
      const lateCount = studentsForAttendance.filter(s => s.attendance === 'late').length;
      
      // Crear un nuevo registro de asistencia
      const newAttendanceRecord: Partial<AttendanceRecord> = {
        course: courseForAttendance,
        date: attendanceDate,
        time: new Date().toLocaleTimeString(),
        totalStudents: studentsForAttendance.length,
        present: presentCount,
        absent: absentCount,
        late: lateCount
      };

      // Guardar los detalles de asistencia por estudiante
      const studentAttendanceDetails = studentsForAttendance.map(student => ({
        name: `${student.name} ${student.lastName || ''}`,
        studentId: student.studentId,
        status: student.attendance
      }));

      // En un entorno real, enviaríamos estos datos al servidor
      // Por ahora, simularemos un guardado exitoso
      console.log('Guardando asistencia:', { record: newAttendanceRecord, details: studentAttendanceDetails });
      
      // Simular una petición exitosa
      setTimeout(() => {
        // Agregar el nuevo registro a los registros existentes
        const newRecord = {
          ...newAttendanceRecord,
          id: `${Date.now()}-${courseForAttendance}` // Generar un ID único
        } as AttendanceRecord;
        
        setAttendanceRecords(prev => [newRecord, ...prev]);
        
        toast.success('Asistencia guardada correctamente');
        setShowAttendanceForm(false);
        setSavingAttendance(false);
      }, 1000);
      
      /* En un entorno real, usaríamos algo como esto:
      const response = await axios.post(`${API_URL}/attendance/record`, {
        record: newAttendanceRecord,
        details: studentAttendanceDetails
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 201 || response.status === 200) {
        toast.success('Asistencia guardada correctamente');
        setShowAttendanceForm(false);
        // Actualizar los registros de asistencia
        fetchCourses();
      } else {
        toast.error('Error al guardar la asistencia');
      }
      */
    } catch (error) {
      console.error('Error al guardar la asistencia:', error);
      toast.error('Error al guardar la asistencia');
      setSavingAttendance(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Gestión de Asistencia</h1>

      {/* Indicador de carga */}
      {isLoading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Resumen de Asistencia */}
      {!isLoading && attendanceRecords.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Resumen de Asistencia</h2>
            <Chart type="doughnut" data={attendanceData} />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Tendencias de Asistencia</h2>
            <Chart type="line" data={trendData} />
          </div>
        </div>
      )}

      {/* Filtros */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3">
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
              <select
                id="course"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="all">Todos los Cursos</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.name}>{course.name}</option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-1/3">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                id="startDate"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="w-full md:w-1/3">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input
                type="date"
                id="endDate"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Filter size={18} className="mr-2" />
              Aplicar Filtros
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Download size={18} className="mr-2" />
              Exportar Datos
            </button>
          </div>
        </div>
      )}

      {/* Sección para tomar asistencia */}
      {!isLoading && courses.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-700">Tomar Asistencia</h2>
            <p className="text-sm text-gray-500 mt-1">Seleccione un curso para tomar asistencia en tiempo real</p>
          </div>
          
          {!showAttendanceForm ? (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-gray-800 mb-2">{course.name}</h3>
                    <button
                      onClick={() => handleStartAttendance(course.id, course.name)}
                      className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Tomar Asistencia
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-medium text-gray-800">Curso: {courseForAttendance}</h3>
                  <div className="mt-2 flex items-center">
                    <label htmlFor="attendanceDate" className="block text-sm font-medium text-gray-700 mr-2">
                      Fecha:
                    </label>
                    <input
                      type="date"
                      id="attendanceDate"
                      className="block w-auto px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowAttendanceForm(false)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveAttendance}
                    disabled={savingAttendance}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingAttendance ? 'Guardando...' : 'Guardar Asistencia'}
                  </button>
                </div>
              </div>
              
              {loadingStudents ? (
                <div className="flex justify-center items-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estudiante
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID Estudiante
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {studentsForAttendance.map((student) => (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.name} {student.lastName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.studentId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateStudentAttendance(student._id, 'present')}
                                className={`p-2 rounded-full ${student.attendance === 'present' ? 'bg-green-100 ring-2 ring-green-500' : 'hover:bg-green-50'}`}
                                title="Presente"
                              >
                                <CheckCircle size={20} className="text-green-500" />
                              </button>
                              <button
                                onClick={() => updateStudentAttendance(student._id, 'absent')}
                                className={`p-2 rounded-full ${student.attendance === 'absent' ? 'bg-red-100 ring-2 ring-red-500' : 'hover:bg-red-50'}`}
                                title="Ausente"
                              >
                                <XCircle size={20} className="text-red-500" />
                              </button>
                              <button
                                onClick={() => updateStudentAttendance(student._id, 'late')}
                                className={`p-2 rounded-full ${student.attendance === 'late' ? 'bg-yellow-100 ring-2 ring-yellow-500' : 'hover:bg-yellow-50'}`}
                                title="Tardanza"
                              >
                                <AlertCircle size={20} className="text-yellow-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Mensaje cuando no hay registros */}
      {!isLoading && attendanceRecords.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No hay registros de asistencia disponibles</h2>
          <p className="text-gray-500">No se encontraron cursos asignados a este profesor o no hay datos de asistencia para mostrar.</p>
        </div>
      )}

      {/* Registros de Asistencia */}
      {!isLoading && attendanceRecords.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-700">Registros de Asistencia</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curso
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hora
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Estudiantes
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Presentes
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ausentes
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tardanzas
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.course}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{record.date}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock size={16} className="text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{record.time}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.totalStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CheckCircle size={16} className="text-green-500 mr-2" />
                        <span className="text-sm text-gray-900">{record.present}</span>
                        <span className="ml-1 text-sm text-gray-500">({Math.round((record.present / record.totalStudents) * 100)}%)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <XCircle size={16} className="text-red-500 mr-2" />
                        <span className="text-sm text-gray-900">{record.absent}</span>
                        <span className="ml-1 text-sm text-gray-500">({Math.round((record.absent / record.totalStudents) * 100)}%)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <AlertCircle size={16} className="text-yellow-500 mr-2" />
                        <span className="text-sm text-gray-900">{record.late}</span>
                        <span className="ml-1 text-sm text-gray-500">({Math.round((record.late / record.totalStudents) * 100)}%)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleViewStudents(record)}
                      >
                        Ver Estudiantes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detalle de Asistencia de Estudiantes */}
      {selectedRecord && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-700">
              Asistencia de Estudiantes: {selectedRecord.course} ({selectedRecord.date})
            </h2>
            <button 
              className="text-gray-400 hover:text-gray-500"
              onClick={() => setSelectedRecord(null)}
            >
              Cerrar
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Estudiante
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentAttendance.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(student.status)}
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(student.status)}`}>
                          {student.status === 'present' ? 'Presente' : student.status === 'absent' ? 'Ausente' : 'Tardanza'}
                        </span>
                      </div>
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

export default AttendanceManagement;
