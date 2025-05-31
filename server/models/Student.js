import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  parentName: {
    type: String
  },
  parentContact: {
    type: String
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  block: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block'
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  grade: {
    type: String
  },
  department: {
    type: String
  }
});

const Student = mongoose.model('Student', studentSchema);

export default Student;