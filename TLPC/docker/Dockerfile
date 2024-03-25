FROM node:current-alpine
WORKDIR /usr/src/app
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV
RUN apk add --no-cache python3
COPY ["./package.json", "/usr/src/app"]
RUN npm install
COPY ["./public/",  "/usr/src/app/public/"]
COPY ["./views/", "/usr/src/app/views/"]
COPY ["./index.js", "/usr/src/app/"]
USER node
ENTRYPOINT [ "node","index.js" ] 