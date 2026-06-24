# ---- ETAPA 1: BUILDER ----
# Usamos una versión ligera de Node (Alpine) para compilar
FROM node:22-alpine AS builder

# Definimos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos solo los archivos de configuración de dependencias
# Esto permite que Docker cachee este paso si no cambian los archivos
COPY package*.json ./

# Instalamos todas las dependencias (incluyendo las de desarrollo)
RUN npm ci

# Copiamos el resto del código fuente al contenedor
COPY . .

# Ejecutamos el script de compilación (ej. tsc para transformar TS a JS)
RUN npm run build

# ---- ETAPA 2: PRODUCCIÓN ----
# Iniciamos una nueva imagen desde cero, limpia
FROM node:22-alpine

# Definimos el directorio de trabajo
WORKDIR /app

# Copiamos de nuevo los archivos de dependencias
COPY package*.json ./

# Instalamos SOLO dependencias de producción (--only=production)
# Esto reduce drásticamente el tamaño final de la imagen
RUN npm ci --only=production

# Copiamos SOLO la carpeta 'dist' generada en la etapa anterior
COPY --from=builder /app/dist ./dist

# Documentamos que el contenedor expone el puerto 3001
EXPOSE 3000

# Comando para ejecutar la aplicación compilada
CMD ["node", "dist/main"]