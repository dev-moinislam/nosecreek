import {
  SiteSettings,
  Service,
  TeamMember,
  BlogPost,
  Location,
  Condition,
  Testimonial
} from "@/types/content";

import settingsData from "@/data/settings.json";
import servicesData from "@/data/services.json";
import teamData from "@/data/team.json";
import locationsData from "@/data/locations.json";
import blogData from "@/data/blog.json";
import conditionsData from "@/data/conditions.json";
import testimonialsData from "@/data/testimonials.json";

// Type assertions to ensure local JSON files comply with types
const siteSettingsObj = settingsData as SiteSettings;
const servicesList = servicesData as Service[];
const teamList = teamData as TeamMember[];
const locationsList = locationsData as Location[];
const blogList = blogData as BlogPost[];
const conditionsList = conditionsData as Condition[];
const testimonialsList = testimonialsData as Testimonial[];

/**
 * Site-wide settings (Clinic info, business hours, default SEO)
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  // If an external API is configured, fetch from it:
  // if (process.env.CONTENT_API_URL) {
  //   const res = await fetch(`${process.env.CONTENT_API_URL}/settings`, { headers: { Authorization: `Bearer ${process.env.CONTENT_API_TOKEN}` } });
  //   return res.json();
  // }
  return siteSettingsObj;
}

/**
 * Clinic Services
 */
export async function getServices(): Promise<Service[]> {
  return servicesList;
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  return servicesList.find((s) => s.slug === slug);
}

/**
 * Team Members & Practitioners
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  return teamList.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

export async function getTeamMemberBySlug(slug: string): Promise<TeamMember | undefined> {
  return teamList.find((t) => t.slug === slug);
}

/**
 * Blog Posts
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  return blogList.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  return blogList.find((b) => b.slug === slug);
}

/**
 * Clinic Locations
 */
export async function getLocations(): Promise<Location[]> {
  return locationsList;
}

export async function getLocationBySlug(slug: string): Promise<Location | undefined> {
  return locationsList.find((l) => l.slug === slug);
}

/**
 * Treatable Conditions
 */
export async function getConditions(): Promise<Condition[]> {
  return conditionsList;
}

export async function getConditionBySlug(slug: string): Promise<Condition | undefined> {
  return conditionsList.find((c) => c.slug === slug);
}

/**
 * Reviews & Testimonials
 */
export async function getTestimonials(): Promise<Testimonial[]> {
  return testimonialsList;
}

export async function getTestimonialById(id: string): Promise<Testimonial | undefined> {
  return testimonialsList.find((t) => t.id === id);
}
