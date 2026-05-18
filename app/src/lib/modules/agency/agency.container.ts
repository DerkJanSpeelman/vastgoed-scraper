import { AgencyReadRepositoryImpl } from "./infrastructure/persistence/agency.read-repository.impl";
import { AgencyWriteRepositoryImpl } from "./infrastructure/persistence/agency.write-repository.impl";
import { GetAgenciesHandler } from "./application/queries/get-agencies/get-agencies.handler";
import { GetAgencyByIdHandler } from "./application/queries/get-agency-by-id/get-agency-by-id.handler";
import { CreateAgencyHandler } from "./application/commands/create-agency/create-agency.handler";
import { UpdateAgencyHandler } from "./application/commands/update-agency/update-agency.handler";
import { DeleteAgencyHandler } from "./application/commands/delete-agency/delete-agency.handler";

const agencyReadRepo = new AgencyReadRepositoryImpl();
const agencyWriteRepo = new AgencyWriteRepositoryImpl();

export const getAgenciesHandler = new GetAgenciesHandler(agencyReadRepo);
export const getAgencyByIdHandler = new GetAgencyByIdHandler(agencyReadRepo);
export const createAgencyHandler = new CreateAgencyHandler(agencyWriteRepo);
export const updateAgencyHandler = new UpdateAgencyHandler(agencyWriteRepo);
export const deleteAgencyHandler = new DeleteAgencyHandler(agencyWriteRepo);
