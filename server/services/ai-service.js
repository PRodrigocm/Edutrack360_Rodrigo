import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Course from '../models/Course.js';
import Assignment from '../models/Assignment.js';
import Attendance from '../models/Attendance.js';
import { generateReportPDF } from './report-service.js';

dotenv.config();

export {
  analyzeIntent,
  extractEntities,
  processChatMessage,
  generateDataRequestMessage,
  generateOllamaResponse,
  handleReportDownload,
  generateFallbackResponse,
  createUser
};

// Función para crear un usuario según el rol
const createUser = async (userData) => {
  try {
    await connectDB();
    
    // Verificar si el correo ya existe
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return {
        success: false,
        message: `Ya existe un usuario con el correo ${userData.email}`
      };
    }
    
    // Generar una contraseña aleatoria si no se proporciona
    if (!userData.password) {
      userData.password = Math.random().toString(36).slice(-8);
    }
    
    // Crear el usuario base
    const newUser = new User({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'student'
    });
    
    // Guardar el usuario
    const savedUser = await newUser.save();
    
    let specificUserData = null;
    let specificUserMessage = '';
    
    // Crear registro específico según el rol
    if (userData.role === 'student') {
      // Generar un ID de estudiante si no se proporciona
      const studentId = userData.studentId || `ST${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      const newStudent = new Student({
        user: savedUser._id,
        studentId: studentId,
        dateOfBirth: userData.dateOfBirth,
        address: userData.address,
        phoneNumber: userData.phoneNumber,
        parentName: userData.parentName,
        parentContact: userData.parentContact,
        block: userData.block
      });
      
      specificUserData = await newStudent.save();
      specificUserMessage = `Estudiante creado con ID: ${studentId}`;
    } 
    else if (userData.role === 'teacher') {
      // Generar un ID de profesor si no se proporciona
      const teacherId = userData.teacherId || `TC${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      const newTeacher = new Teacher({
        user: savedUser._id,
        teacherId: teacherId,
        qualification: userData.qualification,
        specialization: userData.specialization,
        phoneNumber: userData.phoneNumber,
        address: userData.address
      });
      
      specificUserData = await newTeacher.save();
      specificUserMessage = `Profesor creado con ID: ${teacherId}`;
    }
    else if (userData.role && userData.role.toLowerCase() === 'admin') {
      // Para administradores, no necesitamos crear registros adicionales
      // pero proporcionamos un mensaje específico
      specificUserMessage = `Administrador creado con acceso completo al sistema`;
    }
    
    return {
      success: true,
      message: `Usuario creado exitosamente con rol de ${userData.role}. ${specificUserMessage}`,
      user: savedUser,
      specificUserData,
      temporaryPassword: userData.password
    };
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return {
      success: false,
      message: `Error al crear usuario: ${error.message}`
    };
  }
};

// Configuración de conexión a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutrack360');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Función para generar respuestas alternativas cuando Ollama no está disponible
const generateFallbackResponse = async (intent, entities, message) => {
  // Base de conocimiento para respuestas generales
  const knowledgeBase = {
    // Preguntas sobre la plataforma
    'que_es_edutrack360': 'EduTrack360 es una plataforma educativa integral que permite la gestión de estudiantes, profesores, cursos, asistencias y calificaciones. Está diseñada para facilitar el seguimiento del progreso académico y mejorar la comunicación entre todos los actores del proceso educativo.',
    'funcionalidades': 'EduTrack360 ofrece funcionalidades como gestión de usuarios, administración de cursos, seguimiento de asistencia, calificación de tareas, generación de reportes y análisis de rendimiento académico.',
    
    // Preguntas sobre roles
    'rol_admin': 'Los administradores pueden gestionar todos los aspectos de la plataforma: crear/modificar usuarios, cursos, asignar profesores, generar reportes globales y configurar parámetros del sistema.',
    'rol_profesor': 'Los profesores pueden gestionar sus cursos asignados, registrar asistencia, calificar tareas, comunicarse con estudiantes y generar reportes de rendimiento de sus clases.',
    'rol_estudiante': 'Los estudiantes pueden ver sus cursos, revisar calificaciones, entregar tareas, consultar su asistencia y comunicarse con sus profesores.',
    
    // Preguntas sobre tecnología
    'tecnologias': 'EduTrack360 está desarrollado con React para el frontend, Node.js y Express para el backend, MongoDB como base de datos, y utiliza Ollama para funcionalidades de IA.',
    
    // Preguntas sobre educación general
    'metodos_aprendizaje': 'Existen diversos métodos de aprendizaje como el aprendizaje basado en proyectos, aprendizaje colaborativo, aula invertida, aprendizaje basado en problemas y gamificación, entre otros.',
    'evaluacion_educativa': 'La evaluación educativa puede ser diagnóstica (al inicio), formativa (durante el proceso) o sumativa (al final). Cada tipo tiene propósitos específicos y complementarios.',
    
    // Preguntas sobre gestión educativa
    'mejores_practicas': 'Algunas mejores prácticas en gestión educativa incluyen: establecer objetivos claros, mantener comunicación constante con estudiantes y padres, implementar evaluación continua, personalizar la enseñanza y utilizar datos para tomar decisiones.',
    'gestion_aula': 'La gestión efectiva del aula incluye establecer reglas claras, crear un ambiente positivo, planificar clases estructuradas, implementar estrategias de participación y manejar adecuadamente los conflictos.',
  };
  
  // Respuestas predefinidas basadas en la intención detectada
  switch (intent) {
    case 'create_user':
      return 'Puedo ayudarte a crear un usuario. Necesito el nombre, correo electrónico y rol (estudiante, profesor o administrador). Por favor, proporciona esta información.';
    
    case 'create_course':
      return 'Puedo ayudarte a crear un curso. Necesito el nombre del curso y un código único. También puedes proporcionar una descripción y el correo del profesor asignado.';
    
    case 'generate_report':
      return 'Puedo generar reportes de rendimiento de estudiantes, asistencia a cursos o estadísticas generales. ¿Qué tipo de reporte necesitas?';
    
    case 'general_query':
      // Intentar identificar el tema de la pregunta
      const lowerMessage = message.toLowerCase();
      
      // Buscar coincidencias en la base de conocimiento
      if (lowerMessage.includes('edutrack') && (lowerMessage.includes('qué es') || lowerMessage.includes('que es'))) {
        return knowledgeBase.que_es_edutrack360;
      }
      if (lowerMessage.includes('funcionalidad') || lowerMessage.includes('característica')) {
        return knowledgeBase.funcionalidades;
      }
      if (lowerMessage.includes('administrador') || lowerMessage.includes('admin')) {
        return knowledgeBase.rol_admin;
      }
      if (lowerMessage.includes('profesor') || lowerMessage.includes('docente') || lowerMessage.includes('maestro')) {
        return knowledgeBase.rol_profesor;
      }
      if (lowerMessage.includes('estudiante') || lowerMessage.includes('alumno')) {
        return knowledgeBase.rol_estudiante;
      }
      if (lowerMessage.includes('tecnología') || lowerMessage.includes('desarrollado') || lowerMessage.includes('stack')) {
        return knowledgeBase.tecnologias;
      }
      if (lowerMessage.includes('método') && lowerMessage.includes('aprendizaje')) {
        return knowledgeBase.metodos_aprendizaje;
      }
      if (lowerMessage.includes('evaluación') || lowerMessage.includes('evaluar')) {
        return knowledgeBase.evaluacion_educativa;
      }
      if (lowerMessage.includes('mejores prácticas') || lowerMessage.includes('buenas prácticas')) {
        return knowledgeBase.mejores_practicas;
      }
      if (lowerMessage.includes('gestión') && lowerMessage.includes('aula')) {
        return knowledgeBase.gestion_aula;
      }
      
      // Si no se encuentra una coincidencia específica, dar una respuesta general
      return 'Como asistente de EduTrack360, puedo responder preguntas sobre la plataforma, roles de usuarios, metodologías educativas, gestión académica y muchos otros temas relacionados con la educación. También puedo ayudarte con la creación de usuarios, cursos y generación de reportes. ¿En qué puedo ayudarte específicamente?';
    
    default:
      return 'Soy el asistente de EduTrack360. Puedo ayudarte con la gestión de usuarios, cursos y reportes, así como responder preguntas sobre educación y tecnología. ¿En qué puedo asistirte hoy?';
  }
};

// Función para comunicarse con Ollama
const generateOllamaResponse = async (prompt, model = 'llama3', intent = 'general_query', entities = {}, originalMessage = '') => {
  // Verificar si debemos intentar usar Ollama o ir directamente a las respuestas alternativas
  const USE_OLLAMA = true; // Cambiar a true cuando Ollama esté funcionando correctamente
  
  // Desactivar Ollama temporalmente durante todo el proceso de creación de usuario
  // Solo se reactiva cuando se completa la creación
  const hasUserData = entities.name && entities.email;
  
  // Si la intención es crear usuario o si hay datos de usuario, desactivar Ollama
  // a menos que la creación ya se haya completado
  if (intent === 'create_user' && !entities.userCreationCompleted) {
    console.log('Proceso de creación de usuario en curso. Desactivando Ollama temporalmente.');
    return await generateFallbackResponse(intent, entities, originalMessage);
  }
  
  if (!USE_OLLAMA) {
    console.log('Usando respuestas alternativas directamente (Ollama desactivado temporalmente)');
    return await generateFallbackResponse(intent, entities, originalMessage);
  }
  
  try {
    // Verificar que Ollama esté funcionando primero usando la API de versión
    try {
      // Aumentar el timeout para la verificación de la versión
      const versionResponse = await axios.get('http://localhost:11434/api/version', { timeout: 15000 });
      console.log(`Ollama está funcionando correctamente. Versión: ${JSON.stringify(versionResponse.data)}`);
    } catch (versionError) {
      console.error('Error al verificar la versión de Ollama:', versionError.message);
      console.log('Usando respuestas alternativas debido a error de conexión con Ollama');
      return await generateFallbackResponse(intent, entities, originalMessage);
    }
    
    // Intentar usar la API de chat con parámetros adicionales
    const chatUrl = 'http://localhost:11434/api/chat';
    const generateUrl = 'http://localhost:11434/api/generate';
    const config = {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // Aumentar el timeout para dar más tiempo al modelo para responder
    };

    // Implementación de función de reintento
    const retryOperation = async (operation, maxRetries = 2, delay = 2000) => {
      let lastError;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await operation();
        } catch (error) {
          lastError = error;
          console.log(`Intento ${attempt}/${maxRetries} falló: ${error.message}`);
          
          if (attempt < maxRetries) {
            console.log(`Esperando ${delay}ms antes del siguiente intento...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            // Incrementar el delay para el próximo intento (backoff exponencial)
            delay = delay * 1.5;
          }
        }
      }
      
      throw lastError; // Lanzar el último error si todos los intentos fallan
    };

    // Primero intentar con la API de chat
    try {
      const chatData = {
        model: model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 512,
        stream: false
      };

      console.log(`Enviando solicitud a Ollama usando la API de chat: ${chatUrl}`);
      console.log(`Usando modelo: ${model}`);

      // Usar el mecanismo de reintento para la API de chat
      const response = await retryOperation(
        () => axios.post(chatUrl, chatData, config),
        2  // Máximo 2 reintentos
      );

      if (response.data && response.data.message && response.data.message.content) {
        console.log('Respuesta de Ollama (API chat) recibida correctamente');
        return {
          success: true,
          message: response.data.message.content,
          intent,
          entities
        };
      } else {
        throw new Error('Respuesta de Ollama (API chat) no tiene el formato esperado');
      }
    } catch (chatError) {
      console.error(`Error al conectar con Ollama usando la API de chat: ${chatError.message}`);
      
      // Si falla la API de chat, intentar con la API de generate
      try {
        console.log(`Intentando con la API de generate como alternativa: ${generateUrl}`);
        
        const generateData = {
          model,
          prompt,
          stream: false
        };
        
        // Usar el mecanismo de reintento para la API de generate
        const generateResponse = await retryOperation(
          () => axios.post(generateUrl, generateData, config),
          2  // Máximo 2 reintentos
        );
        
        if (generateResponse.data && generateResponse.data.response) {
          console.log('Respuesta recibida de Ollama (generate API)');
          return {
            success: true,
            message: generateResponse.data.response,
            intent,
            entities
          };
        } else {
          throw new Error('Respuesta vacía o inválida de la API de generate');
        }
      } catch (generateError) {
        console.error('Error al conectar con Ollama usando la API de generate:', generateError.message);
        console.log('Usando respuestas alternativas como último recurso');
        return await generateFallbackResponse(intent, entities, originalMessage);
      }
    }
  } catch (error) {
    console.error('Error general al comunicarse con Ollama:', error.message);
    console.log('Usando respuestas alternativas debido a error general');
    return await generateFallbackResponse(intent, entities, originalMessage);
  }
};

// Función para manejar la descarga de reportes en PDF
const handleReportDownload = async (intent, entities) => {
  try {
    // Determinar el tipo de reporte
    let reportType = 'general';
    if (intent === 'generate_attendance_report') reportType = 'attendance';
    if (intent === 'generate_grades_report') reportType = 'grades';
    if (intent === 'generate_performance_report') reportType = 'performance';
    if (intent === 'generate_report') {
      // Si solo se pide un reporte sin especificar tipo, generar un reporte completo
      reportType = 'complete';
    }
    
    // Si se solicita un reporte completo, establecer el tipo de reporte como 'complete'
    if (entities.reportType === 'complete') {
      reportType = 'complete';
    }
    
    // Construir los parámetros del reporte
    const reportParams = {
      reportType: reportType,
      filters: {}
    };
    
    // Añadir filtros si existen
    if (entities.courseCode) reportParams.filters.courseCode = entities.courseCode;
    if (entities.courseName) reportParams.filters.courseName = entities.courseName;
    if (entities.studentId) reportParams.filters.studentId = entities.studentId;
    if (entities.studentName) reportParams.filters.studentName = entities.studentName;
    if (entities.startDate) reportParams.filters.startDate = entities.startDate;
    if (entities.endDate) reportParams.filters.endDate = entities.endDate;
    if (entities.minAttendance) reportParams.filters.minAttendance = entities.minAttendance;
    if (entities.minGrade) reportParams.filters.minGrade = entities.minGrade;
    if (entities.maxGrade) reportParams.filters.maxGrade = entities.maxGrade;
    
    // Generar un nombre de archivo para el reporte
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${reportType}_report_${timestamp}.pdf`;
    
    console.log('Generando reporte PDF con los siguientes parámetros:', reportParams);
    
    // Generar el reporte PDF utilizando el servicio de generación de reportes
    const result = await generateReportPDF(reportType, reportParams.filters);
    
    if (result.success) {
      return {
        success: true,
        message: `El reporte ha sido generado y está listo para descargar. Nombre del archivo: ${result.fileName}`,
        fileName: result.fileName,
        downloadUrl: `/api/reports/download/${result.fileName}` // URL para descargar el reporte
      };
    } else {
      return {
        success: false,
        message: result.message || 'Error al generar el reporte PDF.'
      };
    }
  } catch (error) {
    console.error('Error al generar el reporte PDF:', error);
    return {
      success: false,
      message: 'Lo siento, hubo un error al generar el reporte en PDF. Por favor, inténtalo de nuevo más tarde.'
    };
  }
};

// Función para generar mensajes solicitando datos faltantes basados en los formularios reales
const generateDataRequestMessage = (intent, entities) => {
  let missingFields = [];
  let message = '';
  
  switch (intent) {
    case 'create_user':
      // Usar el rol proporcionado o establecer student como valor predeterminado
      let userRole = entities.role || 'student';
      
      // Campos requeridos comunes para todos los usuarios
      if (!entities.name) missingFields.push('nombre');
      if (!entities.email) missingFields.push('correo electrónico');
      
      // Campos específicos según el rol
      if (userRole === 'student' && !entities.studentId) {
        // El ID de estudiante es opcional, se generará automáticamente si no se proporciona
      }
      
      if (userRole === 'teacher' && !entities.teacherId) {
        // El ID de profesor es opcional, se generará automáticamente si no se proporciona
      }
      
      if (missingFields.length > 0) {
        const roleText = userRole === 'teacher' ? 'profesor' : 
                        userRole === 'student' ? 'estudiante' : 
                        userRole === 'admin' ? 'administrador' : 'usuario';
        
        message = `Para crear un ${roleText}, necesito los siguientes datos:\n`;
        message += missingFields.map(field => `- ${field}`).join('\n');
        
        // Proporcionar un formato claro para ingresar los datos
        message += '\n\nPuedes proporcionarme la información en el siguiente formato:\n';
        message += '```\n';
        message += `Nombre: [nombre completo]\n`;
        message += `Email: [correo electrónico]\n`;
        message += `Rol: ${userRole}\n`; // Ya tenemos el rol determinado
        
        // Campos opcionales según el rol
        if (userRole === 'student') {
          message += `ID Estudiante: [opcional, se generará automáticamente si no se proporciona]\n`;
          message += `Teléfono: [opcional]\n`;
          message += `Dirección: [opcional]\n`;
          message += `Nombre del Padre/Madre: [opcional]\n`;
          message += `Contacto del Padre/Madre: [opcional]\n`;
        } else if (userRole === 'teacher') {
          message += `ID Profesor: [opcional, se generará automáticamente si no se proporciona]\n`;
          message += `Especialización: [opcional]\n`;
          message += `Calificación: [opcional]\n`;
          message += `Teléfono: [opcional]\n`;
          message += `Dirección: [opcional]\n`;
        }
        
        message += `Contraseña: [opcional, se generará automáticamente si no se proporciona]\n`;
        message += '```\n';
        message += '\nPor favor, completa los campos requeridos y los opcionales que desees incluir.';
      } else {
        // Si ya tenemos los campos requeridos, preguntar por campos opcionales
        let optionalFields = [];
        
        if (userRole === 'student') {
          if (!entities.phoneNumber) optionalFields.push('número de teléfono');
          if (!entities.address) optionalFields.push('dirección');
          if (!entities.parentName) optionalFields.push('nombre del padre/madre');
          if (!entities.parentContact) optionalFields.push('contacto del padre/madre');
        } else if (userRole === 'teacher') {
          if (!entities.qualification) optionalFields.push('calificación');
          if (!entities.specialization) optionalFields.push('especialización');
          if (!entities.phoneNumber) optionalFields.push('número de teléfono');
          if (!entities.address) optionalFields.push('dirección');
        }
        
        // Solo solicitar campos opcionales si no se ha indicado que ya se han proporcionado todos los campos
        if (optionalFields.length > 0 && !entities.allFieldsProvided) {
          const roleText = userRole === 'teacher' ? 'profesor' : 
                          userRole === 'student' ? 'estudiante' : 
                          userRole === 'admin' ? 'administrador' : 'usuario';
          
          message = `Tengo los datos esenciales para crear el ${roleText}, pero también puedes proporcionar:\n`;
          message += optionalFields.map(field => `- ${field}`).join('\n');
          message += '\n\nEstos campos son opcionales. ¿Deseas añadir alguno de ellos?';
        } else if (entities.allFieldsProvided) {
          // No solicitar más datos, dejar mensaje vacío para que se proceda con la creación
          message = '';
        }
      }
      break;
      
    case 'create_course':
      // Campos requeridos para crear un curso (basado en la ruta courses.js)
      if (!entities.name && !entities.courseName) missingFields.push('nombre del curso');
      if (!entities.code && !entities.courseCode) missingFields.push('código del curso');
      
      if (missingFields.length > 0) {
        message = 'Para crear un curso, necesito los siguientes datos:\n';
        message += missingFields.map(field => `- ${field}`).join('\n');
        message += '\n\nPor favor, proporciona esta información para continuar.';
      } else {
        // Campos opcionales basados en el formulario real
        let optionalFields = [];
        if (!entities.description) optionalFields.push('descripción del curso');
        if (!entities.teacherId && !entities.teacher) optionalFields.push('ID del profesor');
        if (!entities.startDate) optionalFields.push('fecha de inicio');
        if (!entities.endDate) optionalFields.push('fecha de finalización');
        if (!entities.schedule) optionalFields.push('horario');
        
        if (optionalFields.length > 0) {
          message = 'Tengo los datos esenciales para crear el curso, pero el formulario también incluye:\n';
          message += optionalFields.map(field => `- ${field}`).join('\n');
          message += '\n\nEstos campos son opcionales. ¿Deseas añadir alguno de ellos?';
        }
      }
      break;
      
    case 'generate_report':
    case 'generate_attendance_report':
    case 'generate_grades_report':
    case 'generate_performance_report':
      // Verificar si se solicita un reporte completo
      if (entities.reportType === 'complete' || 
          intent === 'generate_report' && 
          (entities.message?.toLowerCase().includes('generar reporte') || 
           entities.message?.toLowerCase().includes('reporte completo'))) {
        // No solicitar filtros para reportes completos
        message = '';
        break;
      }
      
      // Sugerir filtros para el reporte basados en los parámetros reales
      let suggestedFilters = [];
      if (!entities.courseCode && !entities.courseName) suggestedFilters.push('curso (código o nombre)');
      if (!entities.studentId && !entities.studentName) suggestedFilters.push('estudiante (ID o nombre)');
      if (!entities.startDate) suggestedFilters.push('fecha de inicio (formato: DD/MM/YYYY)');
      if (!entities.endDate) suggestedFilters.push('fecha de fin (formato: DD/MM/YYYY)');
      
      if (intent === 'generate_attendance_report') {
        if (!entities.minAttendance) suggestedFilters.push('asistencia mínima (porcentaje)');
      } else if (intent === 'generate_grades_report') {
        if (!entities.minGrade) suggestedFilters.push('calificación mínima');
        if (!entities.maxGrade) suggestedFilters.push('calificación máxima');
      }
      
      if (suggestedFilters.length > 0) {
        message = `Para generar un reporte más preciso, podrías especificar:\n`;
        message += suggestedFilters.map(filter => `- ${filter}`).join('\n');
        message += '\n\nEstos filtros son opcionales. ¿Deseas añadir alguno de ellos?';
      } else {
        // Si ya tenemos todos los filtros necesarios, preguntar si desea descargar el PDF
        message = `Tengo toda la información necesaria para generar el reporte. ¿Deseas descargarlo en formato PDF?`;
      }
      break;
  }
  
  return message;
};

// Procesar el mensaje del chat
const processChatMessage = async (message, userId, role) => {
  try {
    // Inicializar variables
    let contextData = '';
    let actionResult = null;
    
    // Extraer entidades del mensaje primero para poder determinar mejor la intención
    let entities = extractEntities(message);
    console.log('Entities extracted:', entities);
    
    // Verificar si estamos en un proceso de creación de usuario en curso
    // Esto se puede determinar por la presencia de datos de usuario o por respuestas cortas
    // durante un diálogo de creación de usuario
    const hasUserData = entities.name && entities.email;
    const isShortResponse = message.length < 10; // Respuestas cortas como "sí", "no", etc.
    
    // Obtener la última intención conocida y entidades (si existen en la sesión)
    // En un entorno real, esto podría almacenarse en la sesión del usuario
    // Para esta implementación, usaremos variables globales temporales
    if (!global.lastIntentByUser) {
      global.lastIntentByUser = {};
    }
    
    if (!global.lastEntitiesByUser) {
      global.lastEntitiesByUser = {};
    }
    
    // Si el mensaje es corto (posible respuesta a una pregunta) y tenemos datos guardados previamente,
    // recuperar esos datos para mantener el contexto
    if (message.length < 10 && global.lastEntitiesByUser[userId] && Object.keys(global.lastEntitiesByUser[userId]).length > 0) {
      console.log('Recuperando datos de usuario guardados previamente');
      // Combinar las entidades actuales con las guardadas previamente
      entities = { ...global.lastEntitiesByUser[userId], ...entities };
    }
    
    // Determinar la intención actual
    let intent;
    
    // Si hay datos de usuario o si es una respuesta corta durante un proceso de creación de usuario
    if (hasUserData || (isShortResponse && global.lastIntentByUser[userId] === 'create_user')) {
      intent = 'create_user';
      console.log('Manteniendo intención de creación de usuario para la continuidad del proceso');
    } else {
      // Verificar si el mensaje es una respuesta a una solicitud de generación de reporte
      const isNegativeResponse = /^no$/i.test(message.trim()) || /^ninguno$/i.test(message.trim());
      console.log(`Verificando si "${message}" es una respuesta negativa: ${isNegativeResponse}`);
      
      if (isNegativeResponse && global.lastIntentByUser[userId] === 'generate_report') {
        // Si el usuario responde "no" a una solicitud de filtros para un reporte,
        // mantener la intención de generar un reporte sin filtros
        intent = 'generate_report';
        console.log('Manteniendo intención de generación de reporte sin filtros');
      } else {
        intent = analyzeIntent(message);
      }
    }
    
    // Guardar la intención y entidades actuales para futuras referencias
    global.lastIntentByUser[userId] = intent;
    
    // Solo guardar entidades si contienen datos relevantes (nombre, email, etc.)
    if (entities.name || entities.email || entities.role) {
      console.log('Guardando datos de usuario para futuras referencias');
      global.lastEntitiesByUser[userId] = { ...entities };
    }
    
    console.log(`Intent detected: ${intent}`);
    
    // Verificar si hay intenciones de creación o generación de reportes
    const createIntents = ['create_user', 'create_course'];
    const reportIntents = ['generate_report', 'generate_attendance_report', 'generate_grades_report', 'generate_performance_report'];
    
    // Verificar si el mensaje contiene una respuesta afirmativa sobre descargar el reporte
    const downloadConfirmationPattern = /s[ií]|claro|por favor|ok|okay|descarga|descargar|generar|genera/i;
    if (reportIntents.includes(intent) && downloadConfirmationPattern.test(message) && entities.downloadRequested) {
      // El usuario ha confirmado que desea descargar el reporte
      const reportType = intent === 'generate_attendance_report' ? 'attendance' : 
                        intent === 'generate_grades_report' ? 'grades' : 
                        intent === 'generate_performance_report' ? 'performance' : 'general';
      
      // Llamar al servicio de generación de reportes en PDF
      const downloadResult = await generateReportPDF(reportType, entities);
      
      return {
        message: downloadResult.message,
        intent: 'download_report',
        entities: {
          ...entities,
          fileName: downloadResult.fileName,
          downloadUrl: downloadResult.downloadUrl,
          success: downloadResult.success
        }
      };
    }
    
    // Manejar directamente las intenciones de generación de informes
    if (intent === 'generate_report' || intent === 'generate_attendance_report' || 
        intent === 'generate_grades_report' || intent === 'generate_performance_report') {
      console.log('Generando informe directamente sin solicitar más datos');
      
      // Generar el informe directamente
      actionResult = await handleReportDownload(intent, entities);
      
      if (actionResult.success) {
        return {
          success: true,
          message: `${actionResult.message}\n\nPuedes descargar el informe desde el siguiente enlace: ${actionResult.downloadUrl}`,
          actionResult,
          reportUrl: actionResult.downloadUrl
        };
      } else {
        return {
          success: false,
          message: actionResult.message
        };
      }
    }
    
    // Verificar si se necesitan más datos y solicitar al usuario
    if (createIntents.includes(intent)) {
      // Verificar si es una respuesta negativa a una solicitud de datos opcionales
      // Mejorar la detección para incluir más variantes y ser menos estricto con el formato
      const lowerMessage = message.toLowerCase().trim();
      const isOptionalFieldsResponse = 
        lowerMessage === 'no' || 
        lowerMessage === 'ninguno' || 
        lowerMessage === 'nada' || 
        lowerMessage === 'omitir' || 
        lowerMessage === 'saltar' || 
        lowerMessage.includes('no quiero') || 
        lowerMessage.includes('no deseo') || 
        lowerMessage.includes('ninguno de ellos') || 
        lowerMessage.includes('no es necesario');
      
      console.log(`Verificando si "${message}" es una respuesta negativa: ${isOptionalFieldsResponse}`);
      
      // Si el usuario tiene los datos básicos y responde que no quiere añadir campos opcionales
      if (intent === 'create_user' && entities.name && entities.email && isOptionalFieldsResponse) {
        console.log('Usuario decidió no añadir campos opcionales. Procediendo con la creación del usuario.');
        // No solicitar más datos, continuar con la creación del usuario
        entities.allFieldsProvided = true;
        
        // Ejecutar directamente la creación del usuario aquí
        // Normalizar el rol para asegurar consistencia
        let userRole = entities.role || 'student';
        
        // Convertir 'Admin' a 'admin' para consistencia
        if (userRole.toLowerCase() === 'admin') {
          userRole = 'admin';
        }
        actionResult = await createUser({
          name: entities.name,
          email: entities.email,
          password: entities.password,
          role: userRole,
          createdBy: userId,
          // Datos adicionales si están disponibles
          studentId: entities.studentId,
          teacherId: entities.teacherId,
          dateOfBirth: entities.dateOfBirth,
          address: entities.address,
          phoneNumber: entities.phoneNumber,
          qualification: entities.qualification,
          specialization: entities.specialization,
          parentName: entities.parentName,
          parentContact: entities.parentContact
        });
        
        // Marcar que la creación de usuario ha sido completada para reactivar Ollama
        entities.userCreationCompleted = true;
        
        let responseMessage = `Resultado de la creación de ${userRole === 'teacher' ? 'profesor' : userRole === 'student' ? 'estudiante' : 'usuario'}: ${actionResult.success ? 'Exitoso' : 'Fallido'}. ${actionResult.message}`;
        
        // Añadir información sobre la contraseña temporal si se generó una
        if (actionResult.success && actionResult.temporaryPassword && !entities.password) {
          responseMessage += `\n\nContraseña temporal: ${actionResult.temporaryPassword}\n(Recomiende al usuario cambiarla después del primer inicio de sesión)`;
        }
        
        contextData = responseMessage;
        
        // Devolver directamente la respuesta sin solicitar más datos
        return {
          success: true,
          message: responseMessage,
          actionResult
        };
      } else {
        const dataRequestMessage = generateDataRequestMessage(intent, entities);
        
        if (dataRequestMessage) {
          return {
            success: true,
            message: dataRequestMessage,
            needsMoreData: true,
            currentIntent: intent,
            currentEntities: entities
          };
        }
      }
    }
    
    // Ejecutar acción según la intención
    switch (intent) {
      case 'create_user':
        // Usar el rol proporcionado o establecer student como valor predeterminado
        let userRole = entities.role || 'student';
        
        if (entities.name && entities.email) {
          actionResult = await createUser({
            name: entities.name,
            email: entities.email,
            password: entities.password, // Usar la contraseña si se proporcionó
            role: userRole,
            createdBy: userId,
            // Datos adicionales si están disponibles
            studentId: entities.studentId,
            teacherId: entities.teacherId,
            dateOfBirth: entities.dateOfBirth,
            address: entities.address,
            phoneNumber: entities.phoneNumber,
            qualification: entities.qualification,
            specialization: entities.specialization,
            parentName: entities.parentName,
            parentContact: entities.parentContact
          });
          
          let responseMessage = `Resultado de la creación de ${userRole === 'teacher' ? 'profesor' : userRole === 'student' ? 'estudiante' : 'usuario'}: ${actionResult.success ? 'Exitoso' : 'Fallido'}. ${actionResult.message}`;
          
          // Añadir información sobre la contraseña temporal si se generó una
          if (actionResult.success && actionResult.temporaryPassword && !entities.password) {
            responseMessage += `\n\nContraseña temporal: ${actionResult.temporaryPassword}\n(Recomiende al usuario cambiarla después del primer inicio de sesión)`;
          }
          
          // Marcar que la creación de usuario ha sido completada para reactivar Ollama
          entities.userCreationCompleted = true;
          contextData = responseMessage;
        } else {
          contextData = `Se detectó intención de crear ${userRole === 'teacher' ? 'profesor' : userRole === 'student' ? 'estudiante' : 'usuario'}, pero faltan datos necesarios (nombre y correo electrónico).`;
        }
        break;
        
      case 'create_course':
        if (entities.courseName && entities.courseCode) {
          actionResult = await createCourse({
            name: entities.courseName,
            code: entities.courseCode,
            description: entities.description || `Curso de ${entities.courseName}`,
            teacherEmail: entities.email,
            createdBy: userId
          });
          
          contextData = `Resultado de la creación de curso: ${actionResult.success ? 'Exitoso' : 'Fallido'}. ${actionResult.message}`;
        } else {
          contextData = 'Se detectó intención de crear curso, pero faltan datos necesarios (nombre y código del curso).';
        }
        break;
        
      case 'generate_report':
      case 'generate_attendance_report':
      case 'generate_grades_report':
      case 'generate_performance_report':
        // Determinar el tipo de reporte basado en la intención
        let reportType = entities.reportType || 'overall_stats';
        if (intent === 'generate_attendance_report') reportType = 'course_attendance';
        if (intent === 'generate_grades_report') reportType = 'student_grades';
        if (intent === 'generate_performance_report') reportType = 'student_performance';
        
        // Si se solicita un reporte completo, establecer el tipo de reporte como 'complete'
        if (entities.reportType === 'complete' || 
            message.toLowerCase().includes('generar reporte') || 
            message.toLowerCase().includes('reporte completo')) {
          reportType = 'complete';
        }
        
        // Preparar filtros según el tipo de reporte
        const filters = {};
        
        // Añadir filtros basados en las entidades extraídas
        if (entities.studentId) filters.studentId = entities.studentId;
        if (entities.studentName) filters.studentName = entities.studentName;
        if (entities.courseCode) {
          try {
            const Course = mongoose.models.Course || mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
            const course = await Course.findOne({ code: entities.courseCode });
            if (course) filters.courseId = course._id;
          } catch (error) {
            console.error('Error al buscar curso:', error);
          }
        }
        
        // Añadir filtros de fecha si están disponibles
        if (entities.startDate) filters.startDate = entities.startDate;
        if (entities.endDate) filters.endDate = entities.endDate;
        
        // Generar el reporte
        actionResult = await generateReportPDF(reportType, filters);
        
        if (actionResult.success) {
          // Formatear la respuesta para que sea más legible
          let formattedReport = 'Reporte generado:\n\n';
          
          if (reportType === 'course_attendance') {
            formattedReport += 'Reporte de Asistencia\n';
            formattedReport += `Curso: ${actionResult.reportData.courseName || 'Todos los cursos'}\n`;
            formattedReport += `Periodo: ${actionResult.reportData.period || 'Todo el periodo'}\n\n`;
            formattedReport += 'Resumen de asistencia:\n';
            formattedReport += `- Asistencia promedio: ${actionResult.reportData.averageAttendance || '0'}%\n`;
            formattedReport += `- Total de clases: ${actionResult.reportData.totalClasses || '0'}\n`;
          } else if (reportType === 'student_grades') {
            formattedReport += 'Reporte de Calificaciones\n';
            formattedReport += `Estudiante: ${actionResult.reportData.studentName || 'Todos los estudiantes'}\n`;
            formattedReport += `Curso: ${actionResult.reportData.courseName || 'Todos los cursos'}\n\n`;
            formattedReport += 'Resumen de calificaciones:\n';
            formattedReport += `- Promedio general: ${actionResult.reportData.averageGrade || '0'}\n`;
            formattedReport += `- Mejor calificación: ${actionResult.reportData.highestGrade || '0'}\n`;
            formattedReport += `- Calificación más baja: ${actionResult.reportData.lowestGrade || '0'}\n`;
          } else if (reportType === 'student_performance') {
            formattedReport += 'Reporte de Rendimiento\n';
            formattedReport += `Estudiante: ${actionResult.reportData.studentName || 'Todos los estudiantes'}\n`;
            formattedReport += `Periodo: ${actionResult.reportData.period || 'Todo el periodo'}\n\n`;
            formattedReport += 'Resumen de rendimiento:\n';
            formattedReport += `- Promedio general: ${actionResult.reportData.averagePerformance || '0'}%\n`;
            formattedReport += `- Asistencia: ${actionResult.reportData.attendanceRate || '0'}%\n`;
            formattedReport += `- Tareas completadas: ${actionResult.reportData.completedAssignments || '0'}/${actionResult.reportData.totalAssignments || '0'}\n`;
          } else if (reportType === 'complete') {
            formattedReport += 'REPORTE COMPLETO EDUTRACK360\n\n';
            formattedReport += `Fecha de generación: ${actionResult.reportData?.generationDate || new Date().toLocaleDateString()}\n`;
            formattedReport += `Hora de generación: ${actionResult.reportData?.generationTime || new Date().toLocaleTimeString()}\n\n`;
            formattedReport += 'El reporte completo ha sido generado exitosamente y está disponible para su descarga.\n';
            formattedReport += 'Incluye información detallada de docentes, estudiantes, asistencias y bloques.\n';
          } else {
            formattedReport += 'Estadísticas Generales\n\n';
            formattedReport += `- Total de estudiantes: ${actionResult.reportData?.totalStudents || '0'}\n`;
            formattedReport += `- Total de cursos: ${actionResult.reportData?.totalCourses || '0'}\n`;
            formattedReport += `- Promedio general: ${actionResult.reportData?.overallAverage || '0'}\n`;
          }
          
          contextData = formattedReport;
        } else {
          contextData = `Error al generar reporte: ${actionResult.message}`;
        }
        break;
        
      case 'general_query':
        if (role === 'admin' && message.toLowerCase().includes('estudiante')) {
          // Si es un administrador preguntando por un estudiante, intentamos extraer el ID o nombre
          const studentIdentifier = extractStudentIdentifier(message);
          if (studentIdentifier) {
            const studentData = await getStudentData(studentIdentifier);
            if (studentData) {
              contextData = `Información del estudiante: ${JSON.stringify(studentData)}`;
            }
          }
        }
        break;
    }
    
    // Determinar si debemos usar Ollama o no
    let useOllama = true;
    
    // Desactivar Ollama durante el proceso de creación de usuario
    // Verificar si estamos en un proceso de creación de usuario
    if (intent === 'create_user') {
      // Si el usuario ha proporcionado datos básicos (nombre y email)
      if (entities.name && entities.email) {
        console.log('Desactivando Ollama durante el proceso de creación de usuario');
        useOllama = false;
        
        // Si no tenemos un resultado de acción pero tenemos los datos básicos,
        // ejecutar la creación del usuario aquí
        if (!actionResult && !entities.userCreationCompleted) {
          // Normalizar el rol para asegurar consistencia
          let userRole = entities.role || 'student';
          
          // Convertir 'Admin' a 'admin' para consistencia
          if (userRole.toLowerCase() === 'admin') {
            userRole = 'admin';
          }
          
          console.log(`Creando usuario con rol: ${userRole}`);
          
          actionResult = await createUser({
            name: entities.name,
            email: entities.email,
            password: entities.password,
            role: userRole,
            createdBy: userId,
            // Datos adicionales si están disponibles
            studentId: entities.studentId,
            teacherId: entities.teacherId,
            dateOfBirth: entities.dateOfBirth,
            address: entities.address,
            phoneNumber: entities.phoneNumber,
            qualification: entities.qualification,
            specialization: entities.specialization,
            parentName: entities.parentName,
            parentContact: entities.parentContact
          });
          
          // Marcar que la creación de usuario ha sido completada
          entities.userCreationCompleted = true;
          
          let responseMessage = `Resultado de la creación de ${userRole.toLowerCase() === 'teacher' ? 'profesor' : userRole.toLowerCase() === 'student' ? 'estudiante' : userRole.toLowerCase() === 'admin' ? 'administrador' : 'usuario'}: ${actionResult.success ? 'Exitoso' : 'Fallido'}. ${actionResult.message}`;
          
          // Añadir información sobre la contraseña temporal si se generó una
          if (actionResult.success && actionResult.temporaryPassword && !entities.password) {
            responseMessage += `\n\nContraseña temporal: ${actionResult.temporaryPassword}\n(Recomiende al usuario cambiarla después del primer inicio de sesión)`;
          }
          
          contextData = responseMessage;
          
          return {
            success: true,
            message: responseMessage,
            actionResult
          };
        }
      }
    }
    
    // Si no se ha desactivado Ollama, construir el prompt y obtener respuesta
    if (useOllama) {
      // Construir el prompt para Ollama
      const prompt = `
      Eres un asistente educativo para la plataforma EduTrack360.
      
      ${contextData ? `Contexto adicional: ${contextData}` : ''}
      
      Pregunta del usuario (${role}): ${message}
      
      Responde de manera concisa y profesional, proporcionando información relevante para el contexto educativo.
      
      ${actionResult && actionResult.success ? 
        `Incluye en tu respuesta que la acción solicitada se ha completado exitosamente: ${actionResult.message}` : 
        actionResult ? `Incluye en tu respuesta que hubo un problema con la acción solicitada: ${actionResult.message}` : ''}
      
      Si el usuario está intentando crear un usuario o curso pero faltan datos, solicítalos de manera específica.
      Si el usuario está intentando generar un reporte pero no especificó el tipo, pregúntale si desea un reporte de rendimiento de estudiantes, asistencia de curso o estadísticas generales.
      `;
      
      // Obtener respuesta de Ollama pasando la intención, entidades y mensaje original
      const response = await generateOllamaResponse(prompt, 'llama3', intent, entities, message);
      return response;
    } else {
      // Si Ollama está desactivado, devolver el resultado de la acción
      return {
        success: true,
        message: contextData || 'Acción completada',
        actionResult
      };
    }
    
    return {
      success: true,
      message: response,
      actionResult
    };
  } catch (error) {
    console.error('Error en el procesamiento del mensaje:', error);
    return {
      success: false,
      message: 'Ocurrió un error al procesar tu mensaje. Por favor, inténtalo de nuevo más tarde.'
    };
  }
};

// Función auxiliar para extraer identificadores de estudiantes de un mensaje
const extractStudentIdentifier = (message) => {
  // Implementación básica - se podría mejorar con NLP
  const idMatch = message.match(/id:?\s*([a-f0-9]{24})/i);
  if (idMatch) return idMatch[1];
  
  // Aquí se podrían implementar más métodos de extracción
  return null;
};

// Función para analizar la intención del mensaje
const analyzeIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Patrones para detectar intenciones
  const createUserPatterns = [
    /crear\s+(un\s+)?((nuevo\s+)?usuario|estudiante|profesor|alumno|docente)/i,
    /añadir\s+(un\s+)?((nuevo\s+)?usuario|estudiante|profesor|alumno|docente)/i,
    /registrar\s+(un\s+)?((nuevo\s+)?usuario|estudiante|profesor|alumno|docente)/i,
    /dar de alta\s+(un\s+)?((nuevo\s+)?usuario|estudiante|profesor|alumno|docente)/i,
    /nuevo\s+(usuario|estudiante|profesor|alumno|docente)/i
  ];
  
  const createCoursePatterns = [
    /crear\s+(un\s+)?((nuevo\s+)?curso|materia|asignatura|clase)/i,
    /añadir\s+(un\s+)?((nuevo\s+)?curso|materia|asignatura|clase)/i,
    /registrar\s+(un\s+)?((nuevo\s+)?curso|materia|asignatura|clase)/i,
    /dar de alta\s+(un\s+)?((nuevo\s+)?curso|materia|asignatura|clase)/i,
    /nuevo\s+(curso|materia|asignatura|clase)/i
  ];
  
  const generateReportPatterns = [
    /(generar|crear|hacer)\s+(un\s+)?(reporte|informe|estadística)/i,
    /necesito\s+(un\s+)?(reporte|informe|estadística)/i,
    /quiero\s+(un\s+)?(reporte|informe|estadística)/i,
    /dame\s+(un\s+)?(reporte|informe|estadística)/i,
    /mostrar\s+(un\s+)?(reporte|informe|estadística)/i,
    /ver\s+(un\s+)?(reporte|informe|estadística)/i,
    /generar\s+reporte/i,
    /reporte\s+completo/i
  ];
  
  // Verificar intenciones
  for (const pattern of createUserPatterns) {
    if (pattern.test(lowerMessage)) {
      return 'create_user';
    }
  }
  
  for (const pattern of createCoursePatterns) {
    if (pattern.test(lowerMessage)) {
      return 'create_course';
    }
  }
  
  for (const pattern of generateReportPatterns) {
    if (pattern.test(lowerMessage)) {
      return 'generate_report';
    }
  }
  
  // Intenciones específicas para tipos de reportes
  if (/reporte\s+de\s+asistencia/i.test(lowerMessage) || 
      /informe\s+de\s+asistencia/i.test(lowerMessage) ||
      /asistencia\s+de\s+los\s+estudiantes/i.test(lowerMessage)) {
    return 'generate_attendance_report';
  }
  
  if (/reporte\s+de\s+calificaciones/i.test(lowerMessage) || 
      /informe\s+de\s+calificaciones/i.test(lowerMessage) ||
      /calificaciones\s+de\s+los\s+estudiantes/i.test(lowerMessage)) {
    return 'generate_grades_report';
  }
  
  if (/reporte\s+de\s+rendimiento/i.test(lowerMessage) || 
      /informe\s+de\s+rendimiento/i.test(lowerMessage) ||
      /rendimiento\s+de\s+los\s+estudiantes/i.test(lowerMessage)) {
    return 'generate_performance_report';
  }
  
  return 'general_query';
};

// Función para extraer entidades del mensaje
const extractEntities = (message) => {
  const entities = {};
  const lowerMessage = message.toLowerCase();
  
  // Extraer correo electrónico
  const emailPatterns = [
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    /email:?\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,  // Formato sugerido: "Email: usuario@ejemplo.com"
    /correo:?\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    /correo electrónico:?\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
  ];
  
  for (const pattern of emailPatterns) {
    const match = message.match(pattern);
    if (match) {
      entities.email = Array.isArray(match[1]) ? match[0] : (match[1] || match[0]);
      entities.email = entities.email.replace(/\[correo electrónico\]|\[.+\]/g, '').trim();
      break;
    }
  }
  
  // Extraer nombre
  const namePatterns = [
    /nombre[:\s]+([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+?)(?=\s+(correo|email|rol|password|contraseña)|[,\.\s]|$)/i,
    /llamad[oa][:\s]+([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+?)(?=\s+(correo|email|rol|password|contraseña)|[,\.\s]|$)/i,
    /se llama[:\s]+([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+?)(?=\s+(correo|email|rol|password|contraseña)|[,\.\s]|$)/i,
    /^nombre:?\s+([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+?)(?=\s+(correo|email|rol|password|contraseña)|[,\.\s]|$)/im  // Formato sugerido: "Nombre: Juan Pérez"
  ];
  
  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      entities.name = match[1].trim().replace(/\[nombre completo\]|\[.+\]/g, '').trim();
      console.log(`Nombre extraído: ${entities.name}`);
      break;
    }
  }
  
  // Si no se encontró el nombre con los patrones anteriores, intentar con un enfoque más simple
  if (!entities.name && message.toLowerCase().includes('nombre:')) {
    // Dividir el mensaje en líneas o partes
    const parts = message.split(/[,;\n]/);
    for (const part of parts) {
      if (part.toLowerCase().includes('nombre:')) {
        // Extraer solo la parte después de "nombre:" y antes del siguiente campo
        const namePart = part.replace(/nombre:?/i, '').trim();
        // Verificar que no contenga otros campos
        if (!namePart.toLowerCase().includes('correo:') && 
            !namePart.toLowerCase().includes('email:') && 
            !namePart.toLowerCase().includes('contraseña:') && 
            !namePart.toLowerCase().includes('rol:')) {
          entities.name = namePart;
          console.log(`Nombre extraído (método alternativo): ${entities.name}`);
          break;
        }
      }
    }
  }
  
  // Extraer contraseña
  const passwordPatterns = [
    /contraseña[:\s]+([a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>\/?]+)(?=[,\.\s]|$)/i,
    /password[:\s]+([a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>\/?]+)(?=[,\.\s]|$)/i,
    /clave[:\s]+([a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>\/?]+)(?=[,\.\s]|$)/i,
    /^contraseña:?\s+(.+)$/im  // Formato sugerido: "Contraseña: miContraseña123"
  ];
  
  for (const pattern of passwordPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      entities.password = match[1].trim().replace(/\[opcional.+\]|\[.+\]/g, '').trim();
      // Si después de limpiar la contraseña está vacía, no la consideramos
      if (!entities.password) {
        delete entities.password;
      }
      break;
    }
  }
  
  // Extraer rol
  const rolePatterns = [
    /rol[:\s]+(estudiante|profesor|admin|administrador|student|teacher)/i,
    /^rol:?\s+(estudiante|profesor|admin|administrador|student|teacher)$/im  // Formato sugerido: "Rol: student"
  ];
  
  for (const pattern of rolePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      let role = match[1].toLowerCase();
      if (role === 'administrador') role = 'admin';
      if (role === 'estudiante' || role === 'alumno' || role === 'student') role = 'student';
      if (role === 'profesor' || role === 'docente' || role === 'teacher') role = 'teacher';
      entities.role = role;
      break;
    }
  }
  
  // Detectar rol por palabras clave en el mensaje si no se ha encontrado un rol explícito
  if (!entities.role) {
    if (lowerMessage.includes('student') || lowerMessage.includes('estudiante') || lowerMessage.includes('alumno')) {
      entities.role = 'student';
    } else if (lowerMessage.includes('teacher') || lowerMessage.includes('profesor') || lowerMessage.includes('docente') || lowerMessage.includes('maestro')) {
      entities.role = 'teacher';
    } else if (lowerMessage.includes('admin') || lowerMessage.includes('administrador')) {
      entities.role = 'admin';
    }
  }
  
  // Extraer ID de estudiante
  const studentIdPatterns = [
    /id\s+de\s+estudiante[:\s]+([A-Z0-9-]+)/i,
    /número\s+de\s+estudiante[:\s]+([A-Z0-9-]+)/i,
    /matrícula[:\s]+([A-Z0-9-]+)/i,
    /estudiante\s+id[:\s]+([A-Z0-9-]+)/i,
    /^id\s+estudiante:?\s+(.+)$/im,  // Formato sugerido: "ID Estudiante: ST1234"
    /^id\s+student:?\s+(.+)$/im
  ];
  
  for (const pattern of studentIdPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      entities.studentId = match[1].trim().replace(/\[opcional.+\]|\[.+\]/g, '').trim();
      // Si después de limpiar el ID está vacío, no lo consideramos
      if (!entities.studentId) {
        delete entities.studentId;
      }
      break;
    }
  }
  
  // Extraer ID de profesor
  const teacherIdPatterns = [
    /id\s+de\s+profesor[:\s]+([A-Z0-9-]+)/i,
    /número\s+de\s+profesor[:\s]+([A-Z0-9-]+)/i,
    /profesor\s+id[:\s]+([A-Z0-9-]+)/i,
    /^id\s+profesor:?\s+(.+)$/im,  // Formato sugerido: "ID Profesor: TC1234"
    /^id\s+teacher:?\s+(.+)$/im
  ];
  
  for (const pattern of teacherIdPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      entities.teacherId = match[1].trim().replace(/\[opcional.+\]|\[.+\]/g, '').trim();
      // Si después de limpiar el ID está vacío, no lo consideramos
      if (!entities.teacherId) {
        delete entities.teacherId;
      }
      break;
    }
  }
  
  // Extraer grado
  const gradePatterns = [
    /grado[:\s]+([0-9]+[a-zA-Z]*|[a-zA-Z]+)/i,
    /curso[:\s]+([0-9]+[a-zA-Z]*|[a-zA-Z]+)\s+grado/i
  ];
  
  for (const pattern of gradePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      entities.grade = match[1].trim();
      break;
    }
  }
  
  // Extraer departamento
  const departmentPatterns = [
    /departamento[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+)(?=[,\.\s]|$)/i,
    /área[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+)(?=[,\.\s]|$)/i
  ];
  
  for (const pattern of departmentPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      entities.department = match[1].trim();
      break;
    }
  }
  
  // Extraer bloque
  const blockPatterns = [
    /bloque[:\s]+([a-zA-Z0-9-]+)/i,
    /edificio[:\s]+([a-zA-Z0-9-]+)/i
  ];
  
  for (const pattern of blockPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      entities.block = match[1].trim();
      break;
    }
  }
  
  // La extracción de calificación/título se realiza más adelante en el código
  
  // La extracción de especialización se realiza más adelante en el código
  
  // Extraer fecha de nacimiento
  const dobPatterns = [
    /fecha\s+de\s+nacimiento[:\s]+([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{4})/i,
    /nació\s+el[:\s]+([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{4})/i,
    /nacimiento[:\s]+([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{4})/i
  ];
  
  for (const pattern of dobPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      entities.dateOfBirth = match[1].trim();
      break;
    }
  }
  
  // Extraer dirección
  const addressPatterns = [
    /dirección[:\s]+([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,\.\-#]+)(?=[,\.\s]|$)/i,
    /domicilio[:\s]+([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,\.\-#]+)(?=[,\.\s]|$)/i,
    /vive\s+en[:\s]+([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,\.\-#]+)(?=[,\.\s]|$)/i,
    /^dirección:?\s+(.+)$/im,  // Formato sugerido: "Dirección: Calle Principal 123"
    /^direccion:?\s+(.+)$/im,
    /^address:?\s+(.+)$/im
  ];
  
  for (const pattern of addressPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      entities.address = match[1].trim().replace(/\[opcional\]|\[.+\]/g, '').trim();
      // Si después de limpiar la dirección está vacía, no la consideramos
      if (!entities.address) {
        delete entities.address;
      }
      break;
    }
  }
  
  // Extraer número de teléfono
  const phonePatterns = [
    /teléfono[:\s]+([0-9+\-\s()]+)/i,
    /celular[:\s]+([0-9+\-\s()]+)/i,
    /móvil[:\s]+([0-9+\-\s()]+)/i,
    /número\s+de\s+contacto[:\s]+([0-9+\-\s()]+)/i,
    /^teléfono:?\s+(.+)$/im,  // Formato sugerido: "Teléfono: 123-456-7890"
    /^telefono:?\s+(.+)$/im,
    /^tel:?\s+(.+)$/im,
    /^phone:?\s+(.+)$/im
  ];
  
  for (const pattern of phonePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      entities.phoneNumber = match[1].trim().replace(/\[opcional\]|\[.+\]/g, '').trim();
      // Si después de limpiar el teléfono está vacío, no lo consideramos
      if (!entities.phoneNumber) {
        delete entities.phoneNumber;
      }
      break;
    }
  }
  
  // Extraer nombre de padre/madre
  if (lowerMessage.includes('padre') || lowerMessage.includes('madre') || lowerMessage.includes('tutor')) {
    const parentNamePatterns = [
      /padre[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+)(?=[,\.\s]|$)/i,
      /madre[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+)(?=[,\.\s]|$)/i,
      /tutor[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+)(?=[,\.\s]|$)/i,
      /padre\s+se\s+llama[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+)(?=[,\.\s]|$)/i,
      /madre\s+se\s+llama[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+)(?=[,\.\s]|$)/i
    ];
    
    for (const pattern of parentNamePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        entities.parentName = match[1].trim();
        break;
      }
    }
  }
  
  // Extraer contacto de padre/madre
  if (lowerMessage.includes('padre') || lowerMessage.includes('madre') || lowerMessage.includes('tutor')) {
    const parentContactPatterns = [
      /contacto\s+(?:del|de la|de)\s+(?:padre|madre|tutor)[:\s]+([0-9\s\-\+\(\)]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      /(?:padre|madre|tutor)\s+contacto[:\s]+([0-9\s\-\+\(\)]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      /(?:teléfono|email|correo)\s+(?:del|de la|de)\s+(?:padre|madre|tutor)[:\s]+([0-9\s\-\+\(\)]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
    ];
    
    for (const pattern of parentContactPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        entities.parentContact = match[1].trim();
        break;
      }
    }
  }
  
  // Extraer código de curso
  const courseCodePatterns = [
    /código[:\s]+([A-Z0-9-]+)/i,
    /código\s+del\s+curso[:\s]+([A-Z0-9-]+)/i,
    /curso\s+código[:\s]+([A-Z0-9-]+)/i,
    /identificador\s+del\s+curso[:\s]+([A-Z0-9-]+)/i
  ];
  
  for (const pattern of courseCodePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      entities.courseCode = match[1].trim();
      break;
    }
  }
  
  // Extraer nombre de curso
  const courseNamePatterns = [
    /curso[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+)(?=[,\.\s]|$)/i,
    /materia[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+)(?=[,\.\s]|$)/i,
    /asignatura[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+)(?=[,\.\s]|$)/i,
    /clase\s+de[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+)(?=[,\.\s]|$)/i
  ];
  
  for (const pattern of courseNamePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      entities.courseName = match[1].trim();
      break;
    }
  }
  
  // Extraer descripción del curso
  const descriptionPatterns = [
    /descripción[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s,\.\-]+)(?=[,\.\s]|$)/i,
    /descripción\s+del\s+curso[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s,\.\-]+)(?=[,\.\s]|$)/i,
    /sobre\s+el\s+curso[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s,\.\-]+)(?=[,\.\s]|$)/i
  ];
  
  for (const pattern of descriptionPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      entities.description = match[1].trim();
      break;
    }
  }
  
  // Detectar si se solicita un reporte completo
  if (lowerMessage.includes('generar reporte') || 
      (lowerMessage.includes('reporte') && lowerMessage.includes('completo')) ||
      (lowerMessage.includes('reporte') && lowerMessage.includes('todos los datos')) ||
      (lowerMessage.includes('reporte') && lowerMessage.includes('docentes') && lowerMessage.includes('estudiantes')) ||
      (lowerMessage.includes('reporte') && lowerMessage.includes('asistencias') && lowerMessage.includes('bloques'))) {
    entities.reportType = 'complete';
    entities.includeTeachers = true;
    entities.includeStudents = true;
    entities.includeAttendance = true;
    entities.includeBlocks = true;
    entities.generatePDF = true;
  }
  
  // Extraer fechas de inicio y fin del curso
  const startDatePatterns = [
    /fecha\s+de\s+inicio[:\s]+([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{4})/i,
    /inicia\s+el[:\s]+([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{4})/i,
    /comienza\s+el[:\s]+([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{4})/i
  ];
  
  for (const pattern of startDatePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      entities.startDate = match[1].trim();
      break;
    }
  }
  
  const endDatePatterns = [
    /fecha\s+de\s+fin[:\s]+([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{4})/i,
    /termina\s+el[:\s]+([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{4})/i,
    /finaliza\s+el[:\s]+([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{4})/i
  ];
  
  for (const pattern of endDatePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      entities.endDate = match[1].trim();
      break;
    }
  }
  
  // Extraer horario
  const schedulePatterns = [
    /horario[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s,\.\-:]+)(?=[,\.\s]|$)/i,
    /horario\s+del\s+curso[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s,\.\-:]+)(?=[,\.\s]|$)/i
  ];
  
  for (const pattern of schedulePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      entities.schedule = match[1].trim();
      break;
    }
  }
  
  // Extraer tipo de reporte
  const reportTypePatterns = [
    /reporte\s+de\s+(rendimiento|asistencia|estadísticas|general|calificaciones)/i,
    /informe\s+de\s+(rendimiento|asistencia|estadísticas|general|calificaciones)/i,
    /reporte\s+(de\s+)?(rendimiento|asistencia|estadísticas|general|calificaciones)/i
  ];
  
  // Detectar si se solicita un reporte completo
  if (lowerMessage.includes('generar reporte') || 
      lowerMessage.includes('reporte completo') || 
      lowerMessage.match(/generar\s+un\s+reporte/i) || 
      lowerMessage.match(/dame\s+un\s+reporte/i) || 
      lowerMessage.match(/necesito\s+un\s+reporte/i)) {
    entities.reportType = 'complete';
  }
  
  for (const pattern of reportTypePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      let reportType = match[1].toLowerCase();
      if (reportType === 'rendimiento') reportType = 'performance';
      if (reportType === 'asistencia') reportType = 'attendance';
      if (reportType === 'calificaciones') reportType = 'grades';
      if (reportType === 'estadísticas' || reportType === 'general') reportType = 'general';
      entities.reportType = reportType;
      break;
    }
  }
  
  // Extraer nombre del padre/madre
  const parentNamePatterns = [
    /nombre\s+del\s+padre[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+)(?=[,\.\s]|$)/i,
    /nombre\s+de\s+la\s+madre[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+)(?=[,\.\s]|$)/i,
    /padre\s+o\s+madre[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+)(?=[,\.\s]|$)/i,
    /^nombre\s+del\s+padre\/madre:?\s+(.+)$/im,  // Formato sugerido
    /^parent\s+name:?\s+(.+)$/im
  ];
  
  for (const pattern of parentNamePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      entities.parentName = match[1].trim().replace(/\[opcional\]|\[.+\]/g, '').trim();
      // Si después de limpiar el nombre está vacío, no lo consideramos
      if (!entities.parentName) {
        delete entities.parentName;
      }
      break;
    }
  }
  
  // Extraer contacto del padre/madre
  const parentContactPatterns = [
    /contacto\s+del\s+padre[:\s]+([a-zA-Z0-9+\-\s()@\.]+)(?=[,\.\s]|$)/i,
    /contacto\s+de\s+la\s+madre[:\s]+([a-zA-Z0-9+\-\s()@\.]+)(?=[,\.\s]|$)/i,
    /teléfono\s+del\s+padre[:\s]+([0-9+\-\s()]+)/i,
    /teléfono\s+de\s+la\s+madre[:\s]+([0-9+\-\s()]+)/i,
    /^contacto\s+del\s+padre\/madre:?\s+(.+)$/im,  // Formato sugerido
    /^parent\s+contact:?\s+(.+)$/im
  ];
  
  for (const pattern of parentContactPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      entities.parentContact = match[1].trim().replace(/\[opcional\]|\[.+\]/g, '').trim();
      // Si después de limpiar el contacto está vacío, no lo consideramos
      if (!entities.parentContact) {
        delete entities.parentContact;
      }
      break;
    }
  }
  
  // Extraer especialización (para profesores)
  const specializationPatterns = [
    /especialización[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s,\.]+)(?=[,\.\s]|$)/i,
    /especialidad[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s,\.]+)(?=[,\.\s]|$)/i,
    /^especialización:?\s+(.+)$/im,  // Formato sugerido
    /^especializacion:?\s+(.+)$/im,
    /^specialization:?\s+(.+)$/im
  ];
  
  for (const pattern of specializationPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      entities.specialization = match[1].trim().replace(/\[opcional\]|\[.+\]/g, '').trim();
      // Si después de limpiar la especialización está vacía, no la consideramos
      if (!entities.specialization) {
        delete entities.specialization;
      }
      break;
    }
  }
  
  // Extraer calificación/título (para profesores)
  const qualificationPatterns = [
    /calificación[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s,\.]+)(?=[,\.\s]|$)/i,
    /título[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s,\.]+)(?=[,\.\s]|$)/i,
    /grado\s+académico[:\s]+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s,\.]+)(?=[,\.\s]|$)/i,
    /^calificación:?\s+(.+)$/im,  // Formato sugerido
    /^calificacion:?\s+(.+)$/im,
    /^qualification:?\s+(.+)$/im
  ];
  
  for (const pattern of qualificationPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      entities.qualification = match[1].trim().replace(/\[opcional\]|\[.+\]/g, '').trim();
      // Si después de limpiar la calificación está vacía, no la consideramos
      if (!entities.qualification) {
        delete entities.qualification;
      }
      break;
    }
  }
  
  // Marcar si todos los campos opcionales han sido proporcionados
  if (message.toLowerCase().includes('todos los campos') || 
      message.toLowerCase().includes('all fields') ||
      message.toLowerCase().includes('ya está completo') ||
      message.toLowerCase().includes('está completa la información')) {
    entities.allFieldsProvided = true;
  }
  
  return entities;
};

// Las exportaciones ya están definidas al inicio del archivo
