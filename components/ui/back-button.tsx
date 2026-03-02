"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

type BackButtonProps = {
  href?: string;
  className?: string;
};

export function BackButton({ href, className }: BackButtonProps) {
  const router = useRouter();
  const { t } = useLanguage();

  if (href) {
    return (
      <Button variant="ghost" size="sm" asChild className={className}>
        <a href={href} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </a>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      {t("back")}
    </Button>
  );
}
