import React from "react";
import { notFound } from "next/navigation";
import ServiceLiveView from "@/components/content/ServiceLiveView";
import {
  getServiceBySlug,
  getTeamMembers,
  getConditions,
  getServices,
  getSubServices
} from "@/lib/api";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

export async function generateStaticParams() {
  const { getServices } = await import("@/lib/api");
  const services = await getServices();
  return services.flatMap((s) => {
    const list = [{ slug: [s.slug] }];
    if (s.parentSlug) {
      list.push({ slug: [s.parentSlug, s.slug] });
    }
    return list;
  });
}

import { resolvePageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service Not Found | Nose Creek Physiotherapy"
    };
  }

  const pathUrl = `/services/${Array.isArray(slug) ? slug.join("/") : slug}`;

  return resolvePageMetadata(pathUrl, {
    title: `${service.seo?.title || service.title} in Calgary | Nose Creek Physiotherapy`,
    description: service.seo?.description || service.shortDescription || undefined,
    openGraph: {
      title: service.seo?.ogTitle || `${service.title} | Nose Creek Physiotherapy Calgary`,
      description: service.seo?.ogDescription || service.shortDescription || undefined,
      images: (service.cardImage || service.heroImage) ? [{ url: String(service.cardImage || service.heroImage) }] : undefined
    }
  });
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  // Cross-reference data
  const [allTeam, allConditions, allServices, subServices] = await Promise.all([
    getTeamMembers(),
    getConditions(),
    getServices(),
    getSubServices(service.slug)
  ]);

  const parentService = service.parentSlug
    ? allServices.find((s) => s.slug === service.parentSlug)
    : undefined;

  return (
    <div style={{ width: "100%", overflowX: "hidden", backgroundColor: "#fff" }}>
      {/* Real-time Reactive Live View with Sub-Service Support */}
      <ServiceLiveView 
        initialService={service} 
        allTeam={allTeam} 
        allConditions={allConditions} 
        allServices={allServices}
        subServices={subServices}
        parentService={parentService}
      />
    </div>
  );
}
