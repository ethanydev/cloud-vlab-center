#!/bin/bash
# ============================================================
# init-letsencrypt.sh
# AWS EC2에서 certbot으로 초기 Let's Encrypt 인증서 발급
#
# 사용법:
#   chmod +x scripts/init-letsencrypt.sh
#   ./scripts/init-letsencrypt.sh
#
# 사전 조건:
#   - .env 파일에 DOMAIN, CERTBOT_EMAIL 설정
#   - ethany.org DNS A 레코드가 이 EC2 인스턴스 IP를 가리켜야 함
#   - 포트 80, 443이 EC2 보안 그룹에서 열려 있어야 함
# ============================================================

set -e

# .env 에서 변수 로드 (선언된 경우)
if [ -f .env ]; then
  export $(grep -E '^(DOMAIN|CERTBOT_EMAIL)=' .env | xargs)
fi

DOMAIN="${DOMAIN:-ethany.org}"
EMAIL="${CERTBOT_EMAIL:-admin@ethany.org}"
DATA_PATH="./data/certbot"
RSA_KEY_SIZE=4096

echo "### 도메인: $DOMAIN"
echo "### 이메일: $EMAIL"
echo ""

# ── 디렉토리 생성 ────────────────────────────────────────────────────────────
mkdir -p "$DATA_PATH/conf/live/$DOMAIN"
mkdir -p "$DATA_PATH/www"

# ── TLS 권장 파라미터 다운로드 ───────────────────────────────────────────────
if [ ! -e "$DATA_PATH/conf/options-ssl-nginx.conf" ] || \
   [ ! -e "$DATA_PATH/conf/ssl-dhparams.pem" ]; then
  echo "### Let's Encrypt 권장 TLS 파라미터 다운로드..."
  curl -fsSL https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf \
    -o "$DATA_PATH/conf/options-ssl-nginx.conf"
  curl -fsSL https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem \
    -o "$DATA_PATH/conf/ssl-dhparams.pem"
fi

# ── 임시 자체서명 인증서 생성 (nginx 초기 시작용) ───────────────────────────
if [ ! -e "$DATA_PATH/conf/live/$DOMAIN/fullchain.pem" ]; then
  echo "### 임시 자체서명 인증서 생성..."
  docker compose run --rm --entrypoint \
    "openssl req -x509 -nodes -newkey rsa:$RSA_KEY_SIZE -days 1 \
      -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
      -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
      -subj '/CN=localhost'" certbot
  echo ""
fi

# ── nginx 기동 ───────────────────────────────────────────────────────────────
echo "### nginx 기동..."
docker compose up --force-recreate -d nginx
echo ""

# ── 임시 인증서 삭제 ─────────────────────────────────────────────────────────
echo "### 임시 인증서 삭제..."
docker compose run --rm --entrypoint \
  "rm -Rf /etc/letsencrypt/live/$DOMAIN && \
   rm -Rf /etc/letsencrypt/archive/$DOMAIN && \
   rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot
echo ""

# ── Let's Encrypt 인증서 발급 ────────────────────────────────────────────────
echo "### Let's Encrypt 인증서 발급 요청..."
docker compose run --rm --entrypoint \
  "certbot certonly --webroot \
    -w /var/www/certbot \
    --email $EMAIL \
    -d $DOMAIN \
    -d www.$DOMAIN \
    --rsa-key-size $RSA_KEY_SIZE \
    --agree-tos \
    --non-interactive \
    --force-renewal" certbot
echo ""

# ── nginx 재로드 ─────────────────────────────────────────────────────────────
echo "### nginx 설정 재로드..."
docker compose exec nginx nginx -s reload
echo ""

echo "### 완료! 인증서 경로: $DATA_PATH/conf/live/$DOMAIN/"
echo "### 이제 전체 스택을 시작하세요: docker compose up -d"
