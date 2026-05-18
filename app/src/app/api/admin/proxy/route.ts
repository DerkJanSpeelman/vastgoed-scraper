import { NextRequest, NextResponse } from "next/server";
import { validateProxyUrl } from "@/lib/admin/proxy-url";
import { getTargetingScript } from "@/lib/admin/targeting-script";

const STRIPPED_HEADERS = ["x-frame-options", "content-security-policy", "content-security-policy-report-only"];

function rewriteUrls(html: string, base: string): string {
  return html
    .replace(/(href|src|action)="(\/[^"]*?)"/gi, (_, attr, path) => `${attr}="${new URL(path, base).href}"`)
    .replace(/(href|src|action)='(\/[^']*?)'/gi, (_, attr, path) => `${attr}='${new URL(path, base).href}'`);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const validationError = validateProxyUrl(rawUrl);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  let response: Response;
  try {
    response = await fetch(rawUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; vastgoed-scraper-config/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
  } catch {
    return NextResponse.json({ error: "Kon de pagina niet ophalen" }, { status: 502 });
  }

  const contentType = response.headers.get("content-type") ?? "text/html";
  if (!contentType.includes("text/html")) {
    return NextResponse.json({ error: "Alleen HTML-pagina's worden ondersteund" }, { status: 415 });
  }

  let html = await response.text();
  const base = new URL(rawUrl).origin;
  html = rewriteUrls(html, base);
  html = html.replace("</head>", `<script>${getTargetingScript()}</script></head>`);

  const headers = new Headers({ "content-type": "text/html; charset=utf-8" });
  for (const [key, value] of response.headers.entries()) {
    if (!STRIPPED_HEADERS.includes(key.toLowerCase())) {
      try { headers.set(key, value); } catch { /* skip invalid headers */ }
    }
  }
  headers.set("content-type", "text/html; charset=utf-8");

  return new NextResponse(html, { status: 200, headers });
}
