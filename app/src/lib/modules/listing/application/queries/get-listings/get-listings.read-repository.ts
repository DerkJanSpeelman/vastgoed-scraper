import { GetListingsFilters } from "./get-listings.query";
import { GetListingsRow } from "./get-listings.row";
import { GetListingByIdRow } from "../get-listing-by-id/get-listing-by-id.row";
import { GetListingImageRow } from "../get-listing-by-id/get-listing-image.row";
import { GetListingPriceRow } from "../get-listing-by-id/get-listing-price.row";

export interface ListingReadRepository {
  findAll(filters: GetListingsFilters, limit: number, offset: number): Promise<GetListingsRow[]>;
  findById(id: number): Promise<GetListingByIdRow | null>;
  findImagesByListingId(listingId: number): Promise<GetListingImageRow[]>;
  findPricesByListingId(listingId: number): Promise<GetListingPriceRow[]>;
}
