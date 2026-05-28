# Tiny Gate — Complete Deployment Guide
## AWS EC2 + Docker + Nginx + SSL

---

## Architecture Overview

```
Internet
    │
    ▼
┌─────────────────────────────────────────────────────┐
│              AWS EC2 (Ubuntu 22.04)                 │
│                                                     │
│   ┌────────────────────────────────────────────┐   │
│   │          Nginx  (ports 80 / 443)           │   │
│   │   • SSL termination (Let's Encrypt)        │   │
│   │   • HTTP → HTTPS redirect                  │   │
│   │   • Rate limiting                          │   │
│   └────────┬────────────────┬──────────────────┘   │
│            │                │                       │
│   ┌────────▼───────┐ ┌──────▼────────────────────┐ │
│   │ tinygate_      │ │ tinygate_backend           │ │
│   │ frontend :80   │ │ (Express)  :5000           │ │
│   │ (Nginx SPA)    │ └──────┬────────────────────┘ │
│   └────────────────┘        │                       │
│                        ┌────▼──────────────┐        │
│                        │ tinygate_mongo    │        │
│                        │ (MongoDB)  :27017 │        │
│                        │ [internal only]   │        │
│                        └───────────────────┘        │
└─────────────────────────────────────────────────────┘
```

---

## Part 1 — AWS EC2 Setup

### 1.1 Launch EC2 Instance

1. Go to **AWS Console → EC2 → Launch Instance**
2. Choose:
   - **Name**: `tinygate-prod`
   - **AMI**: Ubuntu Server 22.04 LTS (Free Tier eligible)
   - **Instance type**: `t2.micro` (free tier) or `t3.small` for production
   - **Key pair**: Create or select an existing `.pem` key
3. Under **Network settings**, click **Edit** and add these inbound rules:

| Type  | Protocol | Port | Source    |
|-------|----------|------|-----------|
| SSH   | TCP      | 22   | My IP     |
| HTTP  | TCP      | 80   | 0.0.0.0/0 |
| HTTPS | TCP      | 443  | 0.0.0.0/0 |

4. Storage: **20 GB gp3** (minimum)
5. Click **Launch Instance**

### 1.2 Connect via SSH

```bash
# Replace with your key path and EC2 public IP
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

---

## Part 2 — Server Setup

### 2.1 Install Git and clone the repo

```bash
sudo apt-get update && sudo apt-get install -y git
git clone https://github.com/YOUR_USERNAME/tinygate.git
cd tinygate
```

### 2.2 Point your domain to EC2

Go to your domain registrar (GoDaddy / Namecheap / Route 53) and add:

| Type | Host | Value              | TTL  |
|------|------|--------------------|------|
| A    | @    | YOUR_EC2_PUBLIC_IP | 300  |
| A    | www  | YOUR_EC2_PUBLIC_IP | 300  |

> Wait 5–30 minutes for DNS to propagate. Verify with:
> ```bash
> nslookup yourdomain.com
> ```

---

## Part 3 — Automated Deployment (Recommended)

```bash
# Make scripts executable
chmod +x scripts/deploy.sh scripts/update.sh

# Run the one-shot deployment (prompts for domain + email)
sudo ./scripts/deploy.sh
```

This script will automatically:
- Install Docker + Docker Compose
- Configure UFW firewall (ports 22, 80, 443)
- Generate `.env.production` with random secrets
- Issue a Let's Encrypt SSL certificate
- Build and start all 4 Docker containers

---

## Part 4 — Manual Deployment (Step by Step)

### 4.1 Install Docker

```bash
# Update package index
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com | sudo bash

# Add ubuntu user to docker group (avoid using sudo for docker)
sudo usermod -aG docker ubuntu
newgrp docker

# Verify
docker --version
docker compose version
```

### 4.2 Create production environment file

```bash
cp .env.production.example .env.production
nano .env.production
```

Fill in all values — especially:
```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or with openssl:
openssl rand -hex 64
```

### 4.3 Patch nginx.conf with your domain

```bash
# Replace placeholder with your actual domain
sed -i 's/yourdomain.com/tinygate.app/g' nginx/nginx.conf
```

### 4.4 Issue SSL Certificate

```bash
# Run certbot standalone to issue cert BEFORE starting nginx
docker run --rm -it \
  -v "$(pwd)/nginx/ssl/letsencrypt:/etc/letsencrypt" \
  -p 80:80 \
  certbot/certbot certonly \
    --standalone \
    --email your@email.com \
    --agree-tos \
    --no-eff-email \
    -d yourdomain.com \
    -d www.yourdomain.com
```

### 4.5 docker build — What happens

```bash
# Build backend image
# docker build reads the Dockerfile, runs each RUN instruction as a layer,
# caches unchanged layers (faster rebuilds), produces a final image.
docker build -t tinygate_backend:latest .

# Build frontend image (pass public API URL at build time)
docker build \
  --build-arg VITE_API_URL=https://yourdomain.com \
  -t tinygate_frontend:latest \
  ./client
```

**Layer breakdown:**
```
FROM node:20-alpine       ← base image layer (cached after first pull)
COPY package*.json ./     ← dependency manifest layer
RUN npm ci --omit=dev     ← install layer (cached if package.json unchanged)
COPY . .                  ← source code layer (changes most often)
CMD ["node", "server.js"] ← sets default command (metadata, no layer)
```

### 4.6 docker compose up — What happens

```bash
# Start all services in the background
docker compose -f docker-compose.prod.yml up -d --build

# --build    : rebuild images before starting
# -d         : detached mode (runs in background)
# -f         : specify which compose file to use
```

**Startup order enforced by `depends_on + healthcheck`:**
```
mongo starts first
  │
  └─► backend starts (waits for mongo healthcheck: PASS)
        │
        └─► frontend starts in parallel
              │
              └─► nginx starts (waits for both to be healthy)
```

### 4.7 Verify everything is running

```bash
# See all container statuses
docker compose -f docker-compose.prod.yml ps

# Live logs from all containers
docker compose -f docker-compose.prod.yml logs -f

# Logs from a specific container
docker compose -f docker-compose.prod.yml logs -f backend

# Test backend health
curl https://yourdomain.com/health

# Expected: {"status":"ok","service":"tiny-gate"}
```

---

## Part 5 — Nginx Explained

### How requests flow through Nginx

```
HTTPS Request: https://yourdomain.com/api/url/shorten
                              │
                    [Nginx port 443]
                              │
                    SSL termination (decrypts TLS)
                              │
                    Location matching:
                    /api/auth/*  → auth_limit zone (10 req/min)
                    /api/*       → api_limit zone  (30 req/min)
                    /xK9pQ2r    → backend (redirect)
                    /            → frontend (React SPA)
                              │
                    Proxy to upstream (Docker network)
                              │
                    tinygate_backend:5000
```

### Key nginx.conf sections

| Directive | Purpose |
|-----------|---------|
| `limit_req_zone` | Defines rate-limit buckets (per IP) |
| `upstream backend` | Maps a name to Docker container + port |
| `ssl_protocols TLSv1.2 TLSv1.3` | Disables old insecure protocols |
| `add_header HSTS` | Forces HTTPS for 2 years via browser |
| `gzip on` | Compresses responses (saves 60–80% bandwidth) |
| `proxy_set_header X-Real-IP` | Passes real client IP to backend |

### Reload Nginx config without downtime

```bash
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

---

## Part 6 — SSL Setup Explained

### How Let's Encrypt / Certbot works

```
Your server                  Let's Encrypt CA
      │                             │
      │──── 1. Request cert for ────►│
      │         yourdomain.com      │
      │                             │
      │◄─── 2. ACME challenge ──────│
      │    "Prove you own domain"   │
      │                             │
      │──── 3. Serve file at ───────►│
      │  /.well-known/acme-challenge/│
      │                             │
      │◄─── 4. Cert issued ─────────│
      │    (valid 90 days)          │
```

### Auto-renewal via Certbot container

The `certbot` service in `docker-compose.prod.yml` runs every 12 hours:

```bash
# Check renewal status
docker compose -f docker-compose.prod.yml exec certbot certbot certificates

# Force renewal (useful for testing)
docker compose -f docker-compose.prod.yml exec certbot certbot renew --force-renewal

# After renewal, reload nginx to pick up new cert
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

---

## Part 7 — Operations

### Useful commands

```bash
# View all container statuses
docker compose -f docker-compose.prod.yml ps

# Follow logs for all services
docker compose -f docker-compose.prod.yml logs -f

# Shell into a running container
docker compose -f docker-compose.prod.yml exec backend sh
docker compose -f docker-compose.prod.yml exec mongo mongosh

# Restart a single service
docker compose -f docker-compose.prod.yml restart backend

# Deploy code update (zero downtime)
git pull && sudo ./scripts/update.sh

# Backup MongoDB data
docker compose -f docker-compose.prod.yml exec mongo \
  mongodump --authenticationDatabase admin \
  -u tinygate_admin -p YOUR_PASS \
  --db tinygate --archive \
  | gzip > backup-$(date +%Y%m%d).gz

# Scale backend horizontally (advanced)
docker compose -f docker-compose.prod.yml up -d --scale backend=3
```

### Environment variable security on EC2

```bash
# Restrict .env.production so only root can read it
chmod 600 .env.production
sudo chown root:root .env.production

# Alternatively use AWS Secrets Manager and inject at runtime
# https://docs.aws.amazon.com/secretsmanager/latest/userguide/
```

---

## Part 8 — Cost Estimate (AWS Free Tier)

| Resource | Spec | Monthly Cost |
|----------|------|-------------|
| EC2 t2.micro | 1 vCPU, 1 GB RAM | Free (12 months) |
| EBS Storage | 20 GB gp3 | Free (12 months) |
| Data Transfer | First 100 GB out | Free |
| Elastic IP | 1 IP (attached to running instance) | Free |
| **Total** | | **$0/month** (first year) |

After free tier: ~$10–15/month on t3.small.

---

## Quick Reference

```bash
# ── First deploy ───────────────────────────────────────────────
sudo ./scripts/deploy.sh

# ── Start (after server reboot) ──────────────────────────────
docker compose -f docker-compose.prod.yml up -d

# ── Stop everything ──────────────────────────────────────────
docker compose -f docker-compose.prod.yml down

# ── Code update ──────────────────────────────────────────────
git pull && sudo ./scripts/update.sh

# ── View logs ─────────────────────────────────────────────────
docker compose -f docker-compose.prod.yml logs -f

# ── MongoDB shell ─────────────────────────────────────────────
docker compose -f docker-compose.prod.yml exec mongo \
  mongosh -u tinygate_admin -p YOUR_PASS --authenticationDatabase admin tinygate
```
