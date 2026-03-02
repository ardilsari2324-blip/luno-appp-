"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { ContentWithLinks } from "@/components/content-with-links";
import { MarkdownContent } from "@/components/markdown-content";

type TranslatableContentProps = {
  content: string;
  className?: string;
  compact?: boolean;
};

export function TranslatableContent({ content, className, compact }: TranslatableContentProps) {
  const { locale, t, autoTranslate } = useLanguage();
  const [translated, setTranslated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const doTranslate = useCallback(async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const targetLang = locale === "tr" ? "en" : "tr";
      const sourceLang = locale === "tr" ? "tr" : "en";
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content, source: sourceLang, target: targetLang }),
      });
      const data = await res.json();
      const raw = data.translatedText;
      const isError = typeof raw === "string" && (
        raw.toUpperCase().includes("PLEASE SELECT TWO DISTINCT") ||
        raw.toUpperCase().includes("SELECT TWO DISTINCT LANGUAGES")
      );
      if (raw && raw !== content && !isError) {
        setTranslated(raw);
        setShowOriginal(false);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [content, locale]);

  const invalidTranslation =
    translated !== null &&
    typeof translated === "string" &&
    translated.toUpperCase().includes("PLEASE SELECT TWO DISTINCT");
  const safeTranslated = invalidTranslation ? null : translated;
  const displayText = showOriginal ? content : (safeTranslated ?? content);
  const hasTranslation = safeTranslated !== null;

  useEffect(() => {
    if (invalidTranslation) setTranslated(null);
  }, [invalidTranslation]);

  useEffect(() => {
    if (autoTranslate && !safeTranslated && !loading && content.trim()) {
      doTranslate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- doTranslate triggers state, avoid loop
  }, [autoTranslate, content]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasTranslation && !showOriginal) {
      setShowOriginal(true);
    } else {
      doTranslate();
    }
  };

  if (!content.trim()) return null;

  return (
    <div className={className}>
      {/[\*\[`]/.test(displayText) ? (
        <MarkdownContent content={displayText} className="whitespace-pre-wrap break-words" />
      ) : (
        <ContentWithLinks content={displayText} className="whitespace-pre-wrap break-words" />
      )}
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 px-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 -ml-2 ${
          compact ? "text-xs" : ""
        }`}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          t("translating")
        ) : hasTranslation && !showOriginal ? (
          t("showOriginal")
        ) : (
          <>
            <Languages className="h-3.5 w-3 mr-1" />
            {locale === "tr" ? "EN" : "TR"}
          </>
        )}
      </Button>
    </div>
  );
}
