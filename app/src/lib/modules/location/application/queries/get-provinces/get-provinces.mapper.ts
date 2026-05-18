import { GetProvincesDto } from "./get-provinces.dto";
import { GetProvincesRow } from "./get-provinces.row";

export function toGetProvincesDto(row: GetProvincesRow): GetProvincesDto {
  return { id: row.id, name: row.name, code: row.code };
}
