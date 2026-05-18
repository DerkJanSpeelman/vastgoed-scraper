export interface GetListingsDto {
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
  yearBuilt:             number | null;
  createdAt:             string;
  currentPrice:          number | null;
  priceTypeId:           number | null;
  thumbnailUrl:          string | null;
  imageCount:            number;
  floorPlanCount:        number;
}
