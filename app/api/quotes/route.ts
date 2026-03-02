import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { createQuoteSchema } from "@/lib/validations/post";

/** POST: Alıntı gönderi oluştur */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const body = await req.json();
    const parsed = createQuoteSchema.safeParse(body);
    const postId = body.postId as string | undefined;
    if (!parsed.success || !postId) {
      return NextResponse.json(
        { error: parsed.success ? "postId gerekli." : parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const original = await prisma.post.findUnique({ where: { id: postId } });
    if (!original) {
      return NextResponse.json({ error: "Gönderi bulunamadı." }, { status: 404 });
    }
    const quote = await prisma.quote.create({
      data: {
        postId,
        authorId: session.user.id,
        quoteContent: parsed.data.quoteContent,
      },
      include: {
        author: { select: { id: true, anonymousNickname: true } },
        originalPost: {
          include: { author: { select: { id: true, anonymousNickname: true } } },
        },
      },
    });
    return NextResponse.json(quote);
  } catch (e) {
    console.error("Quote create error:", e);
    return NextResponse.json({ error: "Alıntı oluşturulamadı." }, { status: 500 });
  }
}
