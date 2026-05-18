import { Agency } from "./agency.entity";
import { ValidationError } from "@/lib/errors";

describe("Agency", () => {
  describe("create()", () => {
    it("creates agency with trimmed name and null websiteUrl when empty", () => {
      const a = Agency.create("  Demo Makelaars  ", "", "scraper");
      expect(a.id).toBe(0);
      expect(a.name).toBe("Demo Makelaars");
      expect(a.websiteUrl).toBeNull();
      expect(a.isDemo).toBe(false);
      expect(a.dataSource).toBe("scraper");
    });

    it("throws ValidationError for empty name", () => {
      expect(() => Agency.create("", null, "scraper")).toThrow(ValidationError);
      expect(() => Agency.create("   ", null, "scraper")).toThrow(ValidationError);
    });

    it("throws ValidationError for name over 200 chars", () => {
      expect(() => Agency.create("a".repeat(201), null, "scraper")).toThrow(ValidationError);
    });

    it("preserves websiteUrl when provided", () => {
      const a = Agency.create("Test", "https://example.com", "scraper");
      expect(a.websiteUrl).toBe("https://example.com");
    });
  });

  describe("existing()", () => {
    it("preserves all supplied values including isDemo", () => {
      const now = new Date();
      const a = Agency.existing(5, "Demo", null, true, "mailing_list", now, now);
      expect(a.id).toBe(5);
      expect(a.isDemo).toBe(true);
      expect(a.dataSource).toBe("mailing_list");
    });
  });
});
