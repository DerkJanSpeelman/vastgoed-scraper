import type { TransactionSql } from "postgres";

// price_type_id codes: 1=k.k. (kosten koper), 2=v.o.n. (vrij op naam), 3=prijs_op_aanvraag
export async function up(sql: TransactionSql) {
    await sql.unsafe(/* sql */`
        CREATE TABLE IF NOT EXISTS listing_prices (
            id           SERIAL      PRIMARY KEY,
            listing_id   INTEGER     NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
            amount       INTEGER     NOT NULL,
            price_type_id INTEGER    NOT NULL DEFAULT 1,
            scraped_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
}

export async function down(sql: TransactionSql) {
    await sql.unsafe(/* sql */`DROP TABLE IF EXISTS listing_prices`);
}
