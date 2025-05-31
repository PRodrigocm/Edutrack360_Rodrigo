import React from 'react';
import { BookOpen, ClipboardList, CheckSquare, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import Chart from '../../components/Chart';
import AssignmentsList from '../../components/AssignmentsList';

const StudentHome = () => {
  // Mock data for charts
  const attendanceData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [
      {
        label: 'Attendance Overview',
        data: [90, 5, 5],
        backgroundColor: ['#1cc88a', '#e74a3b', '#f6c23e'],
        hoverBackgroundColor: ['#17a673', '#d03b2f', '#dca834'],
        hoverBorderColor: 'rgba(234, 236, 244, 1)',
      },
    ],
  };

  const gradeData = {
    labels: ['Math', 'Science', 'History', 'English', 'Art'],
    datasets: [
      {
        label: 'Current Grade',
        backgroundColor: 'rgba(78, 115, 223, 0.8)',
        borderColor: 'rgba(78, 115, 223, 1)',
        data: [85, 78, 92, 88, 95],
        maxBarThickness: 25,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Enrolled Courses"
          value="5"
          icon={<BookOpen size={24} className="text-primary" />}
          bgColor="bg-primary"
          link="/student/courses"
        />
        <StatCard 
          title="Pending Assignments"
          value="8"
          icon={<ClipboardList size={24} className="text-warning" />}
          bgColor="bg-warning"
          link="/student/assignments"
        />
        <StatCard 
          title="Attendance Rate"
          value="90%"
          icon={<CheckSquare size={24} className="text-success" />}
          bgColor="bg-success"
          link="/student/attendance"
        />
        <StatCard 
          title="GPA"
          value="3.8"
          icon={<Award size={24} className="text-info" />}
          bgColor="bg-info"
          link="/student/grades"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Attendance Overview</h2>
          <Chart type="doughnut" data={attendanceData} />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Current Grades</h2>
          <Chart type="bar" data={gradeData} />
        </div>
      </div>
      
      {/* Upcoming Assignments */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-700">Upcoming Assignments</h2>
          <Link to="/student/assignments" className="text-primary hover:text-primary-dark text-sm font-medium">
            View All
          </Link>
        </div>
        <AssignmentsList />
      </div>
    </div>
  );
};

export default StudentHome;