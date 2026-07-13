export class CreateScraperRunCommand {
  constructor(
    readonly scraperConfigId: number,
    readonly agencyId: number,
    readonly triggeredBy: "manual" | "scheduled",
  ) {}
}
