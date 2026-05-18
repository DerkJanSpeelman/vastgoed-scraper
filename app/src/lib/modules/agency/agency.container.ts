import { AgencyReadRepositoryImpl } from "./infrastructure/persistence/agency.read-repository.impl";
import { GetAgenciesHandler } from "./application/queries/get-agencies/get-agencies.handler";

const agencyReadRepo = new AgencyReadRepositoryImpl();

export const getAgenciesHandler = new GetAgenciesHandler(agencyReadRepo);
