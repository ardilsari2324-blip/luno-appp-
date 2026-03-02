"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";

export function SettingsPageHeader() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/app" className="flex items-center gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Link>
      </Button>
      <div>
        <h1 className="font-bold text-lg">{t("settings")}</h1>
        <p className="text-xs text-muted-foreground">{t("language")} · {t("profile")}</p>
      </div>
    </div>
  );
}
