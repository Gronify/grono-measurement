# DEVELOPMENT STAGE
FROM node:20.11.1-alpine As development

# Устанавливаем Chromium (если нужно для Puppeteer)
RUN apk add --no-cache chromium --repository=http://dl-cdn.alpinelinux.org/alpine/v3.10/main

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем все зависимости, включая dev-зависимости для разработки
RUN npm install

# Копируем остальные файлы проекта
COPY . .

# Устанавливаем переменную PATH для NestJS CLI
ENV PATH="/app/node_modules/.bin:$PATH"

# Выполняем сборку
RUN npm run build

# PRODUCTION STAGE
FROM node:20.11.1-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Копируем package.json и package-lock.json (для продакшн зависимостей)
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm install --only=production

# Копируем необходимые файлы из development стадии
COPY --from=development /app/dist ./dist
COPY --from=development /app/node_modules ./node_modules

# Запуск приложения
CMD ["node", "dist/main"]