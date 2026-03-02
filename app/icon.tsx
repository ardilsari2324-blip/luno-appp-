import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
          borderRadius: 24,
          fontSize: 72,
          fontWeight: 800,
          color: "white",
        }}
      >
        L
      </div>
    ),
    { ...size }
  );
}
