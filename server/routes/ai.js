import express from 'express';
import { processChatMessage } from '../services/ai-service.js';
import { authenticateJWT, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Ruta para procesar mensajes del chatbot
router.post('/chat', authenticateJWT, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'El mensaje es requerido' });
    }
    
    // Obtener el ID y rol del usuario desde el token JWT
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Procesar el mensaje con el servicio de IA
    const response = await processChatMessage(message, userId, userRole);
    
    // Simplificar la respuesta para mostrar solo el mensaje directamente
    if (typeof response === 'object' && response !== null) {
      // Si la respuesta tiene una estructura anidada (message dentro de message)
      if (response.message && typeof response.message === 'object' && response.message.message) {
        // Extraer solo el mensaje interno
        return res.json({
          success: true,
          message: response.message.message,
          actionResult: response.actionResult || null
        });
      }
      // Si la respuesta es un objeto pero no tiene una propiedad message que sea string
      else if (typeof response.message !== 'string') {
        // Convertir el objeto a un mensaje simple
        return res.json({
          success: true,
          message: response.message?.message || 'Respuesta recibida',
          actionResult: response.actionResult || null
        });
      }
    }
    
    return res.json(response);
  } catch (error) {
    console.error('Error en la ruta del chatbot:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al procesar el mensaje del chatbot' 
    });
  }
});

// Ruta para obtener historial de conversaciones (solo para administradores)
router.get('/history', authenticateJWT, isAdmin, async (req, res) => {
  try {
    // Esta ruta podría implementarse en el futuro para obtener el historial de conversaciones
    // Por ahora, devolvemos un mensaje indicando que esta funcionalidad está en desarrollo
    res.status(200).json({
      success: true,
      message: 'Funcionalidad en desarrollo',
      data: []
    });
  } catch (error) {
    console.error('Error al obtener historial de conversaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de conversaciones'
    });
  }
});

export default router;
