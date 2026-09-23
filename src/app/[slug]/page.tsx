import React from "react";
import { notFound } from "next/navigation";
import { getCustomPageBySlug, getCustomPages, getTeamMembers, getServices, getConditions } from "@/lib/api";
import { resolvePageMetadata } from "@/lib/seo";
import CustomPageLiveView from "@/components/content/CustomPageLiveView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

export async function generateStaticParams() {
  try {
    const pages = await getCustomPages();
    return pages
      .filter((p) => (p.isPublished !== false && p.is_published !== false) && p.slug)
      .map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = await getCustomPageBySlug(slug);

  if (!page) {
    return {
      title: "Page Not Found | Nose Creek Physiotherapy"
    };
  }

  const pathUrl = `/${slug}`;
  const defaultTitle = page.seoTitle || `${page.title} | Nose Creek Physiotherapy Calgary`;
  const defaultDesc = page.seoDescription || page.heroSubtitle || page.subtitle || undefined;

  const heroImg = page.heroImage || 
    page.hero_image || 
    page.sectionsData?.hero?.image ||
    page.sections_data?.hero?.image ||
    (page as any).cardImage ||
    undefined;

  const targetOgImage = page.ogImage || page.seoOgImage || page.seo?.ogImage || heroImg;

  return resolvePageMetadata(pathUrl, {
    title: defaultTitle,
    description: defaultDesc,
    openGraph: {
      title: defaultTitle,
      description: defaultDesc,
      url: `https://www.nosecreekphysiotherapy.com/${slug}`,
      siteName: "Nose Creek Physiotherapy",
      type: "website",
      images: targetOgImage ? [{ url: targetOgImage }] : undefined
    }
  });
}

export default async function DynamicCustomLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getCustomPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const [allTeam, allServices, allConditions] = await Promise.all([
    getTeamMembers().catch(() => []),
    getServices().catch(() => []),
    getConditions().catch(() => [])
  ]);

  return (
    <CustomPageLiveView
      initialPage={page}
      allTeam={allTeam}
      allServices={allServices}
      allConditions={allConditions}
    />
  );
}
