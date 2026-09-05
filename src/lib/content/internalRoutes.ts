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

// 4. Default Services List
export const DEFAULT_SERVICE_ROUTES: InternalRouteItem[] = [
  {
    id: "srv-physiotherapy",
    title: "Physiotherapy",
    url: "/services/physiotherapy",
    category: "service",
    badge: "Service",
    description: "Evidence-based manual therapy, joint mobilization, and exercise rehab."
  },
  {
    id: "srv-chiropractic-care",
    title: "Chiropractic Care",
    url: "/services/chiropractic-care",
    category: "service",
    badge: "Service",
    description: "Gentle spinal adjustments, active release, and nervous system balance."
  },
  {
    id: "srv-massage-therapy",
    title: "Registered Massage Therapy (RMT)",
    url: "/services/massage-therapy",
    category: "service",
    badge: "Service",
    description: "Deep tissue, trigger point release, and relaxation massage."
  },
  {
    id: "srv-pelvic-floor",
    title: "Pelvic Floor Physiotherapy",
    url: "/services/pelvic-floor-physiotherapy",
    category: "service",
    badge: "Service",
    description: "Specialized rehabilitation for incontinence, pelvic pain, and postpartum recovery."
  },
  {
    id: "srv-acupuncture",
    title: "Acupuncture & Dry Needling (IMS)",
    url: "/services/acupuncture",
    category: "service",
    badge: "Service",
    description: "Gunn IMS and medical acupuncture for chronic nerve and muscle pain."
  },
  {
    id: "srv-vestibular",
    title: "Vestibular & Concussion Rehab",
    url: "/services/vestibular-rehabilitation",
    category: "service",
    badge: "Service",
    description: "Treatment for vertigo, BPPV, balance disorders, and post-concussion syndrome."
  },
  {
    id: "srv-custom-orthotics",
    title: "Custom Orthotics & Biomechanics",
    url: "/services/custom-orthotics",
    category: "service",
    badge: "Service",
    description: "Computerized gait analysis and custom foot orthotics."
  },
  {
    id: "srv-tmj-therapy",
    title: "TMJ & Jaw Pain Therapy",
    url: "/services/tmj-therapy",
    category: "service",
    badge: "Service",
    description: "Relief for jaw clicking, clenching, locking, and facial pain."
  },
  {
    id: "srv-shockwave",
    title: "Shockwave Therapy",
    url: "/services/shockwave-therapy",
    category: "service",
    badge: "Service",
    description: "Acoustic soundwaves for plantar fasciitis, tendinitis, and calcification."
  }
];

// 5. Default Conditions List
export const DEFAULT_CONDITION_ROUTES: InternalRouteItem[] = [
  {
    id: "cnd-back-pain",
    title: "Back Pain & Sciatica Relief",
    url: "/conditions/back-pain-relief",
    category: "condition",
    badge: "Condition",
    description: "Relief for disc herniation, spinal stenosis, and lower back tightness."
  },
  {
    id: "cnd-neck-pain",
    title: "Neck Pain & Whiplash Relief",
    url: "/conditions/neck-pain-relief",
    category: "condition",
    badge: "Condition",
    description: "Restoring neck motion after auto accidents, poor posture, and disc issues."
  },
  {
    id: "cnd-shoulder-pain",
    title: "Shoulder Pain & Rotator Cuff",
    url: "/conditions/shoulder-pain",
    category: "condition",
    badge: "Condition",
    description: "Treating rotator cuff tears, frozen shoulder, and impingement."
  },
  {
    id: "cnd-knee-hip",
    title: "Knee & Hip Pain Relief",
    url: "/conditions/knee-hip-pain",
    category: "condition",
    badge: "Condition",
    description: "Care for meniscus tears, osteoarthritis, runner's knee, and bursitis."
  },
  {
    id: "cnd-headaches",
    title: "Headaches & Migraines",
    url: "/conditions/headaches",
    category: "condition",
    badge: "Condition",
    description: "Relieving cervicogenic headaches and tension originating in the upper neck."
  },
  {
    id: "cnd-sports-injuries",
    title: "Sports Injuries & Return to Play",
    url: "/conditions/sports-injuries",
    category: "condition",
    badge: "Condition",
    description: "Fast-track rehabilitation for ligament sprains, muscle strains, and athletic injury."
  },
  {
    id: "cnd-mva",
    title: "Motor Vehicle Accident (MVA / Whiplash)",
    url: "/conditions/motor-vehicle-accident",
    category: "condition",
    badge: "Condition",
    description: "Direct-billed Alberta auto insurance rehabilitation with zero out-of-pocket costs."
  },
  {
    id: "cnd-chronic-pain",
    title: "Chronic Pain Management",
    url: "/conditions/chronic-pain",
    category: "condition",
    badge: "Condition",
    description: "Comprehensive multi-disciplinary protocols for persistent pain syndromes."
  }
];

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
          serviceRoutes = parsed.map((s) => ({
            id: `srv-${s.slug || s.id}`,
            title: s.title || s.name,
            url: `/services/${s.slug}`,
            category: "service",
            badge: "Service",
            description: s.shortDescription || `Specialized ${s.title} treatments at Nose Creek.`
          }));
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
          conditionRoutes = parsed.map((c) => ({
            id: `cnd-${c.slug || c.id}`,
            title: c.name || c.title,
            url: `/conditions/${c.slug}`,
            category: "condition",
            badge: "Condition",
            description: c.shortDescription || `Targeted care for ${c.name || c.title}.`
          }));
        }
      }
    } catch {}
  }

  return [
    ...CORE_PAGES,
    ...serviceRoutes,
    ...conditionRoutes,
    ...LOCATION_ROUTES,
    ...ANCHOR_LINKS
  ];
}
