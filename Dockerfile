FROM node:current-alpine
RUN apk add python3 

WORKDIR /usr/src/app
RUN chown node:node ./
USER node

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

ENV TZ="Asia/Tehran"

COPY package.json ./
RUN npm i && npm cache clean --force

COPY .build/ .build

