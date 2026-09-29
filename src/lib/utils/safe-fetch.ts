import "server-only";

import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import { isSafeFetchTarget } from "./url";

/**
 * SSRF-guarded fetch for user-supplied URLs. Every hop (including redirects)
 * is resolved via DNS and rejected if any address is private, loopback,
 * link-local, or otherwise non-public. Redirects are followed manually so a
 * public URL can't bounce the request to an internal host.
 */

const blocked = new BlockList();
for (const [net, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  blocked.addSubnet(net, prefix, "ipv4");
}
for (const [net, prefix] of [
  ["::", 128],
  ["::1", 128],
  // IPv4-mapped (::ffff:a.b.c.d) needs no rule: BlockList checks those
  // against the IPv4 subnets above.
  ["64:ff9b::", 96], // NAT64
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
] as const) {
  blocked.addSubnet(net, prefix, "ipv6");
}

export class UnsafeTargetError extends Error {}

function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return !blocked.check(address, "ipv4");
  if (family === 6) return !blocked.check(address, "ipv6");
  return false;
}

async function assertPublicHost(url: URL): Promise<void> {
  if (!isSafeFetchTarget(url.href)) throw new UnsafeTargetError("unsafe_url");
  // URL keeps brackets around IPv6 literals; dns.lookup wants them stripped.
  const host = url.hostname.replace(/^\[|\]$/g, "");
  let addresses: { address: string }[];
  try {
    addresses = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new UnsafeTargetError("unresolvable_host");
  }
  if (addresses.length === 0 || !addresses.every((a) => isPublicAddress(a.address))) {
    throw new UnsafeTargetError("private_address");
  }
}

export async function safeFetch(
  input: string,
  init: Omit<RequestInit, "redirect"> = {},
  maxRedirects = 5,
): Promise<Response> {
  let url = new URL(input);
  for (let hop = 0; hop <= maxRedirects; hop++) {
    await assertPublicHost(url);
    const res = await fetch(url, { ...init, redirect: "manual" });
    const location = res.headers.get("location");
    if (res.status < 300 || res.status >= 400 || !location) return res;
    await res.body?.cancel();
    url = new URL(location, url);
  }
  throw new UnsafeTargetError("too_many_redirects");
}
