FROM node:20-slim

WORKDIR /app

# Instalar herramientas para healthchecks y scripts
RUN apt-get update && apt-get install -y curl bash && rm -rf /var/lib/apt/lists/*

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Exponer puerto 3000 de Next.js
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Comando para desarrollo con hot-reload (Next dev)
CMD ["npm", "run", "dev"]
