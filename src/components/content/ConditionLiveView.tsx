"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ServiceIcon from "@/components/ui/ServiceIcon";
import TeamCarousel from "@/components/ui/TeamCarousel";
import FormattedNarrative from "@/components/ui/FormattedNarrative";
import { Condition, Service, TeamMember, SectionBlockConfig, parseStepItem } from "@/types/content";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import VisitUsSection from "./VisitUsSection";
import CustomStorySection from "./CustomStorySection";
import ReviewCarousel from "@/components/ui/ReviewCarousel";
import DynamicFAQSchema from "@/components/seo/DynamicFAQSchema";
import OptimizedImage from "@/components/ui/OptimizedImage";

const eyebrowEl = (text: string, color = "var(--primary, #1c9fd8)") => (
  <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color, letterSpacing: "1.5px", fontSize: 13, textTransform: "uppercase" as const, marginBottom: 12 }}>
    {text}
  </div>
);

const defaultConditionSectionOrder = [
  "hero",
  "at_a_glance",
  "clinical_overview",
  "custom_sections",
  "sub_conditions",
  "benefits",
  "symptoms",
  "treatment_approach",
  "related_therapies",
  "team_carousel",
  "faqs",
  "location_map",
  "decision_ctas",
  "sibling_conditions",
  "other_links",
  "bottom_cta"
];

const getDefaultConditionOrder = (c: Condition): string[] => {
  const list: string[] = ["hero"];
  if (c.sectionsData?.at_a_glance) {
    list.push("at_a_glance");
  }
  if (c.description || c.sectionsData?.clinical_overview?.content) {
    list.push("clinical_overview");
  }
  if (c.customSections && c.customSections.length > 0) {
    c.customSections.forEach((_, i) => list.push(`custom-${i}`));
  }
  list.push("sub_conditions");
  if ((c.benefits && c.benefits.length > 0) || (c.sectionsData?.benefits?.bullets && c.sectionsData.benefits.bullets.length > 0)) {
    list.push("benefits");
  }
  if ((c.symptoms && c.symptoms.length > 0) || (c.sectionsData?.symptoms?.bullets && c.sectionsData.symptoms.bullets.length > 0)) {
    list.push("symptoms");
  }
  if ((c.treatmentApproach && c.treatmentApproach.length > 0) || (c.sectionsData?.treatment_approach?.bullets && c.sectionsData.treatment_approach.bullets.length > 0)) {
    list.push("treatment_approach");
  }
  list.push("related_therapies");
  list.push("team_carousel");
  if (c.faqs && c.faqs.length > 0) {
    list.push("faqs");
  }
  list.push("location_map");
  list.push("decision_ctas");
  list.push("sibling_conditions");
  list.push("other_links");
  list.push("bottom_cta");

  if (c.sectionsData) {
    Object.keys(c.sectionsData).forEach((k) => {
      if (!list.includes(k) && k !== "hero" && !k.startsWith("custom-")) {
        list.push(k);
      }
    });
  }
  return list;
};

export default function ConditionLiveView({
  initialCondition,
  allServices,
  allConditions,
  allTeam,
  subConditions = [],
  parentCondition
}: {
  initialCondition: Condition;
  allServices: Service[];
  allConditions: Condition[];
  allTeam: TeamMember[];
  subConditions?: Condition[];
  parentCondition?: Condition;
}) {
  const [condition, setCondition] = useState<Condition>(initialCondition);

  // Real-time synchronization with local admin updates & live database
  useEffect(() => {
    function syncFromLocal() {
      try {
        const saved = localStorage.getItem("adm_conditions");
        if (saved) {
          const list: Condition[] = JSON.parse(saved);
          const found = list.find((c) => c.slug === initialCondition.slug || c.id === initialCondition.id);
          if (found) {
            setCondition(found);
            return;
          }
        }
      } catch {
        // ignore
      }
    }

    // 1. Sync from local storage immediately on mount
    syncFromLocal();

    // 2. Fetch fresh live data from Supabase on mount
    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          const { data, error } = await supabase
            .from("conditions")
            .select("*")
            .eq("slug", initialCondition.slug)
            .eq("is_published", true)
            .single();

          if (!error && data) {
            setCondition((prev) => ({
              ...prev,
              name: data.name || prev.name,
              heroImage: data.hero_image !== undefined ? data.hero_image : prev.heroImage,
              sideImage: data.side_image !== undefined ? data.side_image : prev.sideImage,
              cardImage: data.card_image || data.seo?.cardImage || prev.cardImage,
              description: data.description || prev.description,
              shortDescription: data.short_description || prev.shortDescription,
              benefits: data.benefits || prev.benefits,
              symptoms: data.symptoms || prev.symptoms,
              treatmentApproach: data.treatment_approach || prev.treatmentApproach,
              customSections: data.custom_sections || prev.customSections,
              sectionsData: data.sections_data || data.seo?.sectionsData || prev.sectionsData,
              faqs: data.faqs || prev.faqs,
              hiddenSections: data.hidden_sections || prev.hiddenSections,
              sectionOrder: data.section_order || prev.sectionOrder,
              seo: data.seo || prev.seo
            }));
          }
        } catch {
          // ignore
        }
      })();
    }

    window.addEventListener("conditionsUpdated", syncFromLocal);
    window.addEventListener("storage", syncFromLocal);
    return () => {
      window.removeEventListener("conditionsUpdated", syncFromLocal);
      window.removeEventListener("storage", syncFromLocal);
    };
  }, [initialCondition]);

  const isHidden = (key: string) => (condition.hiddenSections || []).includes(key);
  const rawOrder = condition.sectionOrder && condition.sectionOrder.length > 0
    ? condition.sectionOrder
    : getDefaultConditionOrder(condition);

  const order = rawOrder.filter((key) => {
    if (key === "hero") return true;
    if (isHidden(key)) return false;
    if (key.startsWith("custom-")) {
      const idx = parseInt(key.replace("custom-", ""), 10);
      return Boolean(condition.customSections && condition.customSections[idx]);
    }
    if (key === "custom_sections") return Boolean(condition.customSections && condition.customSections.length > 0);
    if (key === "at_a_glance") return Boolean(condition.sectionsData?.at_a_glance);
    if (key === "clinical_overview") return Boolean(condition.description || condition.sectionsData?.clinical_overview?.content);
    if (key === "sub_conditions") return Boolean(subConditions && subConditions.length > 0);
    if (key === "sibling_conditions") return Boolean(condition.parentSlug);
    if (key === "benefits") return Boolean((condition.sectionsData?.benefits?.bullets?.length) || (condition.benefits?.length));
    if (key === "symptoms") return Boolean((condition.sectionsData?.symptoms?.bullets?.length) || (condition.symptoms?.length));
    if (key === "treatment_approach") return Boolean((condition.sectionsData?.treatment_approach?.bullets?.length) || (condition.treatmentApproach?.length));
    if (key === "faqs") return Boolean(condition.faqs?.length);
    return true;
  });

  const relatedServiceObjects = allServices.filter((s) =>
    (condition.relatedServices ?? []).includes(s.id) || (condition.relatedServices ?? []).includes(s.slug)
  );
  const otherConditions = allConditions.filter((c) => c.slug !== condition.slug);

  const getCustomConfig = (key: string): SectionBlockConfig | undefined => {
    return (condition.sectionsData || {})[key];
  };

  // Render individual section block with full layout, image & background flexibility
  const renderSection = (key: string) => {
    if (isHidden(key)) return null;

    // Handle Custom Storytelling Sections
    if (key.startsWith("custom-")) {
      const idx = parseInt(key.replace("custom-", ""), 10);
      const customSec = condition.customSections?.[idx];
      if (!customSec) return null;
      const merged = { ...customSec, ...(condition.sectionsData?.[key] || {}) };
      return <CustomStorySection key={key} section={merged} />;
    }

    if (key === "custom_sections") {
      if (order.some((k) => k.startsWith("custom-"))) return null;
      if (!condition.customSections || condition.customSections.length === 0) return null;
      return (
        <React.Fragment key="custom_sections">
          {condition.customSections.map((sec, idx) => {
            const blockKey = `custom-${idx}`;
            const merged = { ...sec, ...(condition.sectionsData?.[blockKey] || {}) };
            return <CustomStorySection key={sec.id || blockKey} section={merged} />;
          })}
        </React.Fragment>
      );
    }

    const cfg = getCustomConfig(key);

    switch (key) {
      case "hero":
        return (
          <section key="hero" className="condition-hero-section" style={{ background: "linear-gradient(180deg, #f2f8fb 0%, #ffffff 100%)", padding: "clamp(24px, 4vw, 56px) 0 44px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                    @media (max-width: 768px) {
                      .condition-hero-top-nav {
                        display: none !important;
                      }
                      .condition-hero-section {
                        padding-top: 20px !important;
                      }
                      .condition-hero-main-grid {
                        margin-top: 6px !important;
                      }
                    }
                  `
                }}
              />

              <div className="condition-hero-top-nav">
                <Breadcrumbs
                  items={[
                    { label: "Home", href: "/" },
                    { label: "What We Treat", href: "/conditions" },
                    ...(parentCondition ? [{ label: parentCondition.name, href: `/conditions/${parentCondition.slug}` }] : []),
                    { label: condition.name }
                  ]}
                />

                {parentCondition && (
                  <div style={{ marginTop: 14 }}>
                    <Link
                      href={`/conditions/${parentCondition.slug}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: "var(--primary, #0e78a8)",
                        textDecoration: "none"
                      }}
                    >
                      &larr; Back to {parentCondition.name} Overview
                    </Link>
                  </div>
                )}
              </div>

              <div className="condition-hero-main-grid" style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "clamp(32px, 4vw, 56px)", alignItems: "center" }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--nc-bg-blue, #e6f4ea)", color: "var(--secondary-hover, #5c9515)", fontWeight: 700, fontSize: 13, fontFamily: "'Poppins',sans-serif", padding: "7px 14px", borderRadius: 999, marginBottom: 20 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--secondary, #6faf1c)", display: "inline-block" }} />
                    {cfg?.eyebrow || (parentCondition ? `Sub-Condition · ${parentCondition.name}` : "Targeted Clinical Care · Calgary North NW & NE")}
                  </div>

                  <h1 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(30px, 4.2vw, 48px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.12, marginBottom: 18 }}>
                    {cfg?.title || `${condition.name} Relief in Calgary`}
                  </h1>

                  <p style={{ fontSize: "clamp(16px, 1.5vw, 18.5px)", lineHeight: 1.65, color: "#48535c", marginBottom: 28, maxWidth: 580 }}>
                    {cfg?.content || condition.shortDescription || condition.description}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
                    <a
                      href={cfg?.ctaHref || condition.ctaHref || "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"}
                      target="_blank"
                      rel="noopener noreferrer"
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
                      {cfg?.ctaText || condition.ctaText || "Book Your Treatment Online"}
                    </a>
                    <a
                      href="tel:+14032958590"
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
                      Call 403.295.8590
                    </a>
                  </div>

                  {/* Trust Micro-Badges */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 22px", marginTop: 26, paddingTop: 20, borderTop: "1px solid #e7edf1", fontSize: 14, color: "#5a6570", fontWeight: 600 }}>
                    {(cfg?.bullets && cfg.bullets.length > 0 ? cfg.bullets : [
                      "Direct Billing to Insurance",
                      "No Physician Referral Needed",
                      "Free On-Site Parking"
                    ]).map((b, i) => (
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
                      src={cfg?.image || condition.heroImage || "/images/clinic/reception-three.jpg"}
                      alt={cfg?.imageAlt || condition.heroImageAlt || condition.seo?.heroImageAlt || `${condition.name} treatment Calgary`}
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
                { icon: "📍", label: "Clinic Location", val: "Beddington SE (Free Parking)" },
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
        const isCenter = cfg?.align === "center";
        const image = cfg?.image || condition.heroImage;
        const pos = cfg?.imagePosition || (image ? "right" : "none");
        const hasLeftImg = pos === "left" && image;
        const hasRightImg = pos === "right" && image;
        const hasTopImg = pos === "top" && image;
        const hasBottomImg = pos === "bottom" && image;
        const hasNoImg = pos === "none" || !image;
        const isMobileReverse = Boolean(cfg?.reverseMobileOrder || (cfg as any)?.reverse_mobile_order);

        const overviewAlt = cfg?.imageAlt || condition.sideImageAlt || condition.seo?.sideImageAlt || `${condition.name} Clinical Overview - Nose Creek Physiotherapy Calgary`;

        return (
          <section key="clinical_overview" style={{ ...bgStyle, padding: "clamp(56px, 7vw, 96px) 0" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              {hasLeftImg || hasRightImg ? (
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                      @media (max-width: 768px) {
                        .condition-overview-grid {
                          display: flex !important;
                          flex-direction: ${isMobileReverse ? "column-reverse" : "column"} !important;
                        }
                      }
                    `
                  }}
                />
              ) : null}
              
              {hasTopImg && (
                <div style={{ marginBottom: 36, borderRadius: 18, overflow: "hidden", maxHeight: 440, boxShadow: "0 20px 48px rgba(18,60,80,0.14)" }}>
                  <OptimizedImage src={image!} alt={overviewAlt} width={1200} height={440} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              )}

              <div
                className="condition-overview-grid"
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

                <div style={{ maxWidth: hasNoImg ? 880 : "none", textAlign: isCenter ? "center" : "left", margin: isCenter ? "0 auto" : 0 }}>
                  {eyebrowEl(cfg?.eyebrow || "Understanding The Cause", cfg?.eyebrowColor || (isDark ? "#8cc63f" : "#1c9fd8"))}

                  <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: isDark ? "#fff" : "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.15, marginBottom: 18 }}>
                    {cfg?.title || `What Causes ${condition.name} & How Physiotherapy Resolves It`}
                  </h2>

                  {cfg?.subtitle && (
                    <div style={{ fontSize: 18, fontWeight: 600, color: isDark ? "#93c5fd" : "#0e78a8", marginBottom: 18 }}>
                      {cfg.subtitle}
                    </div>
                  )}

                  <FormattedNarrative
                    content={cfg?.content || condition.description || ""}
                    isDark={isDark}
                    style={{ fontSize: "clamp(15.5px, 1.1vw, 17px)", lineHeight: 1.75, color: isDark ? "#cbdbe4" : "#48535c", marginBottom: 24 }}
                  />

                  {cfg?.bullets && cfg.bullets.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10, marginTop: 20 }}>
                      {cfg.bullets.map((b, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, color: isDark ? "#e2e8f0" : "#334155", fontWeight: 500 }}>
                          <span style={{ color: isDark ? "var(--accent, #8cc63f)" : "var(--secondary, #6faf1c)", fontWeight: 800 }}>✓</span>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {cfg?.ctaText && cfg?.ctaHref && (
                    <div style={{ marginTop: 24 }}>
                      <a
                        href={cfg.ctaHref}
                        target={cfg.ctaHref.startsWith("http") ? "_blank" : undefined}
                        rel={cfg.ctaHref.startsWith("http") ? "noopener noreferrer" : undefined}
                        style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--primary, #1c9fd8)", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9, textDecoration: "none" }}
                      >
                        {cfg.ctaText} &rarr;
                      </a>
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
        const benefitsList = (cfg?.bullets && cfg.bullets.length > 0) ? cfg.bullets : (condition.benefits || []);
        if (benefitsList.length === 0) return null;
        const isDark = cfg?.background === "teal";
        const bgStyle = isDark ? { background: "#12303d", color: "#fff" } : cfg?.background === "white" ? { background: "#fff", color: "#1d2b34" } : { background: "#f8fafc", color: "#1d2b34" };
        return (
          <section key="benefits" style={{ ...bgStyle, padding: "clamp(48px, 5vw, 72px) 0", borderTop: "1px solid #e7edf1", borderBottom: "1px solid #e7edf1" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 40px" }}>
                {eyebrowEl(cfg?.eyebrow || "Proven Relief", cfg?.eyebrowColor || (isDark ? "#8cc63f" : "#1c9fd8"))}
                <h2 style={{ fontSize: "clamp(26px, 3.2vw, 38px)", fontWeight: 800, color: isDark ? "#fff" : "#1d2b34", letterSpacing: "-0.5px" }}>
                  {cfg?.title || `Key Benefits of Treating ${condition.name}`}
                </h2>
                {cfg?.subtitle && <p style={{ fontSize: 16, color: isDark ? "#cbd5e1" : "#64748b", marginTop: 8 }}>{cfg.subtitle}</p>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
                {benefitsList.map((b, i) => (
                  <div key={i} style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#fff", padding: "20px 24px", borderRadius: 12, border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e2e8f0", display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: isDark ? "var(--accent, #8cc63f)" : "var(--nc-bg-blue, #e6f4ea)", color: isDark ? "var(--dark, #12303d)" : "var(--secondary-hover, #5c9515)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>✓</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: isDark ? "#fff" : "#1e293b", lineHeight: 1.5 }}>{b}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case "symptoms": {
        const symptomsList = (cfg?.bullets && cfg.bullets.length > 0) ? cfg.bullets : (condition.symptoms || []);
        if (symptomsList.length === 0) return null;
        const isDark = cfg?.background === "teal";
        const bgStyle = isDark ? { background: "#12303d", color: "#fff" } : cfg?.background === "light" ? { background: "#f2f8fb", color: "#1d2b34" } : { background: "#fff", color: "#1d2b34" };
        return (
          <section key="symptoms" style={{ ...bgStyle, padding: "clamp(56px, 7vw, 96px) 0" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ maxWidth: 860, marginBottom: 40 }}>
                {eyebrowEl(cfg?.eyebrow || "Common Symptoms", cfg?.eyebrowColor || (isDark ? "var(--accent, #8cc63f)" : "var(--primary, #1c9fd8)"))}
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: isDark ? "#fff" : "#1d2b34", letterSpacing: "-0.5px" }}>
                  {cfg?.title || `Key Warning Signs & Symptoms of ${condition.name}`}
                </h2>
                {cfg?.subtitle && <p style={{ fontSize: 16, color: isDark ? "#cbd5e1" : "#5a6570", marginTop: 12, lineHeight: 1.6 }}>{cfg.subtitle}</p>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                {symptomsList.map((s, i) => (
                  <div key={i} style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#fff", padding: "18px 22px", borderRadius: 14, border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e7edf1", boxShadow: "0 6px 18px rgba(18,60,80,0.04)", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--secondary, #6faf1c)", display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontSize: 15, fontWeight: 600, color: isDark ? "#fff" : "#1d2b34" }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case "treatment_approach": {
        const approachList = (cfg?.bullets && cfg.bullets.length > 0) ? cfg.bullets : (condition.treatmentApproach || []);
        if (approachList.length === 0) return null;
        const isLight = cfg?.background === "light" || cfg?.background === "white";
        return (
          <section key="treatment_approach" style={{ padding: "clamp(56px, 7vw, 96px) 0", background: isLight ? (cfg?.background === "white" ? "#fff" : "#f2f8fb") : "#12303d", color: isLight ? "#1d2b34" : "#fff" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 48px" }}>
                {eyebrowEl(cfg?.eyebrow || "Proven Clinical Approach", cfg?.eyebrowColor || "var(--accent, #8cc63f)")}
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: isLight ? "#1d2b34" : "#fff", letterSpacing: "-0.5px" }}>
                  {cfg?.title || "Our 4-Step Recovery Protocol"}
                </h2>
                {cfg?.subtitle && <p style={{ fontSize: 16, color: isLight ? "#5a6570" : "#cbdbe4", marginTop: 12, lineHeight: 1.6 }}>{cfg.subtitle}</p>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
                {approachList.map((step, i) => {
                  const parsed = parseStepItem(step, i);
                  return (
                    <div key={i} style={{ background: isLight ? "#fff" : "rgba(255,255,255,0.06)", border: isLight ? "1px solid #e7edf1" : "1px solid rgba(255,255,255,0.12)", padding: 28, borderRadius: 16, boxShadow: "0 6px 20px rgba(18,60,80,0.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--secondary, #6faf1c)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17 }}>
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

      case "related_therapies":
        return (
          <React.Fragment key="related_therapies_group">
            {/* Sub-Conditions & Targeted Treatment Programs (if condition has sub-pages) */}
            {subConditions && subConditions.length > 0 && (
              <section style={{ padding: "clamp(56px, 7vw, 96px) 0", background: "#ffffff", borderTop: "1px solid #e7edf1" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
                  <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 44px" }}>
                    {eyebrowEl("Targeted Treatment Programs", "#1c9fd8")}
                    <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px" }}>
                      Specific Conditions Related to {condition.name}
                    </h2>
                    <p style={{ marginTop: 14, fontSize: 16, color: "#5a6570", lineHeight: 1.6 }}>
                      Select a specialized condition below to learn about targeted symptoms, diagnosis, and evidence-based clinical rehabilitation programs.
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
                    {subConditions.map((sub) => {
                      const nestedUrl = `/conditions/${condition.slug}/${sub.slug}`;
                      return (
                        <Link
                          key={sub.slug}
                          href={nestedUrl}
                          style={{
                            textDecoration: "none",
                            display: "flex",
                            flexDirection: "column",
                            background: "#f8fafc",
                            border: "1.5px solid #e2ebf0",
                            borderRadius: 16,
                            padding: "28px 26px",
                            transition: "all 0.2s ease",
                            boxShadow: "0 4px 14px rgba(18,60,80,0.04)"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--primary, #0e78a8)", background: "#e0f2fe", padding: "4px 10px", borderRadius: 999 }}>
                              Program
                            </span>
                            <span style={{ color: "var(--primary, #0e78a8)", fontWeight: 700, fontSize: 18 }}>&rarr;</span>
                          </div>

                          <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 21, fontWeight: 700, color: "#1d2b34", marginBottom: 10 }}>
                            {sub.name}
                          </h3>

                          <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "#5a6570", flexGrow: 1, margin: 0 }}>
                            {sub.shortDescription || sub.description || "Targeted physical therapy assessment, pain reduction, and active recovery."}
                          </p>

                          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e2ebf0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--secondary, #6faf1c)" }}>
                              View Treatment Program &rarr;
                            </span>
                            <span style={{ fontSize: 12.5, color: "#94a3b8", fontWeight: 600 }}>
                              Calgary Clinic
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {relatedServiceObjects.length > 0 && (
              <section style={{ padding: "clamp(56px, 7vw, 96px) 0", background: "#f2f8fb" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
                  <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 44px" }}>
                    {eyebrowEl(cfg?.eyebrow || "Comprehensive Treatment", cfg?.eyebrowColor || "#6faf1c")}
                    <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px" }}>
                      {cfg?.title || `Recommended Therapies for ${condition.name}`}
                    </h2>
                    <p style={{ marginTop: 14, fontSize: 16, color: "#5a6570", lineHeight: 1.6 }}>
                      We combine targeted physiotherapy with complementary modalities to accelerate your healing.
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 22 }}>
                    {relatedServiceObjects.map((svc) => (
                      <Link key={svc.slug} href={`/services/${svc.slug}`} style={{ textDecoration: "none", display: "block" }}>
                        <div style={{ background: "#fff", border: "1px solid #e7edf1", borderRadius: 16, padding: 28, boxShadow: "0 6px 20px rgba(18,60,80,0.05)", height: "100%", display: "flex", flexDirection: "column" }}>
                          <div style={{ width: 52, height: 52, borderRadius: 12, background: svc.iconBg || "#e9f5fb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                            <ServiceIcon type={svc.iconType} color={svc.iconColor || "#1c9fd8"} size={26} />
                          </div>
                          <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#1d2b34" }}>{svc.title}</h3>
                          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#5a6570", flexGrow: 1, margin: 0 }}>{svc.shortDescription}</p>
                          <span style={{ display: "inline-block", marginTop: 14, color: "#0e78a8", fontWeight: 700, fontSize: 14 }}>
                            Learn more &rarr;
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </React.Fragment>
        );

      case "team_carousel":
        return (
          <div key="team_carousel">
            <TeamCarousel members={allTeam} customEyebrow={cfg?.eyebrow} customTitle={cfg?.title} />
          </div>
        );

      case "faqs":
        if (!condition.faqs || condition.faqs.length === 0) return null;
        return (
          <section key="faqs" style={{ padding: "clamp(56px, 7vw, 96px) 0", background: cfg?.background === "white" ? "#fff" : "#f2f8fb", borderTop: "1px solid #e7edf1" }}>
            <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", marginBottom: 38 }}>
                {eyebrowEl(cfg?.eyebrow || "FAQ", cfg?.eyebrowColor || "#1c9fd8")}
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px" }}>
                  {cfg?.title || `Frequently Asked Questions About ${condition.name}`}
                </h2>
                {cfg?.subtitle && <p style={{ fontSize: 16, color: "#5a6570", marginTop: 12, lineHeight: 1.6 }}>{cfg.subtitle}</p>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {condition.faqs.map((faq, i) => (
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

      case "location_map":
        return (
          <div key="location_map">
            <VisitUsSection customEyebrow={cfg?.eyebrow} customTitle={cfg?.title} />
          </div>
        );

      case "testimonials": {
        return (
          <ReviewCarousel
            key="testimonials"
            id="condition-reviews"
            title={cfg?.title || `Real 5-Star Reviews From Our Calgary Patients`}
            subtitle={cfg?.subtitle || "See what our patients have to say about their recovery journey at Nose Creek Physiotherapy"}
          />
        );
      }

      case "decision_ctas":
        return (
          <section key="decision_ctas" style={{ padding: "clamp(56px, 7vw, 96px) 0", background: cfg?.background === "teal" ? "#12303d" : cfg?.background === "light" ? "#f8fafc" : "#ffffff" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 40px" }}>
                {cfg?.eyebrow && eyebrowEl(cfg.eyebrow, cfg.eyebrowColor || "#1c9fd8")}
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(26px, 3.8vw, 42px)", fontWeight: 800, letterSpacing: "-0.5px", color: cfg?.background === "teal" ? "#fff" : "#1d2b34" }}>
                  {cfg?.title || "Want help deciding if physio is right for you?"}
                </h2>
                <p style={{ marginTop: 14, fontSize: 16, color: cfg?.background === "teal" ? "#cbdbe4" : "#5a6570", lineHeight: 1.6 }}>
                  {cfg?.subtitle || cfg?.content || "Not quite ready to book? We offer two free, no-pressure ways to get your questions answered first."}
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
                <div style={{ background: "linear-gradient(160deg, var(--secondary, #6faf1c), var(--secondary-hover, #5c9515))", color: "#fff", borderRadius: 20, padding: 34 }}>
                  <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>Free Discovery Session</h3>
                  <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: "#eaf6da" }}>
                    Unsure if physiotherapy will resolve your {condition.name}? Come in, see the clinic and find out for yourself how we can help — no treatment, no pressure.
                  </p>
                  <a href="/contact" style={{ display: "inline-block", marginTop: 20, background: "#fff", color: "var(--secondary-hover, #5c9515)", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9, textDecoration: "none" }}>
                    Apply for a Free Discovery Session &rarr;
                  </a>
                </div>
                <div style={{ background: "linear-gradient(160deg, var(--primary, #1c9fd8), var(--primary-hover, #1179ab))", color: "#fff", borderRadius: 20, padding: 34 }}>
                  <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>Talk to a Physio First</h3>
                  <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: "#e2f2fa" }}>
                    Have questions about your {condition.name} and want to be 100% sure we can help before booking? Schedule a free phone consult with our clinical team.
                  </p>
                  <a href="tel:4032958590" style={{ display: "inline-block", marginTop: 20, background: "#fff", color: "var(--primary-hover, #1179ab)", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9, textDecoration: "none" }}>
                    Arrange a free phone consult &rarr;
                  </a>
                </div>
              </div>
              <p style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "#8a97a1" }}>
                There is no treatment given at a discovery session — it&apos;s for you to ask questions and for us to confirm whether we can help.
              </p>
            </div>
          </section>
        );

      case "sub_conditions": {
        if (!subConditions || subConditions.length === 0) return null;
        return (
          <section key="sub_conditions" style={{ padding: "clamp(56px, 7vw, 96px) 0", background: "#ffffff", borderTop: "1px solid #e7edf1", borderBottom: "1px solid #e7edf1" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", maxWidth: 820, margin: "0 auto 48px" }}>
                {eyebrowEl("Targeted Shoulder & Cervical Care", "var(--primary, #1c9fd8)")}
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px" }}>
                  Specific Shoulder Conditions We Treat in Calgary NW
                </h2>
                <p style={{ marginTop: 14, fontSize: 16.5, color: "#5a6570", lineHeight: 1.65 }}>
                  Because shoulder and neck biomechanics are intricately connected, our clinic provides specialized care pathways for 9 distinct shoulder injuries. Select any condition below for targeted clinical guidance:
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
                {subConditions.map((sub) => {
                  const nestedUrl = `/conditions/${condition.slug}/${sub.slug}`;
                  return (
                    <Link
                      key={sub.slug}
                      href={nestedUrl}
                      style={{
                        textDecoration: "none",
                        display: "flex",
                        flexDirection: "column",
                        background: "#f8fafc",
                        border: "1.5px solid #e2ebf0",
                        borderRadius: 16,
                        padding: "28px 26px",
                        transition: "all 0.2s ease",
                        boxShadow: "0 4px 14px rgba(18,60,80,0.04)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--primary, #0e78a8)", background: "#e0f2fe", padding: "4px 10px", borderRadius: 999 }}>
                          Shoulder Program
                        </span>
                        <span style={{ color: "var(--primary, #0e78a8)", fontWeight: 700, fontSize: 18 }}>&rarr;</span>
                      </div>

                      <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 20, fontWeight: 700, color: "#1d2b34", marginBottom: 10 }}>
                        {sub.name}
                      </h3>

                      <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "#5a6570", flexGrow: 1, margin: 0 }}>
                        {sub.shortDescription || (sub.description ? sub.description.slice(0, 140) + "..." : "Targeted physical therapy assessment, pain reduction, and active recovery.")}
                      </p>

                      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e2ebf0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--secondary, #6faf1c)" }}>
                          View Treatment Program &rarr;
                        </span>
                        <span style={{ fontSize: 12.5, color: "#94a3b8", fontWeight: 600 }}>
                          Calgary NW Clinic
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      case "sibling_conditions": {
        if (!condition.parentSlug) return null;
        const siblings = allConditions.filter(
          (c) => c.parentSlug === condition.parentSlug && c.slug !== condition.slug
        );
        if (siblings.length === 0) return null;

        return (
          <section key="sibling_conditions" style={{ padding: "clamp(56px, 7vw, 96px) 0", background: "#f8fafc", borderTop: "1px solid #e7edf1" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", maxWidth: 780, margin: "0 auto 40px" }}>
                {eyebrowEl("Other Shoulder Conditions We Treat", "var(--primary, #1c9fd8)")}
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px" }}>
                  Find Treatment for Related Shoulder Conditions
                </h2>
                <p style={{ marginTop: 12, fontSize: 16, color: "#5a6570", lineHeight: 1.6 }}>
                  Our Calgary NW physiotherapy team treats a full spectrum of shoulder and cervical dysfunctions. Explore targeted guidance for other conditions:
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
                {siblings.map((sib) => (
                  <Link
                    key={sib.slug}
                    href={`/conditions/${sib.parentSlug}/${sib.slug}`}
                    style={{
                      textDecoration: "none",
                      background: "#fff",
                      border: "1px solid #d7e6ef",
                      borderRadius: 14,
                      padding: "20px 22px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxShadow: "0 2px 8px rgba(18,60,80,0.04)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--secondary-hover, #5c9515)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                        Targeted Therapy
                      </div>
                      <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 17, fontWeight: 700, color: "#1d2b34", lineHeight: 1.35, marginBottom: 8 }}>
                        {sib.name}
                      </h3>
                      <p style={{ fontSize: 13.5, color: "#5a6570", lineHeight: 1.55, margin: 0 }}>
                        {sib.shortDescription || (sib.description ? sib.description.slice(0, 100) + "..." : "")}
                      </p>
                    </div>
                    <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700, color: "var(--primary, #0e78a8)" }}>
                      <span>Learn More</span>
                      <span>&rarr;</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case "other_links": {
        const rootOtherConditions = otherConditions.filter((c) => !c.parentSlug);
        return (
          <section key="other_links" style={{ padding: "clamp(56px, 7vw, 96px) 0", background: "#f2f8fb", borderTop: "1px solid #e7edf1" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", marginBottom: 36 }}>
                {eyebrowEl(cfg?.eyebrow || "Complete Pain Care", cfg?.eyebrowColor || "var(--primary, #1c9fd8)")}
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(26px, 3.2vw, 38px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px" }}>
                  {cfg?.title || "Other Conditions We Treat in Calgary"}
                </h2>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
                {rootOtherConditions.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/conditions/${c.slug}`}
                    style={{ textDecoration: "none", background: "#fff", border: "1px solid #d7e6ef", padding: "10px 20px", borderRadius: 999, fontSize: 14.5, fontWeight: 600, color: "#1d2b34", boxShadow: "0 2px 8px rgba(18,60,80,0.04)" }}
                  >
                    {c.name} &rarr;
                  </Link>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 32, flexWrap: "wrap" }}>
                <Link href="/conditions" style={{ color: "var(--primary, #0e78a8)", fontWeight: 700, fontSize: 14, textDecoration: "underline", textUnderlineOffset: 4 }}>
                  Browse All Conditions &rarr;
                </Link>
                <span style={{ color: "#cbd5e1" }}>|</span>
                <Link href="/services" style={{ color: "var(--primary, #0e78a8)", fontWeight: 700, fontSize: 14, textDecoration: "underline", textUnderlineOffset: 4 }}>
                  Our Clinical Services &rarr;
                </Link>
                <span style={{ color: "#cbd5e1" }}>|</span>
                <Link href="/" style={{ color: "var(--primary, #0e78a8)", fontWeight: 700, fontSize: 14, textDecoration: "underline", textUnderlineOffset: 4 }}>
                  Return to Homepage &rarr;
                </Link>
              </div>
            </div>
          </section>
        );
      }

      case "bottom_cta":
        return (
          <section key="bottom_cta" style={{ background: "linear-gradient(120deg, var(--primary, #1c9fd8), var(--primary-hover, #1179ab))", color: "#fff" }}>
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(48px, 6vw, 80px) 24px", textAlign: "center" }}>
              <h2 style={{ fontFamily: "'Poppins',sans-serif", color: "#fff", fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.12 }}>
                {cfg?.title || `Stop Living With ${condition.name}`}
              </h2>
              <p style={{ marginTop: 16, fontSize: 17, color: "#e2f2fa", lineHeight: 1.6, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
                {cfg?.content || "Book your comprehensive assessment at Nose Creek Physiotherapy and get a clear, step-by-step recovery plan today."}
              </p>
              <div style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
                <a
                  href={cfg?.ctaHref || condition.ctaHref || "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "var(--accent, #8cc63f)",
                    color: "var(--dark, #12303d)",
                    fontFamily: "'Poppins',sans-serif",
                    fontWeight: 700,
                    fontSize: 17,
                    padding: "16px 30px",
                    borderRadius: 10,
                    boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
                    textDecoration: "none"
                  }}
                >
                  {cfg?.ctaText || "Book Your Assessment Online"}
                </a>
                <a
                  href="tel:+14032958590"
                  style={{
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.5)",
                    color: "#fff",
                    fontFamily: "'Poppins',sans-serif",
                    fontWeight: 700,
                    fontSize: 17,
                    padding: "15px 28px",
                    borderRadius: 10,
                    textDecoration: "none"
                  }}
                >
                  Call 403.295.8590
                </a>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <DynamicFAQSchema faqs={condition.faqs} />
      {order.map((sectionKey) => renderSection(sectionKey))}
    </div>
  );
}
