import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateJWT } from '../middleware/auth.js';
import { generateReportPDF, getReportFilePath } from '../services/report-service.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta para generar un reporte
router.post('/generate', authenticateJWT, async (req, res) => {
  try {
    console.log('Solicitud recibida:', req.body);
    const { reportType, filters } = req.body;
    console.log('Tipo de reporte:', reportType);
    console.log('Filtros:', filters);
    
    // Validar el tipo de reporte
    const validReportTypes = ['attendance', 'grades', 'assignments', 'teachers', 'students', 'performance', 'general'];
    if (!validReportTypes.includes(reportType)) {
      return res.status(400).json({ 
        success: false, 
        message: `Tipo de reporte no válido. Debe ser uno de: ${validReportTypes.join(', ')}` 
      });
    }
    
    // Generar el reporte PDF
    const result = await generateReportPDF(reportType, filters);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        fileName: result.fileName,
        downloadUrl: result.downloadUrl
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error al generar el reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte: ' + error.message
    });
  }
});

// Middleware para autenticar usando token en query params
const authenticateJWTQuery = (req, res, next) => {
  // Verificar si hay un token en los query params
  const token = req.query.token;
  
  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }
  
  // Continuar con la autenticación normal
  authenticateJWT(req, res, next);
};

// Ruta para descargar un reporte generado
router.get('/download/:fileName', authenticateJWTQuery, (req, res) => {
  try {
    const fileName = req.params.fileName;
    const result = getReportFilePath(fileName);
    
    if (result.success) {
      // Configurar headers para la descarga
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.setHeader('Content-Type', 'application/pdf');
      
      // Enviar el archivo
      res.sendFile(result.filePath);
    } else {
      res.status(404).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error al descargar el reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar el reporte: ' + error.message
    });
  }
});

export default router;
