import { AppError } from "@/lib/errors";
import { Agency } from "@/lib/modules/agency/domain/agency.entity";
import { AgencyWriteRepository } from "@/lib/modules/agency/domain/repositories/agency.write-repository.interface";
import { CreateAgencyCommand } from "./create-agency.command";

export class CreateAgencyHandler {
  constructor(private readonly repo: AgencyWriteRepository) {}

  async execute(command: CreateAgencyCommand): Promise<number> {
    try {
      const agency = Agency.create(command.name, command.websiteUrl, command.dataSource);
      return await this.repo.save(agency);
    } catch (e) {
      if (e instanceof AppError) throw e;
      console.error("[CreateAgencyHandler] Unexpected error", e);
      throw new AppError("Er is iets misgegaan", 500);
    }
  }
}
