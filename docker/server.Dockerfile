FROM node:18-alpine

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente del servidor
COPY server/ ./server/
COPY .env ./

# Exponer el puerto del servidor
EXPOSE 5000

# Comando para iniciar el servidor
CMD ["npm", "run", "server"]
