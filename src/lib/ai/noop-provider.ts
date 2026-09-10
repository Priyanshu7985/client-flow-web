import type { FeedbackAnalyzer } from "./provider";

/** Default analyzer: does nothing, returns no insights. */
export const noopAnalyzer: FeedbackAnalyzer = {
  enabled: false,
  async analyze() {
    return [];
  },
};
