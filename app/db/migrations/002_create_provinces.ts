import type { TransactionSql } from "postgres";

export async function up(sql: TransactionSql) {
    await sql.unsafe(/* sql */`
        CREATE TABLE IF NOT EXISTS provinces (
            id   SERIAL PRIMARY KEY,
            name TEXT   NOT NULL,
            code CHAR(2) NOT NULL UNIQUE
        )
    `);
}

export async function down(sql: TransactionSql) {
    await sql.unsafe(/* sql */`DROP TABLE IF EXISTS provinces`);
}
