"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { toastError } from "@/lib/toast";

export function QrPhone() {
  const [qr, setQr] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    fetch("/api/local-url")
      .then((r) => r.json())
      .then((data: { url: string | null }) => {
        if (data.url) {
          setUrl(data.url);
          QRCode.toDataURL(data.url, { width: 220, margin: 2 }).then(setQr);
        }
      })
      .catch(() => toastError(t("errQrLoad")));
  }, [t]);

  if (!qr || !url) return null;

  return (
    <div className="mt-8 p-5 rounded-2xl border border-border bg-card/60 backdrop-blur inline-block">
      <p className="text-sm font-semibold mb-1 text-center">{t("qrTitle")}</p>
      <p className="text-xs text-muted-foreground text-center mb-3">
        {t("qrHint")}
      </p>
      <div className="bg-white p-3 rounded-xl inline-block">
        <Image src={qr} alt="QR kod" width={220} height={220} className="rounded-lg" unoptimized />
      </div>
      <p className="text-xs text-muted-foreground mt-3 text-center break-all max-w-[220px]">{url}</p>
    </div>
  );
}
