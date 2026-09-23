import { GET as getPostSitemap } from "@/app/sitemap-posts.xml/route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return getPostSitemap();
}
