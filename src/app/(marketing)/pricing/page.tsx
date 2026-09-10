import type { Metadata } from "next";
import { Section } from "@/components/marketing/section";
import { PricingTable } from "@/components/marketing/pricing-table";
import { Faq } from "@/components/marketing/faq";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple pricing for ClientFlow. Start free with 2 projects, upgrade to Pro for unlimited projects and revision history.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <Section
        eyebrow="Pricing"
        title="Pricing that scales with your client work"
        description="Start on Free forever. Move to Pro the first month ClientFlow saves you a revision round."
        center
      >
        <PricingTable />
        <p className="mt-6 text-center text-[12.5px] text-subtle-foreground">
          Payments are not enabled in this MVP — every plan is fully usable today.
        </p>
      </Section>
      <Section eyebrow="FAQ" title="Pricing questions" center>
        <Faq />
      </Section>
    </>
  );
}
