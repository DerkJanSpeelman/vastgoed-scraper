export type ScraperConfigStatus = "unconfigured" | "configured" | "active" | "paused" | "error";
export type DataSource = "scraper" | "mailing_list" | "both";

export interface GetAgenciesDto {
  id: number;
  name: string;
  websiteUrl: string | null;
  isDemo: boolean;
  dataSource: DataSource;
  listingCount: number;
  lastRunAt: string | null;
  overviewConfigId: number | null;
  overviewStatus: ScraperConfigStatus | null;
  detailConfigId: number | null;
  detailStatus: ScraperConfigStatus | null;
  createdAt: string;
}
