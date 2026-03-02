import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size } = await params;
  const n = size === "192" ? 192 : size === "512" ? 512 : 192;
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
          borderRadius: n / 8,
          fontSize: n * 0.5,
          fontWeight: 800,
          color: "white",
        }}
      >
        L
      </div>
    ),
    { width: n, height: n }
  );
}
