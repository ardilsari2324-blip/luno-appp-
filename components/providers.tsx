"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/lib/language-context";
import { ThemeProvider } from "@/lib/theme-context";
import { CookieConsent } from "@/components/cookie-consent";
import { OfflineBanner } from "@/components/offline-banner";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

const defaultOptions = {
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 2,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: { retry: 1 },
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient(defaultOptions));
  return (
    <SessionProvider>
      <ThemeProvider>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            {children}
            <CookieConsent />
            <OfflineBanner />
            <ServiceWorkerRegister />
            <Toaster
              position="top-center"
              richColors
              closeButton
              duration={4000}
              toastOptions={{
                style: { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" },
              }}
            />
          </QueryClientProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
