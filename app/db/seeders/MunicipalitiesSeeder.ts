import { Sql } from "postgres";

const municipalities: Array<{ name: string; provinceCode: string }> = [
  { name: "Amsterdam",      provinceCode: "NH" },
  { name: "Haarlem",        provinceCode: "NH" },
  { name: "Zaandam",        provinceCode: "NH" },
  { name: "Rotterdam",      provinceCode: "ZH" },
  { name: "Den Haag",       provinceCode: "ZH" },
  { name: "Leiden",         provinceCode: "ZH" },
  { name: "Delft",          provinceCode: "ZH" },
  { name: "Utrecht",        provinceCode: "UT" },
  { name: "Amersfoort",     provinceCode: "UT" },
  { name: "Eindhoven",      provinceCode: "NB" },
  { name: "Tilburg",        provinceCode: "NB" },
  { name: "Breda",          provinceCode: "NB" },
  { name: "Groningen",      provinceCode: "GR" },
  { name: "Maastricht",     provinceCode: "LI" },
  { name: "Nijmegen",       provinceCode: "GE" },
  { name: "Arnhem",         provinceCode: "GE" },
  { name: "Enschede",       provinceCode: "OV" },
  { name: "Zwolle",         provinceCode: "OV" },
  { name: "Leeuwarden",     provinceCode: "FR" },
  { name: "Middelburg",     provinceCode: "ZE" },
  { name: "Almere",         provinceCode: "FL" },
  { name: "Assen",          provinceCode: "DR" },
];

export async function seed(sql: Sql) {
  await sql.begin(async (tx) => {
    for (const m of municipalities) {
      const [province] = await tx<{ id: number }[]>/* sql */`
        SELECT id FROM provinces WHERE code = ${m.provinceCode}
      `;
      if (!province) continue;
      await tx/* sql */`
        INSERT INTO municipalities (name, province_id)
        VALUES (${m.name}, ${province.id})
        ON CONFLICT DO NOTHING
      `;
    }
  });
}
