import { parsePrice, parseIntValue, applyRegex, applyTransform } from './transform-pipeline';

describe('parsePrice', () => {
  it('parses Dutch price with dots as thousands separators', () => {
    expect(parsePrice('€ 425.000 k.k.')).toBe(425000);
  });

  it('parses price without currency symbol', () => {
    expect(parsePrice('699.000')).toBe(699000);
  });

  it('returns null for non-numeric input', () => {
    expect(parsePrice('Prijs op aanvraag')).toBeNull();
  });

  it('handles comma as decimal separator (Dutch notation: 1.250,50 = 1250.50)', () => {
    expect(parsePrice('1.250,50')).toBe(1251);
  });
});

describe('parseIntValue', () => {
  it('extracts integer from area string', () => {
    expect(parseIntValue('128 m²')).toBe(128);
  });

  it('extracts integer from room count', () => {
    expect(parseIntValue('5 kamers')).toBe(5);
  });

  it('returns null for no digits', () => {
    expect(parseIntValue('onbekend')).toBeNull();
  });

  it('returns first number found', () => {
    expect(parseIntValue('1932')).toBe(1932);
  });
});

describe('applyRegex', () => {
  it('returns capture group 1 when regex matches', () => {
    expect(applyRegex('Bestaande bouw , bouwjaar 1932', '^([^,]+)')).toBe('Bestaande bouw');
  });

  it('returns full match when no capture group', () => {
    expect(applyRegex('B', '[A-G]')).toBe('B');
  });

  it('returns original value when no match', () => {
    expect(applyRegex('foo', '^\\d+')).toBe('foo');
  });

  it('returns original value for invalid regex', () => {
    expect(applyRegex('foo', '[')).toBe('foo');
  });
});

describe('applyTransform', () => {
  it('applies parse_price transform', () => {
    expect(applyTransform('€ 425.000', 'parse_price')).toBe(425000);
  });

  it('applies parse_int transform', () => {
    expect(applyTransform('3 slaapkamers', 'parse_int')).toBe(3);
  });

  it('returns original string when no transform', () => {
    expect(applyTransform('Amsterdam', null)).toBe('Amsterdam');
  });
});
