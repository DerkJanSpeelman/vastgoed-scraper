import { AgencyNotFoundError } from "@/lib/modules/agency/domain/errors";
import { GetAgenciesDto } from "../get-agencies/get-agencies.dto";
import { AgencyReadRepository } from "../get-agencies/get-agencies.read-repository";
import { toGetAgenciesDto } from "../get-agencies/get-agencies.mapper";
import { GetAgencyByIdQuery } from "./get-agency-by-id.query";

export class GetAgencyByIdHandler {
  constructor(private readonly repo: AgencyReadRepository) {}

  async execute(query: GetAgencyByIdQuery): Promise<GetAgenciesDto> {
    const row = await this.repo.findById(query.id);
    if (!row) throw new AgencyNotFoundError(query.id);
    return toGetAgenciesDto(row);
  }
}
