import React, { useState } from 'react';
import { BarChart3, PieChart, LineChart, Download, Calendar, Filter, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Chart from '../../components/Chart';

const Reports = () => {
  // Estado para manejar la carga durante la exportación
  const [isExporting, setIsExporting] = useState(false);
  // Report types
  const reportTypes = [
    { id: 'attendance', name: 'Attendance Reports' },
    { id: 'grades', name: 'Grade Reports' },
    { id: 'assignments', name: 'Assignment Reports' },
    { id: 'teachers', name: 'Teacher Performance' },
    { id: 'students', name: 'Student Performance' },
  ];

  // Time periods
  const timePeriods = [
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'quarter', name: 'This Quarter' },
    { id: 'semester', name: 'This Semester' },
    { id: 'year', name: 'This Year' },
    { id: 'custom', name: 'Custom Range' },
  ];

  const [selectedReportType, setSelectedReportType] = useState('attendance');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('month');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showCustomRange, setShowCustomRange] = useState(false);

  // Handle time period change
  const handleTimePeriodChange = (period: string) => {
    setSelectedTimePeriod(period);
    setShowCustomRange(period === 'custom');
  };

  // Función para exportar el informe a PDF
  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      
      // Construir los filtros basados en el período de tiempo seleccionado
      const filters: any = {};
      
      // Añadir rango de fechas si se ha seleccionado un período personalizado
      if (selectedTimePeriod === 'custom' && dateRange.start && dateRange.end) {
        filters.startDate = dateRange.start;
        filters.endDate = dateRange.end;
      } else {
        filters.timePeriod = selectedTimePeriod;
      }
      
      // Obtener el token de autenticación del localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Debe iniciar sesión para exportar informes');
        setIsExporting(false);
        return;
      }
      
      // Llamar al endpoint para generar el PDF con el token de autenticación
      const response = await axios.post('http://localhost:5000/api/reports/generate', 
        {
          reportType: selectedReportType,
          filters
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Mostrar mensaje de éxito
        toast.success('Informe generado con éxito');
        
        // Descargar el archivo con el token de autenticación
        // Crear un enlace temporal para la descarga
        const downloadLink = document.createElement('a');
        downloadLink.href = `http://localhost:5000/api/reports/download/${response.data.fileName}?token=${token}`;
        downloadLink.target = '_blank';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } else {
        toast.error(response.data.message || 'Error al generar el informe');
      }
    } catch (error) {
      console.error('Error al exportar el informe:', error);
      toast.error('Error al generar el informe. Por favor, inténtelo de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  // Attendance data for chart
  const attendanceData = {
    labels: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'],
    datasets: [
      {
        label: 'Present',
        data: [90, 85, 88, 92, 87],
        backgroundColor: '#4e73df',
      },
      {
        label: 'Absent',
        data: [5, 8, 7, 3, 8],
        backgroundColor: '#e74a3b',
      },
      {
        label: 'Late',
        data: [5, 7, 5, 5, 5],
        backgroundColor: '#f6c23e',
      },
    ],
  };

  // Grade distribution data
  const gradeData = {
    labels: ['A', 'B', 'C', 'D', 'F'],
    datasets: [
      {
        label: 'Mathematics',
        data: [30, 25, 20, 15, 10],
        backgroundColor: '#4e73df',
      },
      {
        label: 'Physics',
        data: [25, 30, 20, 15, 10],
        backgroundColor: '#1cc88a',
      },
      {
        label: 'Chemistry',
        data: [20, 25, 30, 15, 10],
        backgroundColor: '#36b9cc',
      },
      {
        label: 'Biology',
        data: [35, 25, 20, 10, 10],
        backgroundColor: '#f6c23e',
      },
      {
        label: 'Computer Science',
        data: [40, 30, 15, 10, 5],
        backgroundColor: '#e74a3b',
      },
    ],
  };

  // Assignment completion data
  const assignmentData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
    datasets: [
      {
        label: 'Submitted On Time',
        data: [85, 88, 80, 82, 90, 92, 88, 85],
        backgroundColor: '#4e73df',
      },
      {
        label: 'Late Submissions',
        data: [10, 7, 12, 10, 5, 3, 7, 10],
        backgroundColor: '#f6c23e',
      },
      {
        label: 'Not Submitted',
        data: [5, 5, 8, 8, 5, 5, 5, 5],
        backgroundColor: '#e74a3b',
      },
    ],
  };

  // Teacher performance data
  const teacherData = {
    labels: ['Dr. John Smith', 'Prof. Jane Doe', 'Dr. Robert Johnson', 'Dr. Emily Davis', 'Prof. Michael Wilson'],
    datasets: [
      {
        label: 'Student Satisfaction (out of 5)',
        data: [4.5, 4.2, 3.8, 4.7, 4.0],
        backgroundColor: '#4e73df',
      },
      {
        label: 'Course Completion Rate (%)',
        data: [95, 90, 85, 98, 88],
        backgroundColor: '#1cc88a',
      },
      {
        label: 'Grading Timeliness (%)',
        data: [90, 85, 80, 95, 88],
        backgroundColor: '#36b9cc',
      },
    ],
  };

  // Student performance trend data
  const studentPerformanceData = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'Average GPA',
        data: [3.2, 3.3, 3.4, 3.5, 3.6],
        fill: false,
        borderColor: '#4e73df',
        tension: 0.1,
      },
      {
        label: 'Attendance Rate (%)',
        data: [88, 90, 92, 91, 93],
        fill: false,
        borderColor: '#1cc88a',
        tension: 0.1,
      },
      {
        label: 'Assignment Completion (%)',
        data: [85, 87, 90, 92, 94],
        fill: false,
        borderColor: '#f6c23e',
        tension: 0.1,
      },
    ],
  };

  // Render chart based on selected report type
  const renderChart = () => {
    switch (selectedReportType) {
      case 'attendance':
        return (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Attendance by Department</h2>
            <Chart 
              type="bar" 
              data={attendanceData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    stacked: true,
                  },
                  y: {
                    stacked: true,
                    beginAtZero: true,
                    max: 100,
                  },
                },
              }} 
            />
          </div>
        );
      case 'grades':
        return (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Grade Distribution by Department</h2>
            <Chart 
              type="bar" 
              data={gradeData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }} 
            />
          </div>
        );
      case 'assignments':
        return (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Assignment Completion Rates</h2>
            <Chart 
              type="bar" 
              data={assignmentData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    stacked: true,
                  },
                  y: {
                    stacked: true,
                    beginAtZero: true,
                    max: 100,
                  },
                },
              }} 
            />
          </div>
        );
      case 'teachers':
        return (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Teacher Performance Metrics</h2>
            <Chart 
              type="bar" 
              data={teacherData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }} 
            />
          </div>
        );
      case 'students':
        return (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Student Performance Trends</h2>
            <Chart 
              type="line" 
              data={studentPerformanceData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }} 
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Render report summary cards
  const renderSummaryCards = () => {
    switch (selectedReportType) {
      case 'attendance':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Average Attendance</p>
                  <h3 className="text-2xl font-bold text-blue-700">88.4%</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <BarChart3 size={24} className="text-blue-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Highest Attendance</p>
                  <h3 className="text-2xl font-bold text-green-700">Biology (92%)</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <BarChart3 size={24} className="text-green-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Lowest Attendance</p>
                  <h3 className="text-2xl font-bold text-red-700">Physics (85%)</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <BarChart3 size={24} className="text-red-500" />
                </div>
              </div>
            </div>
          </div>
        );
      case 'grades':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Average GPA</p>
                  <h3 className="text-2xl font-bold text-blue-700">3.2</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <PieChart size={24} className="text-blue-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Highest GPA</p>
                  <h3 className="text-2xl font-bold text-green-700">Computer Science (3.5)</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <PieChart size={24} className="text-green-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Lowest GPA</p>
                  <h3 className="text-2xl font-bold text-red-700">Chemistry (2.9)</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <PieChart size={24} className="text-red-500" />
                </div>
              </div>
            </div>
          </div>
        );
      case 'assignments':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">On-Time Submissions</p>
                  <h3 className="text-2xl font-bold text-blue-700">86.3%</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText size={24} className="text-blue-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">Late Submissions</p>
                  <h3 className="text-2xl font-bold text-yellow-700">8.0%</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <FileText size={24} className="text-yellow-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Missing Submissions</p>
                  <h3 className="text-2xl font-bold text-red-700">5.7%</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <FileText size={24} className="text-red-500" />
                </div>
              </div>
            </div>
          </div>
        );
      case 'teachers':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Avg. Satisfaction</p>
                  <h3 className="text-2xl font-bold text-blue-700">4.2/5.0</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <BarChart3 size={24} className="text-blue-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Top Performer</p>
                  <h3 className="text-2xl font-bold text-green-700">Dr. Emily Davis</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <BarChart3 size={24} className="text-green-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Needs Improvement</p>
                  <h3 className="text-2xl font-bold text-red-700">Dr. Robert Johnson</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <BarChart3 size={24} className="text-red-500" />
                </div>
              </div>
            </div>
          </div>
        );
      case 'students':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">GPA Trend</p>
                  <h3 className="text-2xl font-bold text-blue-700">+0.4 (5 months)</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <LineChart size={24} className="text-blue-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Attendance Trend</p>
                  <h3 className="text-2xl font-bold text-green-700">+5% (5 months)</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <LineChart size={24} className="text-green-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">Assignment Trend</p>
                  <h3 className="text-2xl font-bold text-yellow-700">+9% (5 months)</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <LineChart size={24} className="text-yellow-500" />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Reports</h1>

      {/* Report Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              id="reportType"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
            >
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="timePeriod" className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <select
              id="timePeriod"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedTimePeriod}
              onChange={(e) => handleTimePeriodChange(e.target.value)}
            >
              {timePeriods.map((period) => (
                <option key={period.id} value={period.id}>{period.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleExportReport}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Generando...
                </>
              ) : (
                <>
                  <Download size={18} className="mr-2" />
                  Export Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Custom Date Range */}
        {showCustomRange && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={16} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  id="startDate"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={16} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  id="endDate"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Filter size={18} className="mr-2" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Report Summary Cards */}
      {renderSummaryCards()}

      {/* Main Report Chart */}
      <div className="h-96">
        {renderChart()}
      </div>

      {/* Report Details Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-700">Detailed Report Data</h2>
        </div>
        <div className="p-4 text-center text-gray-500">
          <p>Select specific metrics and filters above to view detailed report data.</p>
          <p className="mt-2">You can export the full report data using the Export button.</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
