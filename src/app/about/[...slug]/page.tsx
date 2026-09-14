import React from "react";
import { redirect } from "next/navigation";
import { resolvePageMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const path = Array.isArray(slug) ? slug.join("/") : slug;
  return resolvePageMetadata(`/about/${path}`, {
    title: "About Nose Creek Physiotherapy | Calgary Physiotherapy Clinic",
    description: "Learn about Nose Creek Physiotherapy, our clinical team, philosophy, and dedication to helping Calgarians move without pain."
  });
}

export default async function AboutCatchAllPage({ params }: PageProps) {
  const { slug } = await params;
  const path = Array.isArray(slug) ? slug.join("/") : slug;

  // Map known about sections to their anchors on /about
  if (path === "why-choose-us" || path === "philosophy") {
    redirect("/about#why-choose-us");
  } else if (path === "areas-we-serve" || path === "locations") {
    redirect("/locations");
  } else if (path === "our-team" || path === "team") {
    redirect("/team");
  }

  // Fallback: redirect cleanly to /about
  redirect("/about");
}
