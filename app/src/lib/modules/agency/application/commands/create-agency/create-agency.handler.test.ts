import { CreateAgencyHandler } from "./create-agency.handler";
import { CreateAgencyCommand } from "./create-agency.command";
import { ValidationError } from "@/lib/errors";
import { AgencyWriteRepository } from "@/lib/modules/agency/domain/repositories/agency.write-repository.interface";

const mockRepo: AgencyWriteRepository = {
  save: jest.fn().mockResolvedValue(42),
  update: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
  listingCount: jest.fn().mockResolvedValue(0),
};

describe("CreateAgencyHandler", () => {
  beforeEach(() => jest.clearAllMocks());

  it("saves a new agency and returns the id", async () => {
    const handler = new CreateAgencyHandler(mockRepo);
    const id = await handler.execute(new CreateAgencyCommand("Test Makelaars", "https://test.nl", "scraper"));
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(id).toBe(42);
  });

  it("propagates ValidationError for empty name", async () => {
    const handler = new CreateAgencyHandler(mockRepo);
    await expect(handler.execute(new CreateAgencyCommand("", null, "scraper"))).rejects.toThrow(ValidationError);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
