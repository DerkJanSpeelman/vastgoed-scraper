export interface GetListingsFilters {
  propertyTypeId?: number;
  isStilleVerkoop?: boolean;
  provinceId?: number;
}

export class GetListingsQuery {
  constructor(
    readonly filters: GetListingsFilters = {},
    readonly limit: number = 50,
    readonly offset: number = 0,
  ) {}
}
