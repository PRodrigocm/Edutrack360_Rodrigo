import express from 'express';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { authenticateJWT, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all teachers (admin only)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    // Verificar permisos (solo admin puede ver todos los profesores)
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const teachers = await Teacher.find()
      .populate('user', 'name email')
      .populate('courses', 'name code');
    
    res.status(200).json(teachers);
  } catch (error) {
    console.error('Error al obtener profesores:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Crear nuevo profesor (solo admin)
router.post('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { userId, teacherId, qualification, specialization, phoneNumber, address } = req.body;
    
    // Verificar si ya existe un profesor con ese ID
    let existingTeacher = await Teacher.findOne({ teacherId });
    if (existingTeacher) {
      return res.status(400).json({ message: 'Ya existe un profesor con ese ID' });
    }
    
    // Verificar si el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar si el usuario ya tiene un perfil de profesor
    existingTeacher = await Teacher.findOne({ user: userId });
    if (existingTeacher) {
      return res.status(400).json({ message: 'Este usuario ya tiene un perfil de profesor' });
    }
    
    // Crear nuevo profesor
    const teacher = new Teacher({
      user: userId,
      teacherId: teacherId || `PROF${Math.floor(10000 + Math.random() * 90000)}`,
      qualification,
      specialization,
      phoneNumber,
      address
    });
    
    await teacher.save();
    
    // Actualizar el rol del usuario si no es ya un profesor
    if (user.role !== 'teacher') {
      user.role = 'teacher';
      await user.save();
    }
    
    res.status(201).json({
      message: 'Profesor creado exitosamente',
      teacher: await Teacher.findById(teacher._id)
        .populate('user', 'name email')
        .populate('courses', 'name code')
    });
  } catch (error) {
    console.error('Error al crear profesor:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener profesor por ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('user', 'name email')
      .populate('courses', 'name code');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }
    
    // Verificar permisos (admin o el propio profesor)
    if (req.user.role === 'teacher' && req.user.id !== teacher.user._id.toString()) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    res.status(200).json(teacher);
  } catch (error) {
    console.error('Error al obtener profesor:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Actualizar profesor (admin o el propio profesor)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { qualification, specialization, phoneNumber, address } = req.body;
    
    // Encontrar profesor
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }
    
    // Verificar permisos (admin o el propio profesor)
    if (req.user.role !== 'admin' && req.user.id !== teacher.user.toString()) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    // Actualizar campos
    if (qualification) teacher.qualification = qualification;
    if (specialization) teacher.specialization = specialization;
    if (phoneNumber) teacher.phoneNumber = phoneNumber;
    if (address) teacher.address = address;
    
    await teacher.save();
    
    res.status(200).json({
      message: 'Profesor actualizado exitosamente',
      teacher: await Teacher.findById(teacher._id)
        .populate('user', 'name email')
        .populate('courses', 'name code')
    });
  } catch (error) {
    console.error('Error al actualizar profesor:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener cursos de un profesor
router.get('/:id/courses', authenticateJWT, async (req, res) => {
  try {
    console.log(`Obteniendo cursos para el profesor con ID: ${req.params.id}`);
    
    // Primero verificamos si el profesor existe
    const teacher = await Teacher.findById(req.params.id);
    
    if (!teacher) {
      console.log(`Profesor con ID ${req.params.id} no encontrado`);
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }
    
    // Verificar permisos (admin o el propio profesor)
    if (req.user.role !== 'admin' && 
        req.user.role !== 'teacher' && 
        req.user.id !== teacher.user.toString()) {
      console.log('Acceso denegado: Usuario no autorizado');
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    // Obtener los cursos con toda la información necesaria
    const teacherWithCourses = await Teacher.findById(req.params.id)
      .populate({
        path: 'courses',
        select: 'name code description department startDate endDate schedule students status'
      });
    
    // Verificar si hay cursos asignados
    const courses = teacherWithCourses.courses || [];
    console.log(`Se encontraron ${courses.length} cursos para el profesor`);
    
    // Si no hay cursos, devolver un array vacío en lugar de null
    res.status(200).json({
      teacherId: teacher._id,
      courses: courses
    });
  } catch (error) {
    console.error('Error al obtener cursos del profesor:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Asignar cursos a profesor (solo admin)
router.post('/:id/courses', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { courseIds } = req.body;
    
    if (!courseIds || !Array.isArray(courseIds)) {
      return res.status(400).json({ message: 'Se requiere un array de IDs de cursos' });
    }
    
    // Encontrar profesor
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }
    
    // Encontrar cursos por IDs
    const courses = await Course.find({ _id: { $in: courseIds } });
    if (courses.length === 0) {
      return res.status(404).json({ message: 'No se encontraron cursos con los IDs proporcionados' });
    }
    
    // Actualizar profesor y cursos
    for (const course of courses) {
      if (!teacher.courses.includes(course._id)) {
        teacher.courses.push(course._id);
      }
      
      if (!course.teacher || course.teacher.toString() !== teacher._id.toString()) {
        course.teacher = teacher._id;
        await course.save();
      }
    }
    
    await teacher.save();
    
    res.status(200).json({
      message: 'Cursos asignados al profesor exitosamente',
      teacherId: teacher._id,
      assignedCourses: courses.map(c => ({ id: c._id, name: c.name, code: c.code }))
    });
  } catch (error) {
    console.error('Error al asignar cursos al profesor:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Eliminar profesor (solo admin)
router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    
    if (!teacher) {
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }
    
    // Actualizar cursos asignados a este profesor
    for (const courseId of teacher.courses) {
      const course = await Course.findById(courseId);
      if (course) {
        course.teacher = null;
        await course.save();
      }
    }
    
    // Eliminar profesor
    await teacher.deleteOne();
    
    res.status(200).json({ message: 'Profesor eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar profesor:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

export default router;
