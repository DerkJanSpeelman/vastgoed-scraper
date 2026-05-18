import { formatPrice, formatPriceType, formatPricePerM2, isNieuwbouw } from "./listing-formatters";

describe("formatPrice", () => {
  it("formats a price in Dutch locale", () => {
    expect(formatPrice(1450000)).toBe("€ 1.450.000,-");
  });

  it("returns — for null", () => {
    expect(formatPrice(null)).toBe("—");
  });
});

describe("formatPriceType", () => {
  it("returns k.k. for id 1", () => {
    expect(formatPriceType(1)).toBe("k.k.");
  });

  it("returns v.o.n. for id 2", () => {
    expect(formatPriceType(2)).toBe("v.o.n.");
  });

  it("returns empty string for null", () => {
    expect(formatPriceType(null)).toBe("");
  });
});

describe("formatPricePerM2", () => {
  it("calculates price per m2", () => {
    expect(formatPricePerM2(1450000, 150)).toBe("€ 9.667");
  });

  it("returns — when price is null", () => {
    expect(formatPricePerM2(null, 150)).toBe("—");
  });

  it("returns — when m2 is null", () => {
    expect(formatPricePerM2(1450000, null)).toBe("—");
  });
});

describe("isNieuwbouw", () => {
  it("returns true for property_type_id 2", () => {
    expect(isNieuwbouw(2)).toBe(true);
  });

  it("returns false for property_type_id 1", () => {
    expect(isNieuwbouw(1)).toBe(false);
  });
});
