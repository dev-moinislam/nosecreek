import { MetadataRoute } from "next";
import settingsData from "@/data/settings.json";
import {
  getServices,
  getTeamMembers,
  getBlogPosts,
  getLocations,
  getConditions
} from "@/lib/api";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = settingsData.seo.canonicalUrl.replace(/\/$/, "");

  // Static pages
  const staticPages = ["", "/about", "/services", "/team", "/conditions", "/locations", "/blog", "/contact"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1.0 : 0.8
    })
  );

  // Fetch dynamic content
  const [services, team, posts, locations, conditions] = await Promise.all([
    getServices(),
    getTeamMembers(),
    getBlogPosts(),
    getLocations(),
    getConditions()
  ]);

  const servicePages = services.map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7
  }));

  const teamPages = team.map((t) => ({
    url: `${baseUrl}/team/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6
  }));

  const blogPages = posts.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt || p.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.5
  }));

  const locationPages = locations.map((l) => ({
    url: `${baseUrl}/locations/${l.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7
  }));

  const conditionPages = conditions.map((c) => ({
    url: `${baseUrl}/conditions/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6
  }));

  return [
    ...staticPages,
    ...servicePages,
    ...teamPages,
    ...blogPages,
    ...locationPages,
    ...conditionPages
  ];
}
