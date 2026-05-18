---
name: shared-migrations
description: >
  Self-contained recipe for creating database migrations in app/.
  Explicit registration list and hand-maintained schema dump.
---

# Migrations

Uses the porsager `postgres` driver with explicit migration registration and a hand-maintained schema dump.

| Service | Migrations dir | Registration file | Schema dump |
|---|---|---|---|
| `app` | `app/db/migrations/` | `app/db/migrations/index.ts` | `app/db/schema.dump.sql` |

**For simple migrations (new table, add/drop column, rename, index): use this recipe directly.**

## 1. File path & numbering

`app/db/migrations/<NNN>_<description>.ts`

- `<NNN>` is the next sequential number, zero-padded to 3.
- Find the predecessor with `ls app/db/migrations/` — pick the highest number, add 1.
- `<description>` is `snake_case` and describes the change.

## 2. File template

```typescript
import type { TransactionSql } from "postgres";

export async function up(sql: TransactionSql) {
    await sql.unsafe(/* sql */`
        CREATE TABLE IF NOT EXISTS <name> (
            id SERIAL PRIMARY KEY
            -- columns
        )
    `);
}

export async function down(sql: TransactionSql) {
    await sql.unsafe(/* sql */`
        DROP TABLE IF EXISTS <name>
    `);
}
```

Conventions:
- Indent SQL 4 spaces inside the template literal.
- The `/* sql */` comment is purely for editor highlighting — keep it.
- Migrations run inside a transaction (`TransactionSql`). No explicit `BEGIN`/`COMMIT`.
- Default `id` type is `SERIAL PRIMARY KEY`.
- Columns are `snake_case`. Domain-side props are `camelCase` and mapped in the persistence layer.
- Prefer `IF NOT EXISTS` / `IF EXISTS` for idempotency.

## 3. Register in `index.ts`

**Mandatory — without this the migration never runs.** Two edits, both in numeric order:

```typescript
// 1. Add import:
import * as m002 from "./002_<description>";

// 2. Add to the runner array:
{ version: "002_<description>", ...m002 },
```

The `version` string must match the filename without `.ts`.

## 4. Update `schema.dump.sql`

Edit the file directly to reflect the new schema. Do not regenerate via shell. This file is the canonical schema snapshot and must stay in sync with the migration history.

The `migration-schema-dump.sh` hook will remind you via stderr when the dump still needs updating.

## 5. Apply

- `make migrate` — runs pending migrations.
- `make migrate-rollback` — rolls back the last migration.
- Never run `yarn` / `npx` directly — always go through `make`.

## DONE checklist for a migration task

- [ ] File created at `app/db/migrations/<NNN>_<description>.ts` matching the template
- [ ] Registered in `app/db/migrations/index.ts` (import + runner array entry, both in numeric order)
- [ ] `app/db/schema.dump.sql` updated by hand to reflect the new schema
- [ ] `make migrate` runs cleanly (or explicitly deferred to the user)
