import { UpdateAgencyHandler } from "./update-agency.handler";
import { UpdateAgencyCommand } from "./update-agency.command";
import { ValidationError } from "@/lib/errors";
import { AgencyNotFoundError } from "@/lib/modules/agency/domain/errors";
import { AgencyWriteRepository } from "@/lib/modules/agency/domain/repositories/agency.write-repository.interface";
import { Agency } from "@/lib/modules/agency/domain/agency.entity";

const existingAgency = Agency.existing(3, "Oud Naam", null, true, "scraper", new Date(), new Date());

const mockRepo: AgencyWriteRepository = {
  save: jest.fn().mockResolvedValue(1),
  findById: jest.fn().mockResolvedValue(existingAgency),
  update: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
  listingCount: jest.fn().mockResolvedValue(0),
};

describe("UpdateAgencyHandler", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls repo.update preserving isDemo from the existing record", async () => {
    (mockRepo.findById as jest.Mock).mockResolvedValue(existingAgency);
    const handler = new UpdateAgencyHandler(mockRepo);
    await handler.execute(new UpdateAgencyCommand(3, "Nieuw Naam", null, "mailing_list"));
    expect(mockRepo.update).toHaveBeenCalledTimes(1);
    const saved = (mockRepo.update as jest.Mock).mock.calls[0][0];
    expect(saved.id).toBe(3);
    expect(saved.name).toBe("Nieuw Naam");
    expect(saved.dataSource).toBe("mailing_list");
    expect(saved.isDemo).toBe(true);
  });

  it("throws AgencyNotFoundError when agency does not exist", async () => {
    (mockRepo.findById as jest.Mock).mockResolvedValue(null);
    const handler = new UpdateAgencyHandler(mockRepo);
    await expect(handler.execute(new UpdateAgencyCommand(99, "Test", null, "scraper"))).rejects.toThrow(AgencyNotFoundError);
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it("propagates ValidationError for empty name", async () => {
    (mockRepo.findById as jest.Mock).mockResolvedValue(existingAgency);
    const handler = new UpdateAgencyHandler(mockRepo);
    await expect(handler.execute(new UpdateAgencyCommand(3, "", null, "scraper"))).rejects.toThrow(ValidationError);
    expect(mockRepo.update).not.toHaveBeenCalled();
  });
});
