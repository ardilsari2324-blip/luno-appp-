import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "Luno — Anonymous social sharing",
    template: "%s | Luno",
  },
  description:
    "Share thoughts anonymously. Nobody knows who you are. Sign in securely with email or phone.",
  applicationName: "Luno",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Luno",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Luno",
    title: "Luno — Anonymous social sharing",
    description: "Share thoughts anonymously. Sign in with email or phone.",
  },
  twitter: {
    card: "summary",
    title: "Luno — Anonymous social sharing",
    description: "Share thoughts anonymously. Sign in with email or phone.",
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
    <html lang="en" suppressHydrationWarning>
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
