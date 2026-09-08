"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import MarketingScripts from "@/components/marketing/MarketingScripts";
import FloatingReviewsWidget from "@/components/ui/FloatingReviewsWidget";
import NavigationProgressBar from "@/components/ui/NavigationProgressBar";
import settingsData from "@/data/settings.json";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Exclude all Admin, Portal, and Login routes (/admin, /client-login, /admin-login)
  // from public website Header, Footer, Schema markup, Floating widget, or Marketing trackers.
  const isPortalOrLoginRoute =
    pathname?.startsWith("/admin") ||
    pathname === "/client-login" ||
    pathname?.startsWith("/client-login/") ||
    pathname === "/admin-login" ||
    pathname?.startsWith("/admin-login/");

  if (isPortalOrLoginRoute) {
    return <>{children}</>;
  }

  // Standard public website layout with Header and Footer
  return (
    <>
      <React.Suspense fallback={null}>
        <NavigationProgressBar />
      </React.Suspense>
      <Header />
      <main id="main-content" style={{ minHeight: "100vh" }}>{children}</main>
      <Footer />
      <SchemaMarkup type="MedicalBusiness" data={settingsData} />
      <MarketingScripts />
      <FloatingReviewsWidget />
    </>
  );
}
