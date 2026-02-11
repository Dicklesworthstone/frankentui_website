import { readFileSync } from "fs";
import { join } from "path";
import { ImageResponse } from "next/og";

export const alt = "FrankenTUI Architecture — Inside the Machine";
export const size = { width: 1200, height: 600 };
export const contentType = "image/png";

export default function Image() {
  const headBuffer = readFileSync(join(process.cwd(), "franken_favicon_og.png"));
  const headUri = `data:image/png;base64,${headBuffer.toString("base64")}`;

  const bgBuffer = readFileSync(join(process.cwd(), "public", "screenshots", "code_explorer_syntax_highlighting_og.png"));
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
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(rgba(34, 197, 94, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.5,
            display: "flex",
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
            opacity: 0.15,
            filter: "grayscale(1) contrast(1.2)",
          }}
        />

        <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", padding: "60px 80px", zIndex: 10 }}>
          <div style={{ display: "flex", position: "relative", marginRight: "50px" }}>
            <img src={headUri} alt="" width={240} height={240} style={{ borderRadius: "40px", border: "2px solid rgba(34, 197, 94, 0.2)", boxShadow: "0 0 60px rgba(34, 197, 94, 0.3)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e", display: "flex" }} />
              <span style={{ fontSize: "14px", fontWeight: 900, color: "#22c55e", letterSpacing: "4px", display: "flex" }}>ARCHITECTURE_PROBE</span>
            </div>
            <div style={{ fontSize: "72px", fontWeight: 900, color: "white", lineHeight: 0.9, letterSpacing: "-4px", display: "flex", flexDirection: "column" }}>
              <span style={{ display: "flex" }}>Inside the</span>
              <span style={{ display: "flex" }}>Machine.</span>
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#4ade80", marginTop: "20px", letterSpacing: "1px", display: "flex" }}>
              16-Byte Cell Model {"&"} Bayesian Diff Engine
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: "30px", right: "40px", display: "flex", alignItems: "center", gap: "12px", backgroundColor: "rgba(34, 197, 94, 0.05)", padding: "8px 20px", borderRadius: "9999px", border: "1px solid rgba(34, 197, 94, 0.1)" }}>
          <span style={{ fontSize: "18px", fontWeight: 900, color: "#4ade80", display: "flex" }}>FRANKENTUI / ARCH</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
