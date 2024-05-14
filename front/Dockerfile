ARG apiKey=$APIKEY
ARG host_back=$HOST_BACK
# Usa una imagen de node como base
FROM node:18.19

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Instala Angular CLI de forma global
RUN npm install -g @angular/cli

# Copia el archivo package.json y el archivo package-lock.json (si existe)
COPY package.json package-lock.json ./

# Instala las dependencias
RUN npm install

# Copia todos los archivos de la aplicación Angular al directorio de trabajo
COPY . .

# Expone el puerto 4200 para que la aplicación sea accesible desde fuera del contenedor
EXPOSE 4200

# Comando de inicio para servir la aplicación Angular
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--disable-host-check"]

