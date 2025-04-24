FROM node:latest AS build
WORKDIR /build
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

FROM node:latest AS release
COPY --from=build /build/dist ./dist
COPY --from=build /build/package*.json ./
RUN npm install --only=production

CMD ["node", "dist/index.js"]
