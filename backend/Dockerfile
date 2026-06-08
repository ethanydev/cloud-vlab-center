FROM node:20-alpine

WORKDIR /app

# 의존성 설치 (프로덕션 전용)
COPY package*.json ./
RUN npm install --omit=dev

# 소스 코드 복사
COPY src/ ./src/

EXPOSE 4000

CMD ["node", "src/app.js"]
