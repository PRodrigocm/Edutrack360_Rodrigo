import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface AddTeacherFormProps {
  onClose: () => void;
  onTeacherAdded: () => void;
}

const AddTeacherForm: React.FC<AddTeacherFormProps> = ({ onClose, onTeacherAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    teacherId: '',
    qualification: '',
    specialization: '',
    phoneNumber: '',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Crear usuario primero
      const userResponse = await axios.post('http://localhost:5000/api/users', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'teacher'
      });

      if (userResponse.status === 201) {
        // Crear profesor asociado al usuario
        const teacherData = {
          user: userResponse.data.user._id,
          teacherId: formData.teacherId,
          qualification: formData.qualification,
          specialization: formData.specialization,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
        };

        const teacherResponse = await axios.post('http://localhost:5000/api/teachers', teacherData);
        
        if (teacherResponse.status === 201) {
          toast.success('Profesor creado exitosamente');
          onTeacherAdded();
          onClose();
        }
      }
    } catch (error: any) {
      console.error('Error al crear profesor:', error);
      toast.error(error.response?.data?.message || 'Error al crear profesor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
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
          <label className="block text-sm font-medium text-gray-700">Correo electru00f3nico</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contraseu00f1a</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">ID de Profesor</label>
          <input
            type="text"
            name="teacherId"
            value={formData.teacherId}
            onChange={handleChange}
            placeholder="PROF-2025-XXX"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Calificaciu00f3n</label>
          <select
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Seleccione una opciu00f3n</option>
            <option value="Licenciatura">Licenciatura</option>
            <option value="Maestru00eda">Maestru00eda</option>
            <option value="Doctorado">Doctorado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Especializaciu00f3n</label>
          <select
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Seleccione una opciu00f3n</option>
            <option value="Matemu00e1ticas">Matemu00e1ticas</option>
            <option value="Ciencias">Ciencias</option>
            <option value="Historia">Historia</option>
            <option value="Lenguaje">Lenguaje</option>
            <option value="Informu00e1tica">Informu00e1tica</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Telu00e9fono</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Direcciu00f3n</label>
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
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};

export default AddTeacherForm;
