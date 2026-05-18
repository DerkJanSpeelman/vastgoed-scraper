import { GetListingByIdDto, ListingImageDto, ListingPriceDto } from "./get-listing-by-id.dto";
import { GetListingByIdRow } from "./get-listing-by-id.row";
import { GetListingImageRow } from "./get-listing-image.row";
import { GetListingPriceRow } from "./get-listing-price.row";

export function toListingImageDto(row: GetListingImageRow): ListingImageDto {
  return {
    id:          row.id,
    url:         row.url,
    sortOrder:   row.sort_order,
    isFloorPlan: row.is_floor_plan,
  };
}

export function toListingPriceDto(row: GetListingPriceRow): ListingPriceDto {
  return {
    id:          row.id,
    amount:      row.amount,
    priceTypeId: row.price_type_id,
    scrapedAt:   row.scraped_at.toISOString(),
  };
}

export function toGetListingByIdDto(
  row: GetListingByIdRow,
  images: GetListingImageRow[],
  prices: GetListingPriceRow[],
): GetListingByIdDto {
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
    description:         row.description,
    yearBuilt:           row.year_built,
    sourceUrl:           row.source_url,
    createdAt:           row.created_at.toISOString(),
    updatedAt:           row.updated_at.toISOString(),
    currentPrice:        row.current_price,
    priceTypeId:         row.price_type_id,
    images:              images.map(toListingImageDto),
    prices:              prices.map(toListingPriceDto),
  };
}
