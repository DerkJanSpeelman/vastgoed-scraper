export type ScraperRunStatus = "pending" | "running" | "success" | "failed";
export type ScraperRunTrigger = "manual" | "scheduled";

export class ScraperRun {
  private constructor(
    readonly id: number,
    readonly scraperConfigId: number,
    readonly agencyId: number,
    readonly status: ScraperRunStatus,
    readonly triggeredBy: ScraperRunTrigger,
    readonly startedAt: Date | null,
    readonly finishedAt: Date | null,
    readonly listingsFound: number | null,
    readonly listingsAdded: number | null,
    readonly listingsUpdated: number | null,
    readonly errorMessage: string | null,
    readonly errorDetails: Record<string, unknown> | null,
    readonly createdAt: Date,
    readonly inputUri: string | null,
  ) {}

  static create(
    scraperConfigId: number,
    agencyId: number,
    triggeredBy: ScraperRunTrigger,
    inputUri: string | null = null,
  ): ScraperRun {
    return new ScraperRun(
      0, scraperConfigId, agencyId, "pending", triggeredBy,
      null, null, null, null, null, null, null, new Date(), inputUri,
    );
  }

  static existing(
    id: number,
    scraperConfigId: number,
    agencyId: number,
    status: ScraperRunStatus,
    triggeredBy: ScraperRunTrigger,
    startedAt: Date | null,
    finishedAt: Date | null,
    listingsFound: number | null,
    listingsAdded: number | null,
    listingsUpdated: number | null,
    errorMessage: string | null,
    errorDetails: Record<string, unknown> | null,
    createdAt: Date,
    inputUri: string | null = null,
  ): ScraperRun {
    return new ScraperRun(
      id, scraperConfigId, agencyId, status, triggeredBy,
      startedAt, finishedAt, listingsFound, listingsAdded, listingsUpdated,
      errorMessage, errorDetails, createdAt, inputUri,
    );
  }
}
