import {
  getSiteSettings,
  getServices,
  getConditions,
  getBlogPosts,
  getTeamMembers,
  getLocations,
  getCustomPages
} from "@/lib/api";
import { getSiteBaseUrl } from "@/lib/seo";

export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string | Date;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

export interface SitemapIndexEntry {
  loc: string;
  lastmod?: string | Date;
}

/**
 * Builds standard XML response for sitemap index or urlset
 */
export function buildXmlResponse(xmlContent: string): Response {
  return new Response(xmlContent.trim(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

/**
 * Generates XML string for a Sitemap Index (<sitemapindex>)
 */
export function generateSitemapIndexXml(sitemaps: SitemapIndexEntry[]): string {
  const items = sitemaps
    .map((s) => {
      const dateStr = s.lastmod
        ? (s.lastmod instanceof Date ? s.lastmod.toISOString() : new Date(s.lastmod).toISOString())
        : new Date().toISOString();
      return `  <sitemap>\n    <loc>${escapeXml(s.loc)}</loc>\n    <lastmod>${dateStr}</lastmod>\n  </sitemap>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>`;
}

/**
 * Generates XML string for a Sitemap URL Set (<urlset>)
 */
export function generateUrlSetXml(urls: SitemapUrlEntry[]): string {
  const items = urls
    .map((u) => {
      const dateStr = u.lastmod
        ? (u.lastmod instanceof Date ? u.lastmod.toISOString() : new Date(u.lastmod).toISOString())
        : new Date().toISOString();
      const freq = u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : "";
      const prio = u.priority !== undefined ? `\n    <priority>${u.priority.toFixed(1)}</priority>` : "";
      return `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <lastmod>${dateStr}</lastmod>${freq}${prio}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

/**
 * Returns set of paths that are marked as noIndex in site_settings
 */
export async function getNoIndexPaths(): Promise<Set<string>> {
  const noIndexSet = new Set<string>();
  try {
    const settings = await getSiteSettings();
    const pages = settings.seo?.pages || {};
    Object.entries(pages).forEach(([path, meta]) => {
      if (meta?.noIndex) {
        noIndexSet.add(path.toLowerCase().trim());
      }
    });
  } catch (e) {
    console.warn("Failed to load noIndex paths", e);
  }
  return noIndexSet;
}

/**
 * Core Pages + Custom Landing Pages URLs (excluding noIndex pages)
 */
export async function getPageSitemapUrls(): Promise<SitemapUrlEntry[]> {
  const rawBase = await getSiteBaseUrl();
  const baseUrl = rawBase.replace(/\/$/, "");
  const noIndexPaths = await getNoIndexPaths();

  const coreRoutes = [
    { path: "/", priority: 1.0, changefreq: "weekly" as const },
    { path: "/about", priority: 0.8, changefreq: "monthly" as const },
    { path: "/services", priority: 0.9, changefreq: "weekly" as const },
    { path: "/conditions", priority: 0.9, changefreq: "weekly" as const },
    { path: "/team", priority: 0.8, changefreq: "monthly" as const },
    { path: "/locations", priority: 0.8, changefreq: "monthly" as const },
    { path: "/blog", priority: 0.8, changefreq: "weekly" as const },
    { path: "/contact", priority: 0.8, changefreq: "monthly" as const },
    { path: "/reviews", priority: 0.7, changefreq: "weekly" as const },
    { path: "/workshops", priority: 0.6, changefreq: "monthly" as const },
    { path: "/inquire", priority: 0.8, changefreq: "monthly" as const },
    { path: "/telephone-consultation", priority: 0.7, changefreq: "monthly" as const },
    { path: "/free-discovery-session", priority: 0.7, changefreq: "monthly" as const }
  ];

  const results: SitemapUrlEntry[] = [];

  for (const r of coreRoutes) {
    if (!noIndexPaths.has(r.path.toLowerCase())) {
      results.push({
        loc: `${baseUrl}${r.path === "/" ? "" : r.path}`,
        lastmod: new Date(),
        changefreq: r.changefreq,
        priority: r.priority
      });
    }
  }

  // Include dynamic neighborhood and custom landing pages
  try {
    const customPages = await getCustomPages();
    for (const cp of customPages) {
      const isPublished = cp.isPublished !== false && cp.is_published !== false;
      const isNoIndex = Boolean(cp.noIndex || cp.seo?.noIndex);
      if (!isPublished || isNoIndex) continue;
      const path = `/${cp.slug}`.toLowerCase();
      if (noIndexPaths.has(path)) continue;

      const dateVal = cp.updatedAt || cp.updated_at || cp.createdAt || cp.created_at;
      results.push({
        loc: `${baseUrl}/${cp.slug}`,
        lastmod: dateVal ? new Date(dateVal) : new Date(),
        changefreq: "weekly",
        priority: cp.pageType === "neighborhood" ? 0.8 : 0.7
      });
    }
  } catch (e) {
    console.warn("Failed to fetch custom pages for sitemap", e);
  }

  return results;
}

/**
 * Clinical Services URLs (excluding noIndex pages)
 */
export async function getServiceSitemapUrls(): Promise<SitemapUrlEntry[]> {
  const rawBase = await getSiteBaseUrl();
  const baseUrl = rawBase.replace(/\/$/, "");
  const noIndexPaths = await getNoIndexPaths();

  const services = await getServices().catch(() => []);
  const results: SitemapUrlEntry[] = [];

  for (const s of services) {
    const canonicalPath = s.parentSlug
      ? `/services/${s.parentSlug}/${s.slug}`
      : `/services/${s.slug}`;

    if (noIndexPaths.has(canonicalPath.toLowerCase()) || noIndexPaths.has(`/services/${s.slug}`.toLowerCase())) {
      continue;
    }

    results.push({
      loc: `${baseUrl}${canonicalPath}`,
      lastmod: new Date(),
      changefreq: "monthly",
      priority: 0.8
    });
  }

  return results;
}

/**
 * Conditions We Treat URLs (excluding noIndex pages)
 */
export async function getConditionSitemapUrls(): Promise<SitemapUrlEntry[]> {
  const rawBase = await getSiteBaseUrl();
  const baseUrl = rawBase.replace(/\/$/, "");
  const noIndexPaths = await getNoIndexPaths();

  const conditions = await getConditions().catch(() => []);
  const results: SitemapUrlEntry[] = [];

  for (const c of conditions) {
    const canonicalPath = c.parentSlug
      ? `/conditions/${c.parentSlug}/${c.slug}`
      : `/conditions/${c.slug}`;

    if (noIndexPaths.has(canonicalPath.toLowerCase()) || noIndexPaths.has(`/conditions/${c.slug}`.toLowerCase())) {
      continue;
    }

    results.push({
      loc: `${baseUrl}${canonicalPath}`,
      lastmod: new Date(),
      changefreq: "monthly",
      priority: 0.7
    });
  }

  return results;
}

/**
 * Blog Posts URLs (excluding noIndex pages and drafts)
 */
export async function getPostSitemapUrls(): Promise<SitemapUrlEntry[]> {
  const rawBase = await getSiteBaseUrl();
  const baseUrl = rawBase.replace(/\/$/, "");
  const noIndexPaths = await getNoIndexPaths();

  const posts = await getBlogPosts().catch(() => []);
  const results: SitemapUrlEntry[] = [];

  for (const p of posts) {
    if (p.is_published === false) continue;
    const path = `/blog/${p.slug}`.toLowerCase();
    if (noIndexPaths.has(path)) continue;

    results.push({
      loc: `${baseUrl}/blog/${p.slug}`,
      lastmod: p.updatedAt ? new Date(p.updatedAt) : (p.publishedAt ? new Date(p.publishedAt) : new Date()),
      changefreq: "monthly",
      priority: 0.6
    });
  }

  return results;
}

/**
 * Team Members URLs (excluding noIndex pages)
 */
export async function getTeamSitemapUrls(): Promise<SitemapUrlEntry[]> {
  const rawBase = await getSiteBaseUrl();
  const baseUrl = rawBase.replace(/\/$/, "");
  const noIndexPaths = await getNoIndexPaths();

  const team = await getTeamMembers().catch(() => []);
  const results: SitemapUrlEntry[] = [];

  for (const m of team) {
    const path = `/team/${m.slug}`.toLowerCase();
    if (noIndexPaths.has(path)) continue;

    results.push({
      loc: `${baseUrl}/team/${m.slug}`,
      lastmod: new Date(),
      changefreq: "monthly",
      priority: 0.6
    });
  }

  return results;
}

/**
 * Clinic Locations URLs (excluding noIndex pages)
 */
export async function getLocationSitemapUrls(): Promise<SitemapUrlEntry[]> {
  const rawBase = await getSiteBaseUrl();
  const baseUrl = rawBase.replace(/\/$/, "");
  const noIndexPaths = await getNoIndexPaths();

  const locations = await getLocations().catch(() => []);
  const results: SitemapUrlEntry[] = [];

  for (const l of locations) {
    const path = `/locations/${l.slug}`.toLowerCase();
    if (noIndexPaths.has(path)) continue;

    results.push({
      loc: `${baseUrl}/locations/${l.slug}`,
      lastmod: new Date(),
      changefreq: "monthly",
      priority: 0.7
    });
  }

  return results;
}
