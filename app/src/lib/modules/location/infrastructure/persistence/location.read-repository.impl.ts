import { sql } from "@/db/client";
import { LocationReadRepository } from "../../application/queries/get-provinces/get-provinces.read-repository";
import { GetProvincesRow } from "../../application/queries/get-provinces/get-provinces.row";

export class LocationReadRepositoryImpl implements LocationReadRepository {
  async findAllProvinces(): Promise<GetProvincesRow[]> {
    return sql<GetProvincesRow[]>`
      SELECT id, name, code FROM provinces ORDER BY name
    `;
  }
}
