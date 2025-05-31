// Servicio para la generación y descarga de reportes en PDF
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import Attendance from '../models/Attendance.js';
import Assignment from '../models/Assignment.js';
import { generateTeacherReportContent, generateStudentReportContent, generateAssignmentReportContent } from './report-functions.js';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio para almacenar los reportes generados
const REPORTS_DIR = path.join(__dirname, '..', 'reports');

// Crear el directorio si no existe
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * Genera un reporte en formato PDF
 * @param {string} reportType - Tipo de reporte (attendance, grades, performance, complete)
 * @param {Object} filters - Filtros para el reporte
 * @returns {Promise<Object>} - Resultado de la generación del reporte
 */
const generateReportPDF = async (reportType, filters = {}) => {
  try {
    // Crear directorio de reportes si no existe
    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }
    
    // Generar un nombre de archivo único para el reporte
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${reportType}_report_${timestamp}.pdf`;
    const filePath = path.join(REPORTS_DIR, fileName);
    
    // Crear un nuevo documento PDF
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4'
    });
    
    // Crear un stream para escribir el PDF a un archivo
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    
    // Variables para rastrear si hay datos
    let hasData = false;
    let contentAdded = 0;
    
    // Función para contar el contenido añadido
    const trackContent = () => {
      contentAdded++;
      hasData = true;
    };
    
    // Título del reporte
    let title = 'Reporte General';
    switch (reportType) {
      case 'attendance':
        title = 'Reporte de Asistencia';
        break;
      case 'grades':
        title = 'Reporte de Calificaciones';
        break;
      case 'performance':
        title = 'Reporte de Rendimiento';
        break;
      case 'complete':
      case 'general':
        title = 'Reporte Completo EduTrack360';
        break;
    }
    
    // Añadir título y fecha
    doc.fontSize(25).text(title, { align: 'center' });
    trackContent();
    doc.moveDown();
    doc.fontSize(12).text(`Fecha de generación: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.fontSize(12).text(`Hora de generación: ${new Date().toLocaleTimeString()}`, { align: 'right' });
    doc.moveDown(2);
    
    // Añadir información de filtros si hay alguno
    if (Object.keys(filters).length > 0) {
      doc.fontSize(14).text('Filtros aplicados:', { underline: true });
      doc.moveDown(0.5);
      
      if (filters.courseCode) doc.fontSize(12).text(`Código de curso: ${filters.courseCode}`);
      if (filters.courseName) doc.fontSize(12).text(`Nombre de curso: ${filters.courseName}`);
      if (filters.studentId) doc.fontSize(12).text(`ID de estudiante: ${filters.studentId}`);
      if (filters.studentName) doc.fontSize(12).text(`Nombre de estudiante: ${filters.studentName}`);
      if (filters.startDate) doc.fontSize(12).text(`Fecha de inicio: ${filters.startDate}`);
      if (filters.endDate) doc.fontSize(12).text(`Fecha de fin: ${filters.endDate}`);
      
      doc.moveDown();
    }
    
    // Validar el tipo de reporte y generar contenido específico
    switch (reportType) {
      case 'attendance':
        await generateAttendanceReportContent(doc, filters);
        break;
      case 'grades':
        await generateGradesReportContent(doc, filters);
        break;
      case 'teachers':
        await generateTeacherReportContent(doc, filters);
        break;
      case 'students':
        await generateStudentReportContent(doc, filters);
        break;
      case 'assignments':
        await generateAssignmentReportContent(doc, filters);
        break;
      case 'performance':
        await generatePerformanceReportContent(doc, filters);
        break;
      case 'general':
      case 'complete':
        await generateCompleteReportContent(doc, filters);
        break;
      default:
        // Si no se reconoce el tipo, generar un reporte general
        await generateCompleteReportContent(doc, filters);
    }
    
    // Verificar si el documento tiene poco contenido y agregar datos de ejemplo
    if (contentAdded < 10) {
      doc.addPage();
      doc.fontSize(18).text('DATOS DE EJEMPLO (NO HAY DATOS REALES)', { align: 'center', color: 'red' });
      doc.moveDown(2);
      
      // Agregar datos de ejemplo para docentes
      doc.fontSize(16).text('DOCENTES DE EJEMPLO', { underline: true });
      doc.moveDown();
      for (let i = 1; i <= 3; i++) {
        doc.fontSize(12).text(`Docente ${i}: Juan Pérez ${i}`);
        doc.fontSize(10).text(`   Especialización: Matemáticas Avanzadas`);
        doc.fontSize(10).text(`   Calificación: ${8 + i}`);
        doc.fontSize(10).text(`   Cursos asignados: ${i + 1}`);
        doc.moveDown();
      }
      
      // Agregar datos de ejemplo para estudiantes
      doc.fontSize(16).text('ESTUDIANTES DE EJEMPLO', { underline: true });
      doc.moveDown();
      for (let i = 1; i <= 5; i++) {
        doc.fontSize(12).text(`Estudiante ${i}: María García ${i}`);
        doc.fontSize(10).text(`   Grado: ${6 + (i % 3)}`);
        doc.fontSize(10).text(`   Departamento: Ciencias`);
        doc.moveDown();
      }
      
      // Verificar si hay datos
      if (!hasData && contentAdded < 3) {
        doc.moveDown(2);
        doc.fontSize(14).text('Nota sobre los datos', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text('No se encontraron suficientes datos para generar un reporte completo. Se recomienda revisar los filtros aplicados o verificar que existan datos en el sistema.', { italic: true });
        doc.moveDown();
        
        // Añadir información sobre cómo agregar datos al sistema
        doc.fontSize(14).text('Recomendaciones', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text('Para generar informes más completos, considere las siguientes acciones:');
        doc.moveDown(0.5);
        doc.fontSize(12).text('1. Añadir estudiantes al sistema desde el panel de administración de estudiantes.');
        doc.fontSize(12).text('2. Registrar profesores y asignarles departamentos.');
        doc.fontSize(12).text('3. Crear cursos y asignar estudiantes y profesores a ellos.');
        doc.fontSize(12).text('4. Registrar asistencias y calificaciones para los estudiantes.');
        doc.moveDown();
        doc.fontSize(12).text('Una vez que haya datos suficientes en el sistema, los informes se generarán automáticamente con información real y estadísticas relevantes.');
      }
    }
    
    // Finalizar el documento y cerrar el stream
    doc.end();
    
    // Esperar a que el stream termine de escribir
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        resolve({
          success: true,
          message: `El reporte ha sido generado y está listo para descargar.`,
          fileName: fileName,
          filePath: filePath,
          downloadUrl: `/api/reports/download/${fileName}`
        });
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    });
    
  } catch (error) {
    console.error('Error al generar el reporte PDF:', error);
    return {
      success: false,
      message: 'Lo siento, hubo un error al generar el reporte en PDF. Por favor, inténtalo de nuevo más tarde.'
    };
  }
};

/**
 * Genera el contenido para un reporte de asistencia
 * @param {SimpleReportGenerator} doc - Generador de reportes
 * @param {Object} filters - Filtros para el reporte
 */
const generateAttendanceReportContent = async (doc, filters) => {
  try {
    doc.fontSize(16).text('Reporte de Asistencia', { align: 'center' });
    doc.moveDown();
    
    // Obtener datos de asistencia según los filtros
    let query = {};
    
    if (filters.courseCode || filters.courseName) {
      const courseQuery = {};
      if (filters.courseCode) courseQuery.code = filters.courseCode;
      if (filters.courseName) courseQuery.name = { $regex: filters.courseName, $options: 'i' };
      
      const courses = await Course.find(courseQuery);
      if (courses.length > 0) {
        query.course = { $in: courses.map(c => c._id) };
      }
    }
    
    if (filters.studentId || filters.studentName) {
      const studentQuery = {};
      if (filters.studentId) studentQuery.studentId = filters.studentId;
      
      // Si hay nombre de estudiante, buscar en el modelo User
      if (filters.studentName) {
        const users = await User.find({ name: { $regex: filters.studentName, $options: 'i' } });
        if (users.length > 0) {
          const students = await Student.find({ user: { $in: users.map(u => u._id) } });
          if (students.length > 0) {
            query.student = { $in: students.map(s => s._id) };
          }
        }
      } else {
        const students = await Student.find(studentQuery);
        if (students.length > 0) {
          query.student = { $in: students.map(s => s._id) };
        }
      }
    }
    
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        query.date.$gte = startDate;
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        query.date.$lte = endDate;
      }
    }
    
    // Obtener registros de asistencia
    const attendanceRecords = await Attendance.find(query)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name' }
      })
      .populate('course', 'name code');
    
    if (attendanceRecords.length === 0) {
      doc.fontSize(12).text('No se encontraron registros de asistencia con los filtros proporcionados.', { italic: true });
      return;
    }
    
    // Agrupar por estudiante
    const studentAttendance = {};
    
    attendanceRecords.forEach(record => {
      const studentId = record.student ? record.student._id.toString() : 'unknown';
      const studentName = record.student && record.student.user ? record.student.user.name : 'Desconocido';
      
      if (!studentAttendance[studentId]) {
        studentAttendance[studentId] = {
          name: studentName,
          present: 0,
          absent: 0,
          total: 0,
          courses: {}
        };
      }
      
      studentAttendance[studentId].total++;
      if (record.status === 'present') {
        studentAttendance[studentId].present++;
      } else {
        studentAttendance[studentId].absent++;
      }
      
      // Agrupar también por curso
      const courseId = record.course ? record.course._id.toString() : 'unknown';
      const courseName = record.course ? `${record.course.code} - ${record.course.name}` : 'Curso desconocido';
      
      if (!studentAttendance[studentId].courses[courseId]) {
        studentAttendance[studentId].courses[courseId] = {
          name: courseName,
          present: 0,
          absent: 0,
          total: 0
        };
      }
      
      studentAttendance[studentId].courses[courseId].total++;
      if (record.status === 'present') {
        studentAttendance[studentId].courses[courseId].present++;
      } else {
        studentAttendance[studentId].courses[courseId].absent++;
      }
    });
    
    // Crear tabla de asistencia
    doc.fontSize(14).text('Resumen de Asistencia por Estudiante', { underline: true });
    doc.moveDown();
    
    Object.values(studentAttendance).forEach(student => {
      const attendanceRate = student.total > 0 ? ((student.present / student.total) * 100).toFixed(2) : 0;
      
      doc.fontSize(12).text(`Estudiante: ${student.name}`);
      doc.fontSize(10).text(`Asistencias: ${student.present} | Ausencias: ${student.absent} | Total: ${student.total}`);
      doc.fontSize(10).text(`Porcentaje de asistencia: ${attendanceRate}%`);
      
      doc.moveDown(0.5);
      doc.fontSize(10).text('Desglose por curso:', { italic: true });
      
      Object.values(student.courses).forEach(course => {
        const courseAttendanceRate = course.total > 0 ? ((course.present / course.total) * 100).toFixed(2) : 0;
        doc.fontSize(9).text(`- ${course.name}: ${courseAttendanceRate}% (${course.present}/${course.total})`);
      });
      
      doc.moveDown();
    });
    
  } catch (error) {
    console.error('Error al generar contenido del reporte de asistencia:', error);
    doc.fontSize(12).text('Error al generar el contenido del reporte de asistencia.', { italic: true });
  }
};

/**
 * Genera el contenido para un reporte de calificaciones
 * @param {SimpleReportGenerator} doc - Generador de reportes
 * @param {Object} filters - Filtros para el reporte
 */
const generateGradesReportContent = async (doc, filters) => {
  try {
    doc.fontSize(16).text('Reporte de Calificaciones', { align: 'center' });
    doc.moveDown();
    
    // Obtener datos de calificaciones según los filtros
    let query = {};
    
    if (filters.courseCode || filters.courseName) {
      const courseQuery = {};
      if (filters.courseCode) courseQuery.code = filters.courseCode;
      if (filters.courseName) courseQuery.name = { $regex: filters.courseName, $options: 'i' };
      
      const courses = await Course.find(courseQuery);
      if (courses.length > 0) {
        query.course = { $in: courses.map(c => c._id) };
      }
    }
    
    if (filters.studentId || filters.studentName) {
      const studentQuery = {};
      if (filters.studentId) studentQuery.studentId = filters.studentId;
      
      // Si hay nombre de estudiante, buscar en el modelo User
      if (filters.studentName) {
        const users = await User.find({ name: { $regex: filters.studentName, $options: 'i' } });
        if (users.length > 0) {
          const students = await Student.find({ user: { $in: users.map(u => u._id) } });
          if (students.length > 0) {
            query.student = { $in: students.map(s => s._id) };
          }
        }
      } else {
        const students = await Student.find(studentQuery);
        if (students.length > 0) {
          query.student = { $in: students.map(s => s._id) };
        }
      }
    }
    
    // Filtros de calificación
    if (filters.minGrade) {
      query.grade = { $gte: parseFloat(filters.minGrade) };
    }
    if (filters.maxGrade) {
      if (!query.grade) query.grade = {};
      query.grade.$lte = parseFloat(filters.maxGrade);
    }
    
    // Obtener asignaciones con calificaciones
    const assignments = await Assignment.find(query)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name' }
      })
      .populate('course', 'name code');
    
    if (assignments.length === 0) {
      doc.fontSize(12).text('No se encontraron calificaciones con los filtros proporcionados.', { italic: true });
      return;
    }
    
    // Agrupar por estudiante
    const studentGrades = {};
    
    assignments.forEach(assignment => {
      const studentId = assignment.student ? assignment.student._id.toString() : 'unknown';
      const studentName = assignment.student && assignment.student.user ? assignment.student.user.name : 'Desconocido';
      
      if (!studentGrades[studentId]) {
        studentGrades[studentId] = {
          name: studentName,
          totalGrade: 0,
          assignmentCount: 0,
          courses: {}
        };
      }
      
      if (assignment.grade !== undefined && assignment.grade !== null) {
        studentGrades[studentId].totalGrade += assignment.grade;
        studentGrades[studentId].assignmentCount++;
      }
      
      // Agrupar también por curso
      const courseId = assignment.course ? assignment.course._id.toString() : 'unknown';
      const courseName = assignment.course ? `${assignment.course.code} - ${assignment.course.name}` : 'Curso desconocido';
      
      if (!studentGrades[studentId].courses[courseId]) {
        studentGrades[studentId].courses[courseId] = {
          name: courseName,
          assignments: [],
          totalGrade: 0,
          assignmentCount: 0
        };
      }
      
      studentGrades[studentId].courses[courseId].assignments.push({
        title: assignment.title,
        grade: assignment.grade,
        submittedDate: assignment.submittedDate
      });
      
      if (assignment.grade !== undefined && assignment.grade !== null) {
        studentGrades[studentId].courses[courseId].totalGrade += assignment.grade;
        studentGrades[studentId].courses[courseId].assignmentCount++;
      }
    });
    
    // Crear tabla de calificaciones
    doc.fontSize(14).text('Resumen de Calificaciones por Estudiante', { underline: true });
    doc.moveDown();
    
    Object.values(studentGrades).forEach(student => {
      const averageGrade = student.assignmentCount > 0 ? (student.totalGrade / student.assignmentCount).toFixed(2) : 'N/A';
      
      doc.fontSize(12).text(`Estudiante: ${student.name}`);
      doc.fontSize(10).text(`Calificación promedio: ${averageGrade}`);
      doc.fontSize(10).text(`Total de asignaciones calificadas: ${student.assignmentCount}`);
      
      doc.moveDown(0.5);
      doc.fontSize(10).text('Desglose por curso:', { italic: true });
      
      Object.values(student.courses).forEach(course => {
        const courseAverageGrade = course.assignmentCount > 0 ? (course.totalGrade / course.assignmentCount).toFixed(2) : 'N/A';
        doc.fontSize(9).text(`- ${course.name}: Promedio ${courseAverageGrade} (${course.assignmentCount} asignaciones)`);
        
        // Listar asignaciones si no son demasiadas
        if (course.assignments.length <= 5) {
          course.assignments.forEach(assignment => {
            const grade = assignment.grade !== undefined && assignment.grade !== null ? assignment.grade : 'No calificado';
            doc.fontSize(8).text(`  • ${assignment.title}: ${grade}`);
          });
        }
      });
      
      doc.moveDown();
    });
    
  } catch (error) {
    console.error('Error al generar contenido del reporte de calificaciones:', error);
  }
};

/**
 * Genera el contenido para un reporte de rendimiento
 * @param {SimpleReportGenerator} doc - Generador de reportes
 * @param {Object} filters - Filtros para el reporte
 */
const generatePerformanceReportContent = async (doc, filters) => {
  try {
    // Título del reporte
    doc.fontSize(18).text('Reporte de Rendimiento Académico', { align: 'center' });
    doc.moveDown();
    
    // Información del reporte
    doc.fontSize(12).text(`Fecha de generación: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    
    // Obtener datos de estudiantes y cursos según los filtros
    const students = await Student.find(filters.studentId ? { _id: filters.studentId } : {});
    const courses = await Course.find(filters.courseId ? { _id: filters.courseId } : {});
    
    // Resumen general
    doc.fontSize(14).text('Resumen de Rendimiento', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Total de estudiantes: ${students.length}`);
    doc.fontSize(12).text(`Total de cursos: ${courses.length}`);
    doc.moveDown();
    
    // Detalles por estudiante
    if (students.length > 0) {
      doc.fontSize(14).text('Detalles por Estudiante', { underline: true });
      doc.moveDown();
      
      for (const student of students) {
        doc.fontSize(12).text(`Estudiante: ${student.name || 'Sin nombre'}`);
        doc.fontSize(12).text(`ID: ${student.studentId || 'Sin ID'}`);
        doc.moveDown();
      }
    }
    
    return {
      success: true,
      reportData: {
        studentName: students.length === 1 ? students[0].name : 'Todos los estudiantes',
        period: filters.startDate && filters.endDate ? `${filters.startDate} - ${filters.endDate}` : 'Todo el periodo',
        averagePerformance: '85',  // Datos simulados
        attendanceRate: '90',      // Datos simulados
        completedAssignments: '45',  // Datos simulados
        totalAssignments: '50'      // Datos simulados
      }
    };
  } catch (error) {
    console.error('Error al generar el contenido del reporte de rendimiento:', error);
    return { success: false, message: 'Error al generar el reporte de rendimiento' };
  }
};

// Genera un reporte completo con datos de docentes, estudiantes, asistencias y bloques
// @param {SimpleReportGenerator} doc - Generador de reportes
// @param {Object} filters - Filtros para el reporte
const generateCompleteReportContent = async (doc, filters) => {
  try {
    // Título del reporte
    doc.fontSize(20).text('REPORTE COMPLETO EDUTRACK360', { align: 'center' });
    doc.moveDown();
    
    // Información del reporte
    doc.fontSize(12).text(`Fecha de generación: ${new Date().toLocaleDateString()}`);
    doc.fontSize(12).text(`Hora de generación: ${new Date().toLocaleTimeString()}`);
    doc.moveDown(2);
    
    // Sección 1: Docentes
    doc.fontSize(16).text('1. INFORMACIÓN DE DOCENTES', { underline: true });
    doc.moveDown();
    
    try {
      // Importar el modelo Teacher si es necesario
      const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', new mongoose.Schema({}, { strict: false }));
      
      // Obtener todos los docentes con información completa del usuario
      const teachers = await Teacher.find({}).populate({
        path: 'user',
        select: 'name email'
      });
      console.log(`Docentes encontrados: ${teachers.length}`);
      
      // Procesar la información de los docentes
      const teachersWithDetails = teachers.map(teacher => {
        // Determinar el nombre del profesor
        let name = 'Sin nombre';
        if (teacher.user && teacher.user.name) {
          name = teacher.user.name;
        } else if (teacher.name) {
          name = teacher.name;
        } else if (teacher.teacherId) {
          name = `Profesor (ID: ${teacher.teacherId})`;
        }
        
        return {
          name: name,
          id: teacher.teacherId || (teacher._id ? teacher._id.toString() : 'Sin ID'),
          specialization: teacher.specialization || 'No especificada',
          qualification: teacher.qualification || 'No especificada',
          coursesCount: teacher.courses?.length || 0
        };
      });
      
      doc.fontSize(12).text(`Total de docentes: ${teachers.length}`);
      doc.moveDown();
      
      // Listar docentes
      if (teachers.length > 0) {
        for (let i = 0; i < teachersWithDetails.length; i++) {
          const teacher = teachersWithDetails[i];
          doc.fontSize(12).text(`${i+1}. ${teacher.name} (ID: ${teacher.id})`);
          doc.fontSize(10).text(`   Especialización: ${teacher.specialization}`);
          doc.fontSize(10).text(`   Calificación: ${teacher.qualification}`);
          doc.fontSize(10).text(`   Cursos asignados: ${teacher.coursesCount}`);
          doc.moveDown();
        }
      } else {
        doc.fontSize(12).text('No hay docentes registrados en el sistema.');
      }
    } catch (error) {
      console.error('Error al obtener información de docentes:', error);
      doc.fontSize(12).text('Error al obtener información de docentes.');
    }
    
    doc.moveDown(2);
    
    // Sección 2: Estudiantes
    doc.fontSize(16).text('2. INFORMACIÓN DE ESTUDIANTES', { underline: true });
    doc.moveDown();
    
    try {
      // Obtener todos los estudiantes con información completa del usuario
      const students = await Student.find({}).populate({
        path: 'user',
        select: 'name email'
      });
      console.log(`Estudiantes encontrados: ${students.length}`);
      
      // Procesar la información de los estudiantes
      const studentsWithDetails = students.map(student => {
        // Determinar el nombre del estudiante
        let name = 'Sin nombre';
        if (student.user && student.user.name) {
          name = student.user.name;
        } else if (student.name) {
          name = student.name;
        } else if (student.studentId) {
          name = `Estudiante (ID: ${student.studentId})`;
        }
        
        return {
          name: name,
          id: student.studentId || (student._id ? student._id.toString() : 'Sin ID'),
          grade: student.grade || 'Sin grado',
          department: student.department || 'Sin departamento',
          block: student.block ? student.block.toString() : 'Sin asignar'
        };
      });
      
      doc.fontSize(12).text(`Total de estudiantes: ${students.length}`);
      doc.moveDown();
      
      // Listar estudiantes
      if (students.length > 0) {
        for (let i = 0; i < studentsWithDetails.length; i++) {
          const student = studentsWithDetails[i];
          doc.fontSize(12).text(`${i+1}. ${student.name} (ID: ${student.id})`);
          doc.fontSize(10).text(`   Grado: ${student.grade}`);
          doc.fontSize(10).text(`   Departamento: ${student.department}`);
          doc.fontSize(10).text(`   Bloque: ${student.block}`);
          doc.moveDown();
        }
      } else {
        doc.fontSize(12).text('No hay estudiantes registrados en el sistema.');
      }
    } catch (error) {
      console.error('Error al obtener información de estudiantes:', error);
      doc.fontSize(12).text('Error al obtener información de estudiantes.');
    }
    
    doc.moveDown(2);
    
    // Nota: La sección de asistencias ha sido suprimida según lo solicitado
    doc.moveDown(2);
    
    // Sección 3: Bloques
    doc.fontSize(16).text('3. INFORMACIÓN DE BLOQUES', { underline: true });
    doc.moveDown();
    
    try {
      // Obtener todos los estudiantes agrupados por bloque
      const students = await Student.find({});
      
      // Agrupar estudiantes por bloque
      const blockMap = {};
      students.forEach(student => {
        const block = student.block || 'Sin asignar';
        if (!blockMap[block]) {
          blockMap[block] = [];
        }
        blockMap[block].push(student);
      });
      
      // Mostrar información de bloques
      const blocks = Object.keys(blockMap);
      doc.fontSize(12).text(`Total de bloques: ${blocks.length}`);
      doc.moveDown();
      
      if (blocks.length > 0) {
        blocks.forEach((block, index) => {
          const studentsInBlock = blockMap[block];
          doc.fontSize(12).text(`${index+1}. Bloque: ${block}`);
          doc.fontSize(10).text(`   Estudiantes asignados: ${studentsInBlock.length}`);
          doc.moveDown();
        });
      } else {
        doc.fontSize(12).text('No hay bloques registrados en el sistema.');
      }
    } catch (error) {
      console.error('Error al obtener información de bloques:', error);
      doc.fontSize(12).text('Error al obtener información de bloques.');
    }
    
    // Pie del reporte
    doc.moveDown(2);
    doc.fontSize(10).text('Este reporte fue generado automáticamente por el sistema EduTrack360.', { align: 'center' });
    doc.fontSize(10).text(`Base de datos: edutrack360`, { align: 'center' });
    
    return {
      success: true,
      reportData: {
        totalTeachers: 'Calculado',
        totalStudents: 'Calculado',
        totalAttendances: 'Calculado',
        totalBlocks: 'Calculado',
        generationDate: new Date().toLocaleDateString(),
        generationTime: new Date().toLocaleTimeString()
      }
    };
  } catch (error) {
    console.error('Error al generar el reporte completo:', error);
    return { success: false, message: 'Error al generar el reporte completo' };
  }
};

/**
 * Obtiene la ruta del archivo de reporte para su descarga
 * @param {string} fileName - Nombre del archivo de reporte
 * @returns {Object} - Resultado de la búsqueda del archivo
 */
const getReportFilePath = (fileName) => {
  try {
    const filePath = path.join(REPORTS_DIR, fileName);
    
    if (fs.existsSync(filePath)) {
      return {
        success: true,
        filePath: filePath
      };
    } else {
      return {
        success: false,
        message: 'El archivo de reporte solicitado no existe.'
      };
    }
  } catch (error) {
    console.error('Error al obtener la ruta del archivo de reporte:', error);
    return {
      success: false,
      message: 'Error al obtener la ruta del archivo de reporte.'
    };
  }
};

// Exportar todas las funciones del módulo
export {
  generateReportPDF,
  generateAttendanceReportContent,
  generateGradesReportContent,
  generatePerformanceReportContent,
  generateCompleteReportContent,
  getReportFilePath
};
