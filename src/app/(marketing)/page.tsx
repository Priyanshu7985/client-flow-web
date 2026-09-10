import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CircleDot,
  Clock3,
  Layers,
  MousePointerClick,
  MessagesSquare,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/marketing/section";
import { Reveal } from "@/components/marketing/reveal";
import { ProductPreview } from "@/components/marketing/product-preview";
import { Faq } from "@/components/marketing/faq";
import { PricingTable } from "@/components/marketing/pricing-table";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${APP_NAME} — Get website feedback, exactly where it matters`,
  description:
    "ClientFlow lets designers and agencies share websites with clients, collect pinned visual feedback, manage revisions, and get final approval — all from one place.",
  alternates: { canonical: "/" },
};

const steps = [
  { icon: Layers, title: "Create a project", body: "Add your client, the website URL, and a deadline. ClientFlow generates a private review link." },
  { icon: MousePointerClick, title: "Client pins feedback", body: "Your client opens the site and clicks exactly where something needs to change. A numbered marker is placed." },
  { icon: RefreshCw, title: "You resolve & revise", body: "Work through feedback, reply in-thread, mark items resolved, and push a new revision." },
  { icon: ThumbsUp, title: "Client approves", body: "Once feedback is cleared, your client approves with one click. An immutable approval record is written." },
];

const useCases = [
  { title: "Freelance web designers", body: "Stop chasing feedback across email, WhatsApp and screenshots. One link, one thread." },
  { title: "Design & dev agencies", body: "Keep every client project, revision and approval in a single organised workspace." },
  { title: "Framer & Webflow builders", body: "Share staging sites, collect pixel-precise notes, and ship with confidence." },
  { title: "Product teams", body: "Run structured design reviews with stakeholders without a pile of Loom links." },
];

export default function LandingPage() {
  return (
    <>
      {/* 1. Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.4] [mask-image:radial-gradient(70%_50%_at_50%_0%,black,transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pt-24">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-raised px-3 py-1 text-[12.5px] font-medium text-muted-foreground shadow-[var(--shadow-xs)]">
              <Sparkles className="size-3.5 text-accent" />
              Visual feedback for websites
            </span>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Get website feedback.
              <br />
              <span className="text-accent">Exactly where it matters.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-balance text-[16px] leading-relaxed text-muted-foreground">
              ClientFlow lets designers and agencies share a website, collect pinned visual
              feedback from clients, manage revisions, and capture final approval — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/signup">
                  Start free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/#how">See how it works</Link>
              </Button>
            </div>
            <p className="mt-4 text-[12.5px] text-subtle-foreground">
              No credit card required · 2 projects free forever
            </p>
          </Reveal>

          <Reveal delay={0.15} className="mt-14">
            <ProductPreview />
          </Reveal>
        </div>
      </section>

      {/* 2. Problem */}
      <Section
        eyebrow="The problem"
        title="Feedback lives everywhere except where you need it"
        description="Screenshots in email. Vague notes in WhatsApp. “The button near the top — no, the other one.” Revisions get lost, approvals are never really final, and every project drags."
        center
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: MessagesSquare, t: "Scattered threads", d: "Feedback split across five tools with no source of truth." },
            { icon: CircleDot, t: "Ambiguous notes", d: "Written descriptions of visual problems waste hours of back-and-forth." },
            { icon: Clock3, t: "No clear sign-off", d: "“Looks good” in a chat isn't an approval you can point to later." },
          ].map((item, i) => (
            <Reveal key={item.t} delay={i * 0.08}>
              <div className="h-full rounded-[14px] border border-border bg-surface-raised p-5">
                <item.icon className="size-5 text-accent" />
                <h3 className="mt-3 text-[14px] font-semibold text-foreground">{item.t}</h3>
                <p className="mt-1.5 text-[13px] text-muted-foreground">{item.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 3. How it works */}
      <Section
        id="how"
        eyebrow="How ClientFlow works"
        title="From shared link to signed-off in four steps"
        center
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08}>
              <div className="relative h-full rounded-[14px] border border-border bg-surface-raised p-5">
                <span className="text-[12px] font-semibold text-subtle-foreground">
                  0{i + 1}
                </span>
                <step.icon className="mt-2 size-5 text-accent" />
                <h3 className="mt-3 text-[14px] font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 4. Visual feedback feature */}
      <Section
        id="feature"
        eyebrow="Visual feedback"
        title="Your client clicks. You see exactly where."
        description="The website loads in a review frame with a capture layer on top. Every click becomes a numbered, colour-coded marker anchored to that spot — with the page URL and device it was left on."
      >
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <ProductPreview />
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="space-y-5">
              {[
                { t: "Pixel-anchored markers", d: "Positions are stored as percentages, so pins stay put when the layout reflows or the device changes." },
                { t: "Threaded replies", d: "Designer and client talk it out under each marker until it's genuinely resolved." },
                { t: "Status at a glance", d: "Open, In Progress, Resolved — colour-coded on the page and in the panel." },
                { t: "Works on mobile", d: "Clients can pin feedback from their phone with a tap. The review page is built for it." },
              ].map((item) => (
                <li key={item.t} className="flex gap-3">
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-soft-foreground">
                    <CircleDot className="size-3" />
                  </span>
                  <div>
                    <h3 className="text-[14px] font-semibold text-foreground">{item.t}</h3>
                    <p className="mt-1 text-[13px] text-muted-foreground">{item.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* 5. Revision management */}
      <Section
        id="revisions"
        eyebrow="Revision management"
        title="Every round, tracked"
        description="Each revision captures what changed, how much feedback it carried, and where it landed — so you and your client always agree on which version you're talking about."
        center
      >
        <Reveal>
          <div className="mx-auto max-w-3xl space-y-3">
            {[
              { n: 1, label: "Initial design", meta: "6 feedback · changes requested" },
              { n: 2, label: "Client feedback round 1", meta: "4 changes · 3 feedback · in review" },
              { n: 3, label: "Final changes", meta: "7 changes · 0 open · approved" },
            ].map((rev, i) => (
              <div
                key={rev.n}
                className="flex items-center gap-4 rounded-[12px] border border-border bg-surface-raised p-4"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-surface-muted text-[13px] font-semibold text-foreground">
                  {rev.n}
                </span>
                <div className="flex-1 text-left">
                  <p className="text-[13.5px] font-medium text-foreground">{rev.label}</p>
                  <p className="text-[12px] text-muted-foreground">{rev.meta}</p>
                </div>
                {i === 2 && <ThumbsUp className="size-4 text-status-approved" />}
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* 6. Client approval */}
      <Section
        eyebrow="Client approval"
        title="A sign-off you can actually rely on"
        description="When all feedback is cleared, the client sees one prominent Approve button. Approval writes an immutable record — their name, the date, and a note — that can't be edited afterwards."
      >
        <Reveal>
          <div className="mx-auto max-w-md rounded-[16px] border border-status-approved/30 bg-status-approved-soft p-6 text-center">
            <ThumbsUp className="mx-auto size-6 text-status-approved" />
            <p className="mt-3 text-[15px] font-semibold text-foreground">Project approved</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Approved by Marco Feldt · Sep 4, 2026
            </p>
          </div>
        </Reveal>
      </Section>

      {/* 7. Dashboard preview */}
      <Section
        eyebrow="Dashboard"
        title="Your whole client pipeline in one view"
        description="Active projects, what's waiting on the client, what's approved, and the latest feedback — the moment you log in."
        center
      >
        <Reveal>
          <div className="rounded-[16px] border border-border bg-surface-raised p-5 shadow-[var(--shadow-md)]">
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                { label: "Total projects", value: "12" },
                { label: "Active", value: "5" },
                { label: "Pending approval", value: "3" },
                { label: "Approved", value: "4" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-[12px] border border-border bg-surface p-4 text-left">
                  <p className="text-[12px] text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              {["Vishan Graphics Website", "ABC Restaurant Website", "NovaTech Corporate Website"].map(
                (name, i) => (
                  <div key={name} className="rounded-[12px] border border-border bg-surface p-4 text-left">
                    <p className="text-[13px] font-medium text-foreground">{name}</p>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      {["Waiting for client", "In progress", "Approved"][i]}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        </Reveal>
      </Section>

      {/* 8. Use cases */}
      <Section id="usecases" eyebrow="Use cases" title="Built for anyone who ships websites for clients" center>
        <div className="grid gap-4 sm:grid-cols-2">
          {useCases.map((uc, i) => (
            <Reveal key={uc.title} delay={i * 0.06}>
              <div className="h-full rounded-[14px] border border-border bg-surface-raised p-5">
                <h3 className="text-[14px] font-semibold text-foreground">{uc.title}</h3>
                <p className="mt-1.5 text-[13px] text-muted-foreground">{uc.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 9. Pricing */}
      <Section id="pricing" eyebrow="Pricing" title="Start free. Upgrade when it pays for itself." center>
        <PricingTable />
        <p className="mt-6 text-center text-[12.5px] text-subtle-foreground">
          Payments are not enabled in this MVP — every plan is fully usable while we finish billing.
        </p>
      </Section>

      {/* 10. FAQ */}
      <Section id="faq" eyebrow="FAQ" title="Questions, answered" center>
        <Faq />
      </Section>

      {/* 11. Final CTA */}
      <section className="relative overflow-hidden border-t border-border">
        <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
        <div className="relative mx-auto max-w-3xl px-5 py-24 text-center">
          <Reveal>
            <ShieldCheck className="mx-auto size-7 text-accent" />
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Make client feedback faster than WhatsApp
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] text-muted-foreground">
              Set up your first project in under two minutes. Your client won&apos;t need an account.
            </p>
            <Button asChild size="lg" className="mt-7">
              <Link href="/signup">
                Start free <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
