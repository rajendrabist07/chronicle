import { ImageResponse } from "next/og";
import { getPublicPostBySlug } from "../../lib/public";
import { SITE_CONFIG } from "../../lib/site";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function ArticleOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);

  const title = post?.title || SITE_CONFIG.tagline;
  const author = post?.authorName || "Chronicle Writer";

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
        {/* Brand Header */}
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

        {/* Article Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              maxWidth: "1000px",
            }}
          >
            {title}
          </h1>
        </div>

        {/* Author Byline & Tags Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "999px",
                background: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              {author[0]?.toUpperCase() || "A"}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "22px", fontWeight: 600, color: "#ffffff" }}>
                {author}
              </span>
              <span style={{ fontSize: "16px", color: "#94a3b8" }}>
                Published on {SITE_CONFIG.name}
              </span>
            </div>
          </div>

          <div
            style={{
              background: "rgba(37, 99, 235, 0.2)",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              borderRadius: "999px",
              padding: "10px 24px",
              color: "#93c5fd",
              fontSize: "18px",
              fontWeight: 600,
            }}
          >
            Read Article →
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
