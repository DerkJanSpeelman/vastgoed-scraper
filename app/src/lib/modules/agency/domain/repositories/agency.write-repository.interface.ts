import { Agency } from "../agency.entity";

export interface AgencyWriteRepository {
  save(agency: Agency): Promise<number>;
  findById(id: number): Promise<Agency | null>;
  update(agency: Agency): Promise<void>;
  delete(id: number): Promise<void>;
  listingCount(id: number): Promise<number>;
}
