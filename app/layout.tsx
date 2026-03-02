import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "Luno — Anonim sosyal paylaşım",
    template: "%s | Luno",
  },
  description: "Anonim hesaplarla düşüncelerini paylaş. Kimse seni tanımaz. E-posta veya telefonla güvenle giriş yap.",
  applicationName: "Luno",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Luno",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Luno",
    title: "Luno — Anonim sosyal paylaşım",
    description: "Anonim hesaplarla düşüncelerini paylaş. Kimse seni tanımaz.",
  },
  twitter: {
    card: "summary",
    title: "Luno — Anonim sosyal paylaşım",
    description: "Anonim hesaplarla düşüncelerini paylaş.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#8b5cf6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased font-sans bg-background text-foreground">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('luno_theme')||'dark';document.documentElement.classList.add(t);})();`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
