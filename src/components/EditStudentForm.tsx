import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface EditStudentFormProps {
  studentId: string;
  onClose: () => void;
  onStudentUpdated: () => void;
}

const EditStudentForm: React.FC<EditStudentFormProps> = ({ studentId, onClose, onStudentUpdated }) => {
  const [formData, setFormData] = useState({
    grade: '',
    department: '',
    block: '',
    phoneNumber: '',
    address: '',
    parentName: '',
    parentContact: ''
  });
  const [blocks, setBlocks] = useState<Array<{ _id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Cargar datos del estudiante y bloques disponibles
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentResponse, blocksResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/students/${studentId}`),
          axios.get('http://localhost:5000/api/blocks')
        ]);
        
        if (studentResponse.status === 200) {
          const { grade, department, block, phoneNumber, address, parentName, parentContact } = studentResponse.data;
          setFormData({
            grade: grade || '',
            department: department || '',
            block: block?._id || '',
            phoneNumber: phoneNumber || '',
            address: address || '',
            parentName: parentName || '',
            parentContact: parentContact || ''
          });
        }
        
        if (blocksResponse.status === 200) {
          setBlocks(blocksResponse.data);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('No se pudieron cargar los datos necesarios');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [studentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.put(`http://localhost:5000/api/students/${studentId}`, formData);
      
      if (response.status === 200) {
        toast.success('Estudiante actualizado exitosamente');
        onStudentUpdated();
        onClose();
      }
    } catch (error: any) {
      console.error('Error al actualizar estudiante:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar estudiante');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return <div className="p-4 text-center">Cargando datos del estudiante...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Grado</label>
          <select
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Seleccione un grado</option>
            <option value="9th">9° Grado</option>
            <option value="10th">10° Grado</option>
            <option value="11th">11° Grado</option>
            <option value="12th">12° Grado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Departamento</label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Seleccione un departamento</option>
            <option value="Science">Ciencias</option>
            <option value="Mathematics">Matemáticas</option>
            <option value="History">Historia</option>
            <option value="Language">Lenguaje</option>
            <option value="Arts">Artes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bloque</label>
          <select
            name="block"
            value={formData.block}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Seleccione un bloque</option>
            {blocks.map(block => (
              <option key={block._id} value={block._id}>
                {block.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Teléfono</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Dirección</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={2}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre del padre/madre/tutor</label>
          <input
            type="text"
            name="parentName"
            value={formData.parentName}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contacto del padre/madre/tutor</label>
          <input
            type="text"
            name="parentContact"
            value={formData.parentContact}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
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
          {isLoading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
};

export default EditStudentForm;
