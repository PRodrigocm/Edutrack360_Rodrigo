# Instrucciones para instalar y configurar Ollama

## Paso 1: Descargar e instalar Ollama

1. Visita el sitio oficial de Ollama: [https://ollama.com/download](https://ollama.com/download)
2. Descarga la versión para Windows
3. Ejecuta el instalador y sigue las instrucciones

## Paso 2: Descargar el modelo llama3

1. Abre una terminal (PowerShell o CMD)
2. Ejecuta el siguiente comando:
   ```
   ollama pull llama3
   ```
   Este proceso puede tardar varios minutos dependiendo de tu conexión a internet.

## Paso 3: Iniciar Ollama

1. Ollama debería iniciarse automáticamente después de la instalación
2. Si no está en ejecución, puedes iniciarlo desde el menú de inicio o ejecutando:
   ```
   ollama serve
   ```

## Paso 4: Verificar que Ollama está funcionando

1. Abre una terminal
2. Ejecuta el siguiente comando para verificar que Ollama está respondiendo:
   ```
   ollama run llama3 "Hola, ¿cómo estás?"
   ```
   Deberías recibir una respuesta del modelo.

## Paso 5: Iniciar EduTrack360 con Ollama

1. Asegúrate de que Ollama esté en ejecución
2. Inicia la aplicación EduTrack360 con:
   ```
   npm start
   ```

## Solución de problemas

Si el chatbot muestra errores de conexión con Ollama, verifica:

1. Que Ollama esté en ejecución (puedes verificarlo con `ollama ps`)
2. Que el modelo llama3 esté instalado (puedes verificarlo con `ollama list`)
3. Que no haya un firewall bloqueando la conexión al puerto 11434

## Configuración avanzada

El servicio de IA de EduTrack360 está configurado para conectarse a Ollama en las siguientes URLs (en orden de prioridad):
- http://localhost:11434/api/generate
- http://127.0.0.1:11434/api/generate
- http://host.docker.internal:11434/api/generate
- http://ollama:11434/api/generate

Si Ollama está ejecutándose en una ubicación diferente, puedes modificar el archivo `server/services/ai-service.js` para incluir la URL correcta.
