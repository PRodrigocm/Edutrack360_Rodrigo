import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Importar modelos
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import Block from '../models/Block.js';
import Assignment from '../models/Assignment.js';
import Attendance from '../models/Attendance.js';

// Configurar variables de entorno
dotenv.config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutrack360')
  .then(() => console.log('Conectado a MongoDB para inicializar datos'))
  .catch(err => {
    console.error('Error de conexión a MongoDB:', err);
    process.exit(1);
  });

// Ya no necesitamos esta función porque el modelo User se encarga de hashear las contraseñas
// cuando se crea un nuevo usuario

// Función principal para inicializar la base de datos
async function seedDatabase() {
  try {
    // Limpiar la base de datos existente
    await User.deleteMany({});
    await Teacher.deleteMany({});
    await Student.deleteMany({});
    await Course.deleteMany({});
    await Block.deleteMany({});
    await Assignment.deleteMany({});
    await Attendance.deleteMany({});

    console.log('Base de datos limpiada correctamente');

    // Crear usuarios
    const adminUser = await User.create({
      name: 'Administrador',
      email: 'admin@edutrack360.com',
      password: 'Admin123!',
      role: 'admin'
    });

    const teacherUsers = [];
    for (let i = 1; i <= 5; i++) {
      const teacherUser = await User.create({
        name: `Profesor ${i}`,
        email: `profesor${i}@edutrack360.com`,
        password: 'Profesor123!',
        role: 'teacher'
      });
      teacherUsers.push(teacherUser);
    }

    const studentUsers = [];
    for (let i = 1; i <= 20; i++) {
      const studentUser = await User.create({
        name: `Estudiante ${i}`,
        email: `estudiante${i}@edutrack360.com`,
        password: 'Estudiante123!',
        role: 'student'
      });
      studentUsers.push(studentUser);
    }

    console.log('Usuarios creados correctamente');

    // Crear profesores
    const teachers = [];
    for (let i = 0; i < teacherUsers.length; i++) {
      const teacher = await Teacher.create({
        user: teacherUsers[i]._id,
        teacherId: `PROF-${2025}-${i + 1}`.padStart(10, '0'),
        qualification: ['Licenciatura', 'Maestría', 'Doctorado'][Math.floor(Math.random() * 3)],
        specialization: ['Matemáticas', 'Ciencias', 'Historia', 'Lenguaje', 'Informática'][Math.floor(Math.random() * 5)],
        phoneNumber: `+52 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        address: `Calle Principal #${Math.floor(100 + Math.random() * 900)}, Ciudad Universitaria`,
        joinDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(1 + Math.random() * 28))
      });
      teachers.push(teacher);
    }

    console.log('Profesores creados correctamente');

    // Crear bloques
    const blocks = [];
    const blockNames = ['Bloque A', 'Bloque B', 'Bloque C', 'Bloque D'];
    
    for (let i = 0; i < blockNames.length; i++) {
      const block = await Block.create({
        name: blockNames[i],
        description: `Bloque de estudiantes ${blockNames[i]}`,
        createdBy: adminUser._id
      });
      blocks.push(block);
    }

    console.log('Bloques creados correctamente');

    // Crear estudiantes y asignarlos a bloques
    const students = [];
    for (let i = 0; i < studentUsers.length; i++) {
      const blockIndex = Math.floor(Math.random() * blocks.length);
      const student = await Student.create({
        user: studentUsers[i]._id,
        studentId: `ST-${2025}-${i + 1}`.padStart(10, '0'),
        dateOfBirth: new Date(2000 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(1 + Math.random() * 28)),
        address: `Av. Estudiante #${Math.floor(100 + Math.random() * 900)}, Colonia Centro`,
        phoneNumber: `+52 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        parentName: `Padre de ${studentUsers[i].name}`,
        parentContact: `+52 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        block: blocks[blockIndex]._id,
        enrollmentDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(1 + Math.random() * 28))
      });
      students.push(student);

      // Actualizar bloque con el estudiante
      await Block.findByIdAndUpdate(blocks[blockIndex]._id, {
        $push: { students: student._id }
      });
    }

    console.log('Estudiantes creados correctamente');

    // Crear cursos
    const courses = [];
    const courseData = [
      { name: 'Matemáticas 101', code: 'MAT101', teacher: teachers[0]._id },
      { name: 'Física 202', code: 'FIS202', teacher: teachers[1]._id },
      { name: 'Química 303', code: 'QUI303', teacher: teachers[2]._id },
      { name: 'Biología 404', code: 'BIO404', teacher: teachers[3]._id },
      { name: 'Historia 505', code: 'HIS505', teacher: teachers[4]._id },
    ];

    for (let i = 0; i < courseData.length; i++) {
      const { name, code, teacher } = courseData[i];
      const course = await Course.create({
        name,
        code,
        description: `Curso de ${name} para el ciclo académico 2025`,
        teacher,
        startDate: new Date(2025, 0, 15), // 15 de enero de 2025
        endDate: new Date(2025, 5, 15),   // 15 de junio de 2025
        schedule: {
          days: ['Lunes', 'Miércoles', 'Viernes'],
          startTime: '08:00',
          endTime: '10:00'
        },
        createdBy: adminUser._id
      });
      courses.push(course);

      // Actualizar profesor con el curso
      await Teacher.findByIdAndUpdate(teacher, {
        $push: { courses: course._id }
      });

      // Asignar bloques a cursos
      const blockIndex = i % blocks.length;
      await Course.findByIdAndUpdate(course._id, {
        $push: { blocks: blocks[blockIndex]._id }
      });

      await Block.findByIdAndUpdate(blocks[blockIndex]._id, {
        $push: { courses: course._id }
      });
    }

    console.log('Cursos creados correctamente');

    // Asignar estudiantes a cursos
    for (let i = 0; i < students.length; i++) {
      // Cada estudiante toma entre 2 y 4 cursos
      const numCourses = Math.floor(2 + Math.random() * 3);
      const studentCourses = [];
      
      // Seleccionar cursos aleatorios sin repetir
      while (studentCourses.length < numCourses && studentCourses.length < courses.length) {
        const courseIndex = Math.floor(Math.random() * courses.length);
        if (!studentCourses.includes(courses[courseIndex]._id)) {
          studentCourses.push(courses[courseIndex]._id);
        }
      }

      // Actualizar estudiante con los cursos
      await Student.findByIdAndUpdate(students[i]._id, {
        $set: { courses: studentCourses }
      });

      // Actualizar cada curso con el estudiante
      for (const courseId of studentCourses) {
        await Course.findByIdAndUpdate(courseId, {
          $push: { students: students[i]._id }
        });
      }
    }

    console.log('Estudiantes asignados a cursos correctamente');

    // Crear tareas para cada curso
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const teacher = await Teacher.findById(course.teacher);
      
      // Crear entre 3 y 5 tareas por curso
      const numAssignments = Math.floor(3 + Math.random() * 3);
      
      for (let j = 0; j < numAssignments; j++) {
        const dueDate = new Date(2025, Math.floor(1 + Math.random() * 5), Math.floor(1 + Math.random() * 28));
        
        await Assignment.create({
          title: `Tarea ${j + 1} de ${course.name}`,
          description: `Descripción detallada de la tarea ${j + 1} para el curso de ${course.name}`,
          course: course._id,
          dueDate,
          totalPoints: Math.floor(10 + Math.random() * 91), // Entre 10 y 100 puntos
          createdBy: teacher._id,
          createdAt: new Date(dueDate.getTime() - Math.random() * 15 * 24 * 60 * 60 * 1000) // Entre 1 y 15 días antes de la fecha de entrega
        });
      }
    }

    console.log('Tareas creadas correctamente');

    // Crear registros de asistencia para cada curso
    const today = new Date();
    const statusOptions = ['present', 'absent', 'late', 'excused'];
    
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const courseStudents = await Student.find({ courses: course._id });
      
      // Crear registros de asistencia para los últimos 10 días
      for (let j = 0; j < 10; j++) {
        const date = new Date(today);
        date.setDate(date.getDate() - j);
        
        const records = [];
        
        // Crear un registro para cada estudiante en el curso
        for (const student of courseStudents) {
          const randomStatusIndex = Math.floor(Math.random() * statusOptions.length);
          records.push({
            student: student._id,
            status: statusOptions[randomStatusIndex],
            remark: randomStatusIndex === 1 ? 'Justificación pendiente' : ''
          });
        }
        
        await Attendance.create({
          course: course._id,
          date,
          records,
          takenBy: course.teacher,
          createdAt: date
        });
      }
    }

    console.log('Registros de asistencia creados correctamente');

    console.log('¡Base de datos inicializada correctamente!');
    console.log('\nCredenciales de acceso:');
    console.log('Administrador: admin@edutrack360.com / Admin123!');
    console.log('Profesor: profesor1@edutrack360.com / Profesor123!');
    console.log('Estudiante: estudiante1@edutrack360.com / Estudiante123!');

  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  } finally {
    // Cerrar la conexión a la base de datos
    mongoose.connection.close();
  }
}

// Ejecutar la función de inicialización
seedDatabase();
