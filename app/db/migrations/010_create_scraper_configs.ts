import type { TransactionSql } from "postgres";

export async function up(sql: TransactionSql) {
    await sql.unsafe(/* sql */`
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
        )
    `);
}

export async function down(sql: TransactionSql) {
    await sql.unsafe(/* sql */`
        DROP TABLE IF EXISTS scraper_configs
    `);
}
