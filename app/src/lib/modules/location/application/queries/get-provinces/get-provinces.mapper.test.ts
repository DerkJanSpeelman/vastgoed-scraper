import { toGetProvincesDto } from "./get-provinces.mapper";
import { GetProvincesRow } from "./get-provinces.row";

describe("toGetProvincesDto", () => {
  it("maps id, name, and code", () => {
    const row: GetProvincesRow = { id: 1, name: "Noord-Holland", code: "NH" };
    const dto = toGetProvincesDto(row);
    expect(dto.id).toBe(1);
    expect(dto.name).toBe("Noord-Holland");
    expect(dto.code).toBe("NH");
  });
});
