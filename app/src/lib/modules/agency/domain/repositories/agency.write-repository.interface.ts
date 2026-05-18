import { Agency } from "../agency.entity";

export interface AgencyWriteRepository {
  save(agency: Agency): Promise<number>;
  update(agency: Agency): Promise<void>;
  delete(id: number): Promise<void>;
  listingCount(id: number): Promise<number>;
}
