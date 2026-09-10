"use client";

import { useEffect, useMemo, useState } from "react";
import { ReviewWorkspace, type ReviewHandlers } from "./review-workspace";
import { ReviewIntro } from "./review-intro";
import type { Approval, FeedbackWithReplies } from "@/lib/types";

const NAME_KEY = "clientflow-reviewer-name";

async function post(token: string, body: unknown) {
  const res = await fetch(`/api/review/${token}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong");
  return data;
}

export function ClientReview({
  token,
  projectName,
  websiteUrl,
  designerName,
  designerCompany,
  initialFeedback,
  initialApproval,
}: {
  token: string;
  projectName: string;
  websiteUrl: string;
  designerName: string;
  designerCompany: string | null;
  initialFeedback: FeedbackWithReplies[];
  initialApproval: Approval | null;
}) {
  const [name, setName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(NAME_KEY);
    } catch {
      /* ignore */
    }
    setName(stored);
    setReady(true);
  }, []);

  const handlers = useMemo<ReviewHandlers>(
    () => ({
      createFeedback: async (input) => {
        const data = await post(token, {
          action: "feedback",
          payload: {
            page_url: input.pageUrl,
            device: input.device,
            position_x: input.x,
            position_y: input.y,
            comment: input.comment,
            author_name: name ?? "Client",
          },
        });
        return data.feedback as FeedbackWithReplies;
      },
      reply: async (feedbackId, message) => {
        await post(token, {
          action: "reply",
          payload: { feedback_id: feedbackId, message, author_name: name ?? "Client" },
        });
      },
      setStatus: async () => {
        throw new Error("Only the designer can change feedback status");
      },
      approve: async (approverName, note) => {
        const data = await post(token, {
          action: "approve",
          payload: { approved_by_name: approverName, note },
        });
        return data.approval as Approval;
      },
      refresh: async () => {
        const res = await fetch(`/api/review/${token}`);
        if (!res.ok) return null;
        const bundle = await res.json();
        return { feedback: bundle.feedback, approval: bundle.approval };
      },
    }),
    [token, name],
  );

  if (!ready) return null;

  if (!name && !initialApproval) {
    return (
      <ReviewIntro
        projectName={projectName}
        designerName={designerName}
        designerCompany={designerCompany}
        onStart={(entered) => {
          try {
            localStorage.setItem(NAME_KEY, entered);
          } catch {
            /* ignore */
          }
          setName(entered);
        }}
      />
    );
  }

  return (
    <ReviewWorkspace
      mode="client"
      projectName={projectName}
      websiteUrl={websiteUrl}
      designerName={designerName}
      viewerName={name ?? "Client"}
      initialFeedback={initialFeedback}
      initialApproval={initialApproval}
      handlers={handlers}
    />
  );
}
