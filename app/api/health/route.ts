import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET: Sağlık kontrolü — DB bağlantısı ve uptime */
export async function GET() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const elapsed = Date.now() - start;
    return NextResponse.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
      responseTimeMs: elapsed,
    });
  } catch (e) {
    console.error("Health check failed:", e);
    return NextResponse.json(
      { status: "error", database: "disconnected", error: "Database unreachable" },
      { status: 503 }
    );
  }
}
