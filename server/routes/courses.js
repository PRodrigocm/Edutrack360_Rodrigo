import express from 'express';
import Course from '../models/Course.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import { authenticateJWT, isAdmin, isTeacher, isCourseTeacher } from '../middleware/auth.js';

const router = express.Router();

// Get all courses
router.get('/', authenticateJWT, async (req, res) => {
  try {
    let courses;
    
    // Admin can see all courses
    if (req.user.role === 'admin') {
      courses = await Course.find()
        .populate({
          path: 'teacher',
          populate: {
            path: 'user',
            select: 'name email'
          }
        })
        .populate('createdBy', 'name');
    }
    // Teachers can see their assigned courses
    else if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user.id });
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher profile not found' });
      }
      
      courses = await Course.find({ teacher: teacher._id })
        .populate({
          path: 'teacher',
          populate: {
            path: 'user',
            select: 'name email'
          }
        })
        .populate('createdBy', 'name');
    }
    // Students can see courses they're enrolled in
    else {
      const student = await Student.findOne({ user: req.user.id });
      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }
      
      courses = await Course.find({ students: student._id })
        .populate({
          path: 'teacher',
          populate: {
            path: 'user',
            select: 'name email'
          }
        })
        .populate('createdBy', 'name');
    }
    
    res.status(200).json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new course (admin only)
router.post('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { name, code, description, teacherId, startDate, endDate, schedule } = req.body;
    
    // Check if course code already exists
    let course = await Course.findOne({ code });
    if (course) {
      return res.status(400).json({ message: 'Course code already exists' });
    }
    
    // Find teacher if teacherId is provided
    let teacher = null;
    if (teacherId) {
      teacher = await Teacher.findOne({ teacherId });
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
    }
    
    // Create new course
    course = new Course({
      name,
      code,
      description,
      teacher: teacher ? teacher._id : null,
      startDate,
      endDate,
      schedule,
      createdBy: req.user.id
    });
    
    await course.save();
    
    // Update teacher's courses array
    if (teacher) {
      teacher.courses.push(course._id);
      await teacher.save();
    }
    
    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'teacher',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate('students', 'studentId')
      .populate('blocks', 'name')
      .populate('createdBy', 'name');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check permission for teachers and students
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user.id });
      if (!teacher || course.teacher.toString() !== teacher._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this course' });
      }
    } else if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      if (!student || !course.students.includes(student._id)) {
        return res.status(403).json({ message: 'Not enrolled in this course' });
      }
    }
    
    res.status(200).json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update course (admin only)
router.put('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { name, description, teacher, startDate, endDate, schedule, blocks } = req.body;
    
    // Find course
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Handle teacher change if needed
    let newTeacher = null;
    if (teacher) {
      // Aquí el ID del profesor viene directamente como el ObjectId de MongoDB
      newTeacher = await Teacher.findById(teacher);
      if (!newTeacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      
      // If teacher is different, update teacher's courses arrays
      if (!course.teacher || course.teacher.toString() !== newTeacher._id.toString()) {
        if (course.teacher) {
          // Remove course from old teacher
          const oldTeacher = await Teacher.findById(course.teacher);
          if (oldTeacher) {
            oldTeacher.courses = oldTeacher.courses.filter(id => id.toString() !== course._id.toString());
            await oldTeacher.save();
          }
        }
        
        // Add course to new teacher
        newTeacher.courses.push(course._id);
        await newTeacher.save();
      }
    }
    
    // Update course
    course.name = name || course.name;
    course.description = description || course.description;
    course.teacher = newTeacher ? newTeacher._id : course.teacher;
    course.startDate = startDate || course.startDate;
    course.endDate = endDate || course.endDate;
    course.schedule = schedule || course.schedule;
    
    // Actualizar bloques si se proporcionan
    if (blocks && Array.isArray(blocks)) {
      course.blocks = blocks;
    }
    
    await course.save();
    
    res.status(200).json({
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add students to course (admin only)
router.post('/:id/students', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { studentIds } = req.body;
    
    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ message: 'Student IDs array is required' });
    }
    
    // Find course
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Find students by IDs
    const students = await Student.find({ studentId: { $in: studentIds } });
    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found with the provided IDs' });
    }
    
    // Update course and students
    for (const student of students) {
      if (!course.students.includes(student._id)) {
        course.students.push(student._id);
      }
      
      if (!student.courses.includes(course._id)) {
        student.courses.push(course._id);
        await student.save();
      }
    }
    
    await course.save();
    
    res.status(200).json({
      message: 'Students added to course successfully',
      courseId: course._id,
      addedStudents: students.map(s => s.studentId)
    });
  } catch (error) {
    console.error('Add students to course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Actualizar lista completa de estudiantes asignados a un curso (admin only)
router.put('/:id/students', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { studentIds } = req.body;
    
    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ message: 'Student IDs array is required' });
    }
    
    // Find course
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Obtener los estudiantes actuales para poder eliminar referencias si es necesario
    const currentStudentIds = [...course.students];
    
    // Limpiar la lista actual de estudiantes
    course.students = [];
    
    // Añadir los nuevos estudiantes seleccionados
    for (const studentId of studentIds) {
      // Verificar que el ID es válido
      if (!studentId.match(/^[0-9a-fA-F]{24}$/)) {
        continue; // Saltar IDs inválidos
      }
      
      course.students.push(studentId);
      
      // Actualizar la referencia en el estudiante si no existe
      const student = await Student.findById(studentId);
      if (student && !student.courses.includes(course._id)) {
        student.courses.push(course._id);
        await student.save();
      }
    }
    
    // Eliminar referencias del curso en estudiantes que ya no están asignados
    for (const oldStudentId of currentStudentIds) {
      if (!studentIds.includes(oldStudentId.toString())) {
        const student = await Student.findById(oldStudentId);
        if (student) {
          student.courses = student.courses.filter(id => id.toString() !== course._id.toString());
          await student.save();
        }
      }
    }
    
    await course.save();
    
    res.status(200).json({
      message: 'Students assigned to course successfully',
      courseId: course._id,
      studentCount: course.students.length
    });
  } catch (error) {
    console.error('Assign students to course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove student from course (admin only)
router.delete('/:courseId/students/:studentId', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    
    // Find course and student
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Remove student from course
    course.students = course.students.filter(id => id.toString() !== student._id.toString());
    await course.save();
    
    // Remove course from student
    student.courses = student.courses.filter(id => id.toString() !== course._id.toString());
    await student.save();
    
    res.status(200).json({
      message: 'Student removed from course successfully'
    });
  } catch (error) {
    console.error('Remove student from course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete course (admin only)
router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Remove course from teacher
    if (course.teacher) {
      const teacher = await Teacher.findById(course.teacher);
      if (teacher) {
        teacher.courses = teacher.courses.filter(id => id.toString() !== course._id.toString());
        await teacher.save();
      }
    }
    
    // Remove course from students
    for (const studentId of course.students) {
      const student = await Student.findById(studentId);
      if (student) {
        student.courses = student.courses.filter(id => id.toString() !== course._id.toString());
        await student.save();
      }
    }
    
    // Remove course from blocks
    for (const blockId of course.blocks) {
      const block = await Block.findById(blockId);
      if (block) {
        block.courses = block.courses.filter(id => id.toString() !== course._id.toString());
        await block.save();
      }
    }
    
    // Delete course
    await course.deleteOne();
    
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;