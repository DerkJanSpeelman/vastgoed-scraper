import { toGetScraperConfigsDto } from "./get-scraper-configs.mapper";
import { GetScraperConfigsRow } from "./get-scraper-configs.row";

const baseRow: GetScraperConfigsRow = {
  id: 1,
  agency_id: 5,
  type: "overview",
  status: "unconfigured",
  uri_path: "/aanbod",
  config: { pagination_type: "query_param" },
  last_run_at: null,
  created_at: new Date("2026-05-18T08:00:00Z"),
  updated_at: new Date("2026-05-18T09:00:00Z"),
  website_url: "https://example.nl",
};

describe("toGetScraperConfigsDto", () => {
  it("maps all fields correctly", () => {
    const dto = toGetScraperConfigsDto(baseRow);
    expect(dto.id).toBe(1);
    expect(dto.agencyId).toBe(5);
    expect(dto.type).toBe("overview");
    expect(dto.status).toBe("unconfigured");
    expect(dto.uriPath).toBe("/aanbod");
    expect(dto.config).toEqual({ pagination_type: "query_param" });
    expect(dto.lastRunAt).toBeNull();
    expect(dto.createdAt).toBe("2026-05-18T08:00:00.000Z");
    expect(dto.updatedAt).toBe("2026-05-18T09:00:00.000Z");
  });

  it("formats lastRunAt when present", () => {
    const dto = toGetScraperConfigsDto({ ...baseRow, last_run_at: new Date("2026-05-18T10:00:00Z") });
    expect(dto.lastRunAt).toBe("2026-05-18T10:00:00.000Z");
  });
});
