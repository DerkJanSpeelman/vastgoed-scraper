import { GetListingsDto } from "./get-listings.dto";
import { GetListingsQuery } from "./get-listings.query";
import { ListingReadRepository, ListingStats } from "./get-listings.read-repository";
import { toGetListingsDto } from "./get-listings.mapper";

export interface GetListingsResult {
  items: GetListingsDto[];
  total: number;
}

export class GetListingsHandler {
  constructor(private readonly repo: ListingReadRepository) {}

  async execute(query: GetListingsQuery): Promise<GetListingsResult> {
    const [rows, total] = await Promise.all([
      this.repo.findAll(query.filters, query.sortBy, query.limit, query.offset),
      this.repo.findCount(query.filters),
    ]);
    return { items: rows.map(toGetListingsDto), total };
  }
}

export class GetListingStatsHandler {
  constructor(private readonly repo: ListingReadRepository) {}

  async execute(): Promise<ListingStats> {
    return this.repo.findStats();
  }
}
