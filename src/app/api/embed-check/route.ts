import { NextResponse } from "next/server";
import { isSafeFetchTarget, normalizeUrl } from "@/lib/utils/url";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";
import { safeFetch, UnsafeTargetError } from "@/lib/utils/safe-fetch";

/**
 * Reports whether a URL can be embedded in an iframe by inspecting
 * X-Frame-Options and CSP frame-ancestors. Never fetches private hosts, even
 * via redirects (see safeFetch).
 */
export async function GET(request: Request) {
  const ip = clientIp(request.headers);
  if (!rateLimit(`embed-check:${ip}`, { limit: 20, windowMs: 60_000 }).success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const raw = new URL(request.url).searchParams.get("url") ?? "";
  const url = normalizeUrl(raw);

  if (!isSafeFetchTarget(url)) {
    return NextResponse.json({ embeddable: false, reason: "invalid_url" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await safeFetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { "user-agent": "ClientFlow-EmbedCheck/1.0" },
    });
    await res.body?.cancel();

    const xfo = (res.headers.get("x-frame-options") ?? "").toLowerCase();
    const csp = (res.headers.get("content-security-policy") ?? "").toLowerCase();
    const frameAncestors = csp.match(/frame-ancestors([^;]*)/)?.[1]?.trim() ?? null;

    let embeddable = true;
    let reason: string | null = null;

    if (xfo.includes("deny") || xfo.includes("sameorigin")) {
      embeddable = false;
      reason = "x_frame_options";
    } else if (frameAncestors !== null) {
      const allowsAny = frameAncestors.includes("*") || frameAncestors.includes("http");
      if (!allowsAny || frameAncestors.includes("'none'") || frameAncestors.includes("'self'")) {
        embeddable = false;
        reason = "frame_ancestors";
      }
    }

    return NextResponse.json(
      { embeddable, reason, status: res.status },
      { headers: { "cache-control": "public, max-age=300" } },
    );
  } catch (e) {
    if (e instanceof UnsafeTargetError) {
      return NextResponse.json({ embeddable: false, reason: "invalid_url" }, { status: 400 });
    }
    // Network failure — let the client fall back to its load-timeout heuristic.
    return NextResponse.json({ embeddable: true, reason: "unknown" });
  } finally {
    clearTimeout(timeout);
  }
}
