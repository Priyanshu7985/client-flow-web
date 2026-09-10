/** URL validation + SSRF guards for embed checking. */

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^\[?::1\]?$/,
  /\.local$/i,
  /^metadata\.google\.internal$/i,
];

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isValidWebsiteUrl(raw: string): boolean {
  try {
    const url = new URL(normalizeUrl(raw));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Public http(s) URL that is safe to fetch server-side. */
export function isSafeFetchTarget(raw: string): boolean {
  try {
    const url = new URL(normalizeUrl(raw));
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const host = url.hostname;
    if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(host))) return false;
    if (!host.includes(".")) return false;
    return true;
  } catch {
    return false;
  }
}

export function hostFromUrl(raw: string): string {
  try {
    return new URL(normalizeUrl(raw)).host;
  } catch {
    return raw;
  }
}
