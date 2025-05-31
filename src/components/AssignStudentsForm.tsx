import { useState, useEffect } from 'react';
import { Search, Users } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Student {
  _id: string;
  studentId: string;
  user: {
    name: string;
    email: string;
  };
}

interface AssignStudentsFormProps {
  courseId: string;
  onClose: () => void;
  onStudentsAssigned: () => void;
}

const AssignStudentsForm = ({ courseId, onClose, onStudentsAssigned }: AssignStudentsFormProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Cargar estudiantes y los que ya están asignados al curso
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener todos los estudiantes
        const studentsResponse = await axios.get('http://localhost:5000/api/students');
        
        // Obtener detalles del curso para ver qué estudiantes ya están asignados
        const courseResponse = await axios.get(`http://localhost:5000/api/courses/${courseId}`);
        
        if (studentsResponse.status === 200 && courseResponse.status === 200) {
          setStudents(studentsResponse.data);
          
          // Si el curso tiene estudiantes asignados, seleccionarlos
          if (courseResponse.data.students && courseResponse.data.students.length > 0) {
            const studentIds = courseResponse.data.students.map((student: any) => 
              typeof student === 'string' ? student : student._id
            );
            setSelectedStudents(studentIds);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('No se pudieron cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId]);

  // Manejar la selección/deselección de estudiantes
  const handleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Filtrar estudiantes según el término de búsqueda
  const filteredStudents = students.filter(student => 
    student.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Guardar las asignaciones de estudiantes
  const saveStudentAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.put(`http://localhost:5000/api/courses/${courseId}/students`, {
        studentIds: selectedStudents
      });
      
      if (response.status === 200) {
        toast.success('Estudiantes asignados correctamente');
        onStudentsAssigned();
      }
    } catch (error) {
      console.error('Error al asignar estudiantes:', error);
      toast.error('No se pudieron asignar los estudiantes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Selecciona los estudiantes que deseas asignar a este curso. Los estudiantes ya asignados aparecerán marcados.
        </p>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Buscar estudiantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
          {filteredStudents.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <li key={student._id} className="p-3 hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      id={`student-${student._id}`}
                      checked={selectedStudents.includes(student._id)}
                      onChange={() => handleStudentSelection(student._id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`student-${student._id}`} className="flex-1 flex items-center cursor-pointer">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users size={20} className="text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{student.user?.name || 'Nombre no disponible'}</p>
                        <p className="text-sm text-gray-500">{student.user?.email || 'Email no disponible'}</p>
                        <p className="text-xs text-gray-400">ID: {student.studentId || 'No disponible'}</p>
                      </div>
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No hay estudiantes disponibles que coincidan con la búsqueda.
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-end space-x-3 mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          onClick={saveStudentAssignments}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar Asignaciones'}
        </button>
      </div>
    </div>
  );
};

export default AssignStudentsForm;
