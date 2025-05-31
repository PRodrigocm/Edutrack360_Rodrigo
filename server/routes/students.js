import express from 'express';
import Student from '../models/Student.js';
import User from '../models/User.js';
import Block from '../models/Block.js';
import { authenticateJWT, isAdmin, isTeacher } from '../middleware/auth.js';

const router = express.Router();

// Get all students (admin and teachers)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    // Verificar permisos (solo admin y profesores pueden ver todos los estudiantes)
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const students = await Student.find()
      .populate('user', 'name email')
      .populate('block', 'name')
      .populate('courses', 'name code');
    
    res.status(200).json(students);
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Crear nuevo estudiante (solo admin)
router.post('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { userId, studentId, grade, department, block, phoneNumber, address, parentName, parentContact } = req.body;
    
    // Verificar si ya existe un estudiante con ese ID
    let existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ message: 'Ya existe un estudiante con ese ID' });
    }
    
    // Verificar si el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar si el usuario ya tiene un perfil de estudiante
    existingStudent = await Student.findOne({ user: userId });
    if (existingStudent) {
      return res.status(400).json({ message: 'Este usuario ya tiene un perfil de estudiante' });
    }
    
    // Verificar si el bloque existe
    let blockObj = null;
    if (block) {
      blockObj = await Block.findById(block);
      if (!blockObj) {
        return res.status(404).json({ message: 'Bloque no encontrado' });
      }
    }
    
    // Crear nuevo estudiante
    const student = new Student({
      user: userId,
      studentId: studentId || `STU${Math.floor(10000 + Math.random() * 90000)}`,
      grade,
      department,
      block: blockObj ? blockObj._id : null,
      phoneNumber,
      address,
      parentName,
      parentContact
    });
    
    await student.save();
    
    // Actualizar el bloque si existe
    if (blockObj) {
      blockObj.students.push(student._id);
      await blockObj.save();
    }
    
    // Actualizar el rol del usuario si no es ya un estudiante
    if (user.role !== 'student') {
      user.role = 'student';
      await user.save();
    }
    
    res.status(201).json({
      message: 'Estudiante creado exitosamente',
      student: await Student.findById(student._id)
        .populate('user', 'name email')
        .populate('block', 'name')
    });
  } catch (error) {
    console.error('Error al crear estudiante:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Obtener estudiante por ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email')
      .populate('block', 'name')
      .populate('courses', 'name code');
    
    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }
    
    // Verificar permisos (admin, profesor o el propio estudiante)
    if (req.user.role === 'student' && req.user.id !== student.user._id.toString()) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    res.status(200).json(student);
  } catch (error) {
    console.error('Error al obtener estudiante:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Actualizar estudiante (admin o el propio estudiante)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { grade, department, block, phoneNumber, address, parentName, parentContact } = req.body;
    
    // Encontrar estudiante
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }
    
    // Verificar permisos (admin o el propio estudiante)
    if (req.user.role !== 'admin' && req.user.id !== student.user.toString()) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    // Actualizar campos
    if (grade) student.grade = grade;
    if (department) student.department = department;
    if (phoneNumber) student.phoneNumber = phoneNumber;
    if (address) student.address = address;
    if (parentName) student.parentName = parentName;
    if (parentContact) student.parentContact = parentContact;
    
    // Actualizar bloque (solo admin)
    if (req.user.role === 'admin' && block) {
      // Si el estudiante ya tiene un bloque, removerlo de ese bloque
      if (student.block) {
        const oldBlock = await Block.findById(student.block);
        if (oldBlock) {
          oldBlock.students = oldBlock.students.filter(id => id.toString() !== student._id.toString());
          await oldBlock.save();
        }
      }
      
      // Asignar nuevo bloque
      const newBlock = await Block.findById(block);
      if (!newBlock) {
        return res.status(404).json({ message: 'Bloque no encontrado' });
      }
      
      student.block = newBlock._id;
      newBlock.students.push(student._id);
      await newBlock.save();
    }
    
    await student.save();
    
    res.status(200).json({
      message: 'Estudiante actualizado exitosamente',
      student: await Student.findById(student._id)
        .populate('user', 'name email')
        .populate('block', 'name')
        .populate('courses', 'name code')
    });
  } catch (error) {
    console.error('Error al actualizar estudiante:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Eliminar estudiante (solo admin)
router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }
    
    // Remover estudiante de los cursos
    for (const courseId of student.courses) {
      const course = await Course.findById(courseId);
      if (course) {
        course.students = course.students.filter(id => id.toString() !== student._id.toString());
        await course.save();
      }
    }
    
    // Remover estudiante del bloque
    if (student.block) {
      const block = await Block.findById(student.block);
      if (block) {
        block.students = block.students.filter(id => id.toString() !== student._id.toString());
        await block.save();
      }
    }
    
    // Eliminar estudiante
    await student.deleteOne();
    
    res.status(200).json({ message: 'Estudiante eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar estudiante:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

export default router;
