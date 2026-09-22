import { MetadataRoute } from "next";
import { getSiteBaseUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const rawBaseUrl = await getSiteBaseUrl();
  const baseUrl = rawBaseUrl.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/admin-login", "/client-login", "/api/"]
    },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
