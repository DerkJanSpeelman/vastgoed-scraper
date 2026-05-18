import { toGetAgenciesDto } from "./get-agencies.mapper";
import { GetAgenciesRow } from "./get-agencies.row";

const baseRow: GetAgenciesRow = {
  id: 1,
  name: "Demo Makelaars",
  website_url: null,
  is_demo: true,
  data_source: "scraper",
  listing_count: "12",
  last_run_at: null,
  overview_config_id: null,
  overview_status: null,
  detail_config_id: null,
  detail_status: null,
  created_at: new Date("2026-05-18T10:00:00Z"),
};

describe("toGetAgenciesDto", () => {
  it("maps a demo agency with no scrapers", () => {
    const dto = toGetAgenciesDto(baseRow);
    expect(dto.id).toBe(1);
    expect(dto.name).toBe("Demo Makelaars");
    expect(dto.websiteUrl).toBeNull();
    expect(dto.isDemo).toBe(true);
    expect(dto.dataSource).toBe("scraper");
    expect(dto.listingCount).toBe(12);
    expect(dto.lastRunAt).toBeNull();
    expect(dto.overviewConfigId).toBeNull();
    expect(dto.overviewStatus).toBeNull();
    expect(dto.detailConfigId).toBeNull();
    expect(dto.detailStatus).toBeNull();
    expect(dto.createdAt).toBe("2026-05-18T10:00:00.000Z");
  });

  it("maps an agency with configured scrapers and a last run", () => {
    const dto = toGetAgenciesDto({
      ...baseRow,
      name: "Varwijnen & Sibma",
      website_url: "https://www.varwijkensibma.nl",
      is_demo: false,
      listing_count: "0",
      last_run_at: new Date("2026-05-18T09:00:00Z"),
      overview_config_id: 5,
      overview_status: "active",
      detail_config_id: 6,
      detail_status: "configured",
    });
    expect(dto.websiteUrl).toBe("https://www.varwijkensibma.nl");
    expect(dto.isDemo).toBe(false);
    expect(dto.listingCount).toBe(0);
    expect(dto.lastRunAt).toBe("2026-05-18T09:00:00.000Z");
    expect(dto.overviewConfigId).toBe(5);
    expect(dto.overviewStatus).toBe("active");
    expect(dto.detailConfigId).toBe(6);
    expect(dto.detailStatus).toBe("configured");
  });
});
