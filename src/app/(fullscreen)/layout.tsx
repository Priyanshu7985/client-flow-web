import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { DEMO_MODE, getProfile } from "@/lib/data";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function FullscreenLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  if (!profile && !DEMO_MODE) redirect("/login");
  return <div className="min-h-[100dvh]">{children}</div>;
}
