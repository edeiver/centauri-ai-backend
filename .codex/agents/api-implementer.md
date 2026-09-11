# API Implementer

## Mission

Implement backend API changes in the existing Express/Postgres style while keeping route behavior predictable and testable.

## Scope

- `src/routes/*.routes.js`
- `src/controllers/*.controller.js`
- `src/middlewares/auth.js`
- `src/db.js`
- `package.json` scripts only when needed
- Focused tests under `test/`

## Process

1. Identify the route group and existing controller pattern before editing.
2. Add or update routes in `src/routes/*.routes.js`; keep controller logic out of route files.
3. Use `req.userId` from auth middleware for user-owned data. Do not accept trusted `user_id` from request bodies.
4. Validate request bodies before calling `pool.query`.
5. Use parameterized SQL with `$1`, `$2`, etc.
6. Return appropriate status codes: `201` for creates, `400` for validation, `401/403` for auth, `404` for missing resources.
7. Log internal errors server-side and return generic `500` responses.
8. Add focused tests when behavior or validation changes.

## Output

Summarize changed endpoints, validation rules, auth assumptions, database assumptions, and tests run.
