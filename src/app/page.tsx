import React from "react";
import {
  getTeamMembers,
  getBlogPosts,
  getServices,
  getConditions,
  getTestimonials,
  getHomeContent
} from "@/lib/api";
import HomeLiveView from "@/components/home/HomeLiveView";
import { resolvePageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return resolvePageMetadata("/", {
    title: "Nose Creek Physiotherapy Calgary | Physiotherapy, Massage & Movement",
    description:
      "Physiotherapy in Calgary North (Beddington). Since 2001, restoring mobility, strength & balance naturally. Direct insurance billing, open evenings & Saturdays."
  });
}

export const revalidate = 60;

export default async function HomePage() {
  const [homeData, allTeam, blogPosts, services, conditions, testimonials] = await Promise.all([
    getHomeContent(),
    getTeamMembers(),
    getBlogPosts(),
    getServices(),
    getConditions(),
    getTestimonials()
  ]);

  // Project only the fields strictly needed by the Homepage to keep initial HTML/RSC payload minimal
  const homepageServices = services.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    shortDescription: s.shortDescription,
    cardImage: s.cardImage,
    cardImageAlt: s.cardImageAlt,
    heroImageAlt: s.heroImageAlt,
    iconType: s.iconType,
    iconColor: s.iconColor,
    iconBg: s.iconBg,
    ctaText: s.ctaText,
    ctaMuted: s.ctaMuted,
    seo: s.seo ? { cardImageAlt: s.seo.cardImageAlt, heroImageAlt: s.seo.heroImageAlt } : undefined
  })) as typeof services;

  const homepageConditions = conditions.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name
  })) as typeof conditions;

  const homepageBlogPosts = blogPosts.slice(0, 3).map((b) => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt,
    content: "",
    featuredImage: b.featuredImage,
    featuredImageAlt: b.featuredImageAlt,
    author: b.author,
    category: b.category,
    publishedAt: b.publishedAt
  })) as unknown as typeof blogPosts;

  const homepageTeam = allTeam.map((m) => ({
    id: m.id,
    slug: m.slug,
    name: m.name,
    role: m.role,
    profileImage: m.profileImage,
    profileImageAlt: m.profileImageAlt,
    isDirector: m.isDirector,
    shortBio: m.shortBio
  })) as typeof allTeam;

  const homepageTestimonials = testimonials.slice(0, 10).map((t) => ({
    id: t.id,
    author: t.author,
    rating: t.rating,
    text: t.text,
    date: t.date,
    platform: t.platform
  })) as typeof testimonials;

  return (
    <HomeLiveView
      initialHomeData={homeData}
      allTeam={homepageTeam}
      blogPosts={homepageBlogPosts}
      services={homepageServices}
      conditions={homepageConditions}
      testimonials={homepageTestimonials}
    />
  );
}
