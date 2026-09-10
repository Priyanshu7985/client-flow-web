import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pricing"],
      disallow: ["/dashboard", "/projects", "/clients", "/feedback", "/settings", "/review", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
