import { toGetListingsDto } from "./get-listings.mapper";
import { GetListingsRow } from "./get-listings.row";

const baseRow: GetListingsRow = {
  id: 1,
  street: "Apollolaan",
  house_number: "154",
  house_number_addition: null,
  city_name: "Amsterdam-Zuid",
  municipality_name: "Amsterdam",
  province_name: "Noord-Holland",
  province_code: "NH",
  agency_id: 1,
  agency_name: "Brecheisen Makelaars",
  agency_website_url: "https://www.brecheisen.nl",
  agency_is_demo: false,
  property_type_id: 1,
  is_stille_verkoop: true,
  living_area_m2: 150,
  plot_area_m2: null,
  bedrooms: 4,
  energy_label: "B",
  year_built: 1928,
  created_at: new Date("2026-05-18T08:00:00Z"),
  current_price: 1450000,
  price_type_id: 1,
  thumbnail_url: "https://example.com/img.jpg",
  image_count: 14,
  floor_plan_count: 3,
};

describe("toGetListingsDto", () => {
  it("maps all fields correctly", () => {
    const dto = toGetListingsDto(baseRow);
    expect(dto.id).toBe(1);
    expect(dto.street).toBe("Apollolaan");
    expect(dto.houseNumber).toBe("154");
    expect(dto.houseNumberAddition).toBeNull();
    expect(dto.cityName).toBe("Amsterdam-Zuid");
    expect(dto.municipalityName).toBe("Amsterdam");
    expect(dto.provinceName).toBe("Noord-Holland");
    expect(dto.provinceCode).toBe("NH");
    expect(dto.agencyName).toBe("Brecheisen Makelaars");
    expect(dto.propertyTypeId).toBe(1);
    expect(dto.isStilleVerkoop).toBe(true);
    expect(dto.livingAreaM2).toBe(150);
    expect(dto.plotAreaM2).toBeNull();
    expect(dto.bedrooms).toBe(4);
    expect(dto.energyLabel).toBe("B");
    expect(dto.currentPrice).toBe(1450000);
    expect(dto.priceTypeId).toBe(1);
    expect(dto.imageCount).toBe(14);
    expect(dto.floorPlanCount).toBe(3);
    expect(dto.createdAt).toBe("2026-05-18T08:00:00.000Z");
  });

  it("handles null optional fields", () => {
    const row: GetListingsRow = {
      ...baseRow,
      agency_id: null,
      agency_name: null,
      agency_website_url: null,
      current_price: null,
      price_type_id: null,
      thumbnail_url: null,
    };
    const dto = toGetListingsDto(row);
    expect(dto.agencyId).toBeNull();
    expect(dto.agencyName).toBeNull();
    expect(dto.currentPrice).toBeNull();
    expect(dto.thumbnailUrl).toBeNull();
  });
});
