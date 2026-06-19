# CyberArmor — Premium Hardware PC Security Platform

Production-ready web platform for the **SecureKey / CyberArmor** USB security token ecosystem.

## Scope

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, React Three Fiber, GSAP.
- **Backend**: FastAPI (Python 3.12), SQLAlchemy 2.0, Alembic, PostgreSQL 16, Redis 7.
- **3D/WebGL**: React Three Fiber + Drei, GLTF/GLB pipeline, placeholder model ready for industrial design swap.
- **Security**: CSP, HSTS, TLS 1.3 config, no cryptographic keys or biometric hashes stored online, GDPR/152-ФЗ dual-locale routing (`/en/`, `/ru/`).
- **E-commerce**: Production architecture for Stripe (sandbox/testnet in dev), crypto payments (BTCPay/Coinbase Commerce placeholders), cart, orders, user dashboard.

## Hard Constraints (from [TECHNICAL_ASSIGNMENT.md](TECHNICAL_ASSIGNMENT.md))

- Frontend: Next.js (React). Database: PostgreSQL. Backend: FastAPI or Go (chosen: FastAPI for rapid schema iteration).
- No user encryption keys or full biometric hashes ever touch the web database.
- Cloudflare Enterprise WAF, strict CSP, TLS 1.3 only.
- Blocker: independent penetration test (Critical/High/Medium findings fixed) before go-live.
- Performance budget: PageSpeed ≥95 desktop / ≥88 mobile, LCP ≤1.5s, CLS 0.0.

## Project Layout

```
apps/cyberarmor/
├── frontend/          # Next.js application
├── backend/           # FastAPI application
├── docker-compose.yml # Local orchestration
└── .env.example       # Required environment variables
```

## Quick Start

```bash
cd apps/cyberarmor
cp .env.example .env
docker compose up --build
```

Frontend: http://localhost:3000  
Backend API docs: http://localhost:8000/docs  
PostgreSQL: localhost:5432  
Redis: localhost:6379
