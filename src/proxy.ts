import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/** Next.js 16 Proxy (formerly middleware). Refreshes the Supabase session and
 *  gates authenticated routes. */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except Next internals and static asset file extensions.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
