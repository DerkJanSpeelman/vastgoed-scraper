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

const counts = { total: 42, nieuwbouw: 10, bestaandeBouw: 30, stilleVerkoop: 2 };

describe("FilterBar", () => {
  it("renders type chips", () => {
    render(<FilterBar provinces={provinces} cities={[]} municipalities={[]} counts={counts} />);
    expect(screen.getByText("Bestaande bouw")).toBeInTheDocument();
    expect(screen.getByText("Nieuwbouw")).toBeInTheDocument();
    expect(screen.getByText("Stille verkoop")).toBeInTheDocument();
  });

  it("renders province options", () => {
    render(<FilterBar provinces={provinces} cities={[]} municipalities={[]} counts={counts} />);
    expect(screen.getByRole("option", { name: "Noord-Holland" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Zuid-Holland" })).toBeInTheDocument();
  });

  it("shows stille verkoop count", () => {
    render(<FilterBar provinces={provinces} cities={[]} municipalities={[]} counts={counts} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
