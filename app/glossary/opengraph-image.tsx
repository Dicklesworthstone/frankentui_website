import { readFileSync } from "fs";
import { join } from "path";
import { ImageResponse } from "next/og";

export const alt = "FrankenTUI Glossary — Terminal Terminology";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const headBuffer = readFileSync(join(process.cwd(), "franken_favicon_og.png"));
  const headUri = `data:image/png;base64,${headBuffer.toString("base64")}`;

  const bgBuffer = readFileSync(join(process.cwd(), "public", "screenshots", "widget_gallery_inputs_and_controls_og.png"));
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

        <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", padding: "80px", zIndex: 10 }}>
          <div style={{ display: "flex", position: "relative", marginRight: "60px" }}>
            <img src={headUri} alt="" width={280} height={280} style={{ borderRadius: "48px", border: "2px solid rgba(34, 197, 94, 0.2)", boxShadow: "0 0 60px rgba(34, 197, 94, 0.3)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e", display: "flex" }} />
              <span style={{ fontSize: "14px", fontWeight: 900, color: "#22c55e", letterSpacing: "4px", display: "flex" }}>LEXICAL_DECODER_INIT</span>
            </div>
            <div style={{ fontSize: "80px", fontWeight: 900, color: "white", lineHeight: 0.9, letterSpacing: "-4px", display: "flex", flexDirection: "column" }}>
              <span style={{ display: "flex" }}>Glossary</span>
              <span style={{ display: "flex" }}>Engine.</span>
            </div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#4ade80", marginTop: "24px", letterSpacing: "1px", display: "flex" }}>
              DEMYSTIFYING THE ARCANE VOCABULARY OF TUIS.
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: "40px", right: "40px", display: "flex", alignItems: "center", gap: "12px", backgroundColor: "rgba(34, 197, 94, 0.05)", padding: "8px 20px", borderRadius: "9999px", border: "1px solid rgba(34, 197, 94, 0.1)" }}>
          <span style={{ fontSize: "18px", fontWeight: 900, color: "#4ade80", display: "flex" }}>FRANKENTUI / LEX</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
