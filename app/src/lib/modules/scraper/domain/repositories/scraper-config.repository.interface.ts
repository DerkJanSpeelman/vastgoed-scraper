import { ScraperConfig } from "../scraper-config.entity";

export interface ScraperConfigWriteRepository {
  save(config: ScraperConfig): Promise<number>;
  update(config: ScraperConfig): Promise<void>;
}
