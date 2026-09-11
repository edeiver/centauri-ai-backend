---
name: auth-flow-tester
description: Create, update, and run focused automated tests for Express JWT authentication flows in this repository. Use when working on register/login/refresh/logout, Bearer token middleware, protected routes, user profile authorization, refresh token persistence, auth error responses, or regressions around `src/controllers/auth.controller.js`, `src/middlewares/auth.js`, and auth-protected routes.
---

# Auth Flow Tester

## Overview

Use this skill to add targeted auth coverage without introducing unnecessary framework changes. Prefer Node's built-in `node:test` and `node:assert/strict`, matching the current `npm test` script.

## Workflow

1. Inspect `package.json`, `src/routes/auth.routes.js`, `src/controllers/auth.controller.js`, `src/middlewares/auth.js`, and any protected route being tested.
2. Identify the behavior surface: token parsing, status code, response body, database query, password check, token signing, or ownership check.
3. Prefer fast unit tests for pure middleware and validation behavior. Add route/integration tests only when the database and app wiring can be isolated cleanly.
4. Mock external boundaries explicitly: PostgreSQL pool, bcrypt, JWT clock-sensitive behavior, and AI/network calls if auth gates those routes.
5. Run `npm test` after edits. If a DB-backed integration test needs unavailable infrastructure, keep the test unit-level and state the remaining gap.

## Current Repository Conventions

- Auth middleware expects `Authorization: Bearer <accessToken>`.
- `req.userId` and `req.user` are set by `src/middlewares/auth.js`.
- Access tokens use `JWT_SECRET`; refresh tokens use `JWT_REFRESH_SECRET`.
- Refresh tokens are stored hashed in `users.refresh_token`.
- `GET /user/me` should return the authenticated user's profile.
- `GET /user/:userId` must reject access when `req.userId !== req.params.userId`.
- Tests live in `test/` and should be named `*.test.js`.

## Coverage Checklist

Read `references/auth-cases.md` when adding or reviewing broader auth coverage.

Minimum cases for auth-related changes:

- Missing auth header returns `401`.
- Non-Bearer auth header returns `401`.
- Invalid or expired token returns `403`.
- Valid token calls `next()` and sets `req.userId`.
- Login rejects unknown user and wrong password with the same public error.
- Refresh rejects missing, invalid, unknown, or mismatched refresh tokens.
- Refresh rotates and persists the new hashed refresh token.
- Logout clears only the matching stored refresh token.
- User profile routes do not expose another user's data.

## Test Style

Keep tests direct and behavior-focused. Use small helper factories for fake `req`, `res`, and `next`; avoid snapshot tests for API errors. Assert status codes and response bodies exactly when they are part of the contract.
