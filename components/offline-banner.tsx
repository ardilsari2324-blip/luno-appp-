"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";

export function OfflineBanner() {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] bg-amber-500/95 text-amber-950 text-center py-2 text-sm font-medium"
      role="alert"
    >
      {t("offlineMessage")}
    </div>
  );
}
