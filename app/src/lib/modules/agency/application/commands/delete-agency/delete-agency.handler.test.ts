import { DeleteAgencyHandler } from "./delete-agency.handler";
import { DeleteAgencyCommand } from "./delete-agency.command";
import { AgencyHasListingsError } from "@/lib/modules/agency/domain/errors";
import { AgencyWriteRepository } from "@/lib/modules/agency/domain/repositories/agency.write-repository.interface";

function makeRepo(listingCount: number): AgencyWriteRepository {
  return {
    save: jest.fn().mockResolvedValue(1),
    findById: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    listingCount: jest.fn().mockResolvedValue(listingCount),
  };
}

describe("DeleteAgencyHandler", () => {
  it("deletes the agency when it has no listings", async () => {
    const repo = makeRepo(0);
    const handler = new DeleteAgencyHandler(repo);
    await handler.execute(new DeleteAgencyCommand(5));
    expect(repo.delete).toHaveBeenCalledWith(5);
  });

  it("throws AgencyHasListingsError when listings exist", async () => {
    const repo = makeRepo(3);
    const handler = new DeleteAgencyHandler(repo);
    await expect(handler.execute(new DeleteAgencyCommand(5))).rejects.toThrow(AgencyHasListingsError);
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
