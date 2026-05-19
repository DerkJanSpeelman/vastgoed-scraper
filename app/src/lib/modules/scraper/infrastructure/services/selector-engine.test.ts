import { evaluateXPathFirst, evaluateXPathAll, evaluateXPath } from './selector-engine';

const SAMPLE_HTML = `
<!DOCTYPE html>
<html>
<body>
  <div class="listing">
    <h1>Kerkstraat 12, Amsterdam</h1>
    <a class="detail-link" href="/aanbod/kerkstraat-12">Bekijk</a>
    <span class="price">€ 425.000 k.k.</span>
    <div class="specs">
      <div><span>Woonoppervlakte:</span> <span>128 m²</span></div>
      <div><span>Kamers:</span> <span>5 kamers</span></div>
    </div>
  </div>
  <div class="listing">
    <h1>Prinsengracht 99, Amsterdam</h1>
    <a class="detail-link" href="/aanbod/prinsengracht-99">Bekijk</a>
    <span class="price">€ 699.000 v.o.n.</span>
  </div>
</body>
</html>
`;

describe('evaluateXPathFirst', () => {
  it('returns text content of first matching element', () => {
    const result = evaluateXPathFirst(SAMPLE_HTML, '//h1');
    expect(result).toBe('Kerkstraat 12, Amsterdam');
  });

  it('returns attribute value when selecting attribute node', () => {
    const result = evaluateXPathFirst(SAMPLE_HTML, '//a[@class="detail-link"]/@href');
    expect(result).toBe('/aanbod/kerkstraat-12');
  });

  it('returns null when no match', () => {
    const result = evaluateXPathFirst(SAMPLE_HTML, '//span[@class="nonexistent"]');
    expect(result).toBeNull();
  });

  it('returns null for invalid XPath', () => {
    const result = evaluateXPathFirst(SAMPLE_HTML, '///invalid');
    expect(result).toBeNull();
  });
});

describe('evaluateXPathAll', () => {
  it('returns all matching href attribute values', () => {
    const results = evaluateXPathAll(SAMPLE_HTML, '//a[@class="detail-link"]/@href');
    expect(results).toEqual(['/aanbod/kerkstraat-12', '/aanbod/prinsengracht-99']);
  });

  it('returns all heading texts', () => {
    const results = evaluateXPathAll(SAMPLE_HTML, '//h1');
    expect(results).toHaveLength(2);
    expect(results[0]).toBe('Kerkstraat 12, Amsterdam');
  });
});

describe('evaluateXPath', () => {
  it('returns count alongside values', () => {
    const { values, count } = evaluateXPath(SAMPLE_HTML, '//a[@class="detail-link"]/@href');
    expect(count).toBe(2);
    expect(values).toHaveLength(2);
  });
});
