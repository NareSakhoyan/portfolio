import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site/config";

export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0f0f0e",
          color: "#ecebe6",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 24, color: "#aaa89f" }}>
          <div style={{ width: 12, height: 12, borderRadius: 999, background: "#f5a76b" }} />
          <span>{SITE.availability}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 84, letterSpacing: -2, lineHeight: 1 }}>{SITE.name}</div>
          <div style={{ display: "flex", fontSize: 34, lineHeight: 1.3, maxWidth: 980, color: "#ecebe6" }}>{SITE.tagline}</div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#aaa89f" }}>{`${SITE.role} · agent harnesses · evals · RAG · tool use`}</div>
      </div>
    ),
    { ...size },
  );
}
