import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface EditTeacherFormProps {
  teacherId: string;
  onClose: () => void;
  onTeacherUpdated: () => void;
}

const EditTeacherForm: React.FC<EditTeacherFormProps> = ({ teacherId, onClose, onTeacherUpdated }) => {
  const [formData, setFormData] = useState({
    qualification: '',
    specialization: '',
    phoneNumber: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Cargar datos del profesor
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/teachers/${teacherId}`);
        if (response.status === 200) {
          const { qualification, specialization, phoneNumber, address } = response.data;
          setFormData({
            qualification: qualification || '',
            specialization: specialization || '',
            phoneNumber: phoneNumber || '',
            address: address || ''
          });
        }
      } catch (error) {
        console.error('Error al cargar datos del profesor:', error);
        toast.error('No se pudieron cargar los datos del profesor');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchTeacher();
  }, [teacherId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.put(`http://localhost:5000/api/teachers/${teacherId}`, formData);
      
      if (response.status === 200) {
        toast.success('Profesor actualizado exitosamente');
        onTeacherUpdated();
        onClose();
      }
    } catch (error: any) {
      console.error('Error al actualizar profesor:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar profesor');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return <div className="p-4 text-center">Cargando datos del profesor...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Calificación</label>
          <select
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Seleccione una opción</option>
            <option value="Licenciatura">Licenciatura</option>
            <option value="Maestría">Maestría</option>
            <option value="Doctorado">Doctorado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Especialización</label>
          <select
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Seleccione una opción</option>
            <option value="Matemáticas">Matemáticas</option>
            <option value="Ciencias">Ciencias</option>
            <option value="Historia">Historia</option>
            <option value="Lenguaje">Lenguaje</option>
            <option value="Informática">Informática</option>
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

export default EditTeacherForm;
