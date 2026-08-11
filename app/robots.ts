import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/auth/", "/kullanici-adi", "/listelerim"] },
    sitemap: "https://anadoluturkuleri.com/sitemap.xml",
    host: "https://anadoluturkuleri.com",
  };
}
