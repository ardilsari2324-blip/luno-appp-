import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXTAUTH_URL || "https://luno.app";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/app/", "/settings/", "/admin/", "/login"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
