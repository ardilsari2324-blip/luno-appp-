import { NextResponse } from "next/server";

/** RFC 9116 — güvenlik açığı bildirimi için iletişim */
export async function GET() {
  const contact = process.env.SECURITY_CONTACT_EMAIL?.trim() || "security@example.com";
  const base =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const lines = [
    "Contact: mailto:" + contact,
    "Preferred-Languages: tr, en",
  ];
  if (base) {
    lines.push(`Canonical: ${base}/.well-known/security.txt`);
  }
  lines.push("", "# SECURITY_CONTACT_EMAIL ve NEXTAUTH_URL ile özelleştirin.");
  const body = lines.join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
