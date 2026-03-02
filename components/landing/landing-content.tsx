"use client";

import Link from "next/link";
import { QrPhone } from "@/components/qr-phone";
import { MessageCircle, Shield, Zap, Sparkles, Languages } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";

type Session = { user?: { id?: string } } | null;

export function LandingContent({ session }: { session: Session }) {
  const { t, locale, setLocale } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              {t("appName")}
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => setLocale(locale === "tr" ? "en" : "tr")}
            >
              <Languages className="h-4 w-4 mr-1" />
              {locale === "tr" ? "EN" : "TR"}
            </Button>
            {session?.user ? (
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity glow-primary"
              >
                {t("goToFeed")}
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity glow-primary"
              >
                {t("signIn")}
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-24 pb-20 px-4 gradient-mesh">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-in">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Sparkles className="h-4 w-4" />
              {t("heroBadge")}
            </p>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                {t("heroTitle1")}
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                {t("heroTitle2")}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              {t("heroDesc")} <strong className="text-foreground">{t("heroHighlight")}</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href={session?.user ? "/app" : "/login"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground hover:opacity-90 transition-all hover:scale-[1.02] glow-primary"
              >
                {session?.user ? t("goToFeed") : t("getStarted")}
              </Link>
              {!session?.user && (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card/50 px-8 py-4 text-base font-medium hover:bg-accent/50 transition-colors"
                >
                  {t("alreadyHaveAccount")}
                </Link>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-16">
              {[
                { icon: Shield, text: t("featureAnonymous") },
                { icon: Zap, text: t("featureInstant") },
                { icon: MessageCircle, text: t("featureMessages") },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-2 text-sm text-muted-foreground"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {text}
                </div>
              ))}
            </div>

            <QrPhone />
          </div>
        </div>

        {process.env.NODE_ENV === "development" && (
          <p className="mt-12 text-center text-xs text-muted-foreground max-w-md mx-auto">
            Localhost engelli mi? İki terminal: <code className="bg-muted px-1.5 py-0.5 rounded">npm run dev</code> + <code className="bg-muted px-1.5 py-0.5 rounded">npm run dev:tunnel</code>. Çıkan https linkini aç.
          </p>
        )}
      </main>

      <footer className="border-t border-border/40 py-6 text-center text-sm text-muted-foreground">
        {t("footer")}
      </footer>
    </div>
  );
}
