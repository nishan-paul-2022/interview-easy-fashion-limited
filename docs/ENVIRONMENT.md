# Environment Variables Documentation

This document describes all environment variables used across the `easy-fashion-limited` monorepo services.

## App Backend (`app-backend/.env.example`)

| Variable                 | Description                                            | Required                    |
| ------------------------ | ------------------------------------------------------ | --------------------------- |
| `DATABASE_URL`           | PostgreSQL connection string                           | Yes                         |
| `JWT_ACCESS_SECRET`      | Secret key for signing JWT access tokens               | Yes                         |
| `JWT_ACCESS_EXPIRES_IN`  | Expiration time for access tokens (e.g., `15m`)        | Yes                         |
| `JWT_REFRESH_SECRET`     | Secret key for signing JWT refresh tokens              | Yes                         |
| `JWT_REFRESH_EXPIRES_IN` | Expiration time for refresh tokens (e.g., `7d`)        | Yes                         |
| `GOOGLE_CLIENT_ID`       | OAuth Client ID from Google Cloud Console              | Yes                         |
| `GOOGLE_CLIENT_SECRET`   | OAuth Client Secret from Google Cloud Console          | Yes                         |
| `GOOGLE_REDIRECT_URI`    | Google OAuth redirect URI                              | Yes                         |
| `FACEBOOK_CLIENT_ID`     | OAuth Client ID from Facebook Developer portal         | Yes                         |
| `FACEBOOK_CLIENT_SECRET` | OAuth Client Secret from Facebook                      | Yes                         |
| `FACEBOOK_CALLBACK_URL`  | Facebook OAuth callback URL                            | Yes                         |
| `CLOUDINARY_CLOUD_NAME`  | Cloudinary account cloud name                          | Yes                         |
| `CLOUDINARY_API_KEY`     | Cloudinary API key                                     | Yes                         |
| `CLOUDINARY_API_SECRET`  | Cloudinary API secret                                  | Yes                         |
| `PORT`                   | Port the NestJS server listens on (e.g., 3000)         | Optional (Defaults to 3000) |
| `NODE_ENV`               | Node environment (`development`, `production`, `test`) | Optional                    |
| `API_VERSION`            | Base API version (e.g., `v1`)                          | Optional                    |
| `CORS_ORIGIN_CUSTOMER`   | Allowed CORS origin for the Customer frontend          | Yes                         |
| `CORS_ORIGIN_MANAGEMENT` | Allowed CORS origin for the Management frontend        | Yes                         |
| `SUPER_ADMIN_EMAIL`      | Email used to seed the initial Super Admin account     | Yes                         |
| `SUPER_ADMIN_PASSWORD`   | Password for the initial Super Admin account           | Yes                         |
| `THROTTLE_TTL`           | Rate limiting Time-To-Live in seconds                  | Yes                         |
| `THROTTLE_LIMIT`         | Max requests allowed within `THROTTLE_TTL`             | Yes                         |
| `REDIS_URL`              | Connection string for Redis instance                   | Yes                         |
| `REDIS_TTL`              | Default cache TTL in Redis                             | Optional                    |
| `REDIS_MAX`              | Max concurrent Redis connections                       | Optional                    |
| `ANALYTICS_HASH_SECRET`  | Secret used for hashing analytical data                | Optional                    |
| `LOG_LEVEL`              | Application logging level (`info`, `debug`, `error`)   | Optional                    |
| `ADMIN_EMAIL`            | System administrator email address for critical alerts | Optional                    |

## App Customer (`app-customer/.env.example`)

| Variable                       | Description                                    | Required |
| ------------------------------ | ---------------------------------------------- | -------- |
| `NEXT_PUBLIC_API_URL`          | Full URL of the backend API                    | Yes      |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Public Google OAuth Client ID for frontend SDK | Yes      |

## App Management (`app-management/.env.example`)

| Variable                       | Description                                    | Required |
| ------------------------------ | ---------------------------------------------- | -------- |
| `NEXT_PUBLIC_API_URL`          | Full URL of the backend API                    | Yes      |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Public Google OAuth Client ID for frontend SDK | Yes      |

---

**Note:** Ensure all actual `.env` and `.env.*` files (excluding `.env.example`) remain ignored by `.gitignore` and are never committed to version control.
