// price_type_id: 1=k.k., 2=v.o.n., 3=prijs_op_aanvraag
const PRICE_TYPE_LABEL: Record<number, string> = {
  1: "k.k.",
  2: "v.o.n.",
  3: "p.o.a.",
};

function dutchNumber(n: number): string {
  return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatPrice(amount: number | null): string {
  if (amount === null) return "—";
  return "€ " + dutchNumber(amount) + ",-";
}

export function formatPriceType(priceTypeId: number | null): string {
  if (priceTypeId === null) return "";
  return PRICE_TYPE_LABEL[priceTypeId] ?? "";
}

export function formatPricePerM2(amount: number | null, m2: number | null): string {
  if (amount === null || m2 === null || m2 === 0) return "—";
  return "€ " + dutchNumber(Math.round(amount / m2));
}

// property_type_id: 1=bestaande_bouw, 2=nieuwbouw
export function isNieuwbouw(propertyTypeId: number): boolean {
  return propertyTypeId === 2;
}
