"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/language-context";
import { useTheme } from "@/lib/theme-context";
import { Loader2, Trash2, Sun, Moon, Download } from "lucide-react";
import { toastError } from "@/lib/toast";

export function SettingsForm({
  user,
}: {
  user: { id: string; name?: string };
}) {
  const router = useRouter();
  const { t, locale, setLocale, autoTranslate, setAutoTranslate } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [prefsLoading, setPrefsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/account/preferences")
      .then((r) => r.json())
      .then((d) => setEmailNotifications(!!d.emailNotifications))
      .catch(() => toastError(t("errFailed")))
      .finally(() => setPrefsLoading(false));
  }, [t]);

  async function handleExportData() {
    setExporting(true);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `luno-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toastError(t("errExportFailed"));
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAccount() {
    if (!confirm(t("confirmDeleteAccount"))) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (res.ok) {
        await signOut({ callbackUrl: "/" });
        router.push("/");
        router.refresh();
      } else {
        const j = await res.json();
        toastError(j.error || "Hesap silinemedi.");
      }
    } catch {
      toastError("Hesap silinemedi.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("profile")}</CardTitle>
          <CardDescription>
            {t("profileDesc")} <strong>{user.name || "—"}</strong>. {t("profileNote")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
            {t("signOut")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("language")}</CardTitle>
          <CardDescription>{t("languageDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={locale === "en" ? "default" : "outline"}
              onClick={() => setLocale("en")}
            >
              English
            </Button>
            <Button
              variant={locale === "tr" ? "default" : "outline"}
              onClick={() => setLocale("tr")}
            >
              Türkçe
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">{t("emailNotifications")}</p>
              <p className="text-sm text-muted-foreground">{t("emailNotificationsDesc")}</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                disabled={prefsLoading}
                onChange={(e) => {
                  const v = e.target.checked;
                  setEmailNotifications(v);
                  fetch("/api/account/preferences", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ emailNotifications: v }),
                  }).catch(() => setEmailNotifications(!v));
                }}
                className="rounded"
              />
              <span className="text-sm">{emailNotifications ? t("stateOn") : t("stateOff")}</span>
            </label>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">{t("autoTranslate")}</p>
              <p className="text-sm text-muted-foreground">{t("autoTranslateDesc")}</p>
            </div>
            <Button
              variant={autoTranslate ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoTranslate(!autoTranslate)}
            >
              {autoTranslate ? "ON" : "OFF"}
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4 mt-4">
            <div>
              <p className="font-medium">{t("theme")}</p>
              <p className="text-sm text-muted-foreground">{theme === "dark" ? t("darkTheme") : t("lightTheme")}</p>
            </div>
            <div className="flex gap-2">
              <Button variant={theme === "light" ? "default" : "outline"} size="sm" onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4 mr-1" />
                {t("lightTheme")}
              </Button>
              <Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4 mr-1" />
                {t("darkTheme")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("exportMyData")}</CardTitle>
          <CardDescription>{t("exportDataDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleExportData} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
            {t("exportMyData")}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">{t("deleteAccount")}</CardTitle>
          <CardDescription>
            {t("confirmDeleteAccount")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
            {t("deleteAccount")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
