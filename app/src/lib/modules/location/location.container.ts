import { LocationReadRepositoryImpl } from "./infrastructure/persistence/location.read-repository.impl";
import { GetProvincesHandler } from "./application/queries/get-provinces/get-provinces.handler";

const locationReadRepository = new LocationReadRepositoryImpl();

export const locationContainer = {
  getProvincesHandler: new GetProvincesHandler(locationReadRepository),
};
