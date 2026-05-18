import { NotFoundError } from '@/lib/errors';
import type { GetScraperRunsDto } from '../get-scraper-runs/get-scraper-runs.dto';
import { ScraperRunReadRepository } from '../get-scraper-runs/get-scraper-runs.read-repository';
import { toGetScraperRunsDto } from '../get-scraper-runs/get-scraper-runs.mapper';
import { GetScraperRunByIdQuery } from './get-scraper-run-by-id.query';

export class GetScraperRunByIdHandler {
  constructor(private readonly repo: ScraperRunReadRepository) {}

  async execute(query: GetScraperRunByIdQuery): Promise<GetScraperRunsDto> {
    const row = await this.repo.findById(query.id);
    if (!row) throw new NotFoundError(`Scraper run ${query.id} niet gevonden`);
    return toGetScraperRunsDto(row);
  }
}
