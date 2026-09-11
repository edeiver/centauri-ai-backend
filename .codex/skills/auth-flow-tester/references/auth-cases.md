# Auth Test Case Reference

Use this reference when auth changes touch controllers, route wiring, token storage, or protected resources.

## Middleware

- `Authorization` header missing: return `401` with `{ error: 'Token required' }`.
- Header without `Bearer ` prefix: return `401`.
- Invalid token: return `403` with `{ error: 'Invalid or expired token' }`.
- Valid token: call `next()`, set `req.user`, and set `req.userId`.

## Register

- Reject invalid username, invalid email, or short password with `400`.
- Reject duplicate username or email with `409`.
- Hash password before insert.
- Return only public user fields.

## Login

- Reject missing credentials with `400`.
- Reject unknown user and wrong password with `401` and the same message.
- Return access and refresh tokens on success.
- Persist only a hashed refresh token.

## Refresh

- Reject missing refresh token with `401`.
- Reject malformed or expired refresh token with `403`.
- Reject unknown users with `403`.
- Reject refresh tokens whose hash does not match `users.refresh_token`.
- Return both a new access token and a new refresh token.
- Update `users.refresh_token` to the hash of the new refresh token.

## Logout

- Accept missing or invalid refresh tokens without leaking token validity.
- Clear `users.refresh_token` only when the token belongs to the user and hash matches.

## Protected Resources

- Transactions must use `req.userId` from the token, not request body user IDs.
- `GET /user/me` should read the authenticated user.
- `GET /user/:userId` should return `403` for a different authenticated user.
