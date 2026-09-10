import type { FeedbackStatus } from "@/lib/types";

/**
 * AI abstraction — structure only. A provider (Claude, etc.) can be dropped in
 * later behind this interface without touching feature code. Nothing here makes
 * a network call today.
 */

export interface FeedbackAnalyzerInput {
  projectName: string;
  websiteUrl: string;
  comments: {
    comment: string;
    status: FeedbackStatus;
    author_type: "designer" | "client";
  }[];
}

export type InsightCategory =
  | "typography"
  | "spacing"
  | "cta"
  | "visual_consistency"
  | "animation"
  | "content"
  | "accessibility";

export interface FeedbackInsight {
  category: InsightCategory;
  title: string;
  detail: string;
  relatedCommentIndexes: number[];
}

export interface FeedbackAnalyzer {
  readonly enabled: boolean;
  analyze(input: FeedbackAnalyzerInput): Promise<FeedbackInsight[]>;
}

import { noopAnalyzer } from "./noop-provider";

let analyzer: FeedbackAnalyzer = noopAnalyzer;

/** Swap the active analyzer (e.g. from an env-gated bootstrap). */
export function setFeedbackAnalyzer(next: FeedbackAnalyzer) {
  analyzer = next;
}

export function getFeedbackAnalyzer(): FeedbackAnalyzer {
  return analyzer;
}
