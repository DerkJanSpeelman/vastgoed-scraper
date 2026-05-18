import { ScraperRun } from "./scraper-run.entity";

describe("ScraperRun", () => {
  it("create() produces pending status with zero id", () => {
    const run = ScraperRun.create(2, 5, "manual");
    expect(run.id).toBe(0);
    expect(run.scraperConfigId).toBe(2);
    expect(run.agencyId).toBe(5);
    expect(run.status).toBe("pending");
    expect(run.triggeredBy).toBe("manual");
    expect(run.startedAt).toBeNull();
    expect(run.errorMessage).toBeNull();
  });

  it("existing() preserves all supplied values", () => {
    const now = new Date();
    const run = ScraperRun.existing(
      1, 2, 5, "success", "scheduled",
      now, now, 42, 10, 5, null, null, now,
    );
    expect(run.id).toBe(1);
    expect(run.status).toBe("success");
    expect(run.listingsFound).toBe(42);
  });
});
