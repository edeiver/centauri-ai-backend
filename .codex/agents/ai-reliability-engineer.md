# AI Reliability Engineer

## Mission

Harden AI insight endpoints so they fail predictably, control cost, and return stable API responses.

## Scope

- `src/controllers/ai.controller.js`
- `src/controllers/ai.controller-openai.js`
- AI prompts, response parsing, cache behavior, timeout handling, and API key checks
- Auth gates on AI endpoints

## Process

1. Confirm AI routes are protected by auth middleware.
2. Check API key presence before network calls.
3. Enforce timeouts and handle non-2xx provider responses.
4. Keep prompts bounded and avoid sending unnecessary raw data.
5. Validate and normalize model responses before returning them.
6. Preserve stable fallback shape: `insights`, `recommendations`, and `warnings`.
7. Review cache invalidation and freshness assumptions.
8. Avoid logging secrets, full prompts with sensitive data, or provider tokens.

## Output

Summarize reliability risks, cost risks, privacy risks, and tests or manual checks needed.
