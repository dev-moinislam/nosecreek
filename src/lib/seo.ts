import { Metadata } from "next";
import { getSiteSettings, getServices, getConditions, getBlogPosts, getTeamMembers, getLocations, getCustomPages } from "@/lib/api";
import { PageMetaItem } from "@/types/content";

export interface SiteRouteInfo {
  path: string;
  name: string;
  category: "Core Pages" | "Clinical Services" | "Conditions We Treat" | "Sub-Pages" | "Blog Posts" | "Team Members" | "Clinic Locations" | "Neighborhood & Custom Pages";
  parentName?: string;
  parentSlug?: string;
  isSubPage?: boolean;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage?: string;
}

/**
 * Standard Core Pages Definitions
 */
export const CORE_PAGES: SiteRouteInfo[] = [
  {
    path: "/",
    name: "Homepage",
    category: "Core Pages",
    defaultTitle: "Nose Creek Physiotherapy Calgary | Physiotherapy, Massage & Movement",
    defaultDescription: "Physiotherapy in Calgary North (Beddington). Since 2001, restoring mobility, strength & balance naturally. Direct insurance billing, open evenings & Saturdays.",
    defaultOgImage: "/images/og-home.jpg"
  },
  {
    path: "/about",
    name: "About Us & Clinic Philosophy",
    category: "Core Pages",
    defaultTitle: "About Nose Creek Physiotherapy Calgary | Our Team & Philosophy",
    defaultDescription: "Dedicated to restoring motion and active living since 2001. Learn about our multidisciplinary team, FCAMPT manual therapy credentials, and clinic philosophy.",
    defaultOgImage: "/images/clinic/clinic-mobile.jpg"
  },
  {
    path: "/services",
    name: "Services Directory",
    category: "Core Pages",
    defaultTitle: "Clinical Services | Nose Creek Physiotherapy Calgary",
    defaultDescription: "Explore our full range of clinical services in Calgary North including physiotherapy, massage therapy, shockwave therapy, custom orthotics, and knee bracing.",
    defaultOgImage: "/images/clinic/reception-three.jpg"
  },
  {
    path: "/conditions",
    name: "What We Treat (Conditions Directory)",
    category: "Core Pages",
    defaultTitle: "Conditions We Treat | Nose Creek Physiotherapy Calgary",
    defaultDescription: "Explore the wide range of musculoskeletal, spinal, and sports injury conditions treated at Nose Creek Physiotherapy in Calgary NW & NE.",
    defaultOgImage: "/images/clinic/reception-four.jpg"
  },
  {
    path: "/contact",
    name: "Contact & Directions",
    category: "Core Pages",
    defaultTitle: "Contact Nose Creek Physiotherapy Calgary | Beddington Location",
    defaultDescription: "Find our Calgary North clinic at Beddington Towne Centre. Contact info, hours, directions, transit access, and direct booking lines.",
    defaultOgImage: "/images/clinic/clinic-mobile.jpg"
  },
  {
    path: "/team",
    name: "Our Practitioners & Team Directory",
    category: "Core Pages",
    defaultTitle: "Meet Our Team | Nose Creek Physiotherapy Calgary",
    defaultDescription: "Get to know the highly qualified physiotherapists, chiropractors, and massage therapists at Nose Creek Physiotherapy in Calgary.",
    defaultOgImage: "/images/team/team-banner.jpg"
  },
  {
    path: "/blog",
    name: "Health & Wellness Blog",
    category: "Core Pages",
    defaultTitle: "Health & Wellness Blog | Nose Creek Physiotherapy Calgary",
    defaultDescription: "Read the latest physiotherapy tips, injury recovery advice, exercises, and health guides from our Calgary practitioners.",
    defaultOgImage: "/images/clinic/reception-desktop.jpg"
  },
  {
    path: "/reviews",
    name: "Patient Reviews & Testimonials",
    category: "Core Pages",
    defaultTitle: "Patient Reviews & Five-Star Stories | Nose Creek Physiotherapy",
    defaultDescription: "Read 545+ real patient reviews and recovery testimonials from our Calgary physiotherapy clinic.",
    defaultOgImage: "/images/clinic/reception-three.jpg"
  },
  {
    path: "/workshops",
    name: "Educational Workshops & Events",
    category: "Core Pages",
    defaultTitle: "Workshops & Educational Events | Nose Creek Physiotherapy",
    defaultDescription: "Free community workshops on back pain, sciatica, shoulder injuries, and knee osteoarthritis presented by certified physiotherapists in Calgary.",
    defaultOgImage: "/images/clinic/clinic-mobile.jpg"
  },
  {
    path: "/locations",
    name: "Clinic Locations & Facilities",
    category: "Core Pages",
    defaultTitle: "Our Clinic Location | Nose Creek Physiotherapy Beddington Calgary",
    defaultDescription: "Conveniently located in Beddington Towne Centre with free dedicated parking, open late evenings and Saturdays.",
    defaultOgImage: "/images/clinic/clinic-mobile.jpg"
  }
];

/**
 * Discovers and returns all site routes: core static pages + dynamically created items.
 */
export async function getAllSiteRoutes(): Promise<SiteRouteInfo[]> {
  const routes: SiteRouteInfo[] = [...CORE_PAGES];

  try {
    const [services, conditions, posts, team, locations, customPages] = await Promise.all([
      getServices().catch(() => []),
      getConditions().catch(() => []),
      getBlogPosts().catch(() => []),
      getTeamMembers().catch(() => []),
      getLocations().catch(() => []),
      getCustomPages().catch(() => [])
    ]);

    // 1. Services
    services.forEach((s) => {
      const isSub = Boolean(s.parentSlug);
      const parentSvc = isSub ? services.find((p) => p.slug === s.parentSlug) : undefined;
      const canonicalPath = isSub ? `/services/${s.parentSlug}/${s.slug}` : `/services/${s.slug}`;
      routes.push({
        path: canonicalPath,
        name: s.title,
        category: isSub ? "Sub-Pages" : "Clinical Services",
        parentSlug: s.parentSlug,
        parentName: parentSvc?.title,
        isSubPage: isSub,
        defaultTitle: s.seo?.title || `${s.title} Calgary North | Nose Creek Physiotherapy`,
        defaultDescription: s.seo?.description || s.shortDescription || `Expert ${s.title.toLowerCase()} care at Nose Creek Physiotherapy in Calgary.`,
        defaultOgImage: s.cardImage || s.heroImage || undefined
      });
    });

    // 2. Conditions
    conditions.forEach((c) => {
      const isSub = Boolean(c.parentSlug);
      const parentCond = isSub ? conditions.find((p) => p.slug === c.parentSlug) : undefined;
      const canonicalPath = isSub ? `/conditions/${c.parentSlug}/${c.slug}` : `/conditions/${c.slug}`;
      routes.push({
        path: canonicalPath,
        name: c.name,
        category: isSub ? "Sub-Pages" : "Conditions We Treat",
        parentSlug: c.parentSlug,
        parentName: parentCond?.name,
        isSubPage: isSub,
        defaultTitle: c.seo?.title || `${c.name} Treatment Calgary | Nose Creek Physiotherapy`,
        defaultDescription: c.seo?.description || c.shortDescription || `Targeted evidence-based rehabilitation for ${c.name.toLowerCase()} in Calgary.`,
        defaultOgImage: c.cardImage || c.heroImage || undefined
      });
    });

    // 3. Blog Posts
    posts.forEach((b) => {
      routes.push({
        path: `/blog/${b.slug}`,
        name: `${b.title} (Blog Article)`,
        category: "Blog Posts",
        defaultTitle: b.seo?.title || `${b.title} | Nose Creek Physiotherapy`,
        defaultDescription: b.seo?.description || b.excerpt || `Read this clinical guide on ${b.title.toLowerCase()}.`,
        defaultOgImage: b.featuredImage || undefined
      });
    });

    // 4. Team Members
    team.forEach((m) => {
      routes.push({
        path: `/team/${m.slug}`,
        name: `${m.name} (${m.role})`,
        category: "Team Members",
        defaultTitle: `${m.name}, ${m.role} | Nose Creek Physiotherapy`,
        defaultDescription: m.shortBio ? m.shortBio.slice(0, 160) : `Learn more about ${m.name} at Nose Creek Physiotherapy Calgary.`,
        defaultOgImage: m.profileImage || undefined
      });
    });

    // 5. Locations
    locations.forEach((l) => {
      routes.push({
        path: `/locations/${l.slug}`,
        name: `${l.name} (Location)`,
        category: "Clinic Locations",
        defaultTitle: `${l.name} | Nose Creek Physiotherapy Calgary`,
        defaultDescription: l.address ? `Find our clinic at ${l.address}. Direct insurance billing and free parking.` : "Clinic location details.",
        defaultOgImage: l.images && l.images.length > 0 ? l.images[0] : undefined
      });
    });

    // 6. Custom & Neighborhood Landing Pages
    customPages.forEach((cp) => {
      const pagePath = `/${cp.slug}`;
      if (!routes.some((r) => r.path === pagePath)) {
        const cpHeroImg = cp.heroImage ||
          cp.hero_image ||
          cp.sectionsData?.hero?.image ||
          cp.sections_data?.hero?.image ||
          (cp as any).cardImage ||
          undefined;

        routes.push({
          path: pagePath,
          name: `${cp.title} (${cp.pageType === "neighborhood" ? "Neighborhood Page" : "Custom Landing Page"})`,
          category: "Neighborhood & Custom Pages",
          defaultTitle: cp.seoTitle || `${cp.title} | Nose Creek Physiotherapy`,
          defaultDescription: cp.seoDescription || cp.heroSubtitle || "Expert personalized physiotherapy in Calgary.",
          defaultOgImage: cpHeroImg
        });
      }
    });

    // 6. Navigation Custom Pages Discovery
    const siteSettings = await getSiteSettings().catch(() => null);
    const deletedSlugs = new Set<string>();
    if (typeof window !== "undefined") {
      try {
        const dRaw = localStorage.getItem("adm_deleted_slugs");
        if (dRaw) JSON.parse(dRaw).forEach((s: string) => deletedSlugs.add(s));
      } catch {}
    }
    if (siteSettings?.marketing?.deleted_slugs && Array.isArray(siteSettings.marketing.deleted_slugs)) {
      siteSettings.marketing.deleted_slugs.forEach((s: string) => deletedSlugs.add(s));
    }

    if (siteSettings?.navigation?.header?.menu) {
      const scanNav = (items: any[]) => {
        items.forEach((item: any) => {
          if (item.href && item.href.startsWith("/") && !item.href.includes("#")) {
            const cleanPath = item.href.split("?")[0];
            const isDel = Array.from(deletedSlugs).some((d) => 
              cleanPath === `/conditions/${d}` || cleanPath === `/services/${d}` || cleanPath.endsWith(`/${d}`)
            );
            if (!isDel && !routes.some((r) => r.path === cleanPath)) {
              routes.push({
                path: cleanPath,
                name: `${item.label} (Custom Page)`,
                category: "Core Pages",
                defaultTitle: `${item.label} | Nose Creek Physiotherapy Calgary`,
                defaultDescription: `Learn more about ${item.label.toLowerCase()} at Nose Creek Physiotherapy in Calgary.`
              });
            }
          }
          if (item.children && Array.isArray(item.children)) {
            scanNav(item.children);
          }
        });
      };
      scanNav(siteSettings.navigation.header.menu);
    }
  } catch (err) {
    console.warn("Error discovering dynamic site routes:", err);
  }

  // Filter out any route matching deleted slugs
  const finalDeletedSlugs = new Set<string>();
  if (typeof window !== "undefined") {
    try {
      const dRaw = localStorage.getItem("adm_deleted_slugs");
      if (dRaw) JSON.parse(dRaw).forEach((s: string) => finalDeletedSlugs.add(s));
    } catch {}
  }

  return routes.filter((r) => {
    return !Array.from(finalDeletedSlugs).some((d) => 
      r.path === `/conditions/${d}` || r.path === `/services/${d}` || r.path.endsWith(`/${d}`)
    );
  });
}

/**
 * Dynamically resolves the base URL of the active deployment.
 * Supports Vercel preview/production domains, custom domains, and localhost.
 */
export async function getSiteBaseUrl(): Promise<string> {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "https://nosecreekphysiotherapy.com";
}

/**
 * Resolves page metadata, prioritizing custom metadata saved in site settings
 * and dynamically generating self-canonical URLs unless explicitly overridden.
 */
export async function resolvePageMetadata(
  pathname: string,
  fallback: Metadata = {}
): Promise<Metadata> {
  try {
    const [settings, baseUrl] = await Promise.all([
      getSiteSettings(),
      getSiteBaseUrl()
    ]);
    const customPages = settings.seo?.pages || {};
    let custom = customPages[pathname];
    if (!custom && !pathname.includes("/admin") && !pathname.includes("/api")) {
      const slug = pathname.replace(/^\//, "").trim();
      if (slug && !slug.includes("/")) {
        try {
          const { getCustomPageBySlug } = await import("@/lib/api");
          const cp = await getCustomPageBySlug(slug);
          if (cp) {
            const cpHeroImg = cp.heroImage ||
              cp.hero_image ||
              cp.sectionsData?.hero?.image ||
              cp.sections_data?.hero?.image ||
              (cp as any).cardImage ||
              undefined;

            custom = {
              title: cp.seoTitle || cp.seo?.title,
              description: cp.seoDescription || cp.seo?.description || cp.subtitle,
              noIndex: cp.noIndex ?? cp.seo?.noIndex,
              noFollow: cp.noFollow ?? cp.seo?.noFollow,
              ogImage: cp.ogImage || cp.seoOgImage || cp.seo_og_image || cp.seo?.ogImage || cpHeroImg
            };
          }
        } catch {}
      }
    }

    const fallbackTitleStr = typeof fallback.title === "string" 
      ? fallback.title 
      : (fallback.title as any)?.default || `${settings.clinicName}`;

    const title = custom?.title && custom.title.trim() !== "" 
      ? custom.title.trim() 
      : fallbackTitleStr;

    const description = custom?.description && custom.description.trim() !== ""
      ? custom.description.trim()
      : (fallback.description || settings.seo?.description || "");

    const ogTitle = custom?.ogTitle && custom.ogTitle.trim() !== ""
      ? custom.ogTitle.trim()
      : (fallback.openGraph?.title || title);

    const ogDescription = custom?.ogDescription && custom.ogDescription.trim() !== ""
      ? custom.ogDescription.trim()
      : (fallback.openGraph?.description || description);

    // 1. Custom OG image explicitly set in Admin SEO
    let ogImage: string | undefined = custom?.ogImage && custom.ogImage.trim() !== ""
      ? custom.ogImage.trim()
      : undefined;

    // 2. Fallback to page Hero Image provided via fallback.openGraph.images
    if (!ogImage) {
      const fallbackImg = (fallback.openGraph?.images as any)?.[0]?.url;
      if (fallbackImg && typeof fallbackImg === "string" && fallbackImg.trim() !== "") {
        ogImage = fallbackImg.trim();
      }
    }

    // 3. Fallback: Dynamically resolve hero image based on route path
    if (!ogImage && !pathname.includes("/admin") && !pathname.includes("/api")) {
      try {
        if (pathname.startsWith("/services/")) {
          const serviceSlug = pathname.replace("/services/", "").split("/").pop();
          if (serviceSlug) {
            const { getServices } = await import("@/lib/api");
            const svcs = await getServices();
            const s = svcs.find((item) => item.slug === serviceSlug);
            if (s) ogImage = s.heroImage || s.cardImage || undefined;
          }
        } else if (pathname.startsWith("/conditions/")) {
          const conditionSlug = pathname.replace("/conditions/", "").split("/").pop();
          if (conditionSlug) {
            const { getConditions } = await import("@/lib/api");
            const conds = await getConditions();
            const c = conds.find((item) => item.slug === conditionSlug);
            if (c) ogImage = c.heroImage || c.cardImage || undefined;
          }
        } else if (pathname.startsWith("/blog/")) {
          const postSlug = pathname.replace("/blog/", "").split("/").pop();
          if (postSlug) {
            const { getBlogPostBySlug } = await import("@/lib/api");
            const post = await getBlogPostBySlug(postSlug);
            if (post) ogImage = post.featuredImage || undefined;
          }
        }
      } catch {}
    }

    // 4. Final fallback to site default OG image
    if (!ogImage || ogImage.trim() === "") {
      ogImage = settings.seo?.ogImage || "/images/og-home.jpg";
    }

    const resolvedOgImageUrl = ogImage.startsWith("http://") || ogImage.startsWith("https://")
      ? ogImage
      : (ogImage.startsWith("/") ? `${baseUrl}${ogImage}` : `${baseUrl}/${ogImage}`);

    // Dynamic Self-Canonical or Custom Target Resolution
    let canonicalUrl: string;
    if (custom?.canonicalUrl && custom.canonicalUrl.trim() !== "") {
      const trimmedCanonical = custom.canonicalUrl.trim();
      if (trimmedCanonical.startsWith("http://") || trimmedCanonical.startsWith("https://")) {
        canonicalUrl = trimmedCanonical;
      } else {
        const cleanPath = trimmedCanonical.startsWith("/") ? trimmedCanonical : `/${trimmedCanonical}`;
        canonicalUrl = `${baseUrl}${cleanPath}`;
      }
    } else {
      // Default: Dynamic Self-Canonical matching current page URL
      const cleanPath = pathname === "/" ? "" : (pathname.startsWith("/") ? pathname : `/${pathname}`);
      canonicalUrl = `${baseUrl}${cleanPath}`;
    }

    return {
      ...fallback,
      metadataBase: new URL(baseUrl),
      title,
      description,
      alternates: {
        ...(fallback.alternates || {}),
        canonical: canonicalUrl,
      },
      openGraph: {
        ...(fallback.openGraph || {}),
        title: ogTitle,
        description: ogDescription,
        images: [{ url: resolvedOgImageUrl, width: 1200, height: 630, alt: ogTitle }],
        siteName: settings.clinicName,
        url: canonicalUrl,
      },
      twitter: {
        ...(fallback.twitter || {}),
        card: "summary_large_image",
        title: ogTitle,
        description: ogDescription,
        images: [resolvedOgImageUrl],
      },
      ...(custom?.keywords ? { keywords: custom.keywords } : {}),
      robots: {
        index: !custom?.noIndex,
        follow: !custom?.noFollow,
        googleBot: {
          index: !custom?.noIndex,
          follow: !custom?.noFollow,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1
        }
      }
    };
  } catch (err) {
    console.warn(`Error resolving metadata for ${pathname}:`, err);
    return fallback;
  }
}
