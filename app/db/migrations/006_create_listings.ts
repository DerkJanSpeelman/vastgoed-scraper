import type { TransactionSql } from "postgres";

// property_type_id codes: 1=bestaande_bouw, 2=nieuwbouw
export async function up(sql: TransactionSql) {
    await sql.unsafe(/* sql */`
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
        )
    `);
}

export async function down(sql: TransactionSql) {
    await sql.unsafe(/* sql */`DROP TABLE IF EXISTS listings`);
}
