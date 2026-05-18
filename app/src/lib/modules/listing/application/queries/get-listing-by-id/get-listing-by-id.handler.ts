import { GetListingByIdDto } from "./get-listing-by-id.dto";
import { ListingReadRepository } from "../get-listings/get-listings.read-repository";
import { toGetListingByIdDto } from "./get-listing-by-id.mapper";

export class GetListingByIdHandler {
  constructor(private readonly repo: ListingReadRepository) {}

  async execute(id: number): Promise<GetListingByIdDto | null> {
    const row = await this.repo.findById(id);
    if (!row) return null;
    const [images, prices] = await Promise.all([
      this.repo.findImagesByListingId(id),
      this.repo.findPricesByListingId(id),
    ]);
    return toGetListingByIdDto(row, images, prices);
  }
}
