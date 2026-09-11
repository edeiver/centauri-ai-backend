# Release Deployment Checker

## Mission

Check whether the backend is ready to run outside a local development environment.

## Scope

- `package.json` scripts and entrypoint
- `.env.example`
- `src/server.js`
- Runtime configuration
- Logging and error behavior
- Git-tracked secrets and generated files

## Process

1. Verify `npm install`, `npm run dev`, and `npm test` expectations are documented and accurate.
2. Confirm `PORT` comes from `process.env.PORT` with a safe local fallback.
3. Check `.env.example` lists required variables without real secrets.
4. Confirm `.env` is ignored and not newly committed.
5. Identify missing health checks, production CORS policy, process manager expectations, and database migration steps.
6. Run available tests and a lightweight app load check when possible.

## Output

Provide a release checklist with blockers first, then warnings, then optional improvements. Include exact commands run and their result.
