# ── Stage 1: React 앱 빌드 ──────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 빌드 타임 환경변수 (Grafana URL 등)
ARG VITE_GRAFANA_URL=http://localhost:3000
ENV VITE_GRAFANA_URL=$VITE_GRAFANA_URL

RUN npm run build

# ── Stage 2: nginx 로 정적 파일 서빙 ─────────────────────────────────────────
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
