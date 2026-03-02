"use client";

import { BackButton } from "@/components/ui/back-button";
import { useLanguage } from "@/lib/language-context";

export function MessagesPageHeader() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-3">
      <BackButton href="/app" />
      <div>
        <h1 className="font-bold text-xl">{t("messagesTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t("messagesDesc")}</p>
      </div>
    </div>
  );
}
