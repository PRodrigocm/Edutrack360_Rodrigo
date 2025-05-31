import express from 'express';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import { authenticateJWT, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get current user information
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get additional profile information based on role
    let profileInfo = {};
    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id });
      if (student) {
        profileInfo = {
          studentId: student._id,
          studentCode: student.studentId
        };
      }
    } else if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: user._id });
      if (teacher) {
        profileInfo = {
          teacherId: teacher._id,
          teacherCode: teacher.teacherId
        };
      }
    }
    
    res.status(200).json({
      ...user.toObject(),
      ...profileInfo
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user (admin only)
router.post('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    user = new User({
      name,
      email,
      password,
      role
    });
    
    await user.save();
    
    // If role is student or teacher, create corresponding profile
    if (role === 'student') {
      const { studentId } = req.body;
      const student = new Student({
        user: user._id,
        studentId: studentId || `STU${Math.floor(10000 + Math.random() * 90000)}`
      });
      await student.save();
    } else if (role === 'teacher') {
      const { teacherId } = req.body;
      const teacher = new Teacher({
        user: user._id,
        teacherId: teacherId || `TCH${Math.floor(10000 + Math.random() * 90000)}`
      });
      await teacher.save();
    }
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check permission (admin can access any user, users can access their own data)
    if (req.user.role !== 'admin' && req.user.id !== user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check permission (admin can update any user, users can update their own data)
    if (req.user.role !== 'admin' && req.user.id !== user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;
    
    // Only admin can change role
    if (req.user.role === 'admin' && req.body.role) {
      user.role = req.body.role;
    }
    
    await user.save();
    
    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete associated profiles
    if (user.role === 'student') {
      await Student.findOneAndDelete({ user: user._id });
    } else if (user.role === 'teacher') {
      await Teacher.findOneAndDelete({ user: user._id });
    }
    
    await user.deleteOne();
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;