import { ScraperConfig } from "./scraper-config.entity";

describe("ScraperConfig", () => {
  it("create() produces unconfigured status with zero id", () => {
    const config = ScraperConfig.create(5, "overview");
    expect(config.id).toBe(0);
    expect(config.agencyId).toBe(5);
    expect(config.type).toBe("overview");
    expect(config.status).toBe("unconfigured");
    expect(config.uriPath).toBeNull();
    expect(config.config).toEqual({});
  });

  it("existing() preserves all supplied values", () => {
    const now = new Date();
    const config = ScraperConfig.existing(
      1, 5, "detail", "configured", "/aanbod/{slug}",
      { example_url: "https://example.com" }, null, now, now,
    );
    expect(config.id).toBe(1);
    expect(config.status).toBe("configured");
    expect(config.uriPath).toBe("/aanbod/{slug}");
  });
});
