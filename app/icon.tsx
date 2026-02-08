import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "32px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#020a02",
          borderRadius: "4px",
          border: "1.5px solid #22c55e44",
          boxShadow: "0 0 6px #22c55e55",
        }}
      >
        <span
          style={{
            fontSize: "22px",
            fontWeight: 900,
            fontFamily: "monospace",
            color: "#22c55e",
            lineHeight: 1,
            letterSpacing: "-1px",
          }}
        >
          F
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
