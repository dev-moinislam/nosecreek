import { GET as getPageSitemap } from "@/app/sitemap-pages.xml/route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  return getPageSitemap(request);
}
