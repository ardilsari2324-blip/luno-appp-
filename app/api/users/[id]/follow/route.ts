import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET: Takip ediyor mu? */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { id: targetId } = await params;
    const follow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: { followerId: session.user.id, followingId: targetId },
      },
    });
    return NextResponse.json({ following: !!follow });
  } catch (e) {
    console.error("Follow status error:", e);
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}

/** POST: Takip et */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { id: targetId } = await params;
    if (targetId === session.user.id) {
      return NextResponse.json({ error: "Kendinizi takip edemezsiniz." }, { status: 400 });
    }
    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }
    await prisma.userFollow.upsert({
      where: {
        followerId_followingId: { followerId: session.user.id, followingId: targetId },
      },
      create: { followerId: session.user.id, followingId: targetId },
      update: {},
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Follow user error:", e);
    return NextResponse.json({ error: "Takip başarısız." }, { status: 500 });
  }
}

/** DELETE: Takipten çık */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { id: targetId } = await params;
    await prisma.userFollow.deleteMany({
      where: {
        followerId: session.user.id,
        followingId: targetId,
      },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Unfollow user error:", e);
    return NextResponse.json({ error: "Takipten çıkma başarısız." }, { status: 500 });
  }
}
