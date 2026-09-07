/**
 * Internal Route Definitions & Link Helper for Nose Creek Physiotherapy
 * Provides a categorized registry of internal links to ensure reliable internal SEO linking.
 */

export interface InternalRouteItem {
  id: string;
  title: string;
  url: string;
  category: "page" | "service" | "condition" | "location" | "cta" | "blog";
  badge: string;
  description?: string;
}

// 1. Core Clinic Pages
export const CORE_PAGES: InternalRouteItem[] = [
  {
    id: "page-home",
    title: "Homepage (North Calgary Physiotherapy)",
    url: "/",
    category: "page",
    badge: "Core Page",
    description: "Main clinic homepage with hero, services, reviews, and appointment booking."
  },
  {
    id: "page-about",
    title: "About Us & Clinical Philosophy",
    url: "/about",
    category: "page",
    badge: "Core Page",
    description: "Our clinic story, 20+ years in Calgary, and patient-first philosophy."
  },
  {
    id: "page-contact",
    title: "Contact Us & Directions",
    url: "/contact",
    category: "page",
    badge: "Core Page",
    description: "Contact form, clinic map, direct phone numbers, and location details."
  },
  {
    id: "page-team",
    title: "Meet Our Team",
    url: "/team",
    category: "page",
    badge: "Core Page",
    description: "Registered physiotherapists, chiropractors, and massage therapists."
  },
  {
    id: "page-locations",
    title: "Locations & Hours",
    url: "/locations",
    category: "page",
    badge: "Core Page",
    description: "Beddington and Thorncliffe clinic facilities and opening hours."
  },
  {
    id: "page-reviews",
    title: "Patient Reviews & Testimonials",
    url: "/reviews",
    category: "page",
    badge: "Core Page",
    description: "Verified 5-star patient reviews and recovery stories."
  },
  {
    id: "page-workshops",
    title: "Workshops & Educational Events",
    url: "/workshops",
    category: "page",
    badge: "Core Page",
    description: "Free community workshops on back pain, knee arthritis, and posture."
  },
  {
    id: "page-blog",
    title: "Health & Clinical Insights Blog",
    url: "/blog",
    category: "page",
    badge: "Core Page",
    description: "Evidence-based articles on injury prevention, exercises, and pain relief."
  }
];

// 2. High-Converting Page Anchors & Action CTAs
export const ANCHOR_LINKS: InternalRouteItem[] = [
  {
    id: "cta-booking",
    title: "Online Booking Form (Anchor)",
    url: "/contact#booking",
    category: "cta",
    badge: "Action Link",
    description: "Jumps directly to the interactive appointment booking form."
  },
  {
    id: "cta-discovery",
    title: "Free 15-Min Discovery Session",
    url: "/contact?consult=discovery",
    category: "cta",
    badge: "Action Link",
    description: "Pre-selects Free In-Person Discovery Session."
  },
  {
    id: "cta-phone-consult",
    title: "Free Telephone Consultation",
    url: "/contact?consult=phone",
    category: "cta",
    badge: "Action Link",
    description: "Pre-selects Free Telephone Consultation."
  },
  {
    id: "cta-location-map",
    title: "Interactive Google Map (Anchor)",
    url: "/contact#map",
    category: "cta",
    badge: "Action Link",
    description: "Scrolls directly to the interactive Google Map and parking details."
  }
];

// 3. Clinic Locations
export const LOCATION_ROUTES: InternalRouteItem[] = [
  {
    id: "loc-beddington",
    title: "Beddington NW Clinic (Co-op Centre)",
    url: "/locations/beddington",
    category: "location",
    badge: "Location",
    description: "#22, 8120 Beddington Blvd NW — Primary flagship clinic."
  },
  {
    id: "loc-thorncliffe",
    title: "Thorncliffe NE Clinic",
    url: "/locations/thorncliffe",
    category: "location",
    badge: "Location",
    description: "5600 Centre St N — Convenient northeast access."
  }
];

import servicesData from "@/data/services.json";
import conditionsData from "@/data/conditions.json";

// 4. Default Services List (derived from active clinic services)
export const DEFAULT_SERVICE_ROUTES: InternalRouteItem[] = (servicesData as any[]).map((s) => ({
  id: `srv-${s.slug || s.id}`,
  title: s.title || s.name,
  url: `/services/${s.slug}`,
  category: "service" as const,
  badge: "Service",
  description: s.shortDescription || `Specialized ${s.title} treatments at Nose Creek.`
}));

// 5. Default Conditions List (derived from active clinic conditions)
export const DEFAULT_CONDITION_ROUTES: InternalRouteItem[] = (conditionsData as any[]).map((c) => ({
  id: `cnd-${c.slug || c.id}`,
  title: c.name || c.title,
  url: `/conditions/${c.slug}`,
  category: "condition" as const,
  badge: "Condition",
  description: c.shortDescription || `Targeted care for ${c.name || c.title}.`
}));

// Helper to get all routes dynamically with optional localStorage overrides
export function getAllInternalRoutes(customServices?: any[], customConditions?: any[]): InternalRouteItem[] {
  let serviceRoutes = DEFAULT_SERVICE_ROUTES;
  let conditionRoutes = DEFAULT_CONDITION_ROUTES;

  // Use custom services if available
  if (customServices && customServices.length > 0) {
    serviceRoutes = customServices.map((s) => ({
      id: `srv-${s.slug || s.id}`,
      title: s.title || s.name,
      url: `/services/${s.slug}`,
      category: "service",
      badge: "Service",
      description: s.shortDescription || `Specialized ${s.title} treatments at Nose Creek.`
    }));
  } else if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("adm_services");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, InternalRouteItem>();
          DEFAULT_SERVICE_ROUTES.forEach((r) => map.set(r.id, r));
          parsed.forEach((s) => {
            const id = `srv-${s.slug || s.id}`;
            map.set(id, {
              id,
              title: s.title || s.name,
              url: `/services/${s.slug}`,
              category: "service",
              badge: "Service",
              description: s.shortDescription || `Specialized ${s.title} treatments at Nose Creek.`
            });
          });
          serviceRoutes = Array.from(map.values());
        }
      }
    } catch {}
  }

  // Use custom conditions if available
  if (customConditions && customConditions.length > 0) {
    conditionRoutes = customConditions.map((c) => ({
      id: `cnd-${c.slug || c.id}`,
      title: c.name || c.title,
      url: `/conditions/${c.slug}`,
      category: "condition",
      badge: "Condition",
      description: c.shortDescription || `Targeted care for ${c.name || c.title}.`
    }));
  } else if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("adm_conditions");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, InternalRouteItem>();
          DEFAULT_CONDITION_ROUTES.forEach((r) => map.set(r.id, r));
          parsed.forEach((c) => {
            const id = `cnd-${c.slug || c.id}`;
            map.set(id, {
              id,
              title: c.name || c.title,
              url: `/conditions/${c.slug}`,
              category: "condition",
              badge: "Condition",
              description: c.shortDescription || `Targeted care for ${c.name || c.title}.`
            });
          });
          conditionRoutes = Array.from(map.values());
        }
      }
    } catch {}
  }

  const allItems: InternalRouteItem[] = [
    ...CORE_PAGES,
    ...serviceRoutes,
    ...conditionRoutes,
    ...LOCATION_ROUTES,
    ...ANCHOR_LINKS
  ];

  // Strictly deduplicate by both ID and URL to guarantee unique React keys
  const seenIds = new Set<string>();
  const seenUrls = new Set<string>();
  const uniqueItems: InternalRouteItem[] = [];

  for (const item of allItems) {
    if (!item.id || !item.url) continue;
    if (!seenIds.has(item.id) && !seenUrls.has(item.url)) {
      seenIds.add(item.id);
      seenUrls.add(item.url);
      uniqueItems.push(item);
    }
  }

  return uniqueItems;
}
