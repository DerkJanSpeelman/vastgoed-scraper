import { render, screen } from "@testing-library/react";
import { ListingGallery } from "./ListingGallery";
import { ListingImageDto } from "@/lib/modules/listing/application/queries/get-listing-by-id/get-listing-by-id.dto";

const photos: ListingImageDto[] = [
  { id: 1, url: "https://example.com/1.jpg", sortOrder: 0, isFloorPlan: false },
  { id: 2, url: "https://example.com/2.jpg", sortOrder: 1, isFloorPlan: false },
];

const floorPlans: ListingImageDto[] = [
  { id: 3, url: "https://example.com/fp.jpg", sortOrder: 10, isFloorPlan: true },
];

describe("ListingGallery", () => {
  it("renders floor plan label when floor plans are provided", () => {
    render(<ListingGallery images={[...photos, ...floorPlans]} address="Apollolaan 154" />);
    expect(screen.getByText("Plattegrond 1")).toBeInTheDocument();
  });

  it("shows empty state when no floor plans", () => {
    render(<ListingGallery images={photos} address="Apollolaan 154" />);
    expect(screen.getByText("Geen plattegronden beschikbaar")).toBeInTheDocument();
  });

  it("renders empty gallery when no images", () => {
    render(<ListingGallery images={[]} address="Apollolaan 154" />);
    expect(screen.getByText("Geen plattegronden beschikbaar")).toBeInTheDocument();
  });
});
