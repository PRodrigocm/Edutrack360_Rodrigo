import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherId: {
    type: String,
    required: true,
    unique: true
  },
  qualification: {
    type: String
  },
  specialization: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  address: {
    type: String
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  joinDate: {
    type: Date,
    default: Date.now
  }
});

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;