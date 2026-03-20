import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { normalizeEmail, verifyPassword } from "@/lib/password";
import { z } from "zod";

export const dynamic = "force-dynamic";

const deleteBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password required."),
});

/** DELETE: Hesabı sil — e-posta + şifre doğrulaması */
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Email and password required." }, { status: 400 });
    }

    const parsed = deleteBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const email = normalizeEmail(parsed.data.email);
    const { password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    if (user.email !== email) {
      return NextResponse.json({ error: "Email does not match this account." }, { status: 400 });
    }
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "This account has no password set; contact support." },
        { status: 400 }
      );
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 400 });
    }

    const userId = session.user.id;
    await prisma.$transaction(async (tx) => {
      await tx.user.delete({ where: { id: userId } });
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Account delete error:", e);
    return NextResponse.json({ error: "Could not delete account." }, { status: 500 });
  }
}
