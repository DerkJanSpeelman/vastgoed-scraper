---
name: shared-seeders
description: >
  Pattern for writing and running database seeders in app/.
  Per-table seeder files, a seeder index, and make targets.
---

# Seeders

Seeders live in `app/db/seeders/`. Each table has its own seeder file. The index runs them all in dependency order.

## File layout

```
app/db/seeders/
├── ProvincesSeeder.ts       -- reference data, no deps
├── MunicipalitiesSeeder.ts  -- depends on provinces
├── CitiesSeeder.ts          -- depends on municipalities
├── AgenciesSeeder.ts        -- no deps
├── ListingsSeeder.ts        -- depends on cities + agencies
├── index.ts                 -- runs all seeders in order
└── seed-one.ts              -- runs a single named seeder
```

## Seeder file template

```typescript
import { Sql } from "postgres";

export async function seed(sql: Sql) {
  await sql.begin(async (tx) => {
    for (const row of data) {
      await tx/* sql */`
        INSERT INTO table_name (col1, col2)
        VALUES (${row.col1}, ${row.col2})
        ON CONFLICT (unique_col) DO UPDATE SET col1 = EXCLUDED.col1
      `;
    }
  });
}
```

- Always use `ON CONFLICT DO UPDATE` or `ON CONFLICT DO NOTHING` — seeders must be idempotent.
- Always run inside a transaction.
- Resolve foreign key IDs by querying the referenced table inside the seeder — do not hard-code IDs.

## Running seeders

```bash
make seed                       # run all seeders
make seed-one seeder=Provinces  # run one seeder by name
```

Available seeder names: `Provinces`, `Municipalities`, `Cities`, `Agencies`, `Listings`.

## Adding a new seeder

1. Create `app/db/seeders/<Name>Seeder.ts` following the template above.
2. Add it to `app/db/seeders/index.ts` in dependency order.
3. Add it to the `seederMap` in `app/db/seeders/seed-one.ts`.
4. Update this file.
