# PRD — Admin & Scraper Management

**What**: An `/admin` interface to manage agencies and configure/run scrapers that collect real listing data.

**Why**: The database currently holds seeded demo data. To get real listings, we need to manage agencies (data sources) and configure per-agency scrapers with a live-preview UI.

**Out of scope**:
- Authentication on `/admin` (no auth, by design for now)
- Mailing list IMAP integration (future PRD)
- Actually executing scrapers (config + run infrastructure only in this PRD; scraper runtime is a future concern)
- Selenium / headless browser runner (future)
- Bot-detection evasion headers (future, when runtime is built)

---

## Phases

### Phase 1 — Demo data reset + demo badge [x] PR #8

**Scope:**
- Migration `009`: add `is_demo BOOLEAN NOT NULL DEFAULT FALSE` and `data_source TEXT NOT NULL DEFAULT 'scraper'` to `agencies`.
- Update `AgenciesSeeder`: seed one demo agency (`name: 'Demo Makelaars'`, `website_url: null`, `is_demo: true`).
- Update `ListingsSeeder`: all seeded listings → demo agency id.
- Update `GetListingsQuery` + `GetListingQuery` DTOs to include `agencyIsDemo: boolean`.
- Add `"demo"` variant to `Badge` component.
- Update `ListingRow` to render demo badge when `agencyIsDemo === true`.
- Create `make truncate` command that truncates `listing_prices`, `listing_images`, `listings`, `agencies` (RESTART IDENTITY CASCADE), then runs seeders.

**Acceptance criteria:**
- `make truncate && make seed` produces one agency (Demo Makelaars), N listings all pointing to that agency.
- Every listing card on `/` shows a "demo" badge.
- `make typecheck` passes.

---

### Phase 2 — Scraper DB schema [x] PR #9

**Scope:**
- Migration `010`: create `scraper_configs` table.
- Migration `011`: create `scraper_runs` table.
- Domain module skeleton: `src/lib/modules/scraper/` (entity, VOs, errors, repository interfaces, container).

**`scraper_configs` table:**
```sql
CREATE TABLE scraper_configs (
    id          SERIAL      PRIMARY KEY,
    agency_id   INTEGER     NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    type        TEXT        NOT NULL CHECK (type IN ('overview', 'detail')),
    status      TEXT        NOT NULL DEFAULT 'unconfigured'
                            CHECK (status IN ('unconfigured', 'configured', 'active', 'paused', 'error')),
    uri_path    TEXT,
    config      JSONB       NOT NULL DEFAULT '{}',
    last_run_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (agency_id, type)
);
```

**`scraper_config.config` JSONB shape — overview type:**
```json
{
  "pagination_type": "query_param | path_segment | load_more | none",
  "page_param_name": "pagina",
  "page_param_start": 1,
  "listings_per_page": 20,
  "detail_link_selector": ".listing a",
  "detail_link_selector_type": "css | xpath",
  "detail_link_attribute": "href",
  "listing_container_selector": ".listing",
  "listing_container_selector_type": "css | xpath",
  "total_count_selector": ".count",
  "total_count_selector_type": "css | xpath",
  "fetch_type": "html | json",
  "json_listings_path": "$.data.listings",
  "max_pages": 50
}
```

**`scraper_config.config` JSONB shape — detail type:**
```json
{
  "example_url": "https://www.varwijkensibma.nl/aanbod/123-adres",
  "url_pattern": "/aanbod/{slug}",
  "field_mappings": {
    "title":        { "selector": "h1", "selector_type": "css", "attribute": "text" },
    "price":        { "selector": "...", "selector_type": "css", "attribute": "text", "transform": "parse_price" },
    "address":      { "selector": "...", "selector_type": "css", "attribute": "text" },
    "city":         { "selector": "...", "selector_type": "css", "attribute": "text" },
    "area_m2":      { "selector": "...", "selector_type": "css", "attribute": "text", "transform": "parse_int" },
    "rooms":        { "selector": "...", "selector_type": "css", "attribute": "text", "transform": "parse_int" },
    "description":  { "selector": "...", "selector_type": "css", "attribute": "text" },
    "images":       { "selector": "...", "selector_type": "css", "attribute": "src", "multiple": true },
    "status":       { "selector": "...", "selector_type": "css", "attribute": "text" },
    "energy_label": { "selector": "...", "selector_type": "css", "attribute": "text" },
    "year_built":   { "selector": "...", "selector_type": "css", "attribute": "text", "transform": "parse_int" },
    "listing_type": { "selector": "...", "selector_type": "css", "attribute": "text" }
  }
}
```

**`scraper_runs` table:**
```sql
CREATE TABLE scraper_runs (
    id                 SERIAL      PRIMARY KEY,
    scraper_config_id  INTEGER     NOT NULL REFERENCES scraper_configs(id) ON DELETE CASCADE,
    agency_id          INTEGER     NOT NULL REFERENCES agencies(id),
    status             TEXT        NOT NULL DEFAULT 'pending'
                                   CHECK (status IN ('pending', 'running', 'success', 'failed')),
    triggered_by       TEXT        NOT NULL DEFAULT 'manual'
                                   CHECK (triggered_by IN ('manual', 'scheduled')),
    started_at         TIMESTAMPTZ,
    finished_at        TIMESTAMPTZ,
    listings_found     INTEGER,
    listings_added     INTEGER,
    listings_updated   INTEGER,
    error_message      TEXT,
    error_details      JSONB,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Acceptance criteria:**
- `make migrate` runs both migrations cleanly.
- `make typecheck` passes.

---

### Phase 3 — Admin layout + agencies overview [x] PR #10

**Scope:**
- Admin layout: `src/app/admin/layout.tsx` — sidebar nav with "Makelaars" + "Scraper runs".
- `/admin` → redirect to `/admin/agencies`.
- `/admin/agencies` page — server component, reads agencies with listing count + scraper config statuses.
- Port `Table` component from `dynamic-infra-poc` (adapted to this project's design tokens, not Tailwind).
- Columns: Name, Website, Listings, Overview scraper (icon), Detail scraper (icon), Data source, Last run, Actions (edit link).
- Scraper status icons: `?` unconfigured, 🔴 error, 🟢 active, ⏸ paused, ⚙ configured-but-not-run.
- "Voeg makelaar toe" button top-right → `/admin/agencies/new`.
- Query: `GetAgenciesQuery` with joined scraper_configs and listing count.

**Acceptance criteria:**
- Table renders with sorting on Name, Listings, Last run columns.
- Demo Makelaars row shows listing count, both scrapers as `?` (unconfigured).
- `make typecheck` passes.

---

### Phase 4 — Agency CRUD [ ]

**Scope:**
- `/admin/agencies/new` — create form: name (required), website_url (optional), data_source toggle (`scraper | mailing_list | both`).
- Server action `CreateAgencyAction` → `CreateAgencyHandler` → redirect to `/admin/agencies/[id]`.
- `/admin/agencies/[id]` — edit page: same fields + "Configureer scraper" section if scrapers not yet configured (shows two cards: overview scraper, detail scraper, each with a configure CTA).
- Server action `UpdateAgencyAction` → `UpdateAgencyHandler`.
- Server action `DeleteAgencyAction` → `DeleteAgencyHandler` (with listings guard: refuse if listings exist).
- Inline form validation with error display.

**Acceptance criteria:**
- Can create an agency with name + website, lands on edit page.
- Edit page shows "Configureer scraper" CTAs when no scraper configs exist.
- Delete blocked if agency has listings.
- `make typecheck` passes.

---

### Phase 5 — Scraper config UI [ ]

**Scope:**
- `/admin/agencies/[id]/scrapers/overview` — overview scraper config page.
- `/admin/agencies/[id]/scrapers/detail` — detail scraper config page.
- **Split view** (50/50, row direction): left = config form, right = live preview iframe.
- **Left side — overview config:**
  - URI path input with domain as `before` addon (adapting the Input component pattern).
  - Pagination type select: query_param | path_segment | load_more | none.
  - Conditional fields per pagination type (page_param_name, page_param_start, etc.).
  - Detail link selector input + selector type toggle (CSS | XPath) + "target" button.
  - Listing container selector input + target button.
  - Total count selector + target button (optional).
  - Fetch type: html | json (show JSON path input when json selected).
  - Max pages input.
- **Left side — detail config:**
  - Example URL input (full URL for iframe preview).
  - URL pattern input (`/aanbod/{slug}`).
  - Field mapping grid: for each field (title, price, address, city, area_m2, rooms, description, images, status, energy_label, year_built, listing_type) → selector input + selector_type toggle + attribute select (text | href | src | data-*) + optional transform select + target button.
- **Right side:**
  - Iframe pointing to `/api/admin/proxy?url=<encoded>`.
  - Refreshes when URI path changes (overview) or example URL changes (detail).
- **Proxy API route** `GET /api/admin/proxy`:
  - Server-side fetch of the target URL.
  - Strips `X-Frame-Options` and `Content-Security-Policy` response headers.
  - Rewrites relative URLs (href, src, action) to absolute.
  - Injects targeting script into `<head>`.
  - Returns modified HTML.
  - Security: only allows `http://` and `https://` schemes; rejects internal/private IPs.
- **Element targeting script** (injected into proxied page):
  - Listens for `{ type: 'enable-targeting', fieldKey: string }` message from parent.
  - On click: prevents default, generates CSS selector for the element, posts `{ type: 'element-selected', fieldKey, selector }` back to parent.
  - Visual highlight on hover in targeting mode.
- **Parent page targeting logic:**
  - "Target" button sets active field key + sends enable-targeting message to iframe.
  - Listens for element-selected messages → populates the corresponding selector input.
- Save action: `UpsertScraperConfigAction` → `UpsertScraperConfigHandler`.

**Acceptance criteria:**
- Proxy loads varwijkensibma.nl in iframe (modulo cookie banner — accepted as known limitation).
- Clicking "target" + clicking an element populates the selector input.
- Config saves and status transitions `unconfigured → configured`.
- `make typecheck` passes.

---

### Phase 6 — Scraper run history [ ]

**Scope:**
- `/admin/scrapers` page — table of all scraper runs across agencies, sortable by agency, type, status, started_at.
- Status column: color-coded badge (pending grey, running blue/pulse, success green, failed red).
- "Manual run" button on agency edit page (`/admin/agencies/[id]`) — posts to `POST /api/admin/scrapers/run` with `{ agencyId, type }`.
- API route creates a `scraper_run` row with status `pending` (actual execution is future work — just enqueues for now).
- Error detail: click a failed run → `/admin/scrapers/[runId]` shows full `error_details` JSONB.
- Run count badges on agency edit page (last run time, status).

**Acceptance criteria:**
- Manual run button creates a run row, shows up in the table.
- Failed runs link to detail page.
- `make typecheck` passes.

---

## First real agency

**Varwijnen & Sibma Makelaars** — `https://www.varwijkensibma.nl/`
- Small agency, Amsterdam area.
- Server-side rendered (HTML scraping, no JS required for listing list).
- Cookie banner present — accepted as known limitation; Selenium integration is future.
- **DO NOT run scrapers during development.** Proxy is only used for config UI — no automated requests.

## Bot-detection notes (for future runtime phase)

- Rotate User-Agent headers.
- Random delays between requests (1–5s jitter).
- Respect robots.txt.
- Selenium/Puppeteer option for JS-heavy or bot-protected sites.
- Never blatantly hammer a site.
