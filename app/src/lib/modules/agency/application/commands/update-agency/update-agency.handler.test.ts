import { UpdateAgencyHandler } from "./update-agency.handler";
import { UpdateAgencyCommand } from "./update-agency.command";
import { ValidationError } from "@/lib/errors";
import { AgencyWriteRepository } from "@/lib/modules/agency/domain/repositories/agency.write-repository.interface";

const mockRepo: AgencyWriteRepository = {
  save: jest.fn().mockResolvedValue(1),
  update: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
  listingCount: jest.fn().mockResolvedValue(0),
};

describe("UpdateAgencyHandler", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls repo.update with the updated agency", async () => {
    const handler = new UpdateAgencyHandler(mockRepo);
    await handler.execute(new UpdateAgencyCommand(3, "Nieuw Naam", null, "mailing_list"));
    expect(mockRepo.update).toHaveBeenCalledTimes(1);
    const saved = (mockRepo.update as jest.Mock).mock.calls[0][0];
    expect(saved.id).toBe(3);
    expect(saved.name).toBe("Nieuw Naam");
    expect(saved.dataSource).toBe("mailing_list");
  });

  it("propagates ValidationError for empty name", async () => {
    const handler = new UpdateAgencyHandler(mockRepo);
    await expect(handler.execute(new UpdateAgencyCommand(3, "", null, "scraper"))).rejects.toThrow(ValidationError);
    expect(mockRepo.update).not.toHaveBeenCalled();
  });
});
