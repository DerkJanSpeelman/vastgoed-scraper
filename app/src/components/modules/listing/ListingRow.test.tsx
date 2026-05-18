import { render, screen } from "@testing-library/react";
import { ListingRow } from "./ListingRow";
import { GetListingsDto } from "@/lib/modules/listing/application/queries/get-listings/get-listings.dto";

const baseListing: GetListingsDto = {
  id: 1,
  street: "Apollolaan",
  houseNumber: "154",
  houseNumberAddition: null,
  cityName: "Amsterdam-Zuid",
  municipalityName: "Amsterdam",
  provinceName: "Noord-Holland",
  provinceCode: "NH",
  agencyId: 1,
  agencyName: "Brecheisen Makelaars",
  agencyWebsiteUrl: "https://www.brecheisen.nl",
  propertyTypeId: 1,
  isStilleVerkoop: false,
  livingAreaM2: 150,
  plotAreaM2: null,
  bedrooms: 4,
  energyLabel: "B",
  yearBuilt: 1928,
  createdAt: "2026-05-18T08:00:00.000Z",
  currentPrice: 1450000,
  priceTypeId: 1,
  thumbnailUrl: null,
  imageCount: 5,
  floorPlanCount: 2,
};

describe("ListingRow", () => {
  it("renders the address", () => {
    render(<ListingRow listing={baseListing} />);
    expect(screen.getByText("Apollolaan 154")).toBeInTheDocument();
  });

  it("renders municipality and province", () => {
    render(<ListingRow listing={baseListing} />);
    expect(screen.getByText(/Amsterdam/)).toBeInTheDocument();
    expect(screen.getByText(/Noord-Holland/)).toBeInTheDocument();
  });

  it("renders price", () => {
    render(<ListingRow listing={baseListing} />);
    expect(screen.getByText("€ 1.450.000,-")).toBeInTheDocument();
  });

  it("shows nieuwbouw badge when propertyTypeId is 2", () => {
    render(<ListingRow listing={{ ...baseListing, propertyTypeId: 2 }} />);
    expect(screen.getByText("Nieuwbouw")).toBeInTheDocument();
  });

  it("shows stille verkoop badge", () => {
    render(<ListingRow listing={{ ...baseListing, isStilleVerkoop: true }} />);
    expect(screen.getByText("Stille verkoop")).toBeInTheDocument();
  });

  it("renders placeholder stat when livingAreaM2 is null", () => {
    render(<ListingRow listing={{ ...baseListing, livingAreaM2: null }} />);
    const placeholders = screen.getAllByText("—");
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it("links to detail page", () => {
    render(<ListingRow listing={baseListing} />);
    const link = screen.getByRole("link", { name: "Apollolaan 154" });
    expect(link).toHaveAttribute("href", "/listings/1");
  });
});
