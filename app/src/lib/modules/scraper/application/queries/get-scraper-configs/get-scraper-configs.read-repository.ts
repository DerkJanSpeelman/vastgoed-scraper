import { GetScraperConfigsRow } from "./get-scraper-configs.row";

export interface ScraperConfigReadRepository {
  findByAgencyId(agencyId: number): Promise<GetScraperConfigsRow[]>;
}
