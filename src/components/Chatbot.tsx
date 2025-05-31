import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Send, X } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  actionResult?: any; // Para almacenar resultados de acciones como creación de usuarios o reportes
}

interface ChatbotProps {
  isOpen: boolean;
  toggleChat: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, toggleChat }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hola, soy el asistente de EduTrack360. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const sendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/ai/chat', { message: userMessage.text });
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.message,
        sender: 'bot',
        timestamp: new Date(),
        actionResult: response.data.actionResult
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Si hay un resultado de acción exitoso, podríamos mostrar una notificación o actualizar la UI
      if (response.data.actionResult && response.data.actionResult.success) {
        // Por ejemplo, si se creó un usuario o curso, podríamos actualizar la lista correspondiente
        // o mostrar una notificación de éxito
        console.log('Acción completada exitosamente:', response.data.actionResult);
      }
    } catch (error) {
      console.error('Error al enviar mensaje al chatbot:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo más tarde.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex flex-col ${isOpen ? 'h-[500px] w-96' : 'h-12 w-12'} transition-all duration-300 ease-in-out shadow-lg`}>
      {/* Chatbot header */}
      <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
        {isOpen ? (
          <>
            <span className="font-semibold">Asistente EduTrack360</span>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">
              <X size={18} />
            </button>
          </>
        ) : (
          <button 
            onClick={toggleChat} 
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            <MessageSquare size={20} />
          </button>
        )}
      </div>

      {/* Chat messages */}
      {isOpen && (
        <>
          <div className="flex-1 bg-white p-3 overflow-y-auto border border-gray-200 border-t-0">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`mb-3 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div 
                  className={`inline-block p-2 rounded-lg max-w-[80%] ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {message.text}
                  
                  {/* Mostrar enlace de descarga si hay un reporte generado */}
                  {message.sender === 'bot' && message.actionResult && message.actionResult.success && 
                    message.actionResult.downloadUrl && (
                    <div className="mt-2 p-2 bg-white rounded border border-gray-300 text-sm">
                      <div className="font-semibold mb-1">Reporte generado:</div>
                      <button 
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm inline-block mt-1"
                        onClick={async () => {
                          try {
                            // Usar axios para la descarga (incluye automáticamente el token JWT)
                            const response = await axios.get(message.actionResult.downloadUrl, {
                              responseType: 'blob' // Importante para descargar archivos
                            });
                            
                            // Crear un objeto URL para el blob
                            const url = window.URL.createObjectURL(new Blob([response.data]));
                            
                            // Crear un enlace para la descarga
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = message.actionResult.fileName || 'reporte.pdf';
                            document.body.appendChild(link);
                            link.click();
                            
                            // Limpiar
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(link);
                          } catch (error) {
                            console.error('Error al descargar el reporte:', error);
                            alert('Error al descargar el reporte. Por favor, inténtalo de nuevo.');
                          }
                        }}
                      >
                        Descargar Reporte
                      </button>
                      <p className="text-xs text-gray-600 mt-1">{message.actionResult.fileName}</p>
                    </div>
                  )}
                  
                  {/* Mostrar datos adicionales si hay un resultado de acción exitoso */}
                  {message.sender === 'bot' && message.actionResult && message.actionResult.success && 
                    message.actionResult.reportData && !message.actionResult.downloadUrl && (
                    <div className="mt-2 p-2 bg-white rounded border border-gray-300 text-sm">
                      <div className="font-semibold mb-1">Datos del reporte:</div>
                      <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-40">
                        {JSON.stringify(message.actionResult.reportData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-left mb-3">
                <div className="inline-block p-2 rounded-lg bg-gray-200 text-gray-800">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="bg-white p-3 border border-gray-200 border-t-0 rounded-b-lg flex">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={inputValue.trim() === '' || isLoading}
              className={`bg-blue-600 text-white px-3 py-2 rounded-r-lg ${
                inputValue.trim() === '' || isLoading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-blue-700'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;
