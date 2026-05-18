import { GetProvincesRow } from "./get-provinces.row";

export interface LocationReadRepository {
  findAllProvinces(): Promise<GetProvincesRow[]>;
}
