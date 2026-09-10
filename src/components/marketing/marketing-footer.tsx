import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { APP_NAME } from "@/lib/constants";

const groups = [
  {
    title: "Product",
    links: [
      { href: "/#how", label: "How it works" },
      { href: "/#feature", label: "Visual feedback" },
      { href: "/#revisions", label: "Revisions" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#usecases", label: "Use cases" },
      { href: "/#faq", label: "FAQ" },
      { href: "/login", label: "Log in" },
      { href: "/signup", label: "Start free" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/#", label: "Privacy" },
      { href: "/#", label: "Terms" },
      { href: "/#", label: "Security" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-[13px] text-muted-foreground">
            Collect visual website feedback, manage revisions, and get final client approval — all in one place.
          </p>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <h4 className="text-[12px] font-semibold uppercase tracking-wide text-subtle-foreground">
              {group.title}
            </h4>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-5 text-[12.5px] text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}. Built for designers and agencies.
        </div>
      </div>
    </footer>
  );
}
