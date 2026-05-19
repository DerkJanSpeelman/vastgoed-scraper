import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { select as xpathSelect } from 'xpath';

export type SelectorResult = { values: string[]; count: number };

type XpathNode = Node & { value?: string };

function parseHtmlToXmlDoc(html: string): Document {
  const htmlDoc = new DOMParser().parseFromString(html, 'text/html');
  const serialized = new XMLSerializer().serializeToString(htmlDoc);
  const stripped = serialized
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/\s+xmlns(?::\w+)?="[^"]*"/g, '');
  return new DOMParser().parseFromString(`<root>${stripped}</root>`, 'text/xml') as unknown as Document;
}

function nodeToString(node: XpathNode): string {
  if (node.nodeType === 2) return node.value ?? '';
  return (node as Element).textContent?.trim() ?? '';
}

export function evaluateXPath(html: string, xpathExpr: string): SelectorResult {
  let doc: Document;
  try {
    doc = parseHtmlToXmlDoc(html);
  } catch {
    return { values: [], count: 0 };
  }

  let nodes: XpathNode[];
  try {
    nodes = xpathSelect(xpathExpr, doc) as XpathNode[];
  } catch {
    return { values: [], count: 0 };
  }

  if (!Array.isArray(nodes)) return { values: [], count: 0 };

  const values = nodes.map(nodeToString);
  return { values, count: nodes.length };
}

export function evaluateXPathAll(html: string, xpathExpr: string): string[] {
  return evaluateXPath(html, xpathExpr).values;
}

export function evaluateXPathFirst(html: string, xpathExpr: string): string | null {
  const { values } = evaluateXPath(html, xpathExpr);
  return values[0] ?? null;
}
