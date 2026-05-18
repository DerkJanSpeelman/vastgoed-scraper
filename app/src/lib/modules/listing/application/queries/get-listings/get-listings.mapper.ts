import { GetListingsDto } from "./get-listings.dto";
import { GetListingsRow } from "./get-listings.row";

export function toGetListingsDto(row: GetListingsRow): GetListingsDto {
  return {
    id:                  row.id,
    street:              row.street,
    houseNumber:         row.house_number,
    houseNumberAddition: row.house_number_addition,
    cityName:            row.city_name,
    municipalityName:    row.municipality_name,
    provinceName:        row.province_name,
    provinceCode:        row.province_code,
    agencyId:            row.agency_id,
    agencyName:          row.agency_name,
    agencyWebsiteUrl:    row.agency_website_url,
    propertyTypeId:      row.property_type_id,
    isStilleVerkoop:     row.is_stille_verkoop,
    livingAreaM2:        row.living_area_m2,
    plotAreaM2:          row.plot_area_m2,
    bedrooms:            row.bedrooms,
    energyLabel:         row.energy_label,
    yearBuilt:           row.year_built,
    createdAt:           row.created_at.toISOString(),
    currentPrice:        row.current_price,
    priceTypeId:         row.price_type_id,
    thumbnailUrl:        row.thumbnail_url,
    imageCount:          row.image_count,
    floorPlanCount:      row.floor_plan_count,
  };
}
