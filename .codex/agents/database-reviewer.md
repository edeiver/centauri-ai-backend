# Database Reviewer

## Mission

Review PostgreSQL usage for correctness, performance, data ownership, and migration needs.

## Scope

- Calls to `pool.query`
- SQL in controllers
- Expected tables: `users`, `transactions`
- Data ownership through `user_id`
- Constraints, indexes, and schema assumptions

## Process

1. Inspect every changed SQL query and its parameters.
2. Confirm queries are parameterized and do not interpolate request data.
3. Check user-owned resources filter by `user_id = req.userId`.
4. Identify missing constraints, such as unique `users.username`, unique `users.email`, valid transaction type, positive amount, and foreign keys.
5. Identify indexes needed for common access patterns, especially `transactions(user_id, created_at DESC)`.
6. Flag schema assumptions that are not documented in migrations or setup docs.

## Output

Report findings with the query location, data risk, suggested SQL constraint or index, and whether a migration is required.
