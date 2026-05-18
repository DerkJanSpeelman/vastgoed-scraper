import { Sql } from "postgres";

// property_type_id: 1=bestaande_bouw, 2=nieuwbouw
// price_type_id:    1=k.k., 2=v.o.n., 3=prijs_op_aanvraag
const listingData = [
  {
    street: "Apollolaan", house_number: "154", house_number_addition: null,
    city: "Amsterdam-Zuid",
    source_url: "intern://demo/1",
    property_type_id: 1, is_stille_verkoop: true,
    living_area_m2: 150, plot_area_m2: null, bedrooms: 4,
    energy_label: "B", year_built: 1928,
    description: "Karakteristieke bovenwoning in beschermd stadsgezicht, gelegen aan een van de meest gewilde lanen van Amsterdam Zuid. Drie woonlagen met originele en-suite kamers, schouwen en glas-in-loodramen. Recent gemoderniseerde keuken en twee badkamers. Zuid-georiënteerd dakterras met vrij uitzicht over de Apollobuurt.",
    price: 1450000, price_type_id: 1,
    images: [
      { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800", sort_order: 0, is_floor_plan: false },
      { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", sort_order: 1, is_floor_plan: false },
      { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800", sort_order: 2, is_floor_plan: false },
      { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800", sort_order: 3, is_floor_plan: false },
      { url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800", sort_order: 4, is_floor_plan: false },
      { url: "https://via.placeholder.com/800x600/e8eaf0/6c7ea0?text=Plattegrond+1", sort_order: 10, is_floor_plan: true },
      { url: "https://via.placeholder.com/800x600/e8eaf0/6c7ea0?text=Plattegrond+2", sort_order: 11, is_floor_plan: true },
      { url: "https://via.placeholder.com/800x600/e8eaf0/6c7ea0?text=Plattegrond+3", sort_order: 12, is_floor_plan: true },
    ],
  },
  {
    street: "Cartesiusweg", house_number: "145", house_number_addition: "Bouwnr. 28",
    city: "Utrecht",
    source_url: "intern://demo/2",
    property_type_id: 2, is_stille_verkoop: false,
    living_area_m2: 85, plot_area_m2: null, bedrooms: 2,
    energy_label: "A++", year_built: 2026,
    description: "Onderdeel van fase 3 van het Cartesius-project: een autoluwe stadswijk met ruim 700 woningen rond een centraal park. Het appartement op de 6e verdieping beschikt over een ruim balkon op het westen en uitzicht over het Merwedekanaal. Hoogwaardig afgewerkt door de aannemer; oplevering Q3 2027.",
    price: 495000, price_type_id: 2,
    images: [
      { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", sort_order: 0, is_floor_plan: false },
      { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", sort_order: 1, is_floor_plan: false },
      { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800", sort_order: 2, is_floor_plan: false },
      { url: "https://via.placeholder.com/800x600/e8eaf0/6c7ea0?text=Plattegrond+1", sort_order: 10, is_floor_plan: true },
      { url: "https://via.placeholder.com/800x600/e8eaf0/6c7ea0?text=Plattegrond+2", sort_order: 11, is_floor_plan: true },
    ],
  },
  {
    street: "Frederik Hendriklaan", house_number: "287", house_number_addition: null,
    city: "Den Haag",
    source_url: "intern://demo/3",
    property_type_id: 1, is_stille_verkoop: true,
    living_area_m2: 155, plot_area_m2: 220, bedrooms: 4,
    energy_label: "C", year_built: 1912,
    description: "Weids herenhuis aan een van de rustigste lanen van het Statenkwartier. Vier slaapkamers, twee badkamers, authentieke schouwen op elke etage. Diepe achtertuin op het westen. Aanbod in stille verkoop; bezichtiging op afspraak.",
    price: 1195000, price_type_id: 1,
    images: [
      { url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800", sort_order: 0, is_floor_plan: false },
      { url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800", sort_order: 1, is_floor_plan: false },
      { url: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800", sort_order: 2, is_floor_plan: false },
      { url: "https://via.placeholder.com/800x600/e8eaf0/6c7ea0?text=Plattegrond+1", sort_order: 10, is_floor_plan: true },
    ],
  },
  {
    street: "Zevenhuizerlaan", house_number: "8", house_number_addition: null,
    city: "Rotterdam-Zuid",
    source_url: "intern://demo/4",
    property_type_id: 1, is_stille_verkoop: false,
    living_area_m2: 95, plot_area_m2: 140, bedrooms: 3,
    energy_label: "D", year_built: 1965,
    description: "Goed onderhouden tussenwoning in rustige woonwijk. Drie slaapkamers, moderne keuken en badkamer. Zonnige achtertuin op het zuiden. Gunstig gelegen nabij uitvalswegen en OV.",
    price: 385000, price_type_id: 1,
    images: [
      { url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800", sort_order: 0, is_floor_plan: false },
      { url: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800", sort_order: 1, is_floor_plan: false },
    ],
  },
  {
    street: "Herengracht", house_number: "432", house_number_addition: null,
    city: "Amsterdam",
    source_url: "intern://demo/5",
    property_type_id: 1, is_stille_verkoop: false,
    living_area_m2: 210, plot_area_m2: null, bedrooms: 5,
    energy_label: "E", year_built: 1685,
    description: "Monumentaal grachtenpand op een van de mooiste stukken van de Herengracht. Unieke gevel, hoge plafonds, originele betimmeringen. Volledig gerestaureerd met behoud van authentieke details. Dak-terras met panoramisch uitzicht over de grachten.",
    price: 3750000, price_type_id: 1,
    images: [
      { url: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800", sort_order: 0, is_floor_plan: false },
      { url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800", sort_order: 1, is_floor_plan: false },
      { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", sort_order: 2, is_floor_plan: false },
      { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", sort_order: 3, is_floor_plan: false },
      { url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800", sort_order: 4, is_floor_plan: false },
    ],
  },
  {
    street: "Stationsplein", house_number: "1", house_number_addition: "fase 2",
    city: "Eindhoven",
    source_url: "intern://demo/6",
    property_type_id: 2, is_stille_verkoop: false,
    living_area_m2: 72, plot_area_m2: null, bedrooms: 2,
    energy_label: "A", year_built: 2025,
    description: "Centrumappartement pal naast Eindhoven CS. Onderdeel van een nieuwbouwcomplex met 180 appartementen, commerciële ruimten en een gezamenlijk dakterras. Volledig gasloos, warmtepomp, zonnepanelen. Oplevering Q2 2025.",
    price: 325000, price_type_id: 2,
    images: [
      { url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800", sort_order: 0, is_floor_plan: false },
      { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", sort_order: 1, is_floor_plan: false },
      { url: "https://via.placeholder.com/800x600/e8eaf0/6c7ea0?text=Plattegrond+1", sort_order: 10, is_floor_plan: true },
    ],
  },
  {
    street: "Riviervismarkt", house_number: "11", house_number_addition: null,
    city: "Den Haag",
    source_url: "intern://demo/7",
    property_type_id: 1, is_stille_verkoop: false,
    living_area_m2: null, plot_area_m2: null, bedrooms: null,
    energy_label: null, year_built: 1902,
    description: null,
    price: 799000, price_type_id: 1,
    images: [],
  },
];

export async function seed(sql: Sql) {
  await sql.begin(async (tx) => {
    const [demoAgency] = await tx<{ id: number }[]>/* sql */`
      SELECT id FROM agencies WHERE is_demo = true ORDER BY id LIMIT 1
    `;
    if (!demoAgency) throw new Error("Demo agency not found — run AgenciesSeeder first");

    for (const l of listingData) {
      const [city] = await tx<{ id: number }[]>/* sql */`
        SELECT id FROM cities WHERE name = ${l.city}
      `;
      if (!city) continue;

      const [listing] = await tx<{ id: number }[]>/* sql */`
        INSERT INTO listings (
          street, house_number, house_number_addition, city_id, agency_id,
          source_url, property_type_id, is_stille_verkoop,
          living_area_m2, plot_area_m2, bedrooms, energy_label,
          description, year_built
        ) VALUES (
          ${l.street}, ${l.house_number}, ${l.house_number_addition ?? null},
          ${city.id}, ${demoAgency.id},
          ${l.source_url}, ${l.property_type_id}, ${l.is_stille_verkoop},
          ${l.living_area_m2 ?? null}, ${l.plot_area_m2 ?? null},
          ${l.bedrooms ?? null}, ${l.energy_label ?? null},
          ${l.description ?? null}, ${l.year_built ?? null}
        )
        RETURNING id
      `;

      await tx/* sql */`
        INSERT INTO listing_prices (listing_id, amount, price_type_id)
        VALUES (${listing.id}, ${l.price}, ${l.price_type_id})
      `;

      for (const img of l.images) {
        await tx/* sql */`
          INSERT INTO listing_images (listing_id, url, sort_order, is_floor_plan)
          VALUES (${listing.id}, ${img.url}, ${img.sort_order}, ${img.is_floor_plan})
        `;
      }
    }
  });
}
