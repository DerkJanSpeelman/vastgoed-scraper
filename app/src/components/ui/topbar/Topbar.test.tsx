import { render, screen } from "@testing-library/react";
import { Topbar } from "./Topbar";

describe("Topbar", () => {
  it("renders brand name", () => {
    render(<Topbar />);
    expect(screen.getByText(/Vastgoed Scraper/)).toBeInTheDocument();
  });

  it("shows listing count when provided", () => {
    render(<Topbar listingCount={42} />);
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });
});
