"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Home, MessageCircle, Settings, LogOut, Languages, Bell, Search, Shield, User } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

type User = { id?: string; name?: string | null; image?: string | null };

export function AppSidebar({ user, isAdmin }: { user: User; isAdmin?: boolean }) {
  const pathname = usePathname();
  const { t, locale, setLocale } = useLanguage();
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
    <aside className="w-64 border-r border-border bg-card/50 flex flex-col">
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
      <div className="p-3 border-t border-border">
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
  );
}
