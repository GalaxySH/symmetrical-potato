FROM node:12-alpine3.12

RUN apk add --no-cache bash

WORKDIR /src

COPY package*.json ./

RUN npm install

COPY . .

CMD ./scripts/wait-for-it.sh mongo:27017 -t 15 -- npm run start