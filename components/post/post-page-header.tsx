"use client";

import { BackButton } from "@/components/ui/back-button";
import { useLanguage } from "@/lib/language-context";

export function PostPageHeader() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center">
      <BackButton href="/app" />
      <span className="ml-2 text-sm text-muted-foreground">{t("post")}</span>
    </div>
  );
}
