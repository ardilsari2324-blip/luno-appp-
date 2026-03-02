import { toast as sonnerToast } from "sonner";

/** Başarı mesajı */
export function toastSuccess(message: string) {
  sonnerToast.success(message);
}

/** Hata mesajı */
export function toastError(message: string) {
  sonnerToast.error(message);
}

/** Bilgi mesajı */
export function toastInfo(message: string) {
  sonnerToast.info(message);
}

/** Uyarı mesajı */
export function toastWarning(message: string) {
  sonnerToast.warning(message);
}

/** Rate limit (429) için özel mesaj */
export function toastRateLimited() {
  sonnerToast.warning("Çok fazla istek. Lütfen biraz bekleyip tekrar deneyin.");
}

/** API hatası — 429 ise rate limit, değilse genel hata */
export function toastApiError(res?: Response, fallback = "İşlem başarısız.") {
  if (res?.status === 429) {
    toastRateLimited();
    return;
  }
  sonnerToast.error(fallback);
}

/** ApiError veya Error'dan toast göster */
export function toastFromError(err: unknown, fallback = "İşlem başarısız.") {
  if (err instanceof Error && "status" in err && (err as { status?: number }).status === 429) {
    toastRateLimited();
    return;
  }
  const msg = err instanceof Error ? err.message : fallback;
  sonnerToast.error(msg);
}
