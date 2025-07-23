FROM node:22-slim

WORKDIR /app

COPY  package*.json ./
# RUN npm install
RUN npm ci

COPY . .

RUN npm run build

CMD ["node", "dist/src/main.js"]