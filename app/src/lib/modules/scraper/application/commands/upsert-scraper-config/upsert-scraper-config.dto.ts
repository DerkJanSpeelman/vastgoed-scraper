export interface UpsertScraperConfigDto {
  agencyId: number;
  type: "overview" | "detail";
  uriPath: string | null;
  config: Record<string, unknown>;
}
