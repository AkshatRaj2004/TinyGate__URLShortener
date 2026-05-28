#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
#  Tiny Gate — One-shot EC2 deployment script
#
#  Run on the EC2 instance AFTER cloning the repo:
#    chmod +x scripts/deploy.sh
#    sudo ./scripts/deploy.sh
#
#  What this script does:
#   1. Installs Docker + Docker Compose plugin
#   2. Configures firewall (UFW)
#   3. Issues a Let's Encrypt SSL certificate via Certbot
#   4. Patches nginx.conf with your domain
#   5. Builds and starts all containers
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Colour helpers ─────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Require root ──────────────────────────────────────────────────────────────
[[ "$EUID" -ne 0 ]] && error "Please run as root: sudo ./scripts/deploy.sh"

# ── Prompt for required values ────────────────────────────────────────────────
read -rp "$(echo -e "${CYAN}Enter your domain (e.g. tinygate.app):${NC} ")" DOMAIN
read -rp "$(echo -e "${CYAN}Enter your email (for SSL cert):${NC} ")"        EMAIL
[[ -z "$DOMAIN" || -z "$EMAIL" ]] && error "Domain and email are required."

# ── Detect OS ─────────────────────────────────────────────────────────────────
if   [ -f /etc/debian_version ]; then OS="debian"
elif [ -f /etc/redhat-release ];  then OS="rhel"
else error "Unsupported OS"; fi

# ═══════════════════════════════════════════════════════════════════════════════
#  STEP 1 — System update
# ═══════════════════════════════════════════════════════════════════════════════
info "Updating system packages…"
if [[ "$OS" == "debian" ]]; then
  apt-get update -qq && apt-get upgrade -y -qq
else
  yum update -y -q
fi
success "System updated"

# ═══════════════════════════════════════════════════════════════════════════════
#  STEP 2 — Install Docker
# ═══════════════════════════════════════════════════════════════════════════════
if ! command -v docker &>/dev/null; then
  info "Installing Docker…"
  if [[ "$OS" == "debian" ]]; then
    apt-get install -y -qq ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
      https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
      > /etc/apt/sources.list.d/docker.list
    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  else
    yum install -y -q docker
    systemctl enable docker && systemctl start docker
    # Install compose plugin manually for RHEL
    COMPOSE_URL="https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)"
    curl -fsSL "$COMPOSE_URL" -o /usr/local/lib/docker/cli-plugins/docker-compose
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
  fi
  success "Docker installed: $(docker --version)"
else
  success "Docker already installed: $(docker --version)"
fi

# Ensure Docker service is running
systemctl enable docker --now 2>/dev/null || true

# ═══════════════════════════════════════════════════════════════════════════════
#  STEP 3 — Firewall
# ═══════════════════════════════════════════════════════════════════════════════
info "Configuring UFW firewall…"
if command -v ufw &>/dev/null; then
  ufw allow ssh
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw --force enable
  success "UFW configured"
else
  warn "UFW not found — configure your AWS Security Group manually (ports 22, 80, 443)"
fi

# ═══════════════════════════════════════════════════════════════════════════════
#  STEP 4 — Build .env.production from template
# ═══════════════════════════════════════════════════════════════════════════════
if [[ ! -f .env.production ]]; then
  info "Generating .env.production…"
  cp .env.production.example .env.production

  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" 2>/dev/null || \
               openssl rand -hex 64)
  MONGO_PASS=$(openssl rand -base64 24 | tr -d '/+=')

  sed -i "s|yourdomain.com|${DOMAIN}|g"               .env.production
  sed -i "s|REPLACE_WITH_64_BYTE_HEX_SECRET|${JWT_SECRET}|" .env.production
  sed -i "s|REPLACE_WITH_STRONG_PASSWORD|${MONGO_PASS}|"     .env.production

  success ".env.production created"
  warn  "MongoDB password: ${MONGO_PASS}  — save this securely!"
fi

# ═══════════════════════════════════════════════════════════════════════════════
#  STEP 5 — Patch nginx.conf with domain
# ═══════════════════════════════════════════════════════════════════════════════
info "Patching nginx.conf for domain: ${DOMAIN}…"
sed -i "s|yourdomain.com|${DOMAIN}|g" nginx/nginx.conf
success "nginx.conf updated"

# ═══════════════════════════════════════════════════════════════════════════════
#  STEP 6 — Issue SSL certificate (requires domain DNS to point to this server)
# ═══════════════════════════════════════════════════════════════════════════════
info "Requesting Let's Encrypt certificate for ${DOMAIN}…"
info "Make sure DNS A record for ${DOMAIN} points to this server's IP first!"
read -rp "DNS ready? Press ENTER to continue or Ctrl+C to cancel…"

# Spin up a temporary Certbot container using standalone mode
docker run --rm -it \
  -v "$(pwd)/nginx/ssl/letsencrypt:/etc/letsencrypt" \
  -v "$(pwd)/nginx/ssl/certbot-www:/var/www/certbot" \
  -p 80:80 \
  certbot/certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email "${EMAIL}" \
    -d "${DOMAIN}" \
    -d "www.${DOMAIN}" && success "SSL certificate issued" || \
    warn "Certbot failed — will start without SSL. Fix DNS and re-run certbot."

# Update nginx.conf to point to standalone cert paths
CERT_PATH="/etc/letsencrypt/live/${DOMAIN}"
sed -i "s|/etc/letsencrypt/live/yourdomain.com|${CERT_PATH}|g" nginx/nginx.conf

# ═══════════════════════════════════════════════════════════════════════════════
#  STEP 7 — Pull images and start all containers
# ═══════════════════════════════════════════════════════════════════════════════
info "Building and starting containers…"
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

success "🚀 Tiny Gate is live at https://${DOMAIN}"
docker compose -f docker-compose.prod.yml ps
