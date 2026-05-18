import { GetAgenciesRow } from "./get-agencies.row";

export interface AgencyReadRepository {
  findAll(): Promise<GetAgenciesRow[]>;
}
