# SQL

Reference schema and seed data for every feature in The Social Circle app.

The live app currently uses an in-memory store (`src/lib/db.ts`) because the
serverless runtime has no writable filesystem. These files mirror that store
one-to-one so you can migrate to a real SQL backend (SQLite, Cloudflare D1,
Postgres) without reshaping the application code — the module boundary is
`src/lib/db.ts` only.

## Files

- `schema.sql` — `CREATE TABLE` + `CREATE INDEX` for every collection:
  `users`, `bookings`, `favorites`, `reviews`, `chat_messages`,
  `direct_messages`, `reports`, `activity`, and the reference tables
  `venues` / `bar_locations`.
- `seed.sql` — initial rows: the built-in admin account, two sample members,
  the seven venues, every bar location, and a couple of sample bookings and
  reports so the admin dashboard renders real data on first open.

## Built-in credentials

| Role  | Login                                | Password      |
| ----- | ------------------------------------ | ------------- |
| Admin | `admin` or `admin@socialcircle.al`   | `Admin2016`   |
| Admin | `mexhidara1@gmail.com`               | `Karomio123!` |

Both admin accounts have identical privileges — the server treats every
address in `ADMIN_EMAILS` (defined in `src/lib/db.ts`) the same.

Password hashes in `seed.sql` are `SHA-256('sc:' || plaintext)`, matching the
prototype hasher in `src/lib/db.ts`. Swap for bcrypt/argon2 when you move to a
real backend and re-generate these rows.

## Local use (SQLite)

```sh
sqlite3 social-circle.db < sql/schema.sql
sqlite3 social-circle.db < sql/seed.sql
```

## Cloudflare D1

```sh
wrangler d1 execute social-circle --file=sql/schema.sql
wrangler d1 execute social-circle --file=sql/seed.sql
```
