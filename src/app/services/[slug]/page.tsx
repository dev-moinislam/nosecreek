import React from "react";
import { notFound } from "next/navigation";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import ServiceLiveView from "@/components/content/ServiceLiveView";
import {
  getServiceBySlug,
  getTeamMembers,
  getConditions
} from "@/lib/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const { getServices } = await import("@/lib/api");
  const services = await getServices();
  return services.map((s) => ({
    slug: s.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return {
      title: "Service Not Found | Nose Creek Physiotherapy"
    };
  }

  return {
    title: `${service.seo?.title || service.title} in Calgary | Nose Creek Physiotherapy`,
    description: service.seo?.description || service.shortDescription,
    openGraph: {
      title: service.seo?.ogTitle || `${service.title} | Nose Creek Physiotherapy Calgary`,
      description: service.seo?.ogDescription || service.shortDescription,
      images: service.heroImage ? [{ url: service.heroImage }] : undefined
    }
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  // Cross-reference data
  const [allTeam, allConditions] = await Promise.all([
    getTeamMembers(),
    getConditions()
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
      />
    </div>
  );
}
