import { NextResponse } from "next/server";

/** Güvenli hata mesajı — production'da iç detay sızmaz */
export function apiError(
  message: string,
  status: number = 500,
  details?: Record<string, unknown>
) {
  const body: Record<string, unknown> = { error: message };
  if (process.env.NODE_ENV === "development" && details) {
    body.details = details;
  }
  return NextResponse.json(body, { status });
}

/** Başarılı JSON yanıtı */
export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}
