# DEVELOPMENT STAGE
FROM node:20.11.1-alpine As development

RUN apk add --no-cache chromium --repository=http://dl-cdn.alpinelinux.org/alpine/v3.10/main

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN ls -R /app

RUN npx prisma generate --schema=./prisma/schema.prisma

ENV PATH="/app/node_modules/.bin:$PATH"

RUN npm run build

RUN ls -la /app/dist

# PRODUCTION STAGE
FROM node:20.11.1-alpine as production

RUN apk add --no-cache chromium --repository=http://dl-cdn.alpinelinux.org/alpine/v3.10/main

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY --from=development /app/dist ./dist
COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/prisma/schema.prisma ./prisma/schema.prisma

RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npx prisma migrate deploy

CMD ["node", "dist/src/main"]
