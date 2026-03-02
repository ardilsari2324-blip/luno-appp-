import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { checkUserRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const reportSchema = z.object({
  postId: z.string().optional(),
  commentId: z.string().optional(),
  reportedUserId: z.string().optional(),
  reason: z.enum(["spam", "harassment", "hate", "violence", "other"]).optional(),
  note: z.string().max(500).optional(),
}).refine(
  (d) => d.postId || d.commentId || d.reportedUserId,
  { message: "Gönderi, yorum veya kullanıcı gerekli." }
);

/** POST: İçerik veya kullanıcı şikayet et */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { ok } = await checkUserRateLimit(session.user.id, "report", 10, 60_000);
    if (!ok) {
      return NextResponse.json({ error: "Çok fazla şikayet. Lütfen bekleyin." }, { status: 429 });
    }
    const body = await req.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { postId, commentId, reportedUserId, reason, note } = parsed.data;
    if (postId) {
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) return NextResponse.json({ error: "Gönderi bulunamadı." }, { status: 404 });
    }
    if (commentId) {
      const comment = await prisma.comment.findUnique({ where: { id: commentId } });
      if (!comment) return NextResponse.json({ error: "Yorum bulunamadı." }, { status: 404 });
    }
    if (reportedUserId) {
      const user = await prisma.user.findUnique({ where: { id: reportedUserId } });
      if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }
    await prisma.report.create({
      data: {
        reporterId: session.user.id,
        postId: postId ?? undefined,
        commentId: commentId ?? undefined,
        reportedUserId: reportedUserId ?? undefined,
        reason: reason ?? undefined,
        note: (note ?? "").trim() || undefined,
      },
    });
    return NextResponse.json({ success: true, message: "Şikayet alındı. İncelenecektir." });
  } catch (e) {
    console.error("Report error:", e);
    return NextResponse.json({ error: "Şikayet gönderilemedi." }, { status: 500 });
  }
}
