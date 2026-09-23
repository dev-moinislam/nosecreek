import { getPageSitemapUrls, generateUrlSetXml, buildXmlResponse } from "@/lib/sitemap";
import { getSiteBaseUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const rawBase = await getSiteBaseUrl(request);
  const urls = await getPageSitemapUrls(rawBase);
  const xml = generateUrlSetXml(urls);
  return buildXmlResponse(xml);
}
