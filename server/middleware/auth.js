import jwt from 'jsonwebtoken';

// Middleware to authenticate JWT token
export const authenticateJWT = (req, res, next) => {
  // Intentar obtener el token de diferentes fuentes
  let token;
  
  // 1. Verificar en el header de autorización
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  
  // 2. Verificar en las cookies
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  
  // 3. Verificar en el cuerpo de la petición
  if (!token && req.body && req.body.token) {
    token = req.body.token;
  }
  
  // 4. Verificar en los query params
  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }
  
  // Si no se encontró el token en ninguna fuente
  if (!token) {
    console.log('No se encontró token de autenticación');
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'edutrack360_secret');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error de verificación de token:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check admin role
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required' });
  }
};

// Middleware to check teacher role
export const isTeacher = (req, res, next) => {
  if (req.user && (req.user.role === 'teacher' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Teacher role required' });
  }
};

// Middleware to check if user is teacher of a specific course
export const isCourseTeacher = async (req, res, next) => {
  try {
    const courseId = req.params.courseId || req.body.courseId;
    const teacherId = req.user.id;
    
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (req.user.role === 'admin' || course.teacher.toString() === teacherId) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Not authorized for this course' });
    }
  } catch (error) {
    console.error('Course teacher check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to check student role
export const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Student role required' });
  }
};

// Middleware to check if user is a student in a specific course
export const isCourseStudent = async (req, res, next) => {
  try {
    const courseId = req.params.courseId || req.body.courseId;
    const studentId = req.user.id;
    
    const student = await Student.findOne({ user: studentId });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (student.courses.includes(courseId)) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Not enrolled in this course' });
    }
  } catch (error) {
    console.error('Course student check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};