# Tech Stack — Final Decision

> Deadline is tomorrow (07 Aug, 11:59 PM). Stack below reflects your picks (NestJS, Next.js, Postgres, Contabo VPS) with the fastest viable setup inside each.

## Backend

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js (v20 LTS) | required |
| Framework | **NestJS** | your call — do use its module structure for real (AuthModule, UsersModule, ProductsModule, OrdersModule, etc.), since that structure is exactly what "clean architecture" scoring rewards. Just don't over-engineer with CQRS/microservices patterns — plain Nest modules + services + guards is enough. |
| Language | TypeScript | native to Nest |
| Validation | **class-validator + class-transformer** (Nest's native pairing, via `ValidationPipe`) | zero extra wiring vs Zod in Nest; use Zod only if you already have a shared-schema reason to |
| Auth | `@nestjs/jwt` + `@nestjs/passport` + `bcrypt` | JWT access/refresh, Nest's idiomatic auth setup, Guards map directly to your RBAC matrix |
| OAuth | `passport-google-oauth20`, `passport-facebook` as Nest strategies | plugs straight into `@nestjs/passport` |
| File uploads | `@nestjs/platform-express` Multer integration → **Cloudinary** (free tier) | product images need real URLs; local disk won't survive VPS redeploys cleanly |
| Rate limiting | `@nestjs/throttler` | bonus requirement, built for Nest |
| ORM | see below | |

## Database

| Layer | Choice | Why |
|---|---|---|
| DB | **PostgreSQL** | confirmed — relational fits the entity list (Users/Roles/Products/Orders/OrderItems) far better than Mongo; FK constraints are explicitly required |
| ORM | **Prisma** (used inside Nest via a `PrismaService`, not `@nestjs/typeorm`) | still faster migration + seed workflow than TypeORM even inside Nest — `prisma migrate dev` and `prisma db seed` (for the mandatory Super Admin) are less code than TypeORM entities/migrations. Nest doesn't require TypeORM; Prisma integrates as a regular injectable service. |
| Hosting | Postgres container on your Contabo VPS | see deployment section below |

## Frontend

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | required |
| Language | TypeScript | consistency with backend |
| UI | **Tailwind CSS + shadcn/ui** | shadcn gives you pre-built accessible components (forms, dialogs, tables) so the dashboard doesn't eat your remaining hours; pure Tailwind alone would be slower |
| State/data | `@tanstack/react-query` | cart state, dashboard tables, filters — handles loading/error/cache without hand-rolled logic |
| Forms | `react-hook-form` + Zod resolver | shares validation schemas with backend intent |
| Carousel | `embla-carousel-react` (via shadcn) | hero banner, minimal setup |

## Two apps: customer site vs. management dashboard

The SRS states "the project consists of two applications" (§3). Confirmed structure: three top-level apps, one shared backend.

```
app-customer     → Next.js (storefront)
app-management   → Next.js (dashboard)
app-backend      → NestJS + Prisma (one shared REST API)
```

Both frontends hit the same NestJS API, differentiated only by JWT role — no separate backend deployments.

**Shared code**: a light `shared/` folder (or package) for the API client wrapper and shared TS types (User, Product, Order, etc.) that both `app-customer` and `app-management` import. No need for full pnpm/Turborepo workspace tooling — relative imports or a simple path alias is enough.

## Deployment — Contabo VPS

- **Docker Compose**, three services: `postgres`, `backend` (NestJS), plus `customer` and `management` (the two Next.js apps) — four containers total.
- **Nginx** as reverse proxy: `/api` → NestJS container, main domain → `app-customer`, a subdomain (e.g. `admin.yourdomain.com`) → `app-management`.
- **Certbot** for free SSL if a domain is pointed at the VPS.
- `.env` files per service, never committed — matches the SRS's "Environment Variables for Secrets" requirement (§5.5) and the submission checklist's env var documentation item.

## Immediate seed requirement

Prisma seed script must create the one **Super Admin** account on `prisma db seed` — this is a hard requirement (§5.3), not optional.
