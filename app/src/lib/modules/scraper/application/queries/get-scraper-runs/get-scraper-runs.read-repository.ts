import { GetScraperRunsRow } from "./get-scraper-runs.row";

export interface ScraperRunReadRepository {
  findAll(agencyId?: number): Promise<GetScraperRunsRow[]>;
  findById(id: number): Promise<GetScraperRunsRow | null>;
}
