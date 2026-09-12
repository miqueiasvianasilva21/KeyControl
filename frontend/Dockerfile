FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN npm install -g pm2

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY server.cjs ./
COPY ecosystem.config.cjs ./

EXPOSE 80

CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]
