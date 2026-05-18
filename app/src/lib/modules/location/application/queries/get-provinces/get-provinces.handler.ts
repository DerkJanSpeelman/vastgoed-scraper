import { GetProvincesDto } from "./get-provinces.dto";
import { LocationReadRepository } from "./get-provinces.read-repository";
import { toGetProvincesDto } from "./get-provinces.mapper";

export class GetProvincesHandler {
  constructor(private readonly repo: LocationReadRepository) {}

  async execute(): Promise<GetProvincesDto[]> {
    const rows = await this.repo.findAllProvinces();
    return rows.map(toGetProvincesDto);
  }
}
