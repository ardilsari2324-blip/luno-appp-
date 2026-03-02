"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold">{t("error")}</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {t("errorOccurred")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="default">
            {t("tryAgain")}
          </Button>
          <Button asChild variant="outline">
            <Link href="/">{t("backToHome")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
