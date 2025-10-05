import type { MetadataRoute } from "next";

import { SITE_URL, absoluteUrl } from "@/lib/site-metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    host: SITE_URL,
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
