import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import https from 'https';
import { createWriteStream } from 'fs';
import { fileURLToPath } from 'url';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para determinar la plataforma y arquitectura
function getPlatformInfo() {
  const platform = os.platform();
  const arch = os.arch();
  
  console.log(`Detectado: Plataforma ${platform}, Arquitectura ${arch}`);
  
  if (platform === 'win32') {
    return {
      platform: 'windows',
      arch: arch === 'x64' ? 'amd64' : arch,
      ext: '.exe'
    };
  } else if (platform === 'darwin') {
    return {
      platform: 'darwin',
      arch: arch === 'arm64' ? 'arm64' : 'amd64',
      ext: ''
    };
  } else if (platform === 'linux') {
    return {
      platform: 'linux',
      arch: arch === 'arm64' ? 'arm64' : 'amd64',
      ext: ''
    };
  } else {
    throw new Error(`Plataforma no soportada: ${platform}`);
  }
}

// Función para descargar un archivo
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    console.log(`Descargando desde ${url} a ${destination}...`);
    
    const file = createWriteStream(destination);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Error al descargar: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('Descarga completada');
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destination, () => {});
      reject(err);
    });
  });
}

// Función principal
async function installOllama() {
  try {
    // Crear directorio para Ollama si no existe
    const ollamaDir = path.join(__dirname, '..', 'ollama');
    if (!fs.existsSync(ollamaDir)) {
      fs.mkdirSync(ollamaDir, { recursive: true });
      console.log(`Directorio creado: ${ollamaDir}`);
    }
    
    // Obtener información de la plataforma
    const { platform, arch, ext } = getPlatformInfo();
    
    // Construir la URL de descarga
    const version = '0.1.29'; // Versión más reciente de Ollama
    const filename = platform === 'windows' ? 'ollama.exe' : `ollama-${platform}`;
    const downloadUrl = `https://ollama.com/download/${platform}-${arch}`;
    console.log(`URL de descarga: ${downloadUrl}`);
    const destinationPath = path.join(ollamaDir, `ollama${ext}`);
    
    // Descargar Ollama
    await downloadFile(downloadUrl, destinationPath);
    
    // Hacer el archivo ejecutable (solo para Unix)
    if (platform !== 'windows') {
      fs.chmodSync(destinationPath, '755');
      console.log('Permisos de ejecución establecidos');
    }
    
    console.log(`Ollama instalado en: ${destinationPath}`);
    console.log('Para iniciar Ollama, ejecuta: npm run start-ollama');
    
    // Crear script para iniciar Ollama
    const startScript = platform === 'windows' 
      ? `@echo off\necho Iniciando Ollama...\ncd %~dp0\\..\\ollama\nstart /B ollama.exe serve`
      : `#!/bin/bash\necho "Iniciando Ollama..."\ncd "$(dirname "$0")/../ollama"\n./ollama serve &`;
    
    const startScriptPath = path.join(__dirname, platform === 'windows' ? 'start-ollama.bat' : 'start-ollama.sh');
    fs.writeFileSync(startScriptPath, startScript);
    
    if (platform !== 'windows') {
      fs.chmodSync(startScriptPath, '755');
    }
    
    console.log(`Script de inicio creado: ${startScriptPath}`);
    
    // Actualizar package.json para incluir el nuevo script
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    packageJson.scripts['start-ollama'] = platform === 'windows' 
      ? 'scripts\\start-ollama.bat' 
      : 'bash ./scripts/start-ollama.sh';
    
    packageJson.scripts['start-with-ollama'] = 'npm run start-ollama && npm start';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('package.json actualizado con nuevos scripts');
    
    // Descargar el modelo llama3 (opcional)
    console.log('Para descargar el modelo llama3, ejecuta: npm run start-ollama y luego en otra terminal: ollama pull llama3');
    
  } catch (error) {
    console.error('Error durante la instalación:', error);
    process.exit(1);
  }
}

// Ejecutar la función principal
installOllama();
