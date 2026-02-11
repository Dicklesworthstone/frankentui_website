import { readFileSync } from "fs";
import { join } from "path";
import { ImageResponse } from "next/og";

export const alt = "FrankenTUI — The Monster Terminal UI Kernel for Rust";
export const size = { width: 1200, height: 600 };
export const contentType = "image/png";

export default function Image() {
  // Load primary brand mark (the head) and background assets
  const headBuffer = readFileSync(join(process.cwd(), "franken_favicon_og.png"));
  const headUri = `data:image/png;base64,${headBuffer.toString("base64")}`;

  const bgBuffer = readFileSync(join(process.cwd(), "public", "screenshots", "dashboard_fullscreen_overview_og.png"));
  const bgUri = `data:image/png;base64,${bgBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#020a02",
          position: "relative",
          overflow: "hidden",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* 1. Deep Background Layer (Grid + Screenshot) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(rgba(34, 197, 94, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.5,
          }}
        />
        
        <img
          src={bgUri}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.1,
            filter: "grayscale(1) contrast(1.2)",
          }}
        />

        {/* 2. Global Vignette / Glows */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at center, transparent 0%, rgba(2, 10, 2, 0.8) 100%)",
          }}
        />
        
        <div
          style={{
            position: "absolute",
            top: "-200px",
            left: "10%",
            width: "800px",
            height: "800px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)",
          }}
        />

        {/* 3. Outer Frame (Stitches + Bolts) */}
        <div
          style={{
            position: "absolute",
            inset: "20px",
            border: "1px solid rgba(34, 197, 94, 0.1)",
            display: "flex",
          }}
        />

        {/* Corner Bolts */}
        {[
          { top: 12, left: 12 },
          { top: 12, right: 12 },
          { bottom: 12, left: 12 },
          { bottom: 12, right: 12 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...pos,
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              backgroundColor: "#1a2e1a",
              border: "1px solid #22c55e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ position: "absolute", width: "10px", height: "1px", backgroundColor: "#22c55e", transform: "rotate(45deg)", display: "flex" }} />
            <div style={{ position: "absolute", width: "10px", height: "1px", backgroundColor: "#22c55e", transform: "rotate(-45deg)", display: "flex" }} />
          </div>
        ))}

        {/* Stitches (Horizontal) */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "25%",
            right: "25%",
            height: "1px",
            borderTop: "2px dashed rgba(34, 197, 94, 0.3)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "25%",
            right: "25%",
            height: "1px",
            borderTop: "2px dashed rgba(34, 197, 94, 0.3)",
          }}
        />

        {/* 4. Main Content Layout */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            height: "100%",
            alignItems: "center",
            padding: "80px",
            zIndex: 10,
          }}
        >
          {/* Logo Section */}
          <div
            style={{
              display: "flex",
              position: "relative",
              marginRight: "60px",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "-20px",
                background: "rgba(34, 197, 94, 0.1)",
                borderRadius: "40px",
                filter: "blur(40px)",
              }}
            />
            <img
              src={headUri}
              alt=""
              width={280}
              height={280}
              style={{
                borderRadius: "48px",
                border: "2px solid rgba(34, 197, 94, 0.2)",
                boxShadow: "0 0 60px rgba(34, 197, 94, 0.3)",
              }}
            />
          </div>

          {/* Text Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444", display: "flex" }} />
              <span style={{ fontSize: "14px", fontWeight: 900, color: "#ef4444", letterSpacing: "4px", display: "flex" }}>SYSTEM_ALIVE</span>
            </div>

            <div
              style={{
                fontSize: "100px",
                fontWeight: 900,
                color: "white",
                lineHeight: 0.9,
                letterSpacing: "-4px",
                display: "flex",
              }}
            >
              FrankenTUI
            </div>

            <div
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#4ade80",
                marginTop: "16px",
                letterSpacing: "-0.5px",
                display: "flex",
              }}
            >
              The Monster Terminal Kernel for Rust.
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "24px",
                marginTop: "40px",
                paddingTop: "32px",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {[
                { label: "WORKSPACE", val: "12 CRATES" },
                { label: "THROUGHPUT", val: "602K C/S" },
                { label: "LOGIC", val: "MATH-HEAVY" },
              ].map((stat, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 900, color: "#64748b", letterSpacing: "2px", display: "flex" }}>{stat.label}</span>
                  <span style={{ fontSize: "20px", fontWeight: 900, color: "white", display: "flex" }}>{stat.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. HUD Accents */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "4px",
          }}
        >
          <span style={{ fontSize: "10px", fontWeight: 900, color: "rgba(34, 197, 94, 0.4)", letterSpacing: "2px", display: "flex" }}>ORIGIN_PROTOCOL_V0.1.1</span>
          <div style={{ width: "120px", height: "2px", backgroundColor: "rgba(34, 197, 94, 0.2)", display: "flex" }} />
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "40px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            backgroundColor: "rgba(34, 197, 94, 0.05)",
            padding: "8px 20px",
            borderRadius: "9999px",
            border: "1px solid rgba(34, 197, 94, 0.1)",
          }}
        >
          <span style={{ fontSize: "18px", fontWeight: 900, color: "#4ade80", letterSpacing: "1px", display: "flex" }}>FRANKENTUI.COM</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}