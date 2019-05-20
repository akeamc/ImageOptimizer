FROM node:11.15.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 80
ENV PORT=80

CMD ["npm", "start"]