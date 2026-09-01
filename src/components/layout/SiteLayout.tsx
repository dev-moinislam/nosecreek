"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import MarketingScripts from "@/components/marketing/MarketingScripts";
import settingsData from "@/data/settings.json";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // If this is any Admin route (/admin, /admin/leads, /admin/services, /admin/login, etc.),
  // do NOT render public website Header, Footer, Schema markup, or Marketing trackers.
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Standard public website layout with Header and Footer
  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <SchemaMarkup type="MedicalBusiness" data={settingsData} />
      <MarketingScripts />
    </>
  );
}
