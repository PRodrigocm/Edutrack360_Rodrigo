import React from 'react';

const Courses = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Course cards will be populated with actual data */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Title</h3>
          <p className="text-gray-600 mb-4">Course description and details will go here</p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Teacher: John Doe</span>
            <span>Room: 101</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;