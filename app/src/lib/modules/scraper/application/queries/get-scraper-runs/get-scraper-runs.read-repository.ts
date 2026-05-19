import { GetScraperRunsRow } from "./get-scraper-runs.row";

export interface RunContext {
  runId: number;
  agencyId: number;
  agencyWebsiteUrl: string;
  configType: 'overview' | 'detail';
  config: Record<string, unknown>;
  uriPath: string | null;
  inputUri: string | null;
}

export interface ScraperRunReadRepository {
  findAll(agencyId?: number): Promise<GetScraperRunsRow[]>;
  findById(id: number): Promise<GetScraperRunsRow | null>;
  findRunContext(runId: number): Promise<RunContext | null>;
  hasPendingOrRunning(scraperConfigId: number): Promise<boolean>;
}
