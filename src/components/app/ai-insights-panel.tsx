import { Sparkles } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { getFeedbackAnalyzer } from "@/lib/ai/provider";

/**
 * AI insights placeholder. The analyzer abstraction (src/lib/ai) returns nothing
 * until a provider is wired in — this panel just shows where it will surface.
 */
export function AiInsightsPanel() {
  const analyzer = getFeedbackAnalyzer();
  if (analyzer.enabled) return null;

  return (
    <Card className="border-dashed">
      <CardBody className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-accent-soft text-accent-soft-foreground">
          <Sparkles className="size-4" />
        </span>
        <div>
          <p className="text-[13px] font-semibold text-foreground">AI feedback analysis</p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            Coming soon — turn vague client comments into concrete suggestions for typography,
            spacing, CTAs and visual consistency. The service abstraction is already in place.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
