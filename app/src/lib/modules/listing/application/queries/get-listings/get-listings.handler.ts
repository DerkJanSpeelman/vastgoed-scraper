import { GetListingsDto } from "./get-listings.dto";
import { GetListingsQuery } from "./get-listings.query";
import { ListingReadRepository } from "./get-listings.read-repository";
import { toGetListingsDto } from "./get-listings.mapper";

export class GetListingsHandler {
  constructor(private readonly repo: ListingReadRepository) {}

  async execute(query: GetListingsQuery): Promise<GetListingsDto[]> {
    const rows = await this.repo.findAll(query.filters, query.limit, query.offset);
    return rows.map(toGetListingsDto);
  }
}
