import { Sql } from "postgres";

const agencies = [
  { name: "Brecheisen Makelaars",    website_url: "https://www.brecheisen.nl" },
  { name: "Boelens Jorritsma",       website_url: "https://www.boelensjorritsma.nl" },
  { name: "NVM Makelaars Den Haag",  website_url: "https://www.nvmdenhaag.nl" },
  { name: "Woning Makelaar Utrecht", website_url: "https://www.woningmakelaarsutrecht.nl" },
  { name: "ERA Makelaars",           website_url: "https://www.era.nl" },
  { name: "Engel & Völkers",         website_url: "https://www.engelvoelkers.com/nl" },
  { name: "MVGM Wonen",             website_url: "https://www.mvgm.nl" },
  { name: "Makelaarsland",          website_url: "https://www.makelaarsland.nl" },
];

export async function seed(sql: Sql) {
  await sql.begin(async (tx) => {
    for (const a of agencies) {
      await tx/* sql */`
        INSERT INTO agencies (name, website_url)
        VALUES (${a.name}, ${a.website_url})
        ON CONFLICT DO NOTHING
      `;
    }
  });
}
