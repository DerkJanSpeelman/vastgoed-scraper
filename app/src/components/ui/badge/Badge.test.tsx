import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders nieuwbouw label", () => {
    render(<Badge variant="nieuwbouw" />);
    expect(screen.getByText("Nieuwbouw")).toBeInTheDocument();
  });

  it("renders stille-verkoop label", () => {
    render(<Badge variant="stille-verkoop" />);
    expect(screen.getByText("Stille verkoop")).toBeInTheDocument();
  });
});
