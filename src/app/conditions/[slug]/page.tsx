import React from "react";
import { notFound } from "next/navigation";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import ConditionLiveView from "@/components/content/ConditionLiveView";
import {
  getConditionBySlug,
  getConditions,
  getServices,
  getTeamMembers
} from "@/lib/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const conditions = await getConditions();
  return conditions.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const condition = await getConditionBySlug(slug);

  if (!condition) {
    return {
      title: "Condition Not Found | Nose Creek Physiotherapy"
    };
  }

  return {
    title: `${condition.seo?.title || condition.name} Treatment in Calgary | Nose Creek Physiotherapy`,
    description: condition.seo?.description || condition.shortDescription || condition.description,
    openGraph: {
      title: condition.seo?.ogTitle || `${condition.name} Treatment | Nose Creek Physiotherapy Calgary`,
      description: condition.seo?.ogDescription || condition.description,
      images: condition.heroImage ? [{ url: condition.heroImage }] : undefined
    }
  };
}

export default async function ConditionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const condition = await getConditionBySlug(slug);

  if (!condition) {
    notFound();
  }

  // Cross-reference data
  const [allServices, allConditions, allTeam] = await Promise.all([
    getServices(),
    getConditions(),
    getTeamMembers()
  ]);

  return (
    <div style={{ width: "100%", overflowX: "hidden", backgroundColor: "#fff" }}>
      <SchemaMarkup
        type="MedicalBusiness"
        data={{
          name: condition.name,
          description: condition.description,
          url: `https://nosecreekphysiotherapy.com/conditions/${condition.slug}`
        }}
      />

      {/* Real-time Reactive Live View */}
      <ConditionLiveView
        initialCondition={condition}
        allServices={allServices}
        allConditions={allConditions}
        allTeam={allTeam}
      />
    </div>
  );
}
