import { ImageResponse } from "next/og";

export const alt = "FrankenTUI — Terminal UI Kernel for Rust";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#020a02",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background radial glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "900px",
            height: "900px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,197,94,0.25) 0%, rgba(34,197,94,0.08) 40%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Secondary glow for depth */}
        <div
          style={{
            position: "absolute",
            bottom: "-200px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "1200px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(163,230,53,0.1) 0%, rgba(34,197,94,0.04) 40%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Top border accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background:
              "linear-gradient(to right, transparent, #22c55e, #a3e635, #22c55e, transparent)",
            display: "flex",
          }}
        />

        {/* Content container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            padding: "40px",
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: "96px",
              fontWeight: 900,
              background:
                "linear-gradient(to bottom right, #22c55e, #a3e635)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1.1,
              letterSpacing: "-2px",
              display: "flex",
            }}
          >
            FrankenTUI
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "36px",
              fontWeight: 400,
              color: "#94a3b8",
              marginTop: "16px",
              letterSpacing: "1px",
              display: "flex",
            }}
          >
            Terminal UI Kernel for Rust
          </div>

          {/* Divider */}
          <div
            style={{
              width: "120px",
              height: "2px",
              background:
                "linear-gradient(to right, transparent, #22c55e, transparent)",
              marginTop: "40px",
              marginBottom: "40px",
              display: "flex",
            }}
          />

          {/* Stats line */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "16px",
              fontSize: "24px",
              color: "#ffffff",
              fontWeight: 500,
            }}
          >
            <span style={{ color: "#22c55e", display: "flex" }}>
              Built in 5 Days
            </span>
            <span style={{ color: "#94a3b8", display: "flex" }}>
              ·
            </span>
            <span style={{ color: "#a3e635", display: "flex" }}>
              12 Crates
            </span>
            <span style={{ color: "#94a3b8", display: "flex" }}>
              ·
            </span>
            <span style={{ color: "#22c55e", display: "flex" }}>
              20+ Algorithms
            </span>
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              display: "flex",
            }}
          />
          <span
            style={{
              fontSize: "22px",
              color: "#94a3b8",
              fontWeight: 400,
              letterSpacing: "2px",
              display: "flex",
            }}
          >
            frankentui.com
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
