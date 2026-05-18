import type { TransactionSql } from "postgres";

export async function up(sql: TransactionSql) {
    await sql.unsafe(/* sql */`
        CREATE TABLE IF NOT EXISTS cities (
            id              SERIAL  PRIMARY KEY,
            name            TEXT    NOT NULL,
            municipality_id INTEGER NOT NULL REFERENCES municipalities(id)
        )
    `);
}

export async function down(sql: TransactionSql) {
    await sql.unsafe(/* sql */`DROP TABLE IF EXISTS cities`);
}
