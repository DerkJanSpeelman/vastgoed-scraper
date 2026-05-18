import type { TransactionSql } from "postgres";

export async function up(sql: TransactionSql) {
    await sql.unsafe(/* sql */`
        CREATE TABLE IF NOT EXISTS municipalities (
            id          SERIAL  PRIMARY KEY,
            name        TEXT    NOT NULL,
            province_id INTEGER NOT NULL REFERENCES provinces(id)
        )
    `);
}

export async function down(sql: TransactionSql) {
    await sql.unsafe(/* sql */`DROP TABLE IF EXISTS municipalities`);
}
