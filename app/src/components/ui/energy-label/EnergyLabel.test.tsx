import { render, screen } from "@testing-library/react";
import { EnergyLabel } from "./EnergyLabel";

describe("EnergyLabel", () => {
  it("renders the label text", () => {
    render(<EnergyLabel label="A" />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders — when label is null", () => {
    render(<EnergyLabel label={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders A++ without breaking", () => {
    render(<EnergyLabel label="A++" />);
    expect(screen.getByText("A++")).toBeInTheDocument();
  });
});
