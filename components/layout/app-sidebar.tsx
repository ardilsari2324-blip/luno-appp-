"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Home, MessageCircle, Settings, LogOut, Languages, Bell, Search, Shield, User, Menu } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

type User = { id?: string; name?: string | null; image?: string | null };

export function AppSidebar({ user, isAdmin }: { user: User; isAdmin?: boolean }) {
  const pathname = usePathname();
  const { t, locale, setLocale } = useLanguage();
  const [anonOpen, setAnonOpen] = useState(false);
  const [anonDragging, setAnonDragging] = useState(false);
  const [anonDragY, setAnonDragY] = useState(0);
  const anonDraggingRef = useRef(false);
  const anonSheetRef = useRef<HTMLDivElement | null>(null);
  const dragStartYRef = useRef(0);
  const dragMaxDyRef = useRef(0);
  const ANON_PEEK_PX = 28;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Route değişince paneli kapat; "ayarlar kaçıyo" hissini azaltır.
  useEffect(() => {
    setAnonOpen(false);
    setAnonDragging(false);
    setMobileNavOpen(false);
    anonDraggingRef.current = false;
    setAnonDragY(0);
  }, [pathname]);
  const nav = [
    { href: "/app", label: t("feed"), icon: Home },
    { href: "/app/search", label: t("search"), icon: Search },
    { href: "/app/notifications", label: t("notifications"), icon: Bell },
    { href: "/app/messages", label: t("messages"), icon: MessageCircle },
    ...(user?.id ? [{ href: `/app/profile/${user.id}`, label: t("profile"), icon: User }] as const : []),
    { href: "/settings", label: t("settings"), icon: Settings },
    ...(isAdmin ? [{ href: "/admin", label: t("admin"), icon: Shield }] as const : []),
  ];
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 flex flex-col hidden lg:flex">
      <div className="p-4 border-b border-border">
        <Link href="/app" className="flex items-center gap-2 group">
          <span className="text-xl font-extrabold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
            {t("appName")}
          </span>
        </Link>
      </div>
      <nav className="p-3 flex-1 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/app" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border hidden lg:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl h-12 px-4 hover:bg-muted">
              <Avatar className="h-8 w-8 ring-2 ring-border">
                <AvatarFallback className="text-xs bg-primary/20 text-primary">
                  {(user.name || "?")?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-sm font-medium">{user.name || "Anon"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                {t("settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLocale(locale === "tr" ? "en" : "tr")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Languages className="h-4 w-4" />
              {locale === "tr" ? "English" : "Türkçe"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              {t("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </aside>

      {/* Mobile: "Anon" butonu aç/kapa paneli (dropdown değil) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur">
        <div className="flex w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setMobileNavOpen(false);
              setAnonDragging(false);
              setAnonDragY(0);
              setAnonOpen((v) => !v);
            }}
            className="w-1/2 justify-center gap-2 h-[72px] rounded-none"
          >
            <Avatar className="h-8 w-8 ring-2 ring-border shrink-0">
              <AvatarFallback className="text-xs bg-primary/20 text-primary">
                {(user.name || "Anon")?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate max-w-[70%] text-sm font-semibold">{user.name || "Anon"}</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setAnonOpen(false);
              setAnonDragging(false);
              setAnonDragY(0);
              setMobileNavOpen((v) => !v);
            }}
            className="w-1/2 justify-center gap-2 h-[72px] rounded-none"
            aria-label="Menü"
          >
            <Menu className="h-5 w-5" />
            <span className="text-sm font-semibold">Menü</span>
          </Button>
        </div>
      </div>

      {/* Mobile nav: Akış/Ara/Bildirimler/Mesajlar/Profil/Ayarlar */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setMobileNavOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute left-0 top-0 bottom-[72px] w-64 bg-background/95 backdrop-blur border-r border-border overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border">
              <p className="text-xs text-muted-foreground">{t("forYou")}</p>
              <p className="font-bold truncate">{t("appName")}</p>
            </div>
            <nav className="p-3 space-y-1">
              {nav.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== "/app" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {label}
                  </Link>
                );
              })}
              <div className="pt-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 px-4 py-3 h-auto rounded-xl text-sm font-medium"
                  onClick={() => setLocale(locale === "tr" ? "en" : "tr")}
                >
                  <Languages className="h-4 w-4" />
                  {locale === "tr" ? "English" : "Türkçe"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 px-4 py-3 h-auto rounded-xl text-sm font-medium text-destructive"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4" />
                  {t("signOut")}
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Mini/pushable anon panel (drag handle ile kenara kayar, az bir kısmı kalır) */}
      <div className="lg:hidden fixed inset-x-0 bottom-[72px] z-50">
        <div
          ref={anonSheetRef}
          className="mx-auto w-[calc(100%-24px)] rounded-2xl bg-card border border-border shadow-lg p-4 will-change-transform"
          style={{
            transform: anonOpen ? `translateY(${anonDragY}px)` : `translateY(calc(100% - ${ANON_PEEK_PX}px))`,
            transition: anonDragging ? "none" : "transform 200ms ease-out",
          }}
          aria-hidden={!anonOpen}
        >
          <div
            className="h-5 -mx-4 px-4 flex items-center justify-center cursor-grab select-none"
            role="button"
            aria-label="Anon paneli"
            onClick={() => {
              if (!anonOpen) {
                setAnonOpen(true);
                setAnonDragging(false);
                setAnonDragY(0);
              }
            }}
            onPointerDown={(e) => {
              if (!anonOpen) return; // mini halde sadece tıklama ile açılır
              setAnonDragging(true);
              anonDraggingRef.current = true;
              setAnonDragY(0);
              dragStartYRef.current = e.clientY;

              const h = anonSheetRef.current?.getBoundingClientRect().height ?? 240;
              dragMaxDyRef.current = Math.max(0, h - ANON_PEEK_PX);

              try {
                (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
              } catch {}
            }}
            onPointerMove={(e) => {
              if (!anonDraggingRef.current) return;
              const dy = e.clientY - dragStartYRef.current;
              const clamped = Math.max(0, Math.min(dy, dragMaxDyRef.current));
              setAnonDragY(clamped);
            }}
            onPointerUp={(e) => {
              if (!anonDraggingRef.current) return;
              const dy = e.clientY - dragStartYRef.current;
              const maxDy = dragMaxDyRef.current || 1;
              setAnonDragging(false);
              anonDraggingRef.current = false;
              setAnonDragY(0);
              setAnonOpen(dy < maxDy * 0.4); // yeterince itildiyse kapat
            }}
            onPointerCancel={() => {
              if (!anonDraggingRef.current) return;
              setAnonDragging(false);
              anonDraggingRef.current = false;
              setAnonDragY(0);
              setAnonOpen(true);
            }}
            style={{
              touchAction: "none",
            }}
          >
            {/* Minimize halde görünen sürükleme şeridi: Luno lilası */}
            <div className="h-1.5 w-12 rounded-full bg-primary/80 glow-primary" />
          </div>

          {/* İçerik sadece açıkken etkileşime girsin */}
          <div className={`pt-1 transition-opacity ${anonOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{t("featureAnonymous")}</p>
                <p className="font-bold truncate">{user.name || "Anon"}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAnonOpen(false);
                  setAnonDragging(false);
                  setAnonDragY(0);
                }}
              >
                Kapat
              </Button>
            </div>

            {user?.id && (
              <div className="mt-3">
                <Link
                  href={`/app/profile/${user.id}`}
                  className="inline-flex items-center justify-center w-full h-10 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary font-semibold"
                  onClick={() => setAnonOpen(false)}
                >
                  Profilim
                </Link>
              </div>
            )}

            <div className="mt-3">
              <Link
                href="/settings"
                className="inline-flex items-center justify-center w-full h-10 rounded-xl bg-muted hover:bg-muted/70 text-foreground font-semibold"
                onClick={() => setAnonOpen(false)}
              >
                {t("settings")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
