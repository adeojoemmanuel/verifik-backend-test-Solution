FROM node:16
WORKDIR /usr/src/webauthn
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "node", "server/index.js" ]
