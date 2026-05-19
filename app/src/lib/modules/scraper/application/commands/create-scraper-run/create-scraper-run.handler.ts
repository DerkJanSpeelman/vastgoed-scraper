import { AppError } from "@/lib/errors";
import { ScraperRun } from "../../../domain/scraper-run.entity";
import { ScraperRunWriteRepository } from "../../../domain/repositories/scraper-run.repository.interface";
import { CreateScraperRunCommand } from "./create-scraper-run.command";

export class CreateScraperRunHandler {
  constructor(private readonly repo: ScraperRunWriteRepository) {}

  async execute(command: CreateScraperRunCommand): Promise<number> {
    try {
      const run = ScraperRun.create(command.scraperConfigId, command.agencyId, command.triggeredBy, command.inputUri);
      return await this.repo.save(run);
    } catch (e) {
      if (e instanceof AppError) throw e;
      console.error("[CreateScraperRunHandler] Unexpected error", e);
      throw new AppError("An unexpected error occurred", 500);
    }
  }
}
