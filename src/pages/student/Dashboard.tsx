import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import StudentHome from './Home.tsx';
import Courses from './Courses.tsx';
import MyAttendance from './MyAttendance.tsx';
import MyAssignments from './MyAssignments.tsx';
import MyGrades from './MyGrades.tsx';
import Profile from '../common/Profile.tsx';

const StudentDashboard = () => {
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
            <Route path="/" element={<StudentHome />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/attendance" element={<MyAttendance />} />
            <Route path="/assignments" element={<MyAssignments />} />
            <Route path="/grades" element={<MyGrades />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/student" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;