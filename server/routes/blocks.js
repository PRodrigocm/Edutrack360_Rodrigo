import express from 'express';
import Block from '../models/Block.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import { authenticateJWT, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all blocks
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const blocks = await Block.find()
      .populate('students', 'studentId')
      .populate('courses', 'name code');
    
    res.status(200).json(blocks);
  } catch (error) {
    console.error('Error al obtener bloques:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Create new block (admin only)
router.post('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if block with same name already exists
    const existingBlock = await Block.findOne({ name });
    if (existingBlock) {
      return res.status(400).json({ message: 'Ya existe un bloque con ese nombre' });
    }
    
    // Create new block
    const block = new Block({
      name,
      description
    });
    
    await block.save();
    
    res.status(201).json({
      message: 'Bloque creado exitosamente',
      block
    });
  } catch (error) {
    console.error('Error al crear bloque:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Get block by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const block = await Block.findById(req.params.id)
      .populate('students', 'studentId')
      .populate('courses', 'name code');
    
    if (!block) {
      return res.status(404).json({ message: 'Bloque no encontrado' });
    }
    
    res.status(200).json(block);
  } catch (error) {
    console.error('Error al obtener bloque:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Update block (admin only)
router.put('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Find block
    const block = await Block.findById(req.params.id);
    if (!block) {
      return res.status(404).json({ message: 'Bloque no encontrado' });
    }
    
    // Check if new name already exists (if name is being changed)
    if (name && name !== block.name) {
      const existingBlock = await Block.findOne({ name });
      if (existingBlock) {
        return res.status(400).json({ message: 'Ya existe un bloque con ese nombre' });
      }
    }
    
    // Update fields
    block.name = name || block.name;
    block.description = description || block.description;
    
    await block.save();
    
    res.status(200).json({
      message: 'Bloque actualizado exitosamente',
      block
    });
  } catch (error) {
    console.error('Error al actualizar bloque:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Add students to block (admin only)
router.post('/:id/students', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { studentIds } = req.body;
    
    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ message: 'Se requiere un array de IDs de estudiantes' });
    }
    
    // Find block
    const block = await Block.findById(req.params.id);
    if (!block) {
      return res.status(404).json({ message: 'Bloque no encontrado' });
    }
    
    // Find students by IDs
    const students = await Student.find({ _id: { $in: studentIds } });
    if (students.length === 0) {
      return res.status(404).json({ message: 'No se encontraron estudiantes con los IDs proporcionados' });
    }
    
    // Update block and students
    for (const student of students) {
      if (!block.students.includes(student._id)) {
        block.students.push(student._id);
      }
      
      if (!student.block || student.block.toString() !== block._id.toString()) {
        // If student already has a block, remove from that block
        if (student.block) {
          const oldBlock = await Block.findById(student.block);
          if (oldBlock) {
            oldBlock.students = oldBlock.students.filter(id => id.toString() !== student._id.toString());
            await oldBlock.save();
          }
        }
        
        student.block = block._id;
        await student.save();
      }
    }
    
    await block.save();
    
    res.status(200).json({
      message: 'Estudiantes agregados al bloque exitosamente',
      blockId: block._id,
      addedStudents: students.map(s => s._id)
    });
  } catch (error) {
    console.error('Error al agregar estudiantes al bloque:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Add courses to block (admin only)
router.post('/:id/courses', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { courseIds } = req.body;
    
    if (!courseIds || !Array.isArray(courseIds)) {
      return res.status(400).json({ message: 'Se requiere un array de IDs de cursos' });
    }
    
    // Find block
    const block = await Block.findById(req.params.id);
    if (!block) {
      return res.status(404).json({ message: 'Bloque no encontrado' });
    }
    
    // Find courses by IDs
    const courses = await Course.find({ _id: { $in: courseIds } });
    if (courses.length === 0) {
      return res.status(404).json({ message: 'No se encontraron cursos con los IDs proporcionados' });
    }
    
    // Update block and courses
    for (const course of courses) {
      if (!block.courses.includes(course._id)) {
        block.courses.push(course._id);
      }
      
      if (!course.blocks.includes(block._id)) {
        course.blocks.push(block._id);
        await course.save();
      }
    }
    
    await block.save();
    
    res.status(200).json({
      message: 'Cursos agregados al bloque exitosamente',
      blockId: block._id,
      addedCourses: courses.map(c => c._id)
    });
  } catch (error) {
    console.error('Error al agregar cursos al bloque:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Delete block (admin only)
router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const block = await Block.findById(req.params.id);
    
    if (!block) {
      return res.status(404).json({ message: 'Bloque no encontrado' });
    }
    
    // Update students assigned to this block
    for (const studentId of block.students) {
      const student = await Student.findById(studentId);
      if (student) {
        student.block = null;
        await student.save();
      }
    }
    
    // Update courses assigned to this block
    for (const courseId of block.courses) {
      const course = await Course.findById(courseId);
      if (course) {
        course.blocks = course.blocks.filter(id => id.toString() !== block._id.toString());
        await course.save();
      }
    }
    
    // Delete block
    await block.deleteOne();
    
    res.status(200).json({ message: 'Bloque eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar bloque:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

export default router;
