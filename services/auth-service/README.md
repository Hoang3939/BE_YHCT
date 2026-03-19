# Auth Service

Authentication service for YHCT.

## Prerequisites

- Node.js 18+
- SQL Server instance

## Setup

```bash
cd services/auth-service
npm install
```

## Environment

Create `.env` from `.env.example` and fill values. Required for auth:

- `PORT`
- `CORS_ORIGINS`
- `JWT_PRIVATE_KEY_BASE64`
- `JWT_PUBLIC_KEY_BASE64`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `EMAIL_VERIFY_EXPIRES_MIN`
- `EMAIL_RESEND_COOLDOWN_SEC`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`

## Run

```bash
# dev
npm run start:dev

# prod
npm run build
npm run start:prod
```

## Swagger

Swagger UI is served at:

- `http://localhost:3001/api/docs`

If needed, override path with `SWAGGER_PATH`.
