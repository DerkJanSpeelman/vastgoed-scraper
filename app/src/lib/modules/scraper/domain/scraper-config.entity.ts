export type ScraperType = "overview" | "detail";
export type ScraperStatus = "unconfigured" | "configured" | "active" | "paused" | "error";

export class ScraperConfig {
  private constructor(
    readonly id: number,
    readonly agencyId: number,
    readonly type: ScraperType,
    readonly status: ScraperStatus,
    readonly uriPath: string | null,
    readonly config: Record<string, unknown>,
    readonly lastRunAt: Date | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(
    agencyId: number,
    type: ScraperType,
  ): ScraperConfig {
    return new ScraperConfig(0, agencyId, type, "unconfigured", null, {}, null, new Date(), new Date());
  }

  static existing(
    id: number,
    agencyId: number,
    type: ScraperType,
    status: ScraperStatus,
    uriPath: string | null,
    config: Record<string, unknown>,
    lastRunAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
  ): ScraperConfig {
    return new ScraperConfig(id, agencyId, type, status, uriPath, config, lastRunAt, createdAt, updatedAt);
  }
}
