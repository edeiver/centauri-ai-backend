# Centauri AI Backend

Express + PostgreSQL API for Centauri: user authentication (JWT access/refresh tokens),
transaction tracking, and AI-generated spending insights (via Gemini, cached for 6 hours).

## Requirements

- Node.js 18+
- PostgreSQL 13+

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file and fill in real values:

   ```bash
   cp .env.example .env
   ```

3. Create the database schema (see [Database setup](#database-setup) below).

4. Start the server:

   ```bash
   npm run dev    # local development, auto-restarts on changes
   npm start      # production
   ```

The server listens on `process.env.PORT`, falling back to `3000` if unset.

## Environment variables

| Variable              | Description                                              |
| ---------------------- | --------------------------------------------------------- |
| `PORT`                | Port the HTTP server listens on. Optional, defaults to `3000`. |
| `DATABASE_URL`        | PostgreSQL connection string, e.g. `postgresql://user:pass@host:5432/dbname`. |
| `JWT_SECRET`          | Secret used to sign short-lived access tokens.            |
| `JWT_REFRESH_SECRET`  | Secret used to sign long-lived refresh tokens. Must differ from `JWT_SECRET`. |
| `ANTHROPIC_API_KEY`   | API key for the Anthropic Messages API, used to generate spending insights. |
| `GEMINI_API_KEY`      | Unused by the current code (kept for reference/rollback). Spending insights now call Claude via `ANTHROPIC_API_KEY`. |

See `.env.example` for a template. Never commit a real `.env` file.

## Database setup

The schema lives in [`db/schema.sql`](./db/schema.sql) and is generated directly from the
queries used in `src/controllers/*.js`, so it must stay in sync with the code rather than
being redesigned independently.

Against a fresh Postgres database:

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

This creates:

- the `pgcrypto` extension (needed for `gen_random_uuid()`)
- `users` — accounts, hashed passwords, hashed refresh tokens, and cached AI insights (`last_insights`, `insights_updated_at`)
- `transactions` — income/expense records linked to `users` via `user_id`, with indexes on `user_id` and `created_at`

The schema uses `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS`, so it's safe to
re-run against a database that already has it applied.

## API overview

| Method | Route              | Auth required | Description                              |
| ------ | ------------------ | -------------- | ----------------------------------------- |
| POST   | `/auth/register`   | No             | Create a new user account.                |
| POST   | `/auth/login`      | No             | Authenticate and receive an access + refresh token pair. |
| POST   | `/auth/refresh`    | No (refresh token in body) | Exchange a valid refresh token for a new token pair. |
| POST   | `/auth/logout`     | No (refresh token in body) | Invalidate a refresh token.               |
| GET    | `/user/me`         | Yes            | Get the authenticated user's profile.     |
| GET    | `/user/:userId`    | Yes            | Get a user's profile by id.               |
| POST   | `/transactions`    | Yes            | Create a transaction (`type`, `amount`, `category`). |
| GET    | `/transactions`    | Yes            | List the authenticated user's transactions. |
| GET    | `/ai/insights`     | Yes            | Get AI-generated spending insights, cached for 6 hours. |

Authenticated routes require a standard bearer header:

```
Authorization: Bearer <accessToken>
```

## Scripts

- `npm run dev` — run the server with nodemon for local development.
- `npm start` — run the server with plain Node, for production/deployment.
- `npm test` — run the test suite (`node --test`).

## Security notes

- `.env` is git-ignored; never commit real secrets. Use `.env.example` as the template for required variables.
- Passwords are hashed with bcrypt; refresh tokens are stored hashed (SHA-256) rather than in plaintext.
