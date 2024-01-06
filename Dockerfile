FROM node:current-alpine as builder
RUN apk add --no-cache python3 g++ make

WORKDIR /usr/src/app
COPY ["./package.json",  "./yarn.lock", "./.eslintrc.js", "./tsconfig.json", "/usr/src/app/"]
RUN yarn install --frozen-lockfile
COPY ./src /usr/src/app/src/
RUN ls -l && yarn dev

#RUN npm i && npm cache clean --force
#COPY .build/ .build

FROM node:current-alpine
WORKDIR /usr/src/app
COPY --from=builder "/usr/src/app/.build/" "/usr/src/app/.build/"
COPY --from=builder "/usr/src/app/node_modules/" "/usr/src/app/node_modules/"
COPY --from=builder "/usr/src/app/package.json" "/usr/src/app/package.json"
RUN chown node:node ./
USER node
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

ENV TZ="Asia/Tehran"


