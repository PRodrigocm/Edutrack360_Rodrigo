import React, { useState } from 'react';
import { User, Search, Filter, Mail, Phone, Download } from 'lucide-react';
import Chart from '../../components/Chart';

const StudentList = () => {
  // Mock data for courses
  const [courses] = useState([
    { id: 1, name: 'Mathematics 101' },
    { id: 2, name: 'Physics 202' },
    { id: 3, name: 'Chemistry 303' },
    { id: 4, name: 'Biology 404' },
  ]);

  // Mock data for students
  const [students, setStudents] = useState([
    {
      id: 1,
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      phone: '(555) 123-4567',
      studentId: 'ST-2025-001',
      course: 'Mathematics 101',
      grade: 'A',
      attendance: 95,
      assignments: 8,
      completedAssignments: 7,
    },
    {
      id: 2,
      name: 'Emma Williams',
      email: 'emma.williams@example.com',
      phone: '(555) 234-5678',
      studentId: 'ST-2025-002',
      course: 'Mathematics 101',
      grade: 'B+',
      attendance: 90,
      assignments: 8,
      completedAssignments: 8,
    },
    {
      id: 3,
      name: 'Noah Brown',
      email: 'noah.brown@example.com',
      phone: '(555) 345-6789',
      studentId: 'ST-2025-003',
      course: 'Physics 202',
      grade: 'C',
      attendance: 80,
      assignments: 6,
      completedAssignments: 5,
    },
    {
      id: 4,
      name: 'Olivia Davis',
      email: 'olivia.davis@example.com',
      phone: '(555) 456-7890',
      studentId: 'ST-2025-004',
      course: 'Chemistry 303',
      grade: 'A-',
      attendance: 92,
      assignments: 5,
      completedAssignments: 5,
    },
    {
      id: 5,
      name: 'Liam Miller',
      email: 'liam.miller@example.com',
      phone: '(555) 567-8901',
      studentId: 'ST-2025-005',
      course: 'Biology 404',
      grade: 'B',
      attendance: 88,
      assignments: 7,
      completedAssignments: 6,
    },
  ]);

  const [selectedCourse, setSelectedCourse] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter students based on course and search term
  const filteredStudents = students.filter((student) => {
    const matchesCourse = selectedCourse === 'all' || student.course === selectedCourse;
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  // Chart data for grade distribution
  const gradeData = {
    labels: ['A', 'B', 'C', 'D', 'F'],
    datasets: [
      {
        label: 'Grade Distribution',
        data: [15, 20, 10, 5, 2],
        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
        hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#dda20a', '#be2617'],
        hoverBorderColor: 'rgba(234, 236, 244, 1)',
      },
    ],
  };

  // Chart data for attendance rate
  const attendanceData = {
    labels: ['90-100%', '80-89%', '70-79%', '60-69%', 'Below 60%'],
    datasets: [
      {
        label: 'Attendance Rate',
        data: [25, 15, 8, 4, 0],
        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
        hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#dda20a', '#be2617'],
        hoverBorderColor: 'rgba(234, 236, 244, 1)',
      },
    ],
  };

  // Get grade color
  const getGradeColor = (grade) => {
    const firstChar = grade.charAt(0);
    switch (firstChar) {
      case 'A':
        return 'text-blue-600';
      case 'B':
        return 'text-green-600';
      case 'C':
        return 'text-yellow-600';
      case 'D':
        return 'text-orange-600';
      case 'F':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get attendance color
  const getAttendanceColor = (attendance) => {
    if (attendance >= 90) return 'text-blue-600';
    if (attendance >= 80) return 'text-green-600';
    if (attendance >= 70) return 'text-yellow-600';
    if (attendance >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  // Get assignment completion color
  const getAssignmentCompletionColor = (completed, total) => {
    const percentage = (completed / total) * 100;
    if (percentage === 100) return 'text-blue-600';
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Student List</h1>

      {/* Student Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Grade Distribution</h2>
          <Chart type="doughnut" data={gradeData} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Attendance Rate</h2>
          <Chart type="doughnut" data={attendanceData} />
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.name}>{course.name}</option>
              ))}
            </select>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Filter size={18} className="mr-2" />
            Apply Filters
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Download size={18} className="mr-2" />
            Export List
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-700">Students</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignments
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={20} className="text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Mail size={16} className="text-gray-400 mr-2" />
                      {student.email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      <Phone size={16} className="text-gray-400 mr-2" />
                      {student.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-bold ${getGradeColor(student.grade)}`}>
                      {student.grade}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getAttendanceColor(student.attendance)}`}>
                      {student.attendance}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getAssignmentCompletionColor(student.completedAssignments, student.assignments)}`}>
                      {student.completedAssignments}/{student.assignments}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
