import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const ADMIN_IDS = (process.env.ADMIN_USER_IDS ?? process.env.ADMIN_USER_ID ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAdmin(userId: string) {
  return ADMIN_IDS.length > 0 && ADMIN_IDS.includes(userId);
}

/** GET: Şikayet listesi (sadece admin) */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !isAdmin(session.user.id)) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";
    const reports = await prisma.report.findMany({
      where: status === "all" ? {} : { status },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        reporter: { select: { id: true, anonymousNickname: true } },
        post: { select: { id: true, content: true } },
        comment: { select: { id: true, content: true } },
      },
    });
    return NextResponse.json(reports);
  } catch (e) {
    console.error("Admin reports error:", e);
    return NextResponse.json({ error: "Yüklenemedi." }, { status: 500 });
  }
}
