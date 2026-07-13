export interface CreateScraperRunDto {
  scraperConfigId: number;
  agencyId: number;
  triggeredBy: "manual" | "scheduled";
}
