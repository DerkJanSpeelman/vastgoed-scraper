import { ScraperRun } from "../scraper-run.entity";

export interface ScraperRunWriteRepository {
  save(run: ScraperRun): Promise<number>;
}
