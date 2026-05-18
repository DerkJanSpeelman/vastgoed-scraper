import { Sql } from "postgres";

const provinces = [
  { name: "Drenthe",       code: "DR" },
  { name: "Flevoland",     code: "FL" },
  { name: "Friesland",     code: "FR" },
  { name: "Gelderland",    code: "GE" },
  { name: "Groningen",     code: "GR" },
  { name: "Limburg",       code: "LI" },
  { name: "Noord-Brabant", code: "NB" },
  { name: "Noord-Holland", code: "NH" },
  { name: "Overijssel",    code: "OV" },
  { name: "Utrecht",       code: "UT" },
  { name: "Zeeland",       code: "ZE" },
  { name: "Zuid-Holland",  code: "ZH" },
];

export async function seed(sql: Sql) {
  await sql.begin(async (tx) => {
    for (const p of provinces) {
      await tx/* sql */`
        INSERT INTO provinces (name, code)
        VALUES (${p.name}, ${p.code})
        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
      `;
    }
  });
}
