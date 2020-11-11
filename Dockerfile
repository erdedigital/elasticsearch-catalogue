FROM node:12-alpine

WORKDIR /usr/src/app

RUN npm install pm2 -g

COPY package*.json ./
RUN npm install

COPY . .

CMD ["pm2-runtime", "ecosystem.config.js"]