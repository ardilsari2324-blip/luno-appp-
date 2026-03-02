import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { put } from "@vercel/blob";
import { checkUserRateLimit } from "@/lib/rate-limit";
import { validateImageBuffer } from "@/lib/upload-security";

export const dynamic = "force-dynamic";

const MAX_SIZE = 25 * 1024 * 1024; // 25MB
const UPLOAD_LIMIT = 10; // kullanıcı başına dakikada
const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }
    const { ok } = await checkUserRateLimit(session.user.id, "upload", UPLOAD_LIMIT);
    if (!ok) {
      return NextResponse.json({ error: "Çok fazla yükleme. Lütfen bekleyin." }, { status: 429 });
    }
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file || !file.size) {
      return NextResponse.json({ error: "Dosya gerekli." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Dosya en fazla 25MB olabilir." }, { status: 400 });
    }
    const type = file.type;
    const isImage = ALLOWED_IMAGE.includes(type);
    const isVideo = ALLOWED_VIDEO.includes(type);
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: "Sadece fotoğraf veya video." }, { status: 400 });
    }
    if (isImage) {
      const buf = await file.arrayBuffer();
      const valid = await validateImageBuffer(buf, type);
      if (!valid) {
        return NextResponse.json({ error: "Geçersiz görsel dosyası." }, { status: 400 });
      }
    }
    const ext = (type.split("/")[1] || "bin").replace(/[^a-z0-9]/gi, "") || "bin";
    const name = `uploads/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const blob = await put(name, file, { access: "public" });
    return NextResponse.json({
      url: blob.url,
      mediaType: isImage ? "image" : "video",
    });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Yükleme başarısız. Lütfen daha sonra tekrar deneyin." },
      { status: 500 }
    );
  }
}
