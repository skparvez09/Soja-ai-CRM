# Soja AI CRM

Production-ready multi-tenant SaaS CRM for AI Automation Agencies built with Next.js 14, Prisma, and NextAuth.

## Folder structure
```
app/                # Next.js app router pages & API routes
components/         # Shared UI + layout components
lib/                # Auth, RBAC, database, events, validators
prisma/             # Prisma schema + seed
```

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables (example):
   ```bash
   cp .env.example .env
   ```
3. Generate Prisma client + run migrations:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```
4. Seed demo data:
   ```bash
   npm run prisma:seed
   ```
5. Run the dev server:
   ```bash
   npm run dev
   ```

## Prisma commands
- `npm run prisma:migrate` – run migrations
- `npm run prisma:seed` – load demo data

## Auth
- NextAuth credentials + optional Google OAuth
- Roles: OWNER, ADMIN, EDITOR, CLIENT

## Tenant isolation
All queries are scoped to `agencyId`. Client portal restricts access to `clientId`.

## Webhook
`POST /api/leads/webhook`

Headers:
```
x-api-key: <WEBHOOK_API_KEY>
```

Body:
```json
{
  "clientId": "..." ,
  "clientCode": "...",
  "customerName": "Jane Doe",
  "phoneNumber": "+15555550123",
  "source": "WHATSAPP",
  "message": "Hello",
  "timestamp": "2024-08-30T12:00:00Z"
}
```

## Deployment
Compatible with Vercel + Supabase Postgres or Railway.
