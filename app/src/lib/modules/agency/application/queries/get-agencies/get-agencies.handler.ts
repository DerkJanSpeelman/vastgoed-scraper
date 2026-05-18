import { GetAgenciesDto } from "./get-agencies.dto";
import { AgencyReadRepository } from "./get-agencies.read-repository";
import { toGetAgenciesDto } from "./get-agencies.mapper";

export class GetAgenciesHandler {
  constructor(private readonly repo: AgencyReadRepository) {}

  async execute(): Promise<GetAgenciesDto[]> {
    const rows = await this.repo.findAll();
    return rows.map(toGetAgenciesDto);
  }
}
