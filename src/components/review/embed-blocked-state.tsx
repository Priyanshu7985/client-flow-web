"use client";

import { ExternalLink, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hostFromUrl } from "@/lib/utils/url";

export function EmbedBlockedState({ url }: { url: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-status-open-soft text-status-open">
        <ShieldAlert className="size-5" />
      </span>
      <h3 className="mt-4 text-[15px] font-semibold text-foreground">
        This website can&apos;t be displayed inside a review frame
      </h3>
      <p className="mt-2 max-w-sm text-[13px] text-muted-foreground">
        <span className="font-medium text-foreground">{hostFromUrl(url)}</span> sends security
        headers (<code className="text-[12px]">X-Frame-Options</code> /{" "}
        <code className="text-[12px]">frame-ancestors</code>) that prevent embedding. ClientFlow
        never bypasses a site&apos;s security policy.
      </p>
      <p className="mt-2 max-w-sm text-[12.5px] text-subtle-foreground">
        You can still open the site in a new tab to review it. A screenshot-based review mode is on
        the roadmap for sites like this.
      </p>
      <Button asChild variant="outline" className="mt-5">
        <a href={url} target="_blank" rel="noopener noreferrer">
          Open site in new tab <ExternalLink className="size-3.5" />
        </a>
      </Button>
    </div>
  );
}
