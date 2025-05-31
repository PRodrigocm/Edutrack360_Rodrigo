import express from 'express';
import Attendance from '../models/Attendance.js';
import Course from '../models/Course.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import { authenticateJWT, isTeacher, isCourseTeacher } from '../middleware/auth.js';

const router = express.Router();

// Get attendance records for a course
router.get('/course/:courseId', authenticateJWT, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Build query
    const query = { course: courseId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
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
      
      // Students can only see their own attendance
      const attendanceRecords = await Attendance.find(query)
        .populate('takenBy', 'teacherId')
        .sort({ date: -1 });
      
      // Filter records to include only this student
      const filteredRecords = attendanceRecords.map(record => {
        return {
          _id: record._id,
          course: record.course,
          date: record.date,
          takenBy: record.takenBy,
          createdAt: record.createdAt,
          record: record.records.find(r => r.student.toString() === student._id.toString())
        };
      });
      
      return res.status(200).json(filteredRecords);
    }
    
    // For admin and teachers, return all records
    const attendanceRecords = await Attendance.find(query)
      .populate({
        path: 'records.student',
        select: 'studentId user',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .populate('takenBy', 'teacherId')
      .sort({ date: -1 });
    
    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error('Get attendance records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create attendance record (teacher only)
router.post('/', authenticateJWT, isTeacher, async (req, res) => {
  try {
    const { courseId, date, records } = req.body;
    
    // Validate input
    if (!courseId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Course ID, date, and student records are required' });
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
      return res.status(403).json({ message: 'Not authorized to take attendance for this course' });
    }
    
    // Check if attendance record already exists for this date
    const existingRecord = await Attendance.findOne({
      course: courseId,
      date: new Date(date)
    });
    
    if (existingRecord) {
      return res.status(400).json({ message: 'Attendance record already exists for this date' });
    }
    
    // Create attendance record
    const attendanceRecord = new Attendance({
      course: courseId,
      date: new Date(date),
      records,
      takenBy: teacher._id
    });
    
    await attendanceRecord.save();
    
    res.status(201).json({
      message: 'Attendance recorded successfully',
      attendance: attendanceRecord
    });
  } catch (error) {
    console.error('Create attendance record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update attendance record (teacher only)
router.put('/:id', authenticateJWT, isTeacher, async (req, res) => {
  try {
    const { records } = req.body;
    
    // Find attendance record
    const attendanceRecord = await Attendance.findById(req.params.id);
    if (!attendanceRecord) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    // Get teacher
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }
    
    // Check if teacher is the one who took this attendance or is admin
    if (attendanceRecord.takenBy.toString() !== teacher._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this attendance record' });
    }
    
    // Update records
    attendanceRecord.records = records;
    await attendanceRecord.save();
    
    res.status(200).json({
      message: 'Attendance updated successfully',
      attendance: attendanceRecord
    });
  } catch (error) {
    console.error('Update attendance record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student attendance summary
router.get('/student/:studentId', authenticateJWT, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Find student
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check permission
    if (req.user.role === 'student' && student.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this data' });
    }
    
    // Get all attendance records for this student
    const attendanceRecords = await Attendance.find({
      'records.student': student._id
    }).populate('course', 'name code');
    
    // Compute statistics
    const summary = {
      totalDays: attendanceRecords.length,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      byCourse: {}
    };
    
    attendanceRecords.forEach(record => {
      const studentRecord = record.records.find(r => r.student.toString() === student._id.toString());
      
      if (studentRecord) {
        summary[studentRecord.status]++;
        
        // Initialize course summary if needed
        const courseId = record.course._id.toString();
        if (!summary.byCourse[courseId]) {
          summary.byCourse[courseId] = {
            courseName: record.course.name,
            courseCode: record.course.code,
            totalDays: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0
          };
        }
        
        summary.byCourse[courseId].totalDays++;
        summary.byCourse[courseId][studentRecord.status]++;
      }
    });
    
    res.status(200).json({
      studentId,
      summary
    });
  } catch (error) {
    console.error('Get student attendance summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;