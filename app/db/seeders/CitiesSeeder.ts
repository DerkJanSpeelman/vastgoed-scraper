import { Sql } from "postgres";

const cities: Array<{ name: string; municipalityName: string }> = [
  { name: "Amsterdam",       municipalityName: "Amsterdam" },
  { name: "Amsterdam-Oost",  municipalityName: "Amsterdam" },
  { name: "Amsterdam-Zuid",  municipalityName: "Amsterdam" },
  { name: "Amsterdam-Noord", municipalityName: "Amsterdam" },
  { name: "Haarlem",         municipalityName: "Haarlem" },
  { name: "Zaandam",         municipalityName: "Zaandam" },
  { name: "Rotterdam",       municipalityName: "Rotterdam" },
  { name: "Rotterdam-Zuid",  municipalityName: "Rotterdam" },
  { name: "Den Haag",        municipalityName: "Den Haag" },
  { name: "Scheveningen",    municipalityName: "Den Haag" },
  { name: "Leiden",          municipalityName: "Leiden" },
  { name: "Delft",           municipalityName: "Delft" },
  { name: "Utrecht",         municipalityName: "Utrecht" },
  { name: "Amersfoort",      municipalityName: "Amersfoort" },
  { name: "Eindhoven",       municipalityName: "Eindhoven" },
  { name: "Tilburg",         municipalityName: "Tilburg" },
  { name: "Breda",           municipalityName: "Breda" },
  { name: "Groningen",       municipalityName: "Groningen" },
  { name: "Maastricht",      municipalityName: "Maastricht" },
  { name: "Nijmegen",        municipalityName: "Nijmegen" },
  { name: "Arnhem",          municipalityName: "Arnhem" },
  { name: "Enschede",        municipalityName: "Enschede" },
  { name: "Zwolle",          municipalityName: "Zwolle" },
  { name: "Leeuwarden",      municipalityName: "Leeuwarden" },
  { name: "Middelburg",      municipalityName: "Middelburg" },
  { name: "Almere",          municipalityName: "Almere" },
  { name: "Assen",           municipalityName: "Assen" },
];

export async function seed(sql: Sql) {
  await sql.begin(async (tx) => {
    for (const c of cities) {
      const [municipality] = await tx<{ id: number }[]>/* sql */`
        SELECT id FROM municipalities WHERE name = ${c.municipalityName}
      `;
      if (!municipality) continue;
      await tx/* sql */`
        INSERT INTO cities (name, municipality_id)
        VALUES (${c.name}, ${municipality.id})
        ON CONFLICT DO NOTHING
      `;
    }
  });
}
