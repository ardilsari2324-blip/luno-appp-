"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "luno_cookie_consent";

export function CookieConsent() {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) setShow(true);
  }, []);

  function accept() {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
      setShow(false);
    }
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card/95 backdrop-blur border-t border-border shadow-lg">
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t("cookieConsent")}{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            {t("privacyTitle")}
          </Link>
        </p>
        <Button size="sm" onClick={accept} className="shrink-0">
          {t("acceptCookies")}
        </Button>
      </div>
    </div>
  );
}
