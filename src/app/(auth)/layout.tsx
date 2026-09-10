import Link from "next/link";
import { MousePointerClick, RefreshCw, ThumbsUp } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Logo />
          <div className="mt-10">{children}</div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden border-l border-border bg-surface lg:block">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
        <div className="relative flex h-full flex-col justify-center px-14">
          <h2 className="max-w-sm text-2xl font-semibold tracking-tight text-foreground">
            Feedback that lands exactly where it matters.
          </h2>
          <p className="mt-3 max-w-sm text-[14px] text-muted-foreground">
            Share a website, collect pinned visual feedback, and get a clean client sign-off.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              { icon: MousePointerClick, t: "Clients pin feedback on the live site" },
              { icon: RefreshCw, t: "Track every revision and resolution" },
              { icon: ThumbsUp, t: "Capture an immutable approval record" },
            ].map((item) => (
              <li key={item.t} className="flex items-center gap-3 text-[13.5px] text-foreground">
                <span className="flex size-8 items-center justify-center rounded-[9px] border border-border bg-surface-raised text-accent">
                  <item.icon className="size-4" />
                </span>
                {item.t}
              </li>
            ))}
          </ul>
          <p className="mt-10 text-[12.5px] text-subtle-foreground">
            Already convinced?{" "}
            <Link href="/signup" className="text-accent hover:underline">
              Create your workspace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
