export class CreateScraperRunCommand {
  constructor(
    readonly scraperConfigId: number,
    readonly agencyId: number,
    readonly triggeredBy: "manual" | "scheduled",
    readonly inputUri: string | null = null,
  ) {}
}
