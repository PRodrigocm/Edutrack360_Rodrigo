# EduTrack360 - Sistema de Gestión Educativa

EduTrack360 es una plataforma integral para la gestión educativa que permite administrar estudiantes, profesores, cursos, asistencias y calificaciones, con un chatbot inteligente para facilitar la interacción y generación de reportes.

## Contenido
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Scripts Disponibles](#scripts-disponibles)
- [Uso del Chatbot](#uso-del-chatbot)
- [Generación de Reportes](#generación-de-reportes)
- [Despliegue con Docker](#despliegue-con-docker)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
  - [Justificación de Tecnologías](#justificación-de-tecnologías)
  - [Resumen de Tecnologías](#resumen-de-tecnologías)
- [Explicación del Sistema](#explicación-del-sistema-edutrack360)
- [Dificultades Encontradas Durante el Desarrollo](#dificultades-encontradas-durante-el-desarrollo)
- [Licencia](#licencia)

## Requisitos

- Node.js (v16 o superior)
- MongoDB
- Ollama (para funcionalidades de IA)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/PRodrigocm/Edutrack360_PGM.git
cd Edutrack360_PGM
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```
MONGODB_URI=mongodb://localhost:27017/edutrack360
JWT_SECRET=tu_clave_secreta_para_jwt
OLLAMA_API_URL=http://localhost:11434
```

### 4. Instalar Ollama (opcional, para funcionalidades de IA)

```bash
npm run install-ollama
```

### 5. Inicializar la base de datos con datos de prueba

```bash
node server/scripts/initDB.js
```

## Scripts Disponibles

### Desarrollo

Iniciar solo el servidor backend:
```bash
npm run server
```

Iniciar solo el cliente frontend:
```bash
npm run client
```

Iniciar tanto el servidor como el cliente simultáneamente:
```bash
npm run start
```

Iniciar Ollama (modelo de IA para el chatbot):
```bash
npm run start-ollama
```

Iniciar todo (Ollama, servidor y cliente):
```bash
npm run start-with-ollama
```

### Construcción y Producción

Construir la aplicación para producción:
```bash
npm run build
```

Previsualizar la versión de producción:
```bash
npm run preview
```

### Linting

Ejecutar el linter:
```bash
npm run lint
```

## Uso del Chatbot

El chatbot de EduTrack360 permite realizar diversas acciones mediante lenguaje natural:

1. **Crear usuarios, estudiantes o profesores**:
   ```
   "Crear un nuevo estudiante llamado Juan Pérez con correo juan@ejemplo.com"
   ```

2. **Generar reportes**:
   ```
   "Generar reporte de asistencia para el curso MAT101"
   "Generar reporte completo"
   ```

3. **Consultar información**:
   ```
   "Mostrar información del estudiante con ID 12345"
   ```

## Generación de Reportes

EduTrack360 puede generar diferentes tipos de reportes en formato PDF:

- **Reportes de Asistencia**: Muestra la asistencia de estudiantes a cursos específicos.
- **Reportes de Calificaciones**: Muestra las calificaciones de estudiantes en diferentes asignaturas.
- **Reportes de Rendimiento**: Analiza el rendimiento académico de estudiantes o grupos.
- **Reportes Completos**: Incluye información de docentes, estudiantes, asistencias y bloques.

Para generar un reporte, puedes usar el chatbot o acceder a la sección de reportes en la interfaz de administrador.

## Despliegue con Docker

### Desplegar toda la aplicación con Docker Compose

```bash
docker-compose up -d
```

Este comando inicia todos los servicios definidos en `docker-compose.yml`:
- MongoDB (base de datos)
- Ollama (servicio de IA)
- Servidor backend (API)
- Cliente frontend (interfaz web)

### Ver logs de los servicios

```bash
# Ver logs de todos los servicios
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs -f server
docker-compose logs -f client
```

### Detener todos los servicios

```bash
docker-compose down
```

### Construir y ejecutar solo el servidor

```bash
docker build -f docker/server.Dockerfile -t edutrack360-server .
docker run -p 5000:5000 edutrack360-server
```

### Construir y ejecutar solo el cliente

```bash
docker build -f docker/client.Dockerfile -t edutrack360-client .
docker run -p 80:80 edutrack360-client
```

## Estructura del Proyecto

```
edutrack360/
├── docker/                 # Configuraciones Docker
├── ollama/                 # Configuración de Ollama
├── scripts/                # Scripts de utilidad
├── server/                 # Backend (Node.js/Express)
│   ├── middleware/         # Middleware Express
│   ├── models/             # Modelos Mongoose
│   ├── reports/            # Reportes generados
│   ├── routes/             # Rutas API
│   ├── scripts/            # Scripts del servidor
│   ├── services/           # Servicios y lógica de negocio
│   └── index.js            # Punto de entrada del servidor
├── src/                    # Frontend (React)
│   ├── components/         # Componentes React
│   ├── contexts/           # Contextos React
│   ├── pages/              # Páginas de la aplicación
│   ├── App.tsx             # Componente principal
│   └── main.tsx            # Punto de entrada del cliente
├── .env                    # Variables de entorno
├── docker-compose.yml      # Configuración Docker Compose
├── package.json            # Dependencias y scripts
└── README.md               # Documentación
```

## Tecnologías Utilizadas

EduTrack360 utiliza un conjunto de tecnologías modernas para ofrecer una solución robusta y escalable para la gestión educativa.

### Resumen de Tecnologías

#### Lenguajes de Programación
- **JavaScript/TypeScript**: Lenguajes principales tanto para el frontend como para el backend
- **HTML/CSS**: Estructura y estilo de la interfaz de usuario
- **JSX/TSX**: Extensión de JavaScript/TypeScript para React

#### Frontend
- **React**: Biblioteca para construir interfaces de usuario
- **Material-UI**: Framework de componentes UI para React
- **React Router**: Gestión de rutas en la aplicación
- **Axios**: Cliente HTTP para realizar peticiones al servidor
- **Chart.js**: Biblioteca para crear gráficos y visualizaciones
- **React Context API**: Gestión de estado global
- **React Hooks**: Funcionalidades avanzadas en componentes funcionales

#### Backend
- **Node.js**: Entorno de ejecución para JavaScript en el servidor
- **Express.js**: Framework web para Node.js
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM (Object Data Modeling) para MongoDB
- **JWT (JSON Web Tokens)**: Autenticación y autorización
- **Bcrypt.js**: Encriptación de contraseñas
- **Multer**: Middleware para manejo de archivos

#### Generación de Reportes
- **PDFKit**: Biblioteca para generar documentos PDF
- **fs (File System)**: Módulo de Node.js para operaciones con archivos

#### Inteligencia Artificial y Chatbot
- **Procesamiento de Lenguaje Natural**: Análisis de intenciones y entidades
- **Algoritmos de Coincidencia de Patrones**: Detección de intenciones del usuario
- **Generación de Respuestas Contextuales**: Respuestas basadas en el contexto de la conversación

#### Herramientas de Desarrollo
- **npm/yarn**: Gestores de paquetes
- **Webpack**: Empaquetador de módulos
- **Babel**: Transpilador de JavaScript
- **ESLint**: Herramienta de análisis de código
- **Git**: Control de versiones

#### Documentación
- **PlantUML**: Herramienta para crear diagramas UML
- **Markdown**: Formato para documentación

#### Despliegue y Entorno
- **Docker**: Contenerización para despliegue consistente
- **Express Static**: Servir archivos estáticos
- **Dotenv**: Gestión de variables de entorno

#### Seguridad
- **Helmet**: Seguridad para aplicaciones Express
- **CORS**: Control de acceso HTTP
- **Validación de Datos**: Verificación de entradas del usuario
- **Sanitización de Datos**: Limpieza de datos para prevenir inyecciones

#### Testing
- **Jest**: Framework de testing para JavaScript
- **React Testing Library**: Utilidades para probar componentes React
- **Supertest**: Testing de API HTTP

#### Otras Bibliotecas y Utilidades
- **Moment.js**: Manipulación de fechas y horas
- **Lodash**: Utilidades para manipulación de datos
- **UUID**: Generación de identificadores únicos

### Justificación de Tecnologías

#### Stack Principal

##### JavaScript/TypeScript
- **Razón de uso**: Permite el desarrollo tanto en frontend como en backend (full-stack), facilitando la consistencia del código y reduciendo la curva de aprendizaje.
- **Beneficios para EduTrack360**: Proporciona tipado estático (TypeScript) que mejora la detección temprana de errores y facilita el mantenimiento, especialmente importante en un sistema educativo donde la integridad de los datos es crítica.

##### React (Frontend)
- **Razón de uso**: Su arquitectura basada en componentes permite crear interfaces modulares y reutilizables.
- **Beneficios para EduTrack360**: Facilita la creación de una interfaz responsiva y dinámica, esencial para que profesores y estudiantes interactúen con el sistema desde diferentes dispositivos. El Virtual DOM optimiza el rendimiento al actualizar solo las partes necesarias de la interfaz cuando cambian los datos.

##### Node.js + Express.js (Backend)
- **Razón de uso**: Permite utilizar JavaScript en el servidor, facilitando la consistencia entre frontend y backend.
- **Beneficios para EduTrack360**: Express.js proporciona un framework ligero pero potente para crear APIs RESTful que conectan la interfaz de usuario con la base de datos. Su naturaleza asíncrona permite manejar múltiples solicitudes simultáneas, ideal para un sistema educativo con múltiples usuarios concurrentes.

##### MongoDB + Mongoose
- **Razón de uso**: Base de datos NoSQL que ofrece flexibilidad en el esquema de datos.
- **Beneficios para EduTrack360**: Permite almacenar datos con estructuras variables (como diferentes tipos de asignaciones o registros de asistencia) sin necesidad de modificar el esquema. Mongoose añade una capa de validación y estructura a los datos, combinando la flexibilidad de MongoDB con la seguridad de un esquema definido.

#### Características Específicas

##### PDFKit para Generación de Reportes
- **Razón de uso**: Biblioteca nativa de Node.js para crear documentos PDF dinámicamente.
- **Beneficios para EduTrack360**: Permite generar reportes personalizados de asistencia, calificaciones y rendimiento académico sin depender de servicios externos, manteniendo la confidencialidad de los datos educativos.

##### JWT para Autenticación
- **Razón de uso**: Mecanismo seguro y stateless para autenticación y autorización.
- **Beneficios para EduTrack360**: Permite implementar diferentes niveles de acceso (administrador, profesor, estudiante) de forma segura, manteniendo la sesión del usuario sin almacenar estado en el servidor.

##### Procesamiento de Lenguaje Natural para el Chatbot
- **Razón de uso**: Permite interpretar y responder a consultas en lenguaje natural.
- **Beneficios para EduTrack360**: El chatbot integrado facilita la interacción con el sistema, permitiendo a los usuarios realizar consultas, generar reportes o acceder a información sin necesidad de navegar por múltiples pantallas, mejorando significativamente la experiencia de usuario.

#### Herramientas de Desarrollo y Calidad

##### Git para Control de Versiones
- **Razón de uso**: Estándar de la industria para control de versiones distribuido.
- **Beneficios para EduTrack360**: Facilita la colaboración entre desarrolladores y el seguimiento de cambios, esencial para un sistema educativo que evoluciona constantemente con nuevas funcionalidades.

##### Jest y React Testing Library
- **Razón de uso**: Frameworks de testing completos y fáciles de usar.
- **Beneficios para EduTrack360**: Permiten implementar pruebas unitarias y de integración, garantizando la fiabilidad del sistema educativo donde los errores podrían afectar procesos críticos como la evaluación o el registro de asistencias.

##### ESLint
- **Razón de uso**: Herramienta de análisis estático de código.
- **Beneficios para EduTrack360**: Mantiene la consistencia y calidad del código, facilitando el mantenimiento a largo plazo y la incorporación de nuevos desarrolladores al proyecto.

#### Seguridad

##### Bcrypt.js, Helmet y CORS
- **Razón de uso**: Herramientas especializadas en seguridad para aplicaciones web.
- **Beneficios para EduTrack360**: Protegen la información sensible de estudiantes y profesores, cumpliendo con regulaciones de privacidad de datos educativos. Bcrypt.js asegura que las contraseñas se almacenen de forma segura, mientras que Helmet y CORS protegen contra vulnerabilidades web comunes.

#### Interfaz de Usuario

##### Material-UI
- **Razón de uso**: Framework de componentes UI para React con diseño Material Design.
- **Beneficios para EduTrack360**: Proporciona una interfaz moderna, consistente y accesible, reduciendo el tiempo de desarrollo y mejorando la experiencia de usuario. Sus componentes responsivos garantizan que el sistema funcione correctamente en dispositivos móviles, tablets y ordenadores.

##### Chart.js
- **Razón de uso**: Biblioteca para visualización de datos.
- **Beneficios para EduTrack360**: Permite crear representaciones visuales de datos académicos (asistencia, calificaciones, rendimiento) facilitando su interpretación por parte de administradores, profesores y estudiantes.

## Explicación del Sistema EduTrack360

EduTrack360 es un sistema integral de gestión educativa diseñado para facilitar el seguimiento académico, la administración de usuarios y la generación de reportes en entornos educativos. El sistema está construido con una arquitectura moderna que integra inteligencia artificial para mejorar la experiencia de usuario.

### Componentes Principales

#### 1. Sistema de Gestión de Usuarios
- Manejo de tres roles principales: Administrador, Profesor y Estudiante
- Funcionalidades de creación, edición y eliminación de usuarios
- Autenticación segura mediante JWT (JSON Web Tokens)

#### 2. Seguimiento Académico
- Registro y control de asistencias
- Gestión de bloques académicos
- Visualización de datos mediante gráficos interactivos con Chart.js

#### 3. Chatbot Inteligente
- Interfaz conversacional para interactuar con el sistema
- Procesamiento de lenguaje natural para entender las intenciones del usuario
- Capacidad para ejecutar acciones como generar reportes o crear usuarios

#### 4. Sistema de Reportes
- Generación de reportes PDF detallados
- Opciones para reportes específicos o completos
- Visualización y descarga directa desde la interfaz

#### 5. Arquitectura Técnica
- **Frontend**: React con TypeScript y Material-UI
- **Backend**: Node.js con Express.js
- **Base de Datos**: MongoDB con Mongoose
- **Servicio de IA**: Integración con Ollama
- **Contenedorización**: Docker y docker-compose

### Flujo de Trabajo Típico

1. El usuario inicia sesión según su rol (Administrador, Profesor, Estudiante)
2. Accede a las funcionalidades correspondientes a su nivel de permisos
3. Puede interactuar con el chatbot para solicitar información o ejecutar acciones
4. Los administradores pueden generar reportes completos del sistema
5. Los profesores pueden registrar asistencias y gestionar sus estudiantes
6. Los estudiantes pueden consultar su información académica

## Dificultades Encontradas Durante el Desarrollo

### 1. Integración del Servicio de IA
La implementación del servicio de IA presentó varios desafíos:
- Inicialmente se desarrolló en Python, lo que creó una heterogeneidad en la pila tecnológica
- La migración a JavaScript requirió reescribir la lógica de procesamiento de lenguaje natural
- La comunicación con Ollama presentaba fallos intermitentes que necesitaban manejo robusto de errores
- Variables no inicializadas o mal referenciadas causaban errores en tiempo de ejecución

### 2. Generación de Reportes PDF
Este componente fue particularmente problemático:
- La implementación inicial usaba simulación con JSON en lugar de PDFs reales
- Al migrar a PDFKit, surgieron problemas con los streams y el manejo asíncrono
- Los reportes aparecían vacíos cuando no había datos en la base de datos
- Fue necesario implementar datos de ejemplo para garantizar reportes con contenido

### 3. Inconsistencias en la Base de Datos
- Se identificaron referencias inconsistentes entre 'edutrack360' y 'pgm_edutrack360'
- Esto causaba que algunas consultas no devolvieran resultados esperados
- La corrección requirió unificar todas las referencias a la base de datos

### 4. Problemas de Autenticación
- El middleware de autenticación tenía dificultades para leer tokens de diferentes fuentes
- La descarga de reportes PDF fallaba por problemas de autenticación
- Se implementó una solución usando axios para mantener el token en las solicitudes

### 5. Errores de Tipado en TypeScript
- Componentes como AssignmentManagement.tsx presentaban múltiples errores de tipado
- Variables de estado no reconocidas en diferentes funciones
- Problemas con el manejo de null en variables como gradeInput

### 6. Coordinación de Servicios
- La gestión de múltiples servicios (frontend, backend, IA, base de datos) requirió una cuidadosa configuración de puertos
- Fue necesario desarrollar scripts unificados para iniciar y detener todos los servicios
- La dockerización añadió complejidad adicional a la configuración del sistema

### 7. Manejo de Objetos Complejos en React
- La interfaz de React tenía problemas al intentar renderizar objetos complejos
- Se requirió modificar las rutas de API para asegurar respuestas en formato adecuado

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.
