import { ImageResponse } from "next/og";
import { SITE_CONFIG } from "./lib/site";

export const alt = SITE_CONFIG.ogImageAlt;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #2563eb, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            C
          </div>
          <span style={{ fontSize: "28px", fontWeight: "bold", color: "#ffffff" }}>
            {SITE_CONFIG.name}
          </span>
        </div>

        {/* Hero Title & Tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              maxWidth: "900px",
            }}
          >
            {SITE_CONFIG.tagline}
          </h1>
          <p style={{ fontSize: "24px", color: "#94a3b8", maxWidth: "800px" }}>
            {SITE_CONFIG.description}
          </p>
        </div>

        {/* Footer badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              background: "rgba(37, 99, 235, 0.2)",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              borderRadius: "999px",
              padding: "8px 20px",
              color: "#93c5fd",
              fontSize: "18px",
              fontWeight: 600,
            }}
          >
            ✨ AI Writing Assistant
          </div>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "999px",
              padding: "8px 20px",
              color: "#e2e8f0",
              fontSize: "18px",
            }}
          >
            Threaded Discussions
          </div>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "999px",
              padding: "8px 20px",
              color: "#e2e8f0",
              fontSize: "18px",
            }}
          >
            Markdown Publishing
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
