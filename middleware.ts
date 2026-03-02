import { NextResponse } from "next/server";
import { auth } from "@/auth";

const securityHeaders = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isApp = req.nextUrl.pathname.startsWith("/app");
  const isSettings = req.nextUrl.pathname.startsWith("/settings");
  const isAdmin = req.nextUrl.pathname.startsWith("/admin");
  const isAuthPage = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/";

  if (isApp || isSettings || isAdmin) {
    if (!isLoggedIn) {
      const login = new URL("/login", req.nextUrl.origin);
      login.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return Response.redirect(login);
    }
  }

  if (isAuthPage && isLoggedIn && req.nextUrl.pathname === "/login") {
    return Response.redirect(new URL("/app", req.nextUrl.origin));
  }

  const res = NextResponse.next();
  Object.entries(securityHeaders).forEach(([k, v]) => res.headers.set(k, v));
  return res;
});

export const config = {
  matcher: ["/app/:path*", "/settings/:path*", "/admin/:path*", "/login"],
};
