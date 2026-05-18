import type { TransactionSql } from "postgres";

export async function up(sql: TransactionSql) {
    await sql.unsafe(/* sql */`
        CREATE TABLE IF NOT EXISTS listing_images (
            id           SERIAL      PRIMARY KEY,
            listing_id   INTEGER     NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
            url          TEXT        NOT NULL,
            sort_order   INTEGER     NOT NULL DEFAULT 0,
            is_floor_plan BOOLEAN    NOT NULL DEFAULT FALSE,
            created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
}

export async function down(sql: TransactionSql) {
    await sql.unsafe(/* sql */`DROP TABLE IF EXISTS listing_images`);
}
