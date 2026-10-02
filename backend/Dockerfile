FROM node:20-alpine

WORKDIR /app

# Instalar herramientas útiles para depuración en desarrollo
RUN apk add --no-cache curl bash

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar dependencias completas de desarrollo
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto de NestJS
EXPOSE 4000

# Comando para desarrollo con hot-reload (NestJS CLI)
CMD ["npm", "run", "start:dev"]
