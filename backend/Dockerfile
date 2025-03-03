FROM node:20.11.1-alpine As builder

# We don't need the standalone Chromium
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apk add --no-cache chromium --repository=http://dl-cdn.alpinelinux.org/alpine/v3.10/main

WORKDIR /app

COPY package*.json ./

# RUN npm install glob rimraf

RUN npm install --only=production  

COPY . .

RUN npm run build

FROM node:20.11.1-alpine as production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist 
COPY --from=builder /app/node_modules ./node_modules

CMD ["node", "dist/main"]