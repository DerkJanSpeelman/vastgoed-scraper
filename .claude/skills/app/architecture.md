---
name: app-architecture
description: >
  Architecture, directory layout, stack, and conventions for the vastgoed-scraper
  Next.js app. Read before touching any file in app/.
---

# App Architecture

**Stack:** Next.js (App Router) · TypeScript · `postgres` (porsager) · PostgreSQL · Docker · `tsx` · yarn
**Port:** 3000 (Docker Compose)
**Commands:** Always use `make` from `app/` — routes through Docker Compose.

## Directory Layout

```
app/
├── src/
│   ├── app/                    Next.js App Router pages and layouts
│   │   ├── layout.tsx
│   │   ├── page.tsx            Homepage (listing overview)
│   │   ├── page.module.css
│   │   └── listings/[id]/
│   │       ├── page.tsx        Listing detail page
│   │       └── page.module.css
│   ├── components/
│   │   ├── ui/                 Primitive, domain-agnostic components
│   │   │   ├── badge/
│   │   │   ├── energy-label/
│   │   │   ├── stat-item/
│   │   │   └── topbar/
│   │   └── modules/
│   │       └── listing/        Domain-coupled listing components
│   │           ├── listing-icons.tsx
│   │           ├── listing-formatters.ts
│   │           ├── ListingRow.tsx
│   │           ├── FilterBar.tsx
│   │           └── ListingGallery.tsx
│   ├── lib/
│   │   ├── errors.ts           AppError, ValidationError, NotFoundError, UnprocessableError
│   │   └── modules/
│   │       ├── location/       Province read queries
│   │       └── listing/        Listing read queries (overview + detail)
│   └── styles/
│       ├── tokens.css          CSS custom properties (design tokens)
│       └── global.css
├── db/
│   ├── client.ts               postgres (porsager) singleton
│   ├── schema.dump.sql         Hand-maintained schema snapshot
│   ├── migrations/
│   │   ├── index.ts            Migration runner + registration list
│   │   └── NNN_<description>.ts
│   └── seeders/
│       ├── index.ts            runAll() — runs all seeders in dependency order
│       ├── seed-one.ts         CLI entry: tsx db/seeders/seed-one.ts <name>
│       ├── ProvincesSeeder.ts
│       ├── MunicipalitiesSeeder.ts
│       ├── CitiesSeeder.ts
│       ├── AgenciesSeeder.ts
│       └── ListingsSeeder.ts
├── package.json
├── tsconfig.json
├── next.config.ts
├── Makefile
└── .env.example
```

## Database

Single PostgreSQL instance shared for all domains.

- Driver: `postgres` (porsager) — template literal parameterization, no ORM.
- Client singleton: `db/client.ts` — import `sql` from here everywhere.
- Migrations: `db/migrations/` — see `.claude/skills/shared/migrations.md`.
- Schema snapshot: `db/schema.dump.sql` — update by hand when writing migrations.

## Conventions

- **DDD/CQRS**: see `.claude/skills/shared/ddd-cqrs.md` — entities, VOs, command/query handlers, repositories.
- **Components**: see `.claude/skills/shared/web-components.md` — component tiers, registry rule.
- **Testing**: see `.claude/skills/shared/testing.md` — DONE gate, co-located tests, patterns.
- **Migrations**: see `.claude/skills/shared/migrations.md` — file template, registration, schema dump.

## Domain modules (add as they are created)

Modules live under `src/lib/modules/<domain>/` with the following structure:

```
src/lib/modules/<domain>/
├── domain/
│   ├── <domain>.entity.ts
│   ├── <field>.vo.ts
│   ├── errors.ts
│   └── repositories/<domain>.repository.interface.ts
├── application/
│   ├── commands/<action>/
│   │   ├── <action>.dto.ts
│   │   ├── <action>.command.ts
│   │   └── <action>.handler.ts
│   └── queries/<action>/
│       ├── <action>.query.ts
│       ├── <action>.row.ts
│       ├── <action>.dto.ts
│       ├── <action>.mapper.ts
│       └── <action>.handler.ts
└── infrastructure/
    └── persistence/
        ├── <domain>.table.ts
        ├── <domain>.mapper.ts
        ├── <domain>.read-repository.impl.ts
        └── <domain>.write-repository.impl.ts
```

Container: `src/lib/modules/<domain>/<domain>.container.ts`

## Components Registry

| Component | Tier | Location | Props summary |
|---|---|---|---|
| `Badge` | ui | `src/components/ui/badge/Badge.tsx` | `variant: "nieuwbouw" \| "stille-verkoop" \| "demo"` |
| `EnergyLabel` | ui | `src/components/ui/energy-label/EnergyLabel.tsx` | `label: string \| null \| undefined` — renders colored badge or "—" |
| `StatItem` | ui | `src/components/ui/stat-item/StatItem.tsx` | `icon: ReactNode, value: ReactNode, unit?: string` — renders "—" for empty values |
| `Topbar` | ui | `src/components/ui/topbar/Topbar.tsx` | `listingCount?: number` — sticky header with brand + count |
| `ListingRow` | modules/listing | `src/components/modules/listing/ListingRow.tsx` | `listing: GetListingsDto` — full listing row with image, stats, badges, agency |
| `FilterBar` | modules/listing | `src/components/modules/listing/FilterBar.tsx` | `provinces: GetProvincesDto[], totalCount: number` — "use client"; chip filters + province select; URL-state driven |
| `ListingGallery` | modules/listing | `src/components/modules/listing/ListingGallery.tsx` | `images: ListingImageDto[]` — photo grid (main + 4 thumbs + "+N more") + floor plans strip |

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | postgres connection string |

## Migration Slot Reservations

_No slots reserved yet._
