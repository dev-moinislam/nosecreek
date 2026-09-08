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

export const revalidate = 0;

export default async function HomePage() {
  const [homeData, allTeam, blogPosts, services, conditions, testimonials] = await Promise.all([
    getHomeContent(),
    getTeamMembers(),
    getBlogPosts(),
    getServices(),
    getConditions(),
    getTestimonials()
  ]);

  return (
    <HomeLiveView
      initialHomeData={homeData}
      allTeam={allTeam}
      blogPosts={blogPosts}
      services={services}
      conditions={conditions}
      testimonials={testimonials}
    />
  );
}
