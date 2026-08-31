import { MetadataRoute } from "next";
import settingsData from "@/data/settings.json";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = settingsData.seo.canonicalUrl.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
