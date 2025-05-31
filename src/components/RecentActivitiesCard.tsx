import React from 'react';
import { UserCircle2 } from 'lucide-react';

// Mock data for recent activities
const activities = [
  {
    id: 1,
    user: 'John Doe',
    action: 'created a new course',
    target: 'Advanced Mathematics',
    time: '2 hours ago',
    type: 'course',
  },
  {
    id: 2,
    user: 'Sarah Johnson',
    action: 'updated assignment',
    target: 'Physics Lab Report',
    time: '3 hours ago',
    type: 'assignment',
  },
  {
    id: 3,
    user: 'Michael Smith',
    action: 'registered a new student',
    target: 'Emma Williams',
    time: '5 hours ago',
    type: 'student',
  },
  {
    id: 4,
    user: 'Jessica Brown',
    action: 'took attendance for',
    target: 'Introduction to Biology',
    time: 'Yesterday',
    type: 'attendance',
  },
  {
    id: 5,
    user: 'Robert Wilson',
    action: 'graded assignment',
    target: 'English Literature Essay',
    time: 'Yesterday',
    type: 'grade',
  },
];

// Activity type colors
const typeColors = {
  course: 'bg-blue-100 text-blue-800',
  assignment: 'bg-green-100 text-green-800',
  student: 'bg-purple-100 text-purple-800',
  attendance: 'bg-yellow-100 text-yellow-800',
  grade: 'bg-red-100 text-red-800',
};

const RecentActivitiesCard = () => {
  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <UserCircle2 className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{activity.user}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {activity.action} <span className="font-medium">{activity.target}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{activity.time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${typeColors[activity.type]}`}>
                    {activity.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentActivitiesCard;