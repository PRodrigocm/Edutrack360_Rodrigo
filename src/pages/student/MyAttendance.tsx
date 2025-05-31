// No se necesita importar React en archivos JSX/TSX modernos
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Chart from '../../components/Chart';

const MyAttendance = () => {
  // Mock data for attendance overview
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

  // Mock attendance records
  const attendanceRecords = [
    {
      id: 1,
      course: 'Mathematics 101',
      date: '2025-08-15',
      status: 'present',
      time: '10:00 AM',
    },
    {
      id: 2,
      course: 'Physics 202',
      date: '2025-08-14',
      status: 'present',
      time: '11:30 AM',
    },
    {
      id: 3,
      course: 'Chemistry 303',
      date: '2025-08-13',
      status: 'late',
      time: '2:15 PM',
    },
    {
      id: 4,
      course: 'Biology 404',
      date: '2025-08-12',
      status: 'absent',
      time: '9:00 AM',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'absent':
        return <XCircle size={20} className="text-red-500" />;
      case 'late':
        return <AlertCircle size={20} className="text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">My Attendance</h1>

      {/* Attendance Overview Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Attendance Overview</h2>
          <Chart type="doughnut" data={attendanceData} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Present</p>
                  <h3 className="text-2xl font-bold text-green-700">90%</h3>
                </div>
                <CheckCircle size={24} className="text-green-500" />
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Absent</p>
                  <h3 className="text-2xl font-bold text-red-700">5%</h3>
                </div>
                <XCircle size={24} className="text-red-500" />
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">Late</p>
                  <h3 className="text-2xl font-bold text-yellow-700">5%</h3>
                </div>
                <AlertCircle size={24} className="text-yellow-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-700">Attendance Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.course}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">{record.date}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock size={16} className="text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">{record.time}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(record.status)}
                      <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(record.status)}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </div>
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

export default MyAttendance;