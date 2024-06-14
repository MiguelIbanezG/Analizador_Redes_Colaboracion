
FROM node:14

WORKDIR /home/miguel/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
