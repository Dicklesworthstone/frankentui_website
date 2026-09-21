import { readFileSync } from "fs";
import { ImageResponse } from "next/og";
import { join } from "path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  const imageBuffer = readFileSync(join(process.cwd(), "public", "favicon-32.png"));
  const base64 = imageBuffer.toString("base64");
  const dataUri = `data:image/png;base64,${base64}`;

  return new ImageResponse(
    <img src={dataUri} alt="" width={32} height={32} style={{ borderRadius: "4px" }} />,
    { ...size },
  );
}
