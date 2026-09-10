import { ImageResponse } from "next/og";
import { APP_NAME } from "@/lib/constants";

export const alt = `${APP_NAME} — Get website feedback, exactly where it matters`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0a0a0b 0%, #16161c 60%, #1e1b3a 100%)",
          padding: 80,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 18, height: 18, borderRadius: 5, background: "white" }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 600 }}>{APP_NAME}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
            Get website feedback.
          </div>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, color: "#a5b4fc" }}>
            Exactly where it matters.
          </div>
          <div style={{ fontSize: 26, color: "#a1a1aa", marginTop: 16 }}>
            Visual feedback · Revisions · Client approval
          </div>
        </div>
      </div>
    ),
    size,
  );
}
