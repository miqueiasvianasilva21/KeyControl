FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

RUN npx prisma generate

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN npm install -g pm2

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --omit=dev
RUN npx prisma generate

COPY --from=build /app/dist ./dist
COPY ecosystem.config.cjs ./
COPY docker-entrypoint.sh /usr/local/bin/

RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]
