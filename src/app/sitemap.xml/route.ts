import { getSiteBaseUrl } from "@/lib/seo";
import { generateSitemapIndexXml, buildXmlResponse } from "@/lib/sitemap";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const rawBase = await getSiteBaseUrl(request);
  const baseUrl = rawBase.replace(/\/$/, "");
  const now = new Date();

  const sitemaps = [
    { loc: `${baseUrl}/sitemap-pages.xml`, lastmod: now },
    { loc: `${baseUrl}/sitemap-services.xml`, lastmod: now },
    { loc: `${baseUrl}/sitemap-conditions.xml`, lastmod: now },
    { loc: `${baseUrl}/sitemap-posts.xml`, lastmod: now },
    { loc: `${baseUrl}/sitemap-team.xml`, lastmod: now },
    { loc: `${baseUrl}/sitemap-locations.xml`, lastmod: now }
  ];

  const xml = generateSitemapIndexXml(sitemaps);
  return buildXmlResponse(xml);
}
