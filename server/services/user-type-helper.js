// Función auxiliar para determinar el tipo de usuario basado en el rol
export const getUserTypeFromRole = (role) => {
  if (!role) return 'usuario';
  
  const lowerRole = role.toLowerCase();
  
  if (lowerRole === 'teacher') return 'profesor';
  if (lowerRole === 'student') return 'estudiante';
  if (lowerRole === 'admin') return 'administrador';
  
  return 'usuario';
};
