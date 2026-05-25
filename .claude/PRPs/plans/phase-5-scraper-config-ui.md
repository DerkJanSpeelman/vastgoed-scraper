---
name: phase-5-scraper-config-ui
description: Implementation plan for Phase 5 — scraper config UI with split view, proxy iframe, and element targeting
phase: 5
---

# Phase 5 — Scraper Config UI

## Build order

1. **Proxy URL validator utility** (pure, testable)
   - `src/lib/admin/proxy-url.ts` — validates URL is http/https, rejects private IP ranges
   - Test: `proxy-url.test.ts`

2. **Proxy API route** — `src/app/api/admin/proxy/route.ts`
   - GET /api/admin/proxy?url=<encoded>
   - Fetch target URL server-side
   - Strip X-Frame-Options + Content-Security-Policy response headers
   - Rewrite relative src/href/action to absolute
   - Inject targeting script into <head>
   - No unit test (integration only — skip for now)

3. **Targeting script** — `src/lib/admin/targeting-script.ts`
   - Returns the JS string to inject
   - Listens for enable-targeting postMessage from parent
   - On hover: highlight element
   - On click: generate CSS selector, post element-selected back
   - No unit test (DOM environment)

4. **Server action** — `src/app/admin/agencies/[id]/scrapers/[type]/actions.ts`
   - `upsertScraperConfigAction(prevState, formData)` → calls upsertScraperConfigHandler

5. **ScraperConfigForm component** (client, form)
   - `src/components/modules/scraper/ScraperConfigForm.tsx` — discriminated union: overview | detail
   - Overview fields: uriPath, pagination_type, conditional fields, selectors with target buttons
   - Detail fields: exampleUrl, urlPattern, field mappings grid
   - Test: basic render test

6. **ProxyIframe component** (client)
   - `src/components/modules/scraper/ProxyIframe.tsx`
   - Accepts `url: string | null`
   - Renders iframe pointing to /api/admin/proxy?url=<encoded>
   - Posts enable-targeting messages; receives element-selected messages
   - Calls `onElementSelected(fieldKey, selector)` callback
   - Test: renders placeholder when url is null

7. **ScraperConfigPage** — `src/app/admin/agencies/[id]/scrapers/[type]/page.tsx`
   - Server component: loads agency + existing scraper config for the type
   - Renders split view: ScraperConfigForm (left) + ProxyIframe (right)
   - Dynamic route: type must be "overview" | "detail" else notFound()

## Files to create

```
src/lib/admin/
  proxy-url.ts
  proxy-url.test.ts
  targeting-script.ts

src/app/api/admin/proxy/
  route.ts

src/app/admin/agencies/[id]/scrapers/[type]/
  page.tsx
  page.module.css
  actions.ts

src/components/modules/scraper/
  ScraperConfigForm.tsx
  ScraperConfigForm.module.css
  ScraperConfigForm.test.tsx
  ProxyIframe.tsx
  ProxyIframe.module.css
  ProxyIframe.test.tsx
```

## Key decisions

- Proxy route: server-side fetch only (no streaming), returns modified HTML as text/html
- URL rewriting: simple regex on href= src= action= attributes (good enough for config-time preview)
- CSS selector generation: walk up DOM using tagName + id + className approach, max 3 levels
- Field mapping fields for detail: title, price, address, city, area_m2, rooms, description, images, status, energy_label, year_built, listing_type
- `before` addon on uriPath input shows the agency's domain (from websiteUrl)
- Form data serialized as flat keys: `field_<name>_selector`, `field_<name>_selector_type`, `field_<name>_attribute`, `field_<name>_transform`
