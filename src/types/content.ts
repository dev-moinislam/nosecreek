export interface PageMetaItem {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  keywords?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface SEOData {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
  cardImage?: string | null;
  sectionsData?: any;
  favicon?: string;
  pages?: Record<string, PageMetaItem>;
  [key: string]: any;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  twitter?: string;
  linkedin?: string;
}

export interface OpeningHours {
  weekdays?: string;
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface ClinicContact {
  phone: string;
  email: string;
  address: string;
  mapEmbedUrl?: string;
}

export interface AutoReplySettings {
  enabled: boolean;
  subject?: string;
  headline?: string;
  customMessage?: string;
}

export interface EmailNotificationSettings {
  enabled: boolean;
  receiverEmail: string;
  senderName?: string;
  senderEmail?: string;
  subjectPrefix?: string;
  provider?: "resend" | "smtp" | "webhook";
  resendApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  webhookUrl?: string;
  autoReply?: AutoReplySettings;
}

export interface CustomSchemaItem {
  id: string;
  title: string;
  enabled: boolean;
  scope: "site_wide" | "homepage" | "specific";
  targetPages: string[];
  schemaJson: string;
}

export interface NavMenuItem {
  id: string;
  label: string;
  href: string;
  target?: "_self" | "_blank";
  badge?: string;
  enabled?: boolean;
  children?: NavMenuItem[];
}

export interface FooterColumnItem {
  id: string;
  title: string;
  links: { label: string; href: string; target?: string; external?: boolean; highlight?: boolean }[];
}

export interface HeaderFooterNavigation {
  header?: {
    topBarEnabled?: boolean;
    phone?: string;
    ctaButtonText?: string;
    ctaButtonUrl?: string;
    menu?: NavMenuItem[];
  };
  footer?: {
    columns?: FooterColumnItem[];
    contactPhone?: string;
    contactEmail?: string;
    contactAddress?: string;
    copyrightText?: string;
    disclaimerText?: string;
  };
}

export interface SiteSettings {
  clinicName: string;
  logoText: string;
  contact: ClinicContact;
  openingHours: OpeningHours;
  socialLinks: SocialLinks;
  bookingUrl: string;
  primaryCTA: string;
  footerContent: string;
  seo: SEOData;
  favicon?: string;
  themeColors?: Record<string, string>;
  theme_colors?: Record<string, string>;
  notifications?: EmailNotificationSettings;
  customSchemas?: CustomSchemaItem[];
  navigation?: HeaderFooterNavigation;
  marketing?: Record<string, any>;
}

export interface SectionBlockConfig {
  id?: string;
  eyebrow?: string;
  eyebrowColor?: string;
  title?: string;
  subtitle?: string;
  content?: string;
  contentCol2?: string; // Secondary narrative content for 2-column sections
  contentLayout?: "1-column" | "2-column"; // Layout format for narrative content
  bullets?: string[];
  items?: string[];
  image?: string | null;
  imageAlt?: string;
  imagePosition?: "left" | "right" | "top" | "bottom" | "none";
  background?: "white" | "light" | "teal" | "gradient";
  align?: "left" | "center" | "right";
  reverseMobileOrder?: boolean;
  reverse_mobile_order?: boolean;
  ctaText?: string;
  ctaHref?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export interface ServiceCustomSection extends SectionBlockConfig {
  title: string;
}

export interface Service {
  id: string;
  slug: string;
  parentSlug?: string;
  title: string;
  shortDescription?: string | null;
  description: string;
  heroImage?: string | null;
  heroImageAlt?: string;
  sideImage?: string | null;
  sideImageAlt?: string;
  cardImage?: string | null;
  cardImageAlt?: string;
  iconType?: string;
  iconBg?: string;
  iconColor?: string;
  ctaText?: string;
  ctaHref?: string;
  ctaMuted?: boolean;
  benefits?: string[];
  symptoms?: string[];
  treatmentApproach?: string[];
  customSections?: ServiceCustomSection[];
  sectionsData?: Record<string, SectionBlockConfig>; // Deep customization for any section
  faqs?: FAQItem[];
  hiddenSections?: string[]; // list of section keys to hide/disable
  sectionOrder?: string[]; // custom ordered list of section keys
  relatedServices?: string[]; // slugs
  relatedConditions?: string[]; // slugs
  teamMembers?: string[]; // slugs
  locations?: string[]; // slugs
  testimonials?: string[]; // ids
  seo?: SEOData;
}

export interface TeamMember {
  id: string;
  slug: string;
  name: string;
  role: string;
  title: string;
  shortBio?: string;
  fullBio?: string;
  profileImage: string;
  profileImageAlt?: string;
  specialties?: string[];
  credentials?: string[];
  education?: string[];
  certifications?: string[];
  experience?: string;
  locations?: string[]; // slugs
  services?: string[]; // slugs
  languages?: string[];
  email?: string;
  phone?: string;
  bookingUrl?: string;
  bookingCtaText?: string;
  socialLinks?: SocialLinks;
  featured?: boolean;
  isDirector?: boolean;
  order?: number;
  href?: string;
  seo?: SEOData;
}

export type BlogBlockType = "richtext" | "custom_section" | "callout" | "image_banner" | "key_takeaways" | "faq";

export interface BlogContentBlock {
  id: string;
  type: BlogBlockType;
  content?: string; // rich HTML string
  eyebrow?: string;
  eyebrowColor?: string;
  title?: string;
  subtitle?: string;
  bullets?: string[];
  image?: string | null;
  imageAlt?: string;
  imagePosition?: "left" | "right" | "top" | "bottom" | "none";
  background?: "white" | "light" | "teal" | "gradient";
  align?: "left" | "center" | "right";
  ctaText?: string;
  ctaHref?: string;
  quoteAuthor?: string;
  faqs?: FAQItem[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  contentBlocks?: BlogContentBlock[];
  featuredImage: string;
  featuredImageAlt?: string;
  author: string;
  category: string;
  tags?: string[];
  publishedAt: string;
  updatedAt?: string;
  readingTime?: string;
  relatedPosts?: string[]; // slugs
  href?: string;
  is_published?: boolean;
  seo?: SEOData;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  eyebrow?: string;
  title?: string;
  directionsUrl?: string;
  hoursList?: { day: string; hours: string; }[];
  insuranceNote?: string;
  openingHours: OpeningHours;
  mapEmbedUrl?: string;
  services: string[]; // slugs
  teamMembers: string[]; // slugs
  testimonials: string[]; // ids
  description: string;
  images: string[];
  imagesAlt?: string[];
  bookingUrl: string;
  seo: SEOData;
}

export interface Condition {
  id: string;
  slug: string;
  parentSlug?: string;
  name: string;
  shortDescription?: string | null;
  description: string;
  heroImage?: string | null;
  heroImageAlt?: string;
  sideImage?: string | null;
  sideImageAlt?: string;
  cardImage?: string | null;
  cardImageAlt?: string;
  ctaText?: string;
  ctaHref?: string;
  ctaMuted?: boolean;
  benefits?: string[];
  symptoms?: string[];
  treatmentApproach?: string[];
  customSections?: ServiceCustomSection[];
  sectionsData?: Record<string, SectionBlockConfig>; // Deep customization for any section
  faqs?: FAQItem[];
  hiddenSections?: string[];
  sectionOrder?: string[];
  relatedServices?: string[]; // slugs
  testimonials?: any[];
  category?: string;
  iconType?: string;
  iconBg?: string;
  iconColor?: string;
  seo?: SEOData;
}

export interface Testimonial {
  id: string;
  author: string;
  text: string;
  rating: number; // 1-5
  platform: string; // e.g. "Google", "Website"
  date?: string;
  avatar?: string;
  verified?: boolean;
}

export interface HomePageData {
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    primaryCtaText: string;
    primaryCtaUrl: string;
    phone: string;
    phoneHref: string;
    badges: string[];
    image: string;
    rating: string;
    reviewCount: string;
  };
  quickFacts?: { icon: string; label: string; val: string }[];
  stats?: { num: string; label: string }[];
  aboutClinic?: {
    eyebrow: string;
    title: string;
    content: string;
    linkText: string;
    linkUrl: string;
    images?: string[];
  };
  director?: {
    eyebrow: string;
    title: string;
    role: string;
    titleSuffix: string;
    bio: string;
    image: string;
    ctaText: string;
    ctaUrl: string;
  };
  faqs?: { q?: string; a?: string; question?: string; answer?: string }[];
  decideCtas?: {
    title?: string;
    description?: string;
    discoveryTitle?: string;
    discoveryDesc?: string;
    discoveryBtnText?: string;
    discoveryBtnUrl?: string;
    phoneTitle?: string;
    phoneDesc?: string;
    phoneBtnText?: string;
    phoneBtnUrl?: string;
    noteText?: string;
    costLinkText?: string;
    costLinkUrl?: string;
  };
  workshops?: {
    title?: string;
    description?: string;
    ctaText?: string;
    ctaUrl?: string;
    background?: string;
  };
  freeReports?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    reports?: { title: string; sub: string; label: string; href: string; color?: string; }[];
  };
  seoCopy?: {
    title?: string;
    paragraph1?: string;
    paragraph2?: string;
    areaLinks?: { label: string; href: string; }[];
  };
  finalCta?: {
    title?: string;
    description?: string;
    ctaText?: string;
    ctaUrl?: string;
    phone?: string;
    phoneHref?: string;
  };
  sectionOrder: string[];
  hiddenSections: string[];
  customSections?: ServiceCustomSection[];
  sectionsData?: Record<string, SectionBlockConfig>;
}

export interface CustomPage {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category?: "Neighborhood" | "Landing Page" | "General";
  pageType?: "neighborhood" | "custom";
  neighborhoodName?: string;
  heroImage?: string;
  heroImageAlt?: string;
  hero_image?: string;
  hero_image_alt?: string;
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  content?: string;
  content_col2?: string;
  columnTwoContent?: string;
  content_layout?: "1-column" | "2-column";
  layout?: "one-column" | "two-column";
  cta_text?: string;
  cta_url?: string;
  primaryCtaText?: string;
  primaryCtaUrl?: string;
  secondary_cta_text?: string;
  secondary_cta_url?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  benefits?: string[];
  symptoms?: string[];
  treatmentApproach?: string[];
  treatment_approach?: string[];
  customSections?: ServiceCustomSection[];
  custom_sections?: ServiceCustomSection[];
  sectionsData?: Record<string, SectionBlockConfig>;
  sections_data?: Record<string, SectionBlockConfig>;
  hiddenSections?: string[];
  hidden_sections?: string[];
  sectionOrder?: string[];
  section_order?: string[];
  relatedServices?: string[];
  relatedConditions?: string[];
  faqs?: FAQItem[];
  seo?: PageMetaItem;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  seoOgImage?: string;
  seo_og_image?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  is_published?: boolean;
  isPublished?: boolean;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StepItem {
  title: string;
  description: string;
}

/**
 * Parses a step item from various formats (object or string with delimiter)
 * into a step number, a semantic title (for H3 heading), and body description.
 */
export function parseStepItem(raw: any, index: number): { stepNum: number; title: string; description: string } {
  if (!raw) {
    return { stepNum: index + 1, title: `Phase ${index + 1}`, description: "" };
  }
  if (typeof raw === "object" && raw !== null) {
    const title = raw.title || raw.heading || raw.label || raw.name || `Phase ${index + 1}`;
    const description = raw.description || raw.text || raw.content || raw.val || "";
    return {
      stepNum: index + 1,
      title: String(title).trim(),
      description: String(description).trim()
    };
  }

  let str = String(raw).trim();
  // Strip redundant leading "Step 1: " or "Step 1 - " if present
  str = str.replace(/^Step\s*\d+[\s:–-]+/i, "").trim();

  // 1. If string contains a colon ":" separator (e.g. "Initial Assessment: A 60-minute one-on-one session...")
  if (str.includes(":")) {
    const colonIdx = str.indexOf(":");
    const title = str.substring(0, colonIdx).trim();
    const description = str.substring(colonIdx + 1).trim();
    return {
      stepNum: index + 1,
      title: title || `Step ${index + 1}`,
      description
    };
  }

  // 2. If string contains a dash separator " - " or " – "
  if (str.includes(" – ") || str.includes(" - ")) {
    const delimiter = str.includes(" – ") ? " – " : " - ";
    const parts = str.split(delimiter);
    const title = parts[0].trim();
    const description = parts.slice(1).join(delimiter).trim();
    return {
      stepNum: index + 1,
      title: title || `Step ${index + 1}`,
      description
    };
  }

  // 3. If string contains a period separator ". " (e.g. "Initial Assessment. A 60-minute one-on-one session...")
  if (str.includes(". ")) {
    const dotIdx = str.indexOf(". ");
    const title = str.substring(0, dotIdx).trim();
    const description = str.substring(dotIdx + 2).trim();
    if (title.length > 0 && description.length > 0) {
      return {
        stepNum: index + 1,
        title,
        description
      };
    }
  }

  // 4. Fallback: If it's a short text (<= 7 words), treat as the title itself
  const words = str.split(/\s+/);
  if (words.length <= 7) {
    return {
      stepNum: index + 1,
      title: str,
      description: ""
    };
  }

  // 4. For longer sentences without delimiter, use the sentence as the title
  return {
    stepNum: index + 1,
    title: str,
    description: ""
  };
}

