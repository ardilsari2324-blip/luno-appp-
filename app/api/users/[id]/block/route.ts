import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET: Engellenmiş mi? */
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
    const block = await prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: { blockerId: session.user.id, blockedId: targetId },
      },
    });
    return NextResponse.json({ blocked: !!block });
  } catch (e) {
    console.error("Block status error:", e);
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}

/** POST: Kullanıcıyı engelle */
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
      return NextResponse.json({ error: "Kendinizi engelleyemezsiniz." }, { status: 400 });
    }
    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }
    await prisma.userBlock.upsert({
      where: {
        blockerId_blockedId: { blockerId: session.user.id, blockedId: targetId },
      },
      create: { blockerId: session.user.id, blockedId: targetId },
      update: {},
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Block user error:", e);
    return NextResponse.json({ error: "Engelleme başarısız." }, { status: 500 });
  }
}

/** DELETE: Engeli kaldır */
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
    await prisma.userBlock.deleteMany({
      where: {
        blockerId: session.user.id,
        blockedId: targetId,
      },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Unblock user error:", e);
    return NextResponse.json({ error: "Engel kaldırılamadı." }, { status: 500 });
  }
}
