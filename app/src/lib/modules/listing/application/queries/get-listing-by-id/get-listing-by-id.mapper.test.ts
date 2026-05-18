import { toGetListingByIdDto } from "./get-listing-by-id.mapper";
import { GetListingByIdRow } from "./get-listing-by-id.row";
import { GetListingImageRow } from "./get-listing-image.row";
import { GetListingPriceRow } from "./get-listing-price.row";

const baseRow: GetListingByIdRow = {
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
  property_type_id: 1,
  is_stille_verkoop: true,
  living_area_m2: 150,
  plot_area_m2: null,
  bedrooms: 4,
  energy_label: "B",
  description: "Een mooie woning.",
  year_built: 1928,
  source_url: "intern://feed/brecheisen/4821",
  created_at: new Date("2026-05-18T08:00:00Z"),
  updated_at: new Date("2026-05-18T09:00:00Z"),
  current_price: 1450000,
  price_type_id: 1,
};

const imageRows: GetListingImageRow[] = [
  { id: 1, url: "https://example.com/1.jpg", sort_order: 0, is_floor_plan: false },
  { id: 2, url: "https://example.com/fp.jpg", sort_order: 10, is_floor_plan: true },
];

const priceRows: GetListingPriceRow[] = [
  { id: 1, amount: 1450000, price_type_id: 1, scraped_at: new Date("2026-05-18T08:00:00Z") },
];

describe("toGetListingByIdDto", () => {
  it("maps listing with images and prices", () => {
    const dto = toGetListingByIdDto(baseRow, imageRows, priceRows);
    expect(dto.id).toBe(1);
    expect(dto.description).toBe("Een mooie woning.");
    expect(dto.images).toHaveLength(2);
    expect(dto.images[0].isFloorPlan).toBe(false);
    expect(dto.images[1].isFloorPlan).toBe(true);
    expect(dto.prices).toHaveLength(1);
    expect(dto.prices[0].amount).toBe(1450000);
    expect(dto.createdAt).toBe("2026-05-18T08:00:00.000Z");
  });

  it("handles empty images and prices", () => {
    const dto = toGetListingByIdDto(baseRow, [], []);
    expect(dto.images).toHaveLength(0);
    expect(dto.prices).toHaveLength(0);
  });
});
