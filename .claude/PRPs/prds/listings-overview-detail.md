# PRD: Listings Overview + Detail Pages + Database Foundation

**Status:** In progress

---

## What
Full database schema, seeder infrastructure, domain/application layer, and frontend for Dutch real estate listings: an overview page (newest first, with filters) and a detail page — matching the design concept in `docs/html/conept/`.

## Why
Prepares the scraper's data model and UI so that once scraping logic is added, listings are immediately displayable and browsable. No scraping logic in scope — data foundation only.

## Phases

### Phase 1: Database Schema (Migrations) — ✅ complete
Create all database tables via numbered migration files. Tables: `provinces`, `municipalities`, `cities`, `agencies`, `listings`, `listing_images`, `listing_prices`. Update `schema.dump.sql`.

**Acceptance criteria:**
- Migrations 002–008 exist, are registered in `index.ts`, and `make migrate` runs cleanly
- `schema.dump.sql` reflects all new tables
- No DB-level enum types — classification columns use `INTEGER` with documented codes
- All foreign keys in place with `ON DELETE CASCADE` where appropriate

### Phase 2: Seeder Infrastructure — ✅ complete
Per-table seeders following the dynamic-infra-poc pattern. Seeder index. `make seed` command. Skill doc added.

**Acceptance criteria:**
- `app/db/seeders/` directory with one seeder per table + `index.ts`
- `app/db/seeders/seed-one.ts` for running a specific seeder
- `make seed` and `make seed-one seeder=<Name>` commands in `app/Makefile`
- `.claude/skills/shared/seeders.md` documents the pattern
- Realistic Dutch sample data (provinces NL, municipalities, cities, agencies, listings with images + prices)

### Phase 3: Domain + Application Layer — ✅ complete
DDD/CQRS modules for `location`, `agency`, and `listing`. Query handlers used by the pages.

**Acceptance criteria:**
- `src/lib/modules/location/` — GetProvinces, GetMunicipalitiesByProvince, GetCitiesByMunicipality queries
- `src/lib/modules/agency/` — GetAgency query
- `src/lib/modules/listing/` — GetListings (with filters), GetListingById queries
- Containers exported for each module
- All handlers, mappers, and repos have co-located `.test.ts`
- `make typecheck` passes

### Phase 4: Design System + Layout — ✅ complete
Design tokens, global styles, Geist font, layout component, topbar.

**Acceptance criteria:**
- `src/styles/tokens.css` — all CSS custom properties from design concept
- `src/styles/global.css` — base resets and typography
- `src/components/ui/` — Badge, EnergyLabel, StatItem, Button components with tests
- `src/app/layout.tsx` — root layout with Geist font + global CSS
- All new components registered in `.claude/skills/app/architecture.md` Components Registry

### Phase 5: Homepage Listing Overview — ✅ complete
`/` page: newest-first listing list with filter bar (type chips, province select).

**Acceptance criteria:**
- `app/src/app/page.tsx` renders listings via `GetListings` query
- `ListingRow` component matching the concept (image, address, price, meta stats, agency, badge)
- Filter bar: Alle / Bestaande bouw / Nieuwbouw / Stille verkoop chips + Province select
- Clicking row (image or address) navigates to `/listings/[id]`
- Placeholder values (`—`) when fields are null
- All components tested

### Phase 6: Listing Detail Page — ✅ complete
`/listings/[id]` route with full detail view.

**Acceptance criteria:**
- `app/src/app/listings/[id]/page.tsx` using `GetListingById` query
- Gallery grid (main + 4 thumbnails, "+N more" overlay)
- Floor plans strip (or empty state if none)
- KPI grid (living area, plot, bedrooms, energy label)
- Description with read-more toggle
- Side column: stats, agency block, source link, price history
- Back link to homepage
- All components tested

---

## Out of scope
- Scraping logic
- Authentication
- Admin UI
- Search beyond filter chips
- Map view
