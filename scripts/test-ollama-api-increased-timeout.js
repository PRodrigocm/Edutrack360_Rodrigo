// Script para probar la conexión con Ollama con timeout aumentado
import axios from 'axios';

// Función para probar la API de versión
async function testVersionAPI() {
  try {
    console.log('Probando API de versión...');
    const response = await axios.get('http://localhost:11434/api/version', { timeout: 10000 });
    console.log('✅ API de versión funciona correctamente:');
    console.log(response.data);
    return true;
  } catch (error) {
    console.error('❌ Error en API de versión:', error.message);
    return false;
  }
}

// Función para probar la API de modelos
async function testListAPI() {
  try {
    console.log('\nProbando API de lista de modelos...');
    const response = await axios.get('http://localhost:11434/api/tags', { timeout: 10000 });
    console.log('✅ API de lista de modelos funciona correctamente:');
    console.log(response.data);
    return true;
  } catch (error) {
    console.error('❌ Error en API de lista de modelos:', error.message);
    return false;
  }
}

// Función para probar la API de chat
async function testChatAPI() {
  try {
    console.log('\nProbando API de chat...');
    const data = {
      model: 'llama3',
      messages: [
        { role: 'user', content: 'Hola, ¿cómo estás?' }
      ],
      stream: false
    };
    
    const response = await axios.post('http://localhost:11434/api/chat', data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 20000
    });
    
    console.log('✅ API de chat funciona correctamente:');
    console.log('Respuesta:', response.data.message.content);
    return true;
  } catch (error) {
    console.error('❌ Error en API de chat:', error.message);
    return false;
  }
}

// Función para probar la API de generate
async function testGenerateAPI() {
  try {
    console.log('\nProbando API de generate...');
    const data = {
      model: 'llama3',
      prompt: 'Hola, ¿cómo estás?',
      stream: false
    };
    
    const response = await axios.post('http://localhost:11434/api/generate', data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 20000
    });
    
    console.log('✅ API de generate funciona correctamente:');
    console.log('Respuesta:', response.data.response);
    return true;
  } catch (error) {
    console.error('❌ Error en API de generate:', error.message);
    return false;
  }
}

// Ejecutar todas las pruebas
async function runAllTests() {
  console.log('=== PRUEBA DE CONEXIÓN CON OLLAMA (Timeout aumentado) ===');
  
  const versionWorks = await testVersionAPI();
  const listWorks = await testListAPI();
  const chatWorks = await testChatAPI();
  const generateWorks = await testGenerateAPI();
  
  console.log('\n=== RESUMEN DE PRUEBAS ===');
  console.log(`API de versión: ${versionWorks ? '✅ Funciona' : '❌ Falla'}`);
  console.log(`API de lista de modelos: ${listWorks ? '✅ Funciona' : '❌ Falla'}`);
  console.log(`API de chat: ${chatWorks ? '✅ Funciona' : '❌ Falla'}`);
  console.log(`API de generate: ${generateWorks ? '✅ Funciona' : '❌ Falla'}`);
  
  if (versionWorks && !chatWorks && !generateWorks) {
    console.log('\n⚠️ DIAGNÓSTICO: Ollama está funcionando pero hay problemas con las APIs de chat y generate.');
    console.log('Posibles soluciones:');
    console.log('1. Reiniciar Ollama completamente');
    console.log('2. Verificar que el modelo llama3 esté correctamente instalado');
    console.log('3. Comprobar si hay algún firewall bloqueando las conexiones');
  }
}

runAllTests();
