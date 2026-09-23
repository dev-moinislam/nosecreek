import { getPageSitemapUrls, generateUrlSetXml, buildXmlResponse } from "@/lib/sitemap";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const urls = await getPageSitemapUrls();
  const xml = generateUrlSetXml(urls);
  return buildXmlResponse(xml);
}
