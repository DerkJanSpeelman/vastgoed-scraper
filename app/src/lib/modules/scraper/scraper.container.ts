import { ScraperReadRepositoryImpl } from "./infrastructure/persistence/scraper.read-repository.impl";
import { ScraperConfigWriteRepositoryImpl, ScraperRunWriteRepositoryImpl } from "./infrastructure/persistence/scraper.write-repository.impl";
import { GetScraperConfigsHandler } from "./application/queries/get-scraper-configs/get-scraper-configs.handler";
import { GetScraperRunsHandler } from "./application/queries/get-scraper-runs/get-scraper-runs.handler";
import { UpsertScraperConfigHandler } from "./application/commands/upsert-scraper-config/upsert-scraper-config.handler";
import { CreateScraperRunHandler } from "./application/commands/create-scraper-run/create-scraper-run.handler";

const scraperReadRepository = new ScraperReadRepositoryImpl();
const scraperConfigWriteRepository = new ScraperConfigWriteRepositoryImpl();
const scraperRunWriteRepository = new ScraperRunWriteRepositoryImpl();

export const scraperContainer = {
  getScraperConfigsHandler: new GetScraperConfigsHandler(scraperReadRepository),
  getScraperRunsHandler: new GetScraperRunsHandler(scraperReadRepository),
  upsertScraperConfigHandler: new UpsertScraperConfigHandler(scraperConfigWriteRepository),
  createScraperRunHandler: new CreateScraperRunHandler(scraperRunWriteRepository),
};
