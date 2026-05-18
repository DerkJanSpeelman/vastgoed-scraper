import { ListingReadRepositoryImpl } from "./infrastructure/persistence/listing.read-repository.impl";
import { GetListingsHandler, GetListingStatsHandler } from "./application/queries/get-listings/get-listings.handler";
import { GetListingByIdHandler } from "./application/queries/get-listing-by-id/get-listing-by-id.handler";

const listingReadRepository = new ListingReadRepositoryImpl();

export const listingContainer = {
  getListingsHandler:     new GetListingsHandler(listingReadRepository),
  getListingStatsHandler: new GetListingStatsHandler(listingReadRepository),
  getListingByIdHandler:  new GetListingByIdHandler(listingReadRepository),
};
