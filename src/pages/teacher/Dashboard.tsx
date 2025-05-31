import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import TeacherHome from './Home.tsx';
import Courses from './Courses.tsx';
import AttendanceManagement from './AttendanceManagement.tsx';
import AssignmentManagement from './AssignmentManagement.tsx';
import StudentList from './StudentList.tsx';
import Profile from '../common/Profile.tsx';

const TeacherDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-[250px]">
        <TopBar toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4">
          <Routes>
            <Route path="/" element={<TeacherHome />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/attendance" element={<AttendanceManagement />} />
            <Route path="/assignments" element={<AssignmentManagement />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/teacher" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;