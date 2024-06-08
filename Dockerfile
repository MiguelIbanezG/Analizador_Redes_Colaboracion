# Usa una imagen oficial de Node.js como imagen base
FROM node:14

# Crea un directorio de trabajo
WORKDIR /home/miguel/app

# Copia el package.json y el package-lock.json
COPY package*.json ./

# Instala las dependencias de la aplicación
RUN npm install

# Copia el resto de la aplicación
COPY . .

# Expone el puerto que utiliza la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
