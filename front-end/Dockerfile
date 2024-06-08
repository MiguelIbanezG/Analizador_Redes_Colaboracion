# Usa una imagen oficial de Node.js como imagen base
FROM node:18

# Crea un directorio de trabajo
WORKDIR /home/miguel/app

# Copia el package.json y el package-lock.json
COPY package*.json ./

# Instala las dependencias de la aplicación
RUN npm install -g @angular/cli && npm install

# Copia el resto de la aplicación
COPY . .

# Expone el puerto que utiliza la aplicación
EXPOSE 4200

# Comando para iniciar la aplicación
CMD ["ng", "serve", "--host", "0.0.0.0"]
