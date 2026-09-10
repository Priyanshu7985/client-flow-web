import { NextResponse } from "next/server";
import { z } from "zod";
import {
  addReviewFeedback,
  addReviewReply,
  approveReviewProject,
  getReviewBundle,
} from "@/lib/data/review";
import {
  approveProjectSchema,
  createFeedbackSchema,
  createReplySchema,
} from "@/lib/validation/schemas";
import { clientIp, hashIp, rateLimit } from "@/lib/utils/rate-limit";

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("feedback"), payload: createFeedbackSchema }),
  z.object({
    action: z.literal("reply"),
    payload: createReplySchema.extend({ feedback_id: z.string().min(1) }),
  }),
  z.object({ action: z.literal("approve"), payload: approveProjectSchema }),
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const bundle = await getReviewBundle(token);
  if (!bundle) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(bundle, { headers: { "x-robots-tag": "noindex" } });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const ip = clientIp(request.headers);

  if (!rateLimit(`review:${ip}:${token}`, { limit: 30, windowMs: 60_000 }).success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    if (parsed.data.action === "feedback") {
      const p = parsed.data.payload;
      const created = await addReviewFeedback(
        token,
        {
          page_url: p.page_url,
          device: p.device,
          element_selector: p.element_selector ?? null,
          position_x: p.position_x,
          position_y: p.position_y,
          comment: p.comment,
        },
        p.author_name || "Client",
      );
      return NextResponse.json({ feedback: { ...created, replies: [] } }, { status: 201 });
    }

    if (parsed.data.action === "reply") {
      const p = parsed.data.payload;
      const reply = await addReviewReply(token, p.feedback_id, p.message, p.author_name || "Client");
      return NextResponse.json({ reply }, { status: 201 });
    }

    // approve
    const p = parsed.data.payload;
    const record = await approveReviewProject(
      token,
      p.approved_by_name,
      p.note || undefined,
      await hashIp(ip),
    );
    return NextResponse.json({ approval: record }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "error";
    const status = message.toLowerCase().includes("invalid") || message.includes("not") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
