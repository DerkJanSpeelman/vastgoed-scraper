import { AppError } from "@/lib/errors";
import { ScraperConfig } from "../../../domain/scraper-config.entity";
import { ScraperConfigWriteRepository } from "../../../domain/repositories/scraper-config.repository.interface";
import { UpsertScraperConfigCommand } from "./upsert-scraper-config.command";

export class UpsertScraperConfigHandler {
  constructor(private readonly repo: ScraperConfigWriteRepository) {}

  async execute(command: UpsertScraperConfigCommand): Promise<number> {
    try {
      const config = ScraperConfig.create(command.agencyId, command.type);
      return await this.repo.save(config);
    } catch (e) {
      if (e instanceof AppError) throw e;
      console.error("[UpsertScraperConfigHandler] Unexpected error", e);
      throw new AppError("An unexpected error occurred", 500);
    }
  }
}
