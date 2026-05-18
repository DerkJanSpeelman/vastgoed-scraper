export interface ListingImageDto {
  id:          number;
  url:         string;
  sortOrder:   number;
  isFloorPlan: boolean;
}

export interface ListingPriceDto {
  id:          number;
  amount:      number;
  priceTypeId: number;
  scrapedAt:   string;
}

export interface GetListingByIdDto {
  id:                    number;
  street:                string;
  houseNumber:           string;
  houseNumberAddition:   string | null;
  cityName:              string;
  municipalityName:      string;
  provinceName:          string;
  provinceCode:          string;
  agencyId:              number | null;
  agencyName:            string | null;
  agencyWebsiteUrl:      string | null;
  propertyTypeId:        number;
  isStilleVerkoop:       boolean;
  livingAreaM2:          number | null;
  plotAreaM2:            number | null;
  bedrooms:              number | null;
  energyLabel:           string | null;
  description:           string | null;
  yearBuilt:             number | null;
  sourceUrl:             string;
  createdAt:             string;
  updatedAt:             string;
  currentPrice:          number | null;
  priceTypeId:           number | null;
  images:                ListingImageDto[];
  prices:                ListingPriceDto[];
}
