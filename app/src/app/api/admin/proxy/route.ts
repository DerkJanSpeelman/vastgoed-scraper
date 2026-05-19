import { NextRequest, NextResponse } from "next/server";
import { validateProxyUrl } from "@/lib/admin/proxy-url";
import { getTargetingScript } from "@/lib/admin/targeting-script";

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

  const scraperUrl = process.env.SCRAPER_URL ?? "http://localhost:3001";
  let html: string;
  try {
    const response = await fetch(`${scraperUrl}/render`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: rawUrl }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json({ error: (err as { error?: string }).error ?? "Kon de pagina niet ophalen" }, { status: 502 });
    }
    html = await response.text();
  } catch {
    return NextResponse.json({ error: "Kon de pagina niet ophalen" }, { status: 502 });
  }

  const base = new URL(rawUrl).origin;
  html = rewriteUrls(html, base);
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<\/head>/, `<script>${getTargetingScript()}</script></head>`);

  return new NextResponse(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
