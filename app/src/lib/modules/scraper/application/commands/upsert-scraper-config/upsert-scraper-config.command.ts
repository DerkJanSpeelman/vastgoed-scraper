export class UpsertScraperConfigCommand {
  constructor(
    readonly agencyId: number,
    readonly type: "overview" | "detail",
    readonly uriPath: string | null,
    readonly config: Record<string, unknown>,
  ) {}
}
