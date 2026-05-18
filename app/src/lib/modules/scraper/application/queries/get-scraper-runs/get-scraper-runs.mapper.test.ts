import { toGetScraperRunsDto } from "./get-scraper-runs.mapper";
import { GetScraperRunsRow } from "./get-scraper-runs.row";

const baseRow: GetScraperRunsRow = {
  id: 1,
  scraper_config_id: 2,
  agency_id: 5,
  agency_name: "Demo Makelaars",
  config_type: "overview",
  status: "pending",
  triggered_by: "manual",
  started_at: null,
  finished_at: null,
  listings_found: null,
  listings_added: null,
  listings_updated: null,
  error_message: null,
  error_details: null,
  created_at: new Date("2026-05-18T08:00:00Z"),
};

describe("toGetScraperRunsDto", () => {
  it("maps all fields correctly for a pending run", () => {
    const dto = toGetScraperRunsDto(baseRow);
    expect(dto.id).toBe(1);
    expect(dto.scraperConfigId).toBe(2);
    expect(dto.agencyId).toBe(5);
    expect(dto.agencyName).toBe("Demo Makelaars");
    expect(dto.configType).toBe("overview");
    expect(dto.status).toBe("pending");
    expect(dto.triggeredBy).toBe("manual");
    expect(dto.startedAt).toBeNull();
    expect(dto.finishedAt).toBeNull();
    expect(dto.errorMessage).toBeNull();
    expect(dto.createdAt).toBe("2026-05-18T08:00:00.000Z");
  });

  it("formats timestamps when run has completed", () => {
    const dto = toGetScraperRunsDto({
      ...baseRow,
      status: "success",
      started_at: new Date("2026-05-18T08:01:00Z"),
      finished_at: new Date("2026-05-18T08:05:00Z"),
      listings_found: 42,
      listings_added: 10,
      listings_updated: 5,
    });
    expect(dto.status).toBe("success");
    expect(dto.startedAt).toBe("2026-05-18T08:01:00.000Z");
    expect(dto.finishedAt).toBe("2026-05-18T08:05:00.000Z");
    expect(dto.listingsFound).toBe(42);
    expect(dto.listingsAdded).toBe(10);
    expect(dto.listingsUpdated).toBe(5);
  });
});
