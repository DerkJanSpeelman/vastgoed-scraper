import { render, screen } from "@testing-library/react";
import { FilterBar } from "./FilterBar";
import { GetProvincesDto } from "@/lib/modules/location/application/queries/get-provinces/get-provinces.dto";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const provinces: GetProvincesDto[] = [
  { id: 1, name: "Noord-Holland", code: "NH" },
  { id: 2, name: "Zuid-Holland",  code: "ZH" },
];

describe("FilterBar", () => {
  it("renders all filter chips", () => {
    render(<FilterBar provinces={provinces} totalCount={42} />);
    expect(screen.getByText("Alle woningen")).toBeInTheDocument();
    expect(screen.getByText("Bestaande bouw")).toBeInTheDocument();
    expect(screen.getByText("Nieuwbouw")).toBeInTheDocument();
    expect(screen.getByText("Stille verkoop")).toBeInTheDocument();
  });

  it("renders province options", () => {
    render(<FilterBar provinces={provinces} totalCount={42} />);
    expect(screen.getByRole("option", { name: "Noord-Holland" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Zuid-Holland" })).toBeInTheDocument();
  });

  it("shows total count", () => {
    render(<FilterBar provinces={provinces} totalCount={42} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });
});
