import { render, screen } from "@testing-library/react";
import { StatItem } from "./StatItem";

describe("StatItem", () => {
  it("renders value and unit", () => {
    render(<StatItem icon={<span>icon</span>} value={150} unit="m²" />);
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("m²")).toBeInTheDocument();
  });

  it("renders placeholder when value is null", () => {
    render(<StatItem icon={<span>icon</span>} value={null} unit="m²" />);
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.queryByText("m²")).not.toBeInTheDocument();
  });

  it("renders placeholder when value is undefined", () => {
    render(<StatItem icon={<span>icon</span>} value={undefined} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
