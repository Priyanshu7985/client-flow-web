import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PLANS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function PricingTable() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {PLANS.map((plan) => (
        <div
          key={plan.id}
          className={cn(
            "relative flex flex-col rounded-[16px] border bg-surface-raised p-6",
            plan.highlighted
              ? "border-accent shadow-[var(--shadow-md)]"
              : "border-border shadow-[var(--shadow-sm)]",
          )}
        >
          {plan.highlighted && (
            <span className="absolute -top-2.5 left-6 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-accent-foreground">
              Most popular
            </span>
          )}
          <h3 className="text-[15px] font-semibold text-foreground">{plan.name}</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">{plan.tagline}</p>
          <div className="mt-5 flex items-baseline gap-1">
            <span className="text-3xl font-semibold tracking-tight text-foreground">
              ${plan.price}
            </span>
            <span className="text-[13px] text-muted-foreground">/ month</span>
          </div>
          <Button
            asChild
            variant={plan.highlighted ? "primary" : "outline"}
            className="mt-5 w-full"
          >
            <Link href="/signup">{plan.cta}</Link>
          </Button>
          <ul className="mt-6 space-y-2.5">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-[13px] text-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
