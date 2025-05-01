FROM node:21-alpine

WORKDIR /home/app

COPY package*.json ./
RUN npm install \
    && npm cache clean --force

COPY . .
RUN npm run build

ENV NODE_ENV production

EXPOSE 3001

CMD [ "npm", "run", "start" ]
