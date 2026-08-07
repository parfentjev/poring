# Source: https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md

FROM node:current-alpine AS builder
WORKDIR /build-stage

COPY package*.json ./
RUN npm ci

ARG GIT_COMMIT_HASH

COPY tsconfig.json ./
COPY ./src ./src
COPY ./scripts ./scripts
RUN GIT_COMMIT_HASH="$GIT_COMMIT_HASH" npm run build

FROM alpine:latest
WORKDIR /usr/src/app

RUN apk add --no-cache libstdc++ dumb-init \
  && addgroup -g 1000 node && adduser -u 1000 -G node -s /bin/sh -D node \
  && chown node:node ./

COPY --from=builder /usr/local/bin/node /usr/local/bin/
COPY --from=builder /usr/local/bin/docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]
USER node

COPY --from=builder /build-stage/node_modules ./node_modules
COPY --from=builder /build-stage/dist ./dist

CMD ["dumb-init", "node", "dist/index.js"]
