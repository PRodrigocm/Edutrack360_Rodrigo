FROM node:18-alpine

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Construir la aplicación React
RUN npm run build

# Exponer el puerto del servidor
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["npm", "run", "server"]
