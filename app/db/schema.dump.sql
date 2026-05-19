-- Schema dump — update by hand when writing migrations. Do not regenerate via shell.
-- Last updated: migration 013_add_input_uri_to_scraper_runs

CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS provinces (
    id   SERIAL  PRIMARY KEY,
    name TEXT    NOT NULL,
    code CHAR(2) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS municipalities (
    id          SERIAL  PRIMARY KEY,
    name        TEXT    NOT NULL,
    province_id INTEGER NOT NULL REFERENCES provinces(id)
);

CREATE TABLE IF NOT EXISTS cities (
    id              SERIAL  PRIMARY KEY,
    name            TEXT    NOT NULL,
    municipality_id INTEGER NOT NULL REFERENCES municipalities(id)
);

CREATE TABLE IF NOT EXISTS agencies (
    id          SERIAL      PRIMARY KEY,
    name        TEXT        NOT NULL,
    website_url TEXT,
    is_demo     BOOLEAN     NOT NULL DEFAULT FALSE,
    data_source TEXT        NOT NULL DEFAULT 'scraper'
                            CHECK (data_source IN ('scraper', 'mailing_list', 'both')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- property_type_id codes: 1=bestaande_bouw, 2=nieuwbouw
CREATE TABLE IF NOT EXISTS listings (
    id                    SERIAL      PRIMARY KEY,
    street                TEXT        NOT NULL,
    house_number          TEXT        NOT NULL,
    house_number_addition TEXT,
    city_id               INTEGER     NOT NULL REFERENCES cities(id),
    agency_id             INTEGER     REFERENCES agencies(id),
    source_url            TEXT        NOT NULL,
    property_type_id      INTEGER     NOT NULL DEFAULT 1,
    is_stille_verkoop     BOOLEAN     NOT NULL DEFAULT FALSE,
    living_area_m2        INTEGER,
    plot_area_m2          INTEGER,
    bedrooms              INTEGER,
    energy_label          TEXT,
    description           TEXT,
    year_built            INTEGER,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listing_images (
    id            SERIAL      PRIMARY KEY,
    listing_id    INTEGER     NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    url           TEXT        NOT NULL,
    sort_order    INTEGER     NOT NULL DEFAULT 0,
    is_floor_plan BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- price_type_id codes: 1=k.k. (kosten koper), 2=v.o.n. (vrij op naam), 3=prijs_op_aanvraag
CREATE TABLE IF NOT EXISTS listing_prices (
    id            SERIAL      PRIMARY KEY,
    listing_id    INTEGER     NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    amount        INTEGER     NOT NULL,
    price_type_id INTEGER     NOT NULL DEFAULT 1,
    scraped_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- type: 'overview' | 'detail' — one config per type per agency
-- status: unconfigured → configured → active | paused | error
-- config JSONB shape differs per type; see .claude/PRPs/prds/admin-scraper-management.md
CREATE TABLE IF NOT EXISTS scraper_configs (
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

-- triggered_by: 'manual' | 'scheduled' — status: pending → running → success | failed
CREATE TABLE IF NOT EXISTS scraper_runs (
    id                 SERIAL      PRIMARY KEY,
    scraper_config_id  INTEGER     NOT NULL REFERENCES scraper_configs(id) ON DELETE CASCADE,
    agency_id          INTEGER     NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
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
    input_uri          TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
