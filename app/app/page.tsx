"use client";

import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const Feed = dynamic(() => import("@/components/feed/feed").then((m) => ({ default: m.Feed })), {
  loading: () => <FeedSkeleton />,
  ssr: false,
});

function FeedSkeleton() {
  return (
    <div className="animate-in">
      <div className="p-4 border-b border-border space-y-3">
        <div className="h-24 bg-muted/50 rounded-xl animate-skeleton" />
        <div className="flex gap-2">
          <div className="h-10 w-20 bg-muted/50 rounded-lg animate-skeleton" />
          <div className="h-10 w-16 bg-muted/50 rounded-lg ml-auto animate-skeleton" />
        </div>
      </div>
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="h-11 w-11 rounded-xl bg-muted/50 shrink-0 animate-skeleton" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-muted/50 rounded animate-skeleton" />
              <div className="h-16 bg-muted/50 rounded animate-skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AppPage() {
  const { t } = useLanguage();
  return (
    <div className="max-w-2xl mx-auto border-x border-border min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <h1 className="font-bold text-xl flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {t("forYou")}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t("forYouDesc")}</p>
      </div>
      <Feed />
    </div>
  );
}
