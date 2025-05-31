import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface AddCourseFormProps {
  onClose: () => void;
  onCourseAdded: () => void;
}

interface Teacher {
  _id: string;
  user: {
    name: string;
  };
}

interface Block {
  _id: string;
  name: string;
}

const AddCourseForm: React.FC<AddCourseFormProps> = ({ onClose, onCourseAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    teacher: '',
    blocks: [] as string[],
    startDate: '',
    endDate: '',
    days: [] as string[],
    startTime: '',
    endTime: '',
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar profesores y bloques disponibles
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersResponse, blocksResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/teachers'),
          axios.get('http://localhost:5000/api/blocks')
        ]);
        
        setTeachers(teachersResponse.data);
        setBlocks(blocksResponse.data);
        
        if (teachersResponse.data.length > 0) {
          setFormData(prev => ({ ...prev, teacher: teachersResponse.data[0]._id }));
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('No se pudieron cargar los datos necesarios');
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayChange = (day: string) => {
    const updatedDays = formData.days.includes(day)
      ? formData.days.filter(d => d !== day)
      : [...formData.days, day];
    
    setFormData(prev => ({ ...prev, days: updatedDays }));
  };

  const handleBlockChange = (blockId: string) => {
    const updatedBlocks = formData.blocks.includes(blockId)
      ? formData.blocks.filter(b => b !== blockId)
      : [...formData.blocks, blockId];
    
    setFormData(prev => ({ ...prev, blocks: updatedBlocks }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validar datos
      if (!formData.name || !formData.code || !formData.teacher) {
        toast.error('Por favor complete todos los campos requeridos');
        setIsLoading(false);
        return;
      }

      // Preparar datos del curso
      const courseData = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        teacher: formData.teacher,
        blocks: formData.blocks,
        startDate: formData.startDate,
        endDate: formData.endDate,
        schedule: {
          days: formData.days,
          startTime: formData.startTime,
          endTime: formData.endTime
        }
      };

      // Enviar datos al servidor
      const response = await axios.post('http://localhost:5000/api/courses', courseData);
      
      if (response.status === 201) {
        toast.success('Curso creado exitosamente');
        onCourseAdded();
        onClose();
      }
    } catch (error: any) {
      console.error('Error al crear curso:', error);
      toast.error(error.response?.data?.message || 'Error al crear curso');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-2">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre del Curso</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Código del Curso</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="MAT101"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Profesor</label>
          <select
            name="teacher"
            value={formData.teacher}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          >
            {teachers.length > 0 ? (
              teachers.map(teacher => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.user.name}
                </option>
              ))
            ) : (
              <option value="">No hay profesores disponibles</option>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bloques</label>
          <div className="space-y-2">
            {blocks.length > 0 ? (
              blocks.map(block => (
                <div key={block._id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`block-${block._id}`}
                    checked={formData.blocks.includes(block._id)}
                    onChange={() => handleBlockChange(block._id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`block-${block._id}`} className="ml-2 block text-sm text-gray-900">
                    {block.name}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No hay bloques disponibles</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Días de Clase</label>
          <div className="flex flex-wrap gap-3">
            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(day => (
              <div key={day} className="flex items-center">
                <input
                  type="checkbox"
                  id={`day-${day}`}
                  checked={formData.days.includes(day)}
                  onChange={() => handleDayChange(day)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor={`day-${day}`} className="ml-2 block text-sm text-gray-900">
                  {day}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Hora de Inicio</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Hora de Fin</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};

export default AddCourseForm;
