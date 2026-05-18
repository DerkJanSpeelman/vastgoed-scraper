import type { TransactionSql } from "postgres";

export async function up(sql: TransactionSql) {
    await sql.unsafe(/* sql */`
        CREATE TABLE IF NOT EXISTS scraper_runs (
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
        )
    `);
}

export async function down(sql: TransactionSql) {
    await sql.unsafe(/* sql */`
        DROP TABLE IF EXISTS scraper_runs
    `);
}
