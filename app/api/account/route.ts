import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** DELETE: Hesabı sil (kullanıcı + ilişkili veriler cascade ile silinir) — transaction ile atomik */
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const userId = session.user.id;
    await prisma.$transaction(async (tx) => {
      await tx.user.delete({ where: { id: userId } });
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Account delete error:", e);
    return NextResponse.json({ error: "Hesap silinemedi." }, { status: 500 });
  }
}
