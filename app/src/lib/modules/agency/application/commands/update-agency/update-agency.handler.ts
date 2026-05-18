import { AppError } from "@/lib/errors";
import { Agency } from "@/lib/modules/agency/domain/agency.entity";
import { AgencyNotFoundError } from "@/lib/modules/agency/domain/errors";
import { AgencyWriteRepository } from "@/lib/modules/agency/domain/repositories/agency.write-repository.interface";
import { UpdateAgencyCommand } from "./update-agency.command";

export class UpdateAgencyHandler {
  constructor(private readonly repo: AgencyWriteRepository) {}

  async execute(command: UpdateAgencyCommand): Promise<void> {
    try {
      const existing = await this.repo.findById(command.id);
      if (!existing) throw new AgencyNotFoundError(command.id);

      const validated = Agency.create(command.name, command.websiteUrl, command.dataSource);
      const updated = Agency.existing(
        command.id,
        validated.name,
        validated.websiteUrl,
        existing.isDemo,
        validated.dataSource,
        existing.createdAt,
        new Date(),
      );
      await this.repo.update(updated);
    } catch (e) {
      if (e instanceof AppError) throw e;
      console.error("[UpdateAgencyHandler] Unexpected error", { id: command.id }, e);
      throw new AppError("Er is iets misgegaan", 500);
    }
  }
}
