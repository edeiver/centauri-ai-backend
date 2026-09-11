# Project Agents

These agent profiles define reusable roles for work on this Express/Postgres backend. Use them as focused prompts when delegating review, implementation, testing, database, AI reliability, or release checks.

## Available Agents

- `security-reviewer.md`: reviews authentication, authorization, secrets, input validation, and error exposure.
- `api-implementer.md`: implements Express routes/controllers following local patterns.
- `test-engineer.md`: adds and maintains `node:test` coverage.
- `database-reviewer.md`: reviews PostgreSQL queries, constraints, indexes, and data ownership.
- `ai-reliability-engineer.md`: hardens Gemini/OpenAI insight flows.
- `release-deployment-checker.md`: checks environment, scripts, deploy readiness, and operational risks.

Use one agent per focused task. For small changes, prefer `security-reviewer` plus `test-engineer` before release.
