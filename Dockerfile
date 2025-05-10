FROM node:latest AS build
WORKDIR /build
COPY package*.json .
RUN npm install
COPY . .
RUN npm run test
RUN npm run build

FROM node:latest AS release
WORKDIR /release
COPY --from=build /build/dist ./dist
COPY --from=build /build/package*.json ./
RUN npm install --omit=dev

CMD ["node", "./dist/src/index.js"]
