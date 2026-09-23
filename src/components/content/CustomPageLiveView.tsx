"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TeamCarousel from "@/components/ui/TeamCarousel";
import ReviewCarousel from "@/components/ui/ReviewCarousel";
import FormattedNarrative from "@/components/ui/FormattedNarrative";
import OptimizedImage from "@/components/ui/OptimizedImage";
import CustomStorySection from "./CustomStorySection";
import VisitUsSection from "./VisitUsSection";
import { CustomPage, TeamMember, Service, Condition, SectionBlockConfig, parseStepItem } from "@/types/content";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

const eyebrowEl = (text: string, color = "var(--primary, #1c9fd8)") => (
  <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color, letterSpacing: "1.5px", fontSize: 13, textTransform: "uppercase" as const, marginBottom: 12 }}>
    {text}
  </div>
);

export const defaultCustomPageSectionOrder = [
  "hero",
  "at_a_glance",
  "clinical_overview",
  "custom_sections",
  "benefits",
  "symptoms",
  "treatment_approach",
  "reviews_carousel",
  "team_carousel",
  "faqs",
  "location_map",
  "bottom_cta"
];

export function getDefaultCustomPageOrder(p: CustomPage): string[] {
  const list: string[] = ["hero"];
  list.push("at_a_glance");
  list.push("clinical_overview");
  if (p.customSections && p.customSections.length > 0) {
    p.customSections.forEach((_, i) => list.push(`custom-${i}`));
  }
  if ((p.benefits && p.benefits.length > 0) || (p.sectionsData?.benefits?.bullets && p.sectionsData.benefits.bullets.length > 0)) {
    list.push("benefits");
  }
  if ((p.symptoms && p.symptoms.length > 0) || (p.sectionsData?.symptoms?.bullets && p.sectionsData.symptoms.bullets.length > 0)) {
    list.push("symptoms");
  }
  if ((p.treatmentApproach && p.treatmentApproach.length > 0) || (p.sectionsData?.treatment_approach?.bullets && p.sectionsData.treatment_approach.bullets.length > 0)) {
    list.push("treatment_approach");
  }
  list.push("reviews_carousel");
  list.push("team_carousel");
  if (p.faqs && p.faqs.length > 0) {
    list.push("faqs");
  }
  list.push("location_map");
  list.push("bottom_cta");

  if (p.sectionsData) {
    Object.keys(p.sectionsData).forEach((k) => {
      if (!list.includes(k) && k !== "hero" && !k.startsWith("custom-")) {
        list.push(k);
      }
    });
  }
  return list;
}

interface CustomPageLiveViewProps {
  initialPage: CustomPage;
  allTeam?: TeamMember[];
  allServices?: Service[];
  allConditions?: Condition[];
}

export default function CustomPageLiveView({
  initialPage,
  allTeam = [],
  allServices = [],
  allConditions = []
}: CustomPageLiveViewProps) {
  const [page, setPage] = useState<CustomPage>(initialPage);

  // Synchronize live with localStorage and Supabase
  useEffect(() => {
    function syncFromLocal() {
      try {
        const saved = localStorage.getItem("adm_custom_pages");
        if (saved) {
          const list: CustomPage[] = JSON.parse(saved);
          const found = list.find((p) => p.slug === initialPage.slug || p.id === initialPage.id);
          if (found) {
            setPage(found);
            return;
          }
        }
      } catch {
        // ignore
      }
    }

    syncFromLocal();

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          const { data, error } = await supabase
            .from("custom_pages")
            .select("*")
            .eq("slug", initialPage.slug)
            .maybeSingle();

          if (!error && data) {
            setPage((prev) => ({
              ...prev,
              title: data.title || prev.title,
              subtitle: data.subtitle || prev.subtitle,
              hero_image: data.hero_image || prev.hero_image,
              heroImage: data.hero_image || prev.heroImage,
              heroBadge: data.hero_badge || prev.heroBadge,
              heroTitle: data.hero_title || prev.heroTitle,
              heroSubtitle: data.hero_subtitle || prev.heroSubtitle,
              content: data.content !== undefined ? data.content : prev.content,
              content_col2: data.content_col2 !== undefined ? data.content_col2 : prev.content_col2,
              columnTwoContent: data.content_col2 !== undefined ? data.content_col2 : prev.columnTwoContent,
              content_layout: data.content_layout || prev.content_layout,
              layout: data.content_layout === "2-column" ? "two-column" : "one-column",
              cta_text: data.cta_text || prev.cta_text,
              cta_url: data.cta_url || prev.cta_url,
              primaryCtaText: data.cta_text || prev.primaryCtaText,
              primaryCtaUrl: data.cta_url || prev.primaryCtaUrl,
              secondary_cta_text: data.secondary_cta_text || prev.secondary_cta_text,
              secondary_cta_url: data.secondary_cta_url || prev.secondary_cta_url,
              secondaryCtaText: data.secondary_cta_text || prev.secondaryCtaText,
              secondaryCtaUrl: data.secondary_cta_url || prev.secondaryCtaUrl,
              benefits: data.benefits || prev.benefits,
              symptoms: data.symptoms || prev.symptoms,
              treatmentApproach: data.treatment_approach || prev.treatmentApproach,
              treatment_approach: data.treatment_approach || prev.treatment_approach,
              customSections: data.custom_sections || prev.customSections,
              custom_sections: data.custom_sections || prev.custom_sections,
              sectionsData: data.sections_data || prev.sectionsData,
              sections_data: data.sections_data || prev.sections_data,
              hiddenSections: data.hidden_sections || prev.hiddenSections,
              hidden_sections: data.hidden_sections || prev.hidden_sections,
              sectionOrder: data.section_order || prev.sectionOrder,
              section_order: data.section_order || prev.section_order,
              faqs: data.faqs || prev.faqs,
              seo: data.seo || prev.seo
            }));
          }
        } catch {
          // ignore
        }
      })();
    }

    window.addEventListener("customPagesUpdated", syncFromLocal);
    window.addEventListener("storage", syncFromLocal);
    return () => {
      window.removeEventListener("customPagesUpdated", syncFromLocal);
      window.removeEventListener("storage", syncFromLocal);
    };
  }, [initialPage]);

  const isHidden = (key: string) => (page.hiddenSections || page.hidden_sections || []).includes(key);

  const rawOrder = (page.sectionOrder && page.sectionOrder.length > 0)
    ? page.sectionOrder
    : (page.section_order && page.section_order.length > 0
        ? page.section_order
        : getDefaultCustomPageOrder(page));

  const order = rawOrder.filter((key) => {
    if (key === "hero") return true;
    if (isHidden(key)) return false;
    if (key.startsWith("custom-")) {
      const idx = parseInt(key.replace("custom-", ""), 10);
      const customList = page.customSections || page.custom_sections || [];
      return Boolean(customList[idx]);
    }
    if (key === "custom_sections") {
      const customList = page.customSections || page.custom_sections || [];
      return Boolean(customList.length > 0);
    }
    if (key === "benefits") {
      return Boolean((page.sectionsData?.benefits?.bullets?.length) || (page.benefits?.length));
    }
    if (key === "symptoms") {
      return Boolean((page.sectionsData?.symptoms?.bullets?.length) || (page.symptoms?.length));
    }
    if (key === "treatment_approach") {
      const approach = page.treatmentApproach || page.treatment_approach || [];
      return Boolean((page.sectionsData?.treatment_approach?.bullets?.length) || (approach.length));
    }
    if (key === "faqs") {
      return Boolean(page.faqs && page.faqs.length > 0);
    }
    return true;
  });

  const getCustomConfig = (key: string): SectionBlockConfig | undefined => {
    const sData = page.sectionsData || page.sections_data || {};
    return sData[key];
  };

  const renderSection = (key: string) => {
    if (isHidden(key)) return null;

    // Handle Custom Storytelling Sections
    if (key.startsWith("custom-")) {
      const idx = parseInt(key.replace("custom-", ""), 10);
      const customList = page.customSections || page.custom_sections || [];
      const customSec = customList[idx];
      if (!customSec) return null;
      const sData = page.sectionsData || page.sections_data || {};
      const merged = { ...customSec, ...(sData[key] || {}) };
      return <CustomStorySection key={key} section={merged} />;
    }

    if (key === "custom_sections") {
      if (order.some((k) => k.startsWith("custom-"))) return null;
      const customList = page.customSections || page.custom_sections || [];
      if (customList.length === 0) return null;
      return (
        <React.Fragment key="custom_sections">
          {customList.map((sec, idx) => {
            const blockKey = `custom-${idx}`;
            const sData = page.sectionsData || page.sections_data || {};
            const merged = { ...sec, ...(sData[blockKey] || {}) };
            return <CustomStorySection key={sec.id || blockKey} section={merged} />;
          })}
        </React.Fragment>
      );
    }

    const cfg = getCustomConfig(key);

    switch (key) {
      case "hero": {
        const heroImg = cfg?.image || page.heroImage || page.hero_image || "/images/clinic/reception-three.jpg";
        const heroImgAlt = cfg?.imageAlt || page.heroImageAlt || page.hero_image_alt || `${page.title} - Nose Creek Physiotherapy Calgary`;
        const heroBadgeText = cfg?.eyebrow || page.heroBadge || (page.neighborhoodName ? `${page.neighborhoodName} & Calgary North Physiotherapy` : "Evidence-Based Clinical Care · Calgary");
        const heroTitleText = cfg?.title || page.heroTitle || `${page.title} in Calgary North`;
        const heroSub = cfg?.subtitle || page.heroSubtitle || page.subtitle || "Restoring your active mobility, natural strength, and pain-free living since 2001.";
        const primaryCta = cfg?.ctaText || page.primaryCtaText || page.cta_text || "Book Your Treatment Online";
        const primaryUrl = cfg?.ctaHref || page.primaryCtaUrl || page.cta_url || "/inquire";
        const secondaryCta = page.secondaryCtaText || page.secondary_cta_text || "Call (403) 295-8590";
        const secondaryUrl = page.secondaryCtaUrl || page.secondary_cta_url || "tel:4032958590";

        const trustBullets = cfg?.bullets && cfg.bullets.length > 0 ? cfg.bullets : [
          "Direct Billing Available",
          "No Doctor Referral Needed",
          "Free Dedicated Parking"
        ];

        return (
          <section key="hero" style={{ background: "linear-gradient(180deg, #f2f8fb 0%, #ffffff 100%)", padding: "clamp(36px, 4vw, 56px) 0 44px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  ...(page.pageType === "neighborhood" ? [{ label: "Communities", href: "/locations" }] : [{ label: "Pages", href: "/" }]),
                  { label: page.title }
                ]}
              />

              <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "clamp(32px, 4vw, 56px)", alignItems: "center" }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--nc-bg-blue, #e6f4ea)", color: "var(--secondary-hover, #5c9515)", fontWeight: 700, fontSize: 13, fontFamily: "'Poppins',sans-serif", padding: "7px 14px", borderRadius: 999, marginBottom: 20 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--secondary, #6faf1c)", display: "inline-block" }} />
                    {heroBadgeText}
                  </div>

                  <h1 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(30px, 4.2vw, 48px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.12, marginBottom: 18 }}>
                    {heroTitleText}
                  </h1>

                  <p style={{ fontSize: "clamp(16px, 1.5vw, 18.5px)", lineHeight: 1.65, color: "#48535c", marginBottom: 28, maxWidth: 580 }}>
                    {heroSub}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
                    <Link
                      href={primaryUrl}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 9,
                        background: "var(--secondary, #6faf1c)",
                        color: "#fff",
                        fontFamily: "'Poppins',sans-serif",
                        fontWeight: 700,
                        fontSize: 16.5,
                        padding: "16px 28px",
                        borderRadius: 10,
                        boxShadow: "0 10px 24px rgba(111,175,28,0.32)",
                        textDecoration: "none"
                      }}
                    >
                      {primaryCta}
                    </Link>

                    <a
                      href={secondaryUrl}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 9,
                        background: "#fff",
                        color: "var(--primary, #0e78a8)",
                        border: "2px solid var(--border-color, #cfe6f2)",
                        fontFamily: "'Poppins',sans-serif",
                        fontWeight: 700,
                        fontSize: 16.5,
                        padding: "14px 26px",
                        borderRadius: 10,
                        textDecoration: "none"
                      }}
                    >
                      {secondaryCta}
                    </a>
                  </div>

                  {/* Trust Micro-Badges */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 22px", marginTop: 26, paddingTop: 20, borderTop: "1px solid #e7edf1", fontSize: 14, color: "#5a6570", fontWeight: 600 }}>
                    {trustBullets.map((b, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: "var(--secondary, #6faf1c)", fontWeight: 800 }}>✓</span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ position: "relative" }}>
                  <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 24px 60px rgba(18,60,80,0.18)", aspectRatio: "4/3", background: "#e2e8f0" }}>
                    <OptimizedImage
                      src={heroImg}
                      alt={heroImgAlt}
                      width={600}
                      height={450}
                      priority
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                  <div style={{ position: "absolute", left: 18, bottom: -22, background: "#fff", borderRadius: 14, padding: "14px 18px", boxShadow: "0 14px 34px rgba(18,60,80,0.16)", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 30, color: "#1d2b34", lineHeight: 1 }}>
                      4.9<span style={{ fontSize: 16, color: "#f6c945" }}> ★</span>
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#5a6570", lineHeight: 1.3 }}>545 Google<br />reviews</div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        );
      }

      case "at_a_glance": {
        const atGlanceItems =
          cfg?.bullets && cfg.bullets.length > 0
            ? cfg.bullets.map((b: any) => {
                if (typeof b === "object" && b !== null && (b.label || b.val || b.title)) {
                  return { icon: b.icon || "⏱", label: b.label || b.title || "Feature", val: b.val || b.description || "" };
                }
                const str = String(b);
                const parts = str.split(":");
                if (parts.length > 1) {
                  return { icon: "⏱", label: parts[0].trim(), val: parts.slice(1).join(":").trim() };
                }
                return { icon: "⏱", label: "Highlight", val: str.trim() };
              })
            : [
                { icon: "⏱", label: "Recovery Assessment", val: "Comprehensive 1-on-1" },
                { icon: "💳", label: "Direct Billing", val: "Available for Most Insurers" },
                { icon: "🩺", label: "Referral Required", val: "No Doctor Referral Needed" },
                { icon: "📍", label: "Clinic Location", val: "Beddington & Thorncliffe (Free Parking)" },
              ];

        return (
          <section key="at_a_glance" style={{ background: cfg?.background === "teal" ? "#12303d" : cfg?.background === "white" ? "#fff" : "#f8fafc", borderTop: "1px solid #e7edf1", borderBottom: "1px solid #e7edf1", padding: "24px 0" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              {cfg?.title && (
                <div style={{ textAlign: "center", marginBottom: 18 }}>
                  {cfg.eyebrow && eyebrowEl(cfg.eyebrow, cfg.eyebrowColor || "#1c9fd8")}
                  <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 20, fontWeight: 700, color: cfg.background === "teal" ? "#fff" : "#1d2b34" }}>{cfg.title}</h3>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                {atGlanceItems.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: cfg?.background === "teal" ? "rgba(255,255,255,0.08)" : "#fff", borderRadius: 12, border: cfg?.background === "teal" ? "1px solid rgba(255,255,255,0.15)" : "1px solid #d7e6ef", boxShadow: "0 4px 12px rgba(18,60,80,0.04)" }}>
                    <span style={{ fontSize: 24 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, fontWeight: 700, color: cfg?.background === "teal" ? "#93c5fd" : "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: cfg?.background === "teal" ? "#fff" : "#1e293b" }}>{item.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case "clinical_overview": {
        const bgStyle =
          cfg?.background === "teal"
            ? { background: "#12303d", color: "#ffffff" }
            : cfg?.background === "light"
            ? { background: "#f2f8fb", color: "#1d2b34" }
            : { background: "#ffffff", color: "#1d2b34" };

        const isDark = cfg?.background === "teal";
        const image = cfg?.image || null;
        const pos = cfg?.imagePosition || (image ? "right" : "none");
        const hasLeftImg = pos === "left" && image;
        const hasRightImg = pos === "right" && image;
        const hasTopImg = pos === "top" && image;
        const hasBottomImg = pos === "bottom" && image;
        const hasNoImg = pos === "none" || !image;

        const overviewAlt = cfg?.imageAlt || `${page.title} Clinical Overview - Nose Creek Physiotherapy Calgary`;
        const contentStr = cfg?.content || page.content || "";
        const contentCol2Str = cfg?.contentCol2 || page.columnTwoContent || page.content_col2 || "";
        const isTwoCol = (cfg?.contentLayout === "2-column" || page.layout === "two-column") && Boolean(contentCol2Str.trim());

        return (
          <section key="clinical_overview" style={{ ...bgStyle, padding: "clamp(56px, 7vw, 96px) 0" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              
              {hasTopImg && (
                <div style={{ marginBottom: 36, borderRadius: 18, overflow: "hidden", maxHeight: 440, boxShadow: "0 20px 48px rgba(18,60,80,0.14)" }}>
                  <OptimizedImage src={image!} alt={overviewAlt} width={1200} height={440} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              )}

              <div
                style={{
                  display: hasNoImg || hasTopImg || hasBottomImg ? "block" : "grid",
                  gridTemplateColumns: hasNoImg ? "1fr" : "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "clamp(32px, 5vw, 64px)",
                  alignItems: "center"
                }}
              >
                {hasLeftImg && (
                  <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 20px 48px rgba(18,60,80,0.14)", aspectRatio: "4/3" }}>
                    <OptimizedImage src={image!} alt={overviewAlt} width={600} height={450} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                )}

                <div style={{ maxWidth: hasNoImg ? (isTwoCol ? "100%" : 900) : "none" }}>
                  {eyebrowEl(cfg?.eyebrow || "Comprehensive Clinical Care", cfg?.eyebrowColor || (isDark ? "#8cc63f" : "#1c9fd8"))}

                  <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: isDark ? "#fff" : "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.15, marginBottom: 18 }}>
                    {cfg?.title || `Understanding Care & Treatment in ${page.neighborhoodName || page.title}`}
                  </h2>

                  {cfg?.subtitle && (
                    <div style={{ fontSize: 18, fontWeight: 600, color: isDark ? "#93c5fd" : "#0e78a8", marginBottom: 18 }}>
                      {cfg.subtitle}
                    </div>
                  )}

                  {isTwoCol ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "clamp(24px, 3.5vw, 44px)",
                        marginTop: 18,
                        alignItems: "start"
                      }}
                    >
                      <div>
                        <FormattedNarrative
                          content={contentStr}
                          isDark={isDark}
                          style={{ fontSize: "clamp(15.5px, 1.1vw, 17px)", lineHeight: 1.75, color: isDark ? "#cbdbe4" : "#48535c" }}
                        />
                      </div>
                      <div>
                        <FormattedNarrative
                          content={contentCol2Str}
                          isDark={isDark}
                          style={{ fontSize: "clamp(15.5px, 1.1vw, 17px)", lineHeight: 1.75, color: isDark ? "#cbdbe4" : "#48535c" }}
                        />
                      </div>
                    </div>
                  ) : (
                    <FormattedNarrative
                      content={contentStr}
                      isDark={isDark}
                      style={{ fontSize: "clamp(15.5px, 1.1vw, 17px)", lineHeight: 1.75, color: isDark ? "#cbdbe4" : "#48535c", marginBottom: 24 }}
                    />
                  )}

                  {cfg?.bullets && cfg.bullets.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10, marginTop: 24 }}>
                      {cfg.bullets.map((b, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, color: isDark ? "#e2e8f0" : "#334155", fontWeight: 500 }}>
                          <span style={{ color: isDark ? "var(--accent, #8cc63f)" : "var(--secondary, #6faf1c)", fontWeight: 800 }}>✓</span>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {cfg?.ctaText && cfg?.ctaHref && (
                    <div style={{ marginTop: 26 }}>
                      <Link
                        href={cfg.ctaHref}
                        style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--primary, #1c9fd8)", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9, textDecoration: "none" }}
                      >
                        {cfg.ctaText} &rarr;
                      </Link>
                    </div>
                  )}
                </div>

                {hasRightImg && (
                  <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 20px 48px rgba(18,60,80,0.14)", aspectRatio: "4/3" }}>
                    <OptimizedImage src={image!} alt={overviewAlt} width={600} height={450} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                )}
              </div>

              {hasBottomImg && (
                <div style={{ marginTop: 36, borderRadius: 18, overflow: "hidden", maxHeight: 440, boxShadow: "0 20px 48px rgba(18,60,80,0.14)" }}>
                  <OptimizedImage src={image!} alt={overviewAlt} width={1200} height={440} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              )}
            </div>
          </section>
        );
      }

      case "benefits": {
        const benefitsList = (cfg?.bullets && cfg.bullets.length > 0) ? cfg.bullets : (page.benefits || []);
        if (benefitsList.length === 0) return null;
        const bgStyle = cfg?.background === "teal" ? { background: "#12303d", color: "#fff" } : cfg?.background === "white" ? { background: "#fff", color: "#1d2b34" } : { background: "#f2f8fb", color: "#1d2b34" };
        const isDark = cfg?.background === "teal";
        return (
          <section key="benefits" style={{ ...bgStyle, padding: "clamp(56px, 7vw, 96px) 0", borderTop: "1px solid #e7edf1" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 44px" }}>
                {eyebrowEl(cfg?.eyebrow || "Proven Clinical Outcomes", cfg?.eyebrowColor || (isDark ? "#8cc63f" : "#1c9fd8"))}
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: isDark ? "#fff" : "#1d2b34", letterSpacing: "-0.5px" }}>
                  {cfg?.title || `Key Benefits of Physiotherapy Care in ${page.neighborhoodName || "Calgary"}`}
                </h2>
                {cfg?.subtitle && <p style={{ fontSize: 16, color: isDark ? "#cbd5e1" : "#5a6570", marginTop: 12, lineHeight: 1.6 }}>{cfg.subtitle}</p>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                {benefitsList.map((b, i) => (
                  <div key={i} style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#fff", padding: "24px 26px", borderRadius: 16, border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e7edf1", boxShadow: "0 6px 20px rgba(18,60,80,0.05)", display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: isDark ? "#8cc63f" : "#e6f4ea", color: isDark ? "#12303d" : "#5c9515", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>✓</div>
                    <div style={{ fontSize: 15.5, fontWeight: 600, color: isDark ? "#fff" : "#1e293b", lineHeight: 1.5 }}>{b}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case "symptoms": {
        const symptomsList = (cfg?.bullets && cfg.bullets.length > 0) ? cfg.bullets : (page.symptoms || []);
        if (symptomsList.length === 0) return null;
        const isDark = cfg?.background === "teal";
        const bgStyle = isDark ? { background: "#12303d", color: "#fff" } : cfg?.background === "light" ? { background: "#f2f8fb", color: "#1d2b34" } : { background: "#fff", color: "#1d2b34" };
        return (
          <section key="symptoms" style={{ ...bgStyle, padding: "clamp(56px, 7vw, 96px) 0" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ maxWidth: 860, marginBottom: 40 }}>
                {eyebrowEl(cfg?.eyebrow || "Targeted Relief", cfg?.eyebrowColor || (isDark ? "#8cc63f" : "#1c9fd8"))}
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: isDark ? "#fff" : "#1d2b34", letterSpacing: "-0.5px" }}>
                  {cfg?.title || "Common Conditions & Complaints We Treat"}
                </h2>
                {cfg?.subtitle && <p style={{ fontSize: 16, color: isDark ? "#cbd5e1" : "#5a6570", marginTop: 12, lineHeight: 1.6 }}>{cfg.subtitle}</p>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                {symptomsList.map((s, i) => (
                  <div key={i} style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#fff", padding: "18px 22px", borderRadius: 14, border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e7edf1", boxShadow: "0 4px 14px rgba(18,60,80,0.04)", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1c9fd8", display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontSize: 15, fontWeight: 600, color: isDark ? "#fff" : "#1d2b34" }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case "treatment_approach": {
        const approach = page.treatmentApproach || page.treatment_approach || [];
        const approachList = (cfg?.bullets && cfg.bullets.length > 0) ? cfg.bullets : approach;
        if (approachList.length === 0) return null;
        const isLight = cfg?.background === "light" || cfg?.background === "white";
        const stepCount = approachList.length;

        return (
          <section key="treatment_approach" style={{ padding: "clamp(56px, 7vw, 96px) 0", background: isLight ? (cfg?.background === "white" ? "#fff" : "#f2f8fb") : "#12303d", color: isLight ? "#1d2b34" : "#fff" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 48px" }}>
                {eyebrowEl(cfg?.eyebrow || "Clinical Process", cfg?.eyebrowColor || "#8cc63f")}
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(26px, 3.8vw, 42px)", fontWeight: 800, color: isLight ? "#1d2b34" : "#fff", letterSpacing: "-0.5px" }}>
                  {cfg?.title || `Our ${stepCount}-Step Patient Care Journey`}
                </h2>
                {cfg?.subtitle ? (
                  <p style={{ fontSize: 16, color: isLight ? "#5a6570" : "#cbdbe4", marginTop: 12, lineHeight: 1.6 }}>{cfg.subtitle}</p>
                ) : (
                  <p style={{ fontSize: 15.5, color: isLight ? "#5a6570" : "#cbdbe4", marginTop: 10, lineHeight: 1.6 }}>
                    Clear, transparent clinical rehabilitation designed around your personal recovery milestones.
                  </p>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
                {approachList.map((step, i) => {
                  const parsed = parseStepItem(step, i);
                  return (
                    <div key={i} style={{ background: isLight ? "#fff" : "rgba(255,255,255,0.06)", border: isLight ? "1px solid #e7edf1" : "1px solid rgba(255,255,255,0.12)", padding: 28, borderRadius: 16, boxShadow: "0 6px 20px rgba(18,60,80,0.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#6faf1c", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17 }}>
                          {parsed.stepNum}
                        </div>
                        <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: isLight ? "#0e78a8" : "#93c5fd", background: isLight ? "#e0f2fe" : "rgba(255,255,255,0.1)", padding: "3px 9px", borderRadius: 999 }}>
                          Step {parsed.stepNum}
                        </span>
                      </div>
                      <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 18, fontWeight: 700, color: isLight ? "#1d2b34" : "#fff", marginBottom: parsed.description ? 10 : 0, lineHeight: 1.35 }}>
                        {parsed.title}
                      </h3>
                      {parsed.description && (
                        <p style={{ margin: 0, fontSize: 14.5, color: isLight ? "#48535c" : "#cbdbe4", lineHeight: 1.65 }}>
                          {parsed.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      case "reviews_carousel":
        return (
          <div key="reviews_carousel">
            <ReviewCarousel
              title={cfg?.title || "Trusted by Over 540+ Calgary Patients"}
              subtitle={cfg?.subtitle || `Read real reviews from patients recovering in Calgary North & ${page.neighborhoodName || "surrounding communities"}`}
            />
          </div>
        );

      case "team_carousel":
        return (
          <div key="team_carousel">
            <TeamCarousel
              members={allTeam}
              customEyebrow={cfg?.eyebrow || "Experienced Clinical Team"}
              customTitle={cfg?.title || "Meet Your Dedicated Calgary Physiotherapists"}
            />
          </div>
        );

      case "faqs": {
        if (!page.faqs || page.faqs.length === 0) return null;
        return (
          <section key="faqs" style={{ padding: "clamp(56px, 7vw, 96px) 0", background: cfg?.background === "white" ? "#fff" : "#f2f8fb", borderTop: "1px solid #e7edf1" }}>
            <div style={{ maxWidth: 840, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", marginBottom: 38 }}>
                {eyebrowEl(cfg?.eyebrow || "Common Questions", cfg?.eyebrowColor || "#1c9fd8")}
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px" }}>
                  {cfg?.title || `Frequently Asked Questions About ${page.title}`}
                </h2>
                {cfg?.subtitle && <p style={{ fontSize: 16, color: "#5a6570", marginTop: 12, lineHeight: 1.6 }}>{cfg.subtitle}</p>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {page.faqs.map((faq, i) => (
                  <details key={i} style={{ background: "#fff", border: "1px solid #e2ebf0", borderRadius: 14, padding: "4px 22px" }}>
                    <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "18px 0", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 17, color: "#1d2b34" }}>
                      {faq.question}
                      <span className="faqPlus" style={{ color: "#1c9fd8", fontSize: 24, transition: "transform .2s", flex: "0 0 auto" }}>+</span>
                    </summary>
                    <p style={{ padding: "0 0 20px", fontSize: 15, lineHeight: 1.7, color: "#5a6570", margin: 0 }}>
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case "location_map": {
        return (
          <div key="location_map">
            <VisitUsSection
              customEyebrow={cfg?.eyebrow || `Serving ${page.neighborhoodName || "Your Community"}`}
              customTitle={cfg?.title || "Convenient Clinic Locations with Free Parking"}
            />
          </div>
        );
      }

      case "decision_ctas": {
        const title = cfg?.title || "Want help deciding if physio is right for you?";
        const subtitle = cfg?.subtitle || cfg?.content || "Not quite ready to book? We offer two free, no-pressure ways to get your questions answered first.";
        return (
          <section key="decision_ctas" style={{ padding: "clamp(56px, 7vw, 96px) 0", background: cfg?.background === "teal" ? "#12303d" : cfg?.background === "light" ? "#f8fafc" : "#ffffff" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 40px" }}>
                {cfg?.eyebrow && eyebrowEl(cfg.eyebrow, cfg.eyebrowColor || "#1c9fd8")}
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(26px, 3.8vw, 42px)", fontWeight: 800, letterSpacing: "-0.5px", color: cfg?.background === "teal" ? "#fff" : "#1d2b34" }}>
                  {title}
                </h2>
                <p style={{ marginTop: 14, fontSize: 16, color: cfg?.background === "teal" ? "#cbdbe4" : "#5a6570", lineHeight: 1.6 }}>
                  {subtitle}
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
                <div style={{ background: "linear-gradient(160deg, var(--secondary, #6faf1c), var(--secondary-hover, #5c9515))", color: "#fff", borderRadius: 20, padding: 34 }}>
                  <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>Free Discovery Session</h3>
                  <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: "#eaf6da" }}>
                    Unsure if physiotherapy will work for your condition, or had a bad experience elsewhere? Come in, tour our clinic and talk to a physiotherapist — no treatment, no pressure.
                  </p>
                  <Link href="/free-discovery-session" style={{ display: "inline-block", marginTop: 20, background: "#fff", color: "var(--secondary-hover, #5c9515)", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9, textDecoration: "none" }}>
                    Apply for a Free Discovery Session &rarr;
                  </Link>
                </div>
                <div style={{ background: "linear-gradient(160deg, var(--primary, #1c9fd8), var(--primary-hover, #1179ab))", color: "#fff", borderRadius: 20, padding: 34 }}>
                  <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>Talk to a Physio First</h3>
                  <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: "#e2f2fa" }}>
                    Have questions about symptoms, recovery timelines, or insurance coverage? Schedule a free phone consultation with our Calgary clinical team.
                  </p>
                  <a href="tel:4032958590" style={{ display: "inline-block", marginTop: 20, background: "#fff", color: "var(--primary-hover, #1179ab)", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9, textDecoration: "none" }}>
                    Arrange a Free Phone Consult &rarr;
                  </a>
                </div>
              </div>
            </div>
          </section>
        );
      }

      case "bottom_cta": {
        const ctaTitle = cfg?.title || "Ready to Get Back to Doing What You Love?";
        const ctaSubtitle = cfg?.subtitle || "Our experienced Calgary physiotherapists are ready to help you recover faster with personalized, one-on-one care. No doctor referral required.";
        const primaryText = cfg?.ctaText || page.primaryCtaText || page.cta_text || "Inquire About Cost & Availability";
        const primaryLink = cfg?.ctaHref || page.primaryCtaUrl || page.cta_url || "/inquire";

        return (
          <section
            key="bottom_cta"
            style={{
              background: "linear-gradient(135deg, #0a2540 0%, #162e4a 100%)",
              color: "#ffffff",
              padding: "68px 24px",
              textAlign: "center"
            }}
          >
            <div style={{ maxWidth: 780, margin: "0 auto" }}>
              <h2 style={{ fontSize: "clamp(26px, 3.8vw, 38px)", fontWeight: 800, margin: "0 0 16px 0", color: "#ffffff", fontFamily: "'Poppins',sans-serif" }}>
                {ctaTitle}
              </h2>
              <p style={{ fontSize: 16, color: "#cbd5e1", lineHeight: 1.65, margin: "0 0 32px 0" }}>
                {ctaSubtitle}
              </p>

              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
                <Link
                  href={primaryLink}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "16px 32px",
                    borderRadius: 8,
                    backgroundColor: "#E75D2A",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 15.5,
                    fontFamily: "'Poppins',sans-serif",
                    textDecoration: "none",
                    boxShadow: "0 10px 24px -5px rgba(231, 93, 42, 0.45)"
                  }}
                >
                  {primaryText}
                </Link>

                <Link
                  href="/free-discovery-session"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "15px 28px",
                    borderRadius: 8,
                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: 15.5,
                    fontFamily: "'Poppins',sans-serif",
                    textDecoration: "none",
                    border: "1px solid rgba(255, 255, 255, 0.25)"
                  }}
                >
                  Free Discovery Session
                </Link>

                <a
                  href="tel:4032958590"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#93c5fd",
                    fontSize: 15,
                    fontWeight: 600,
                    textDecoration: "none",
                    marginLeft: 6
                  }}
                >
                  📞 Call (403) 295-8590
                </a>
              </div>
            </div>
          </section>
        );
      }

      default:
        return null;
    }
  };

  // Generate FAQ schema if FAQs are present
  const faqSchema = page.faqs && page.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": page.faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  return (
    <div style={{ width: "100%", overflowX: "hidden", backgroundColor: "#fff", color: "#1d2b34" }}>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {order.map((key) => renderSection(key))}
    </div>
  );
}
