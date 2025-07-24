#빌드 / 실행 나뉘는 도커 명령어(용량)
 # -> 속도: 캐시활용으로 빠름
 # -> 에러 추적: 명확히 구분 가능
 # -> 자동화: 효율적
 # -> 유연성: 높은
 # -> CI/CD 적합성: 높음

# 🏗️ 1단계: 빌드 단계
FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# 🚀 2단계: 실행 단계 (최종 이미지)
FROM node:22-slim

WORKDIR /app

# 빌드 결과물만 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD ["node", "dist/src/main.js"]



# ⬇️⬇️⬇️빌드 + 실행 한꺼번에 처리하는 docker⬇️⬇️⬇️

# FROM node:22-slim

# apt-get은 선택사항으로 사용
# RUN apt-get update && apt-get upgrade -y

# WORKDIR /app

# COPY  package*.json ./
# # RUN npm install
# RUN npm ci

# COPY . .

# RUN npm run build

# CMD ["node", "dist/src/main.js"]