import { GetAgenciesRow } from "./get-agencies.row";

export interface AgencyReadRepository {
  findAll(): Promise<GetAgenciesRow[]>;
  findById(id: number): Promise<GetAgenciesRow | null>;
}
