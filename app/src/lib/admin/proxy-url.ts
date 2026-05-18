const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
];

export function validateProxyUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "Ongeldige URL";
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return "Alleen http en https zijn toegestaan";
  }

  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host === "::1") {
    return "Interne adressen zijn niet toegestaan";
  }

  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(host)) return "Privé IP-adressen zijn niet toegestaan";
  }

  return null;
}
