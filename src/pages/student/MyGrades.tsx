// No se necesita importar React en archivos JSX/TSX modernos
import { BookOpen, Award, TrendingUp, TrendingDown } from 'lucide-react';
import Chart from '../../components/Chart';

const MyGrades = () => {
  // Mock data for grades overview
  const gradesData = {
    labels: ['A', 'B', 'C', 'D', 'F'],
    datasets: [
      {
        label: 'Grade Distribution',
        data: [8, 5, 2, 1, 0],
        backgroundColor: ['#4e73df', '#1cc88a', '#f6c23e', '#e74a3b', '#858796'],
        hoverBackgroundColor: ['#2e59d9', '#17a673', '#dda20a', '#be2617', '#6e707e'],
        hoverBorderColor: 'rgba(234, 236, 244, 1)',
      },
    ],
  };

  // Mock data for performance trend
  const performanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'GPA',
        data: [3.2, 3.4, 3.3, 3.5, 3.7],
        fill: false,
        borderColor: '#4e73df',
        tension: 0.1,
      },
    ],
  };

  // Mock grades records
  const gradesRecords = [
    {
      id: 1,
      course: 'Mathematics 101',
      assignment: 'Midterm Exam',
      score: 92,
      maxScore: 100,
      grade: 'A',
      date: '2025-03-15',
      feedback: 'Excellent work on the calculus problems!',
    },
    {
      id: 2,
      course: 'Physics 202',
      assignment: 'Lab Report',
      score: 85,
      maxScore: 100,
      grade: 'B',
      date: '2025-03-20',
      feedback: 'Good analysis, but could improve on the discussion section.',
    },
    {
      id: 3,
      course: 'Chemistry 303',
      assignment: 'Final Project',
      score: 95,
      maxScore: 100,
      grade: 'A',
      date: '2025-04-05',
      feedback: 'Outstanding research and presentation!',
    },
    {
      id: 4,
      course: 'Biology 404',
      assignment: 'Quiz 3',
      score: 78,
      maxScore: 100,
      grade: 'C',
      date: '2025-04-12',
      feedback: 'Need to review the cell structure concepts.',
    },
  ];

  // Get grade color
  const getGradeColor = (grade: string) => {
    switch (grade) {
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

  // Get score color
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-blue-600';
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  // Get score icon
  const getScoreIcon = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return <TrendingUp size={16} className="text-green-500" />;
    if (percentage < 70) return <TrendingDown size={16} className="text-red-500" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">My Grades</h1>

      {/* Grades Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Grade Distribution</h2>
          <Chart type="doughnut" data={gradesData} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Performance Trend</h2>
          <Chart type="line" data={performanceData} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current GPA</p>
              <h3 className="text-2xl font-bold text-blue-700">3.7</h3>
            </div>
            <Award size={24} className="text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed Credits</p>
              <h3 className="text-2xl font-bold text-green-700">45</h3>
            </div>
            <BookOpen size={24} className="text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Remaining Credits</p>
              <h3 className="text-2xl font-bold text-yellow-700">75</h3>
            </div>
            <TrendingUp size={24} className="text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Grades Records */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-700">Recent Grades</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feedback
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gradesRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.course}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.assignment}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`text-sm font-medium ${getScoreColor(record.score, record.maxScore)}`}>
                        {record.score}/{record.maxScore}
                      </div>
                      <div className="ml-2">
                        {getScoreIcon(record.score, record.maxScore)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-bold ${getGradeColor(record.grade)}`}>
                      {record.grade}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{record.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">{record.feedback}</div>
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

export default MyGrades;
