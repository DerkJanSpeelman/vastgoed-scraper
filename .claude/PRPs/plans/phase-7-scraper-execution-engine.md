# Phase 7 Plan — Scraper Execution Engine

## Architecture

Queue runner: **pg-boss** (Postgres-backed) running inside the Next.js process via `instrumentation.ts`.
HTML parsing: **linkedom** for server-side XPath evaluation of Playwright-rendered HTML.
The existing Playwright Docker service (`scraper:3001/render`) handles page rendering.

## Build order

1. **Migration 013** — add `input_uri TEXT` to `scraper_runs`
2. **Install** `linkedom` + `pg-boss` in `app/`
3. **Extend ScraperRunWriteRepository** — `updateToRunning` / `updateToSuccess` / `updateToFailed`
4. **Add read repo method** `findRunWithConfig(runId)` — returns run + config JSONB + agency website_url
5. **SelectorEngine** (+ test) — linkedom XPath eval, returns string values
6. **TransformPipeline** (+ test) — `parse_price`, `parse_int`, regex apply
7. **PlaywrightFetchService** — thin wrapper around `POST scraper:3001/render`
8. **ListingUpsertService** — upsert listing + images + prices, returns `'added'|'updated'|'skipped'`
9. **ScraperExecutor** — orchestrates overview + detail flows, calls update methods
10. **Queue** — `src/lib/queue/boss.ts` (singleton) + `src/lib/queue/worker.ts` (job handler)
11. **`src/instrumentation.ts`** — register() starts the worker on Next.js boot
12. **Update `POST /api/admin/scrapers/run`** — deduplication check + pg-boss enqueue
13. **Update `ManualRunButton`** — URI text input for detail type
14. **Update `ScraperRunsTable`** — make rows clickable (link to `/admin/scrapers/[runId]`)

## Config shapes (from existing actions.ts)

### Overview config JSONB
```
pagination_url_template, detail_link_selector, listing_container_selector,
detail_link_regex, listing_container_regex, total_count_selector, total_count_regex
```
All selectors are XPath. Detail links are extracted directly from XPath result nodes (attribute nodes return `.value`, element nodes return `.getAttribute('href')`).

### Detail config JSONB
```
example_url, field_mappings: { [field]: { selector, attribute, regex, multiple } }
```
Fields: title, price, address, postal_code, city, area_m2, rooms, bedrooms, description, images, floor_plans, status, energy_label, year_built, listing_type

## Deduplication rule
Before creating a run: `SELECT 1 FROM scraper_runs WHERE scraper_config_id = $1 AND status IN ('pending', 'running')`. If row exists → return 409.

## Detail manual run
`POST /api/admin/scrapers/run` accepts optional `inputUri: string`. Stored in `scraper_runs.input_uri`. Executor constructs full URL: `agency.websiteUrl + run.input_uri`.

## Listing field → DB column mapping
| Field | DB column |
|---|---|
| title | street + house_number (split on first space/digit boundary) |
| address | street + house_number (preferred if title absent) |
| postal_code | (no column — store in description or skip for now) |
| city | city_id via cities lookup by name |
| area_m2 | living_area_m2 |
| rooms | bedrooms (total rooms mapped to bedrooms when no separate bedrooms field) |
| bedrooms | bedrooms |
| price | listing_prices.amount (INSERT new price row always, not upsert) |
| images | listing_images (url, is_floor_plan=false) |
| floor_plans | listing_images (url, is_floor_plan=true) |
| description | description |
| energy_label | energy_label |
| year_built | year_built |
| status | (no column — skip) |
| listing_type | property_type_id (1=bestaande_bouw if 'Bestaande bouw', 2=nieuwbouw if 'Nieuwbouw', else 1) |

Upsert on `(agency_id, source_url)`. New → `added`. Existing with changes → `updated`. No changes → `skipped`.
