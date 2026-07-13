import { GetScraperRunsDto } from "./get-scraper-runs.dto";
import { GetScraperRunsQuery } from "./get-scraper-runs.query";
import { ScraperRunReadRepository } from "./get-scraper-runs.read-repository";
import { toGetScraperRunsDto } from "./get-scraper-runs.mapper";

export class GetScraperRunsHandler {
  constructor(private readonly repo: ScraperRunReadRepository) {}

  async execute(query: GetScraperRunsQuery): Promise<GetScraperRunsDto[]> {
    const rows = await this.repo.findAll(query.agencyId);
    return rows.map(toGetScraperRunsDto);
  }
}
