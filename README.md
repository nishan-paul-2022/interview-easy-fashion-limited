# 👗 Easy Fashion Limited

Easy Fashion Limited is a modern, responsive fashion e-commerce storefront for customers paired with a secure management dashboard for administrators, managers, and staff. Built using a robust technology stack including Next.js 14, NestJS, Prisma, and PostgreSQL, the platform features complete user authorization (RBAC), social OAuth integrations, dynamic catalog navigation with filtering, guest checkout, and a full set of security features designed to scale on VPS infrastructure.

## Folder Layout

The repository is structured as a monorepo containing the following key components:

```text
.
├── app-backend/         # NestJS backend API with Prisma ORM
├── app-customer/        # Next.js customer-facing storefront website
├── app-management/      # Next.js management dashboard application
├── docs/                # Project requirements, tech stack details, and planning docs
├── infra/               # Docker Compose and Nginx reverse proxy configurations
└── ui-mockups/          # UI/UX reference design mockups
```

## Getting Started

Detailed installation, configuration, and setup steps will be added in subsequent phases.
To run the monorepo locally, you will eventually install dependencies, configure environment variables, run database migrations, seed the database, and spin up the development servers.

## Development Tooling

This repository uses a shared ESLint and Prettier configuration at the root level to maintain code quality and consistent formatting across the monorepo.

Each sub-app (`app-backend`, `app-customer`, `app-management`) will extend this root `eslint.config.js` config and inherit the `.prettierrc` rules.
