import { getTeamSitemapUrls, generateUrlSetXml, buildXmlResponse } from "@/lib/sitemap";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const urls = await getTeamSitemapUrls();
  const xml = generateUrlSetXml(urls);
  return buildXmlResponse(xml);
}
