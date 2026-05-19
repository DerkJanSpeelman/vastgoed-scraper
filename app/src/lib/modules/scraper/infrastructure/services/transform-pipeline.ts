export function parsePrice(raw: string): number | null {
  const cleaned = raw.replace(/[^\d,]/g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export function parseIntValue(raw: string): number | null {
  const match = raw.match(/\d+/);
  if (!match) return null;
  const n = parseInt(match[0], 10);
  return Number.isFinite(n) ? n : null;
}

export function applyRegex(value: string, pattern: string): string {
  try {
    const m = value.match(new RegExp(pattern));
    return m ? (m[1] ?? m[0]).trim() : value;
  } catch {
    return value;
  }
}

export type Transform = 'parse_price' | 'parse_int';

export function applyTransform(value: string, transform?: string | null): string | number | null {
  if (transform === 'parse_price') return parsePrice(value);
  if (transform === 'parse_int') return parseIntValue(value);
  return value;
}
