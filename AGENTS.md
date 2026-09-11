# Repository Guidelines

## Project Structure & Module Organization

This is a Node.js Express backend. Runtime code lives under `src/`.

- `src/server.js` loads environment variables, mounts the app, and starts the HTTP server on port `3000`.
- `src/app.js` configures Express middleware and mounts route groups.
- `src/routes/*.routes.js` defines route endpoints for `auth`, `transactions`, `ai`, and `user`.
- `src/controllers/*.controller.js` contains request handlers and business logic.
- `src/middlewares/` and `src/middlewares.js` contain reusable request middleware.
- `src/db.js` creates the PostgreSQL connection pool from `DATABASE_URL`.

Tests live under `test/` and use Node's built-in test runner.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: run `nodemon src/server.js` for local development with automatic restarts.
- `npm test`: run automated tests with `node --test`.

Before running locally, create a `.env` file with `DATABASE_URL`, `JWT_SECRET`, and `JWT_REFRESH_SECRET`. Do not commit secrets.

## Coding Style & Naming Conventions

Use CommonJS modules (`require`, `module.exports`) to match the existing code. Keep indentation at four spaces in JavaScript files. Prefer `const` by default and `let` only when reassignment is needed.

Name files by responsibility, following existing patterns such as `auth.routes.js`, `transaction.controller.js`, and `ai.controller.js`. Keep SQL parameterized with `$1`, `$2`, etc. and pass values separately to `pool.query`.

No formatter or linter is configured yet. Keep edits consistent with surrounding files.

## Testing Guidelines

Tests use `node:test` with `node:assert/strict`. Add focused unit tests for middleware and validation, and integration coverage for routes when database test setup exists. Cover authentication, token refresh/logout behavior, database error paths, and protected endpoints.

Use clear test names that describe behavior, for example `auth middleware accepts a valid Bearer token`.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit-style prefixes, especially `feat:`. Continue with concise messages such as `feat: add transaction filters` or `fix: validate refresh token payload`.

Pull requests should include a short summary, affected routes/controllers, required environment variable changes, database schema assumptions, and test evidence. Include example requests or responses when endpoint behavior changes.

## Security & Configuration Tips

Keep `.env` local. Never log JWT secrets, refresh tokens, passwords, or full authorization headers. When adding endpoints, validate request bodies before database access and apply auth middleware to routes that require a user identity.
