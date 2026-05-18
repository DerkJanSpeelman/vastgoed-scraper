export interface GetListingsFilters {
  isNieuwbouw?: boolean;
  isBestaandeBouw?: boolean;
  isStilleVerkoop?: boolean;
  provinceId?: number;
  municipalityIds?: number[];
  cityIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  minLivingArea?: number;
  maxLivingArea?: number;
  minPlotArea?: number;
  maxPlotArea?: number;
  energyLabels?: string[];
}

export type ListingsSortBy = "newest" | "price-asc" | "price-desc";

export class GetListingsQuery {
  constructor(
    readonly filters: GetListingsFilters = {},
    readonly sortBy: ListingsSortBy = "newest",
    readonly limit: number = 20,
    readonly offset: number = 0,
  ) {}
}
