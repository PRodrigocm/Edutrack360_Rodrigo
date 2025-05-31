import React from 'react';
import { Calendar, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';

// Mock data for assignments
const assignments = [
  {
    id: 1,
    title: 'Math Problem Set 5',
    course: 'Mathematics 101',
    dueDate: new Date('2025-08-15'),
    status: 'pending',
  },
  {
    id: 2,
    title: 'Physics Lab Report',
    course: 'Physics 202',
    dueDate: new Date('2025-08-18'),
    status: 'pending',
  },
  {
    id: 3,
    title: 'History Essay',
    course: 'History 303',
    dueDate: new Date('2025-08-20'),
    status: 'pending',
  },
  {
    id: 4,
    title: 'Literature Analysis',
    course: 'English 404',
    dueDate: new Date('2025-08-22'),
    status: 'pending',
  },
];

// Status badges
const statusBadges = {
  pending: 'bg-yellow-100 text-yellow-800',
  submitted: 'bg-blue-100 text-blue-800',
  graded: 'bg-green-100 text-green-800',
  late: 'bg-red-100 text-red-800',
};

const AssignmentsList = () => {
  // Calculate days remaining
  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assignment
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.map((assignment) => {
              const daysRemaining = getDaysRemaining(assignment.dueDate);
              
              return (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-md">
                        <FileText className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{assignment.course}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {format(assignment.dueDate, 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock size={14} className="text-gray-400 mr-1" />
                      {daysRemaining > 0
                        ? `${daysRemaining} days remaining`
                        : daysRemaining === 0
                        ? 'Due today'
                        : 'Overdue'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        statusBadges[assignment.status]
                      }`}
                    >
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary hover:text-primary-dark mr-3">
                      Submit
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignmentsList;