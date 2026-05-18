import { AppError } from "@/lib/errors";
import { AgencyHasListingsError } from "@/lib/modules/agency/domain/errors";
import { AgencyWriteRepository } from "@/lib/modules/agency/domain/repositories/agency.write-repository.interface";
import { DeleteAgencyCommand } from "./delete-agency.command";

export class DeleteAgencyHandler {
  constructor(private readonly repo: AgencyWriteRepository) {}

  async execute(command: DeleteAgencyCommand): Promise<void> {
    try {
      const count = await this.repo.listingCount(command.id);
      if (count > 0) throw new AgencyHasListingsError();
      await this.repo.delete(command.id);
    } catch (e) {
      if (e instanceof AppError) throw e;
      console.error("[DeleteAgencyHandler] Unexpected error", { id: command.id }, e);
      throw new AppError("Er is iets misgegaan", 500);
    }
  }
}
