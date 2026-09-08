import React from "react";
import { notFound } from "next/navigation";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import ServiceLiveView from "@/components/content/ServiceLiveView";
import {
  getServiceBySlug,
  getTeamMembers,
  getConditions,
  getServices
} from "@/lib/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;
export const revalidate = 0;

export async function generateStaticParams() {
  const { getServices } = await import("@/lib/api");
  const services = await getServices();
  return services.map((s) => ({
    slug: s.slug,
  }));
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

  return resolvePageMetadata(`/services/${slug}`, {
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
  const [allTeam, allConditions, allServices] = await Promise.all([
    getTeamMembers(),
    getConditions(),
    getServices()
  ]);

  return (
    <div style={{ width: "100%", overflowX: "hidden", backgroundColor: "#fff" }}>
      <SchemaMarkup
        type="MedicalBusiness"
        data={{
          name: service.title,
          description: service.shortDescription,
          url: `https://nosecreekphysiotherapy.com/services/${service.slug}`
        }}
      />

      {/* Real-time Reactive Live View */}
      <ServiceLiveView
        initialService={service}
        allTeam={allTeam}
        allConditions={allConditions}
        allServices={allServices}
      />
    </div>
  );
}
