FROM node:current-alpine
RUN apk add --no-cache python3 g++ make
WORKDIR /usr/src/app
COPY ["./package.json",  "./.eslintrc.js", "./tsconfig.json", "/usr/src/app/"]
RUN yarn install --frozen-lockfile
