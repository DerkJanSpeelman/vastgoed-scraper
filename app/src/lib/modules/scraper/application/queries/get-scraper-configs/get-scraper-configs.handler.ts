import { GetScraperConfigsDto } from "./get-scraper-configs.dto";
import { GetScraperConfigsQuery } from "./get-scraper-configs.query";
import { ScraperConfigReadRepository } from "./get-scraper-configs.read-repository";
import { toGetScraperConfigsDto } from "./get-scraper-configs.mapper";

export class GetScraperConfigsHandler {
  constructor(private readonly repo: ScraperConfigReadRepository) {}

  async execute(query: GetScraperConfigsQuery): Promise<GetScraperConfigsDto[]> {
    const rows = await this.repo.findByAgencyId(query.agencyId);
    return rows.map(toGetScraperConfigsDto);
  }
}
