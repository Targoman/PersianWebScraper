ARG BUILDER_IMAGE
FROM $BUILDER_IMAGE as builder
WORKDIR /usr/src/app
COPY ./src /usr/src/app/src/
RUN ls -l && yarn dev

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


