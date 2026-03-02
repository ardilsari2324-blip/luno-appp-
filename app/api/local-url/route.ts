import { NextResponse } from "next/server";
import os from "os";

export const dynamic = "force-dynamic";

/** Geliştirme için: Telefonda açmak üzere yerel ağ URL'ini döner (QR için) */
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ url: null });
  }
  const port = process.env.PORT || "3001";
  let host: string | null = null;
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    const list = ifaces[name];
    if (!list) continue;
    for (const iface of list) {
      if (iface.family === "IPv4" && !iface.internal) {
        host = iface.address;
        break;
      }
    }
    if (host) break;
  }
  const url = host ? `http://${host}:${port}` : null;
  return NextResponse.json({ url });
}
