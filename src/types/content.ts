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

export interface ServiceCustomSection {
  id?: string;
  eyebrow?: string;
  eyebrowColor?: string;
  title: string;
  subtitle?: string;
  content?: string;
  bullets?: string[];
  image?: string;
  imageAlt?: string;
  imagePosition?: "left" | "right" | "top" | "bottom" | "none";
  background?: "white" | "light" | "teal" | "gradient";
  ctaText?: string;
  ctaHref?: string;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  heroImage?: string;
  sideImage?: string;
  iconType?: string;
  iconBg?: string;
  iconColor?: string;
  ctaText?: string;
  ctaMuted?: boolean;
  benefits?: string[];
  symptoms?: string[];
  treatmentApproach?: string[];
  customSections?: ServiceCustomSection[];
  faqs?: FAQItem[];
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

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
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
  shortDescription?: string;
  description: string;
  heroImage?: string;
  symptoms?: string[];
  treatmentApproach?: string[];
  relatedServices?: string[]; // slugs
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
