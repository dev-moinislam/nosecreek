export interface SEOData {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  linkedin?: string;
}

export interface OpeningHours {
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
}

export interface SectionBlockConfig {
  id?: string;
  eyebrow?: string;
  eyebrowColor?: string;
  title?: string;
  subtitle?: string;
  content?: string;
  bullets?: string[];
  items?: string[];
  image?: string | null;
  imageAlt?: string;
  imagePosition?: "left" | "right" | "top" | "bottom" | "none";
  background?: "white" | "light" | "teal" | "gradient";
  align?: "left" | "center" | "right";
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
  title: string;
  shortDescription?: string | null;
  description: string;
  heroImage?: string | null;
  sideImage?: string | null;
  cardImage?: string | null;
  iconType?: string;
  iconBg?: string;
  iconColor?: string;
  ctaText?: string;
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
  author: string;
  category: string;
  tags?: string[];
  publishedAt: string;
  updatedAt?: string;
  readingTime?: string;
  relatedPosts?: string[]; // slugs
  href?: string;
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
  bookingUrl: string;
  seo: SEOData;
}

export interface Condition {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string | null;
  description: string;
  heroImage?: string | null;
  sideImage?: string | null;
  cardImage?: string | null;
  ctaText?: string;
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

