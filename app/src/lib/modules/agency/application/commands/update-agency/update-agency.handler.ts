import { AppError } from "@/lib/errors";
import { Agency } from "@/lib/modules/agency/domain/agency.entity";
import { AgencyNotFoundError } from "@/lib/modules/agency/domain/errors";
import { AgencyWriteRepository } from "@/lib/modules/agency/domain/repositories/agency.write-repository.interface";
import { UpdateAgencyCommand } from "./update-agency.command";

export class UpdateAgencyHandler {
  constructor(private readonly repo: AgencyWriteRepository) {}

  async execute(command: UpdateAgencyCommand): Promise<void> {
    try {
      const agency = Agency.create(command.name, command.websiteUrl, command.dataSource);
      const withId = Agency.existing(
        command.id,
        agency.name,
        agency.websiteUrl,
        false,
        agency.dataSource,
        new Date(),
        new Date(),
      );
      await this.repo.update(withId);
    } catch (e) {
      if (e instanceof AppError) throw e;
      console.error("[UpdateAgencyHandler] Unexpected error", { id: command.id }, e);
      throw new AppError("Er is iets misgegaan", 500);
    }
  }
}

export { AgencyNotFoundError };
