import express from 'express';
import Assignment from '../models/Assignment.js';
import Course from '../models/Course.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import { authenticateJWT, isTeacher, isCourseTeacher } from '../middleware/auth.js';

const router = express.Router();

// Get assignments for a course
router.get('/course/:courseId', authenticateJWT, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check permission
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
    
    // Get assignments
    const assignments = await Assignment.find({ course: courseId })
      .populate('createdBy', 'teacherId')
      .sort({ dueDate: 1 });
    
    // For students, add their submission status
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      
      const assignmentsWithStatus = assignments.map(assignment => {
        const submission = assignment.submissions.find(
          sub => sub.student && sub.student.toString() === student._id.toString()
        );
        
        return {
          ...assignment._doc,
          submission: submission || null
        };
      });
      
      return res.status(200).json(assignmentsWithStatus);
    }
    
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create assignment (teacher only)
router.post('/', authenticateJWT, isTeacher, async (req, res) => {
  try {
    const { title, description, courseId, dueDate, totalPoints, attachments } = req.body;
    
    // Validate input
    if (!title || !description || !courseId || !dueDate || !totalPoints) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Get teacher
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }
    
    // Check if teacher is assigned to this course
    if (course.teacher.toString() !== teacher._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create assignments for this course' });
    }
    
    // Create assignment
    const assignment = new Assignment({
      title,
      description,
      course: courseId,
      dueDate: new Date(dueDate),
      totalPoints,
      attachments: attachments || [],
      createdBy: teacher._id
    });
    
    await assignment.save();
    
    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assignment by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'name code')
      .populate('createdBy', 'teacherId')
      .populate({
        path: 'submissions.student',
        select: 'studentId user',
        populate: {
          path: 'user',
          select: 'name'
        }
      });
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Check permission
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user.id });
      const course = await Course.findById(assignment.course);
      
      if (!teacher || (course.teacher.toString() !== teacher._id.toString() && req.user.role !== 'admin')) {
        return res.status(403).json({ message: 'Not authorized to access this assignment' });
      }
    } else if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      const course = await Course.findById(assignment.course);
      
      if (!student || !course.students.includes(student._id)) {
        return res.status(403).json({ message: 'Not enrolled in this course' });
      }
      
      // Filter submissions to only show the student's own submission
      if (student) {
        assignment.submissions = assignment.submissions.filter(
          sub => sub.student && sub.student._id.toString() === student._id.toString()
        );
      }
    }
    
    res.status(200).json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit assignment (student only)
router.post('/:id/submit', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit assignments' });
    }
    
    const { attachments } = req.body;
    
    // Find assignment
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Find student
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    // Check if student is enrolled in the course
    const course = await Course.findById(assignment.course);
    if (!course.students.includes(student._id)) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }
    
    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      sub => sub.student && sub.student.toString() === student._id.toString()
    );
    
    if (existingSubmission) {
      // Update existing submission
      existingSubmission.attachments = attachments || existingSubmission.attachments;
      existingSubmission.submissionDate = new Date();
      existingSubmission.status = new Date() > assignment.dueDate ? 'late' : 'submitted';
    } else {
      // Create new submission
      assignment.submissions.push({
        student: student._id,
        attachments: attachments || [],
        status: new Date() > assignment.dueDate ? 'late' : 'submitted'
      });
    }
    
    await assignment.save();
    
    res.status(200).json({
      message: 'Assignment submitted successfully'
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Grade submission (teacher only)
router.post('/:id/grade/:submissionId', authenticateJWT, isTeacher, async (req, res) => {
  try {
    const { points, feedback } = req.body;
    
    // Find assignment
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Find teacher
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }
    
    // Check if teacher is assigned to this course
    const course = await Course.findById(assignment.course);
    if (course.teacher.toString() !== teacher._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to grade assignments for this course' });
    }
    
    // Find submission
    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Update submission with grade
    submission.grade = {
      points: Math.min(points, assignment.totalPoints), // Ensure points don't exceed total
      feedback,
      gradedBy: teacher._id,
      gradedAt: new Date()
    };
    
    submission.status = 'graded';
    
    await assignment.save();
    
    res.status(200).json({
      message: 'Submission graded successfully'
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update assignment (teacher only)
router.put('/:id', authenticateJWT, isTeacher, async (req, res) => {
  try {
    const { title, description, dueDate, totalPoints, attachments } = req.body;
    
    // Find assignment
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Find teacher
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }
    
    // Check if teacher created this assignment or is admin
    if (assignment.createdBy.toString() !== teacher._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }
    
    // Update assignment
    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (dueDate) assignment.dueDate = new Date(dueDate);
    if (totalPoints) assignment.totalPoints = totalPoints;
    if (attachments) assignment.attachments = attachments;
    
    await assignment.save();
    
    res.status(200).json({
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete assignment (teacher only)
router.delete('/:id', authenticateJWT, isTeacher, async (req, res) => {
  try {
    // Find assignment
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Find teacher
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }
    
    // Check if teacher created this assignment or is admin
    if (assignment.createdBy.toString() !== teacher._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }
    
    await assignment.deleteOne();
    
    res.status(200).json({
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;