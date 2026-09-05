"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ServiceIcon from "@/components/ui/ServiceIcon";
import TeamCarousel from "@/components/ui/TeamCarousel";
import FormattedNarrative from "@/components/ui/FormattedNarrative";
import { Condition, Service, TeamMember, SectionBlockConfig } from "@/types/content";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import VisitUsSection from "./VisitUsSection";

const eyebrowEl = (text: string, color = "#1c9fd8") => (
  <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color, letterSpacing: "1.5px", fontSize: 13, textTransform: "uppercase" as const, marginBottom: 12 }}>
    {text}
  </div>
);

const defaultConditionSectionOrder = [
  "hero",
  "at_a_glance",
  "clinical_overview",
  "custom_sections",
  "benefits",
  "symptoms",
  "treatment_approach",
  "related_therapies",
  "team_carousel",
  "faqs",
  "location_map",
  "decision_ctas",
  "other_links",
  "bottom_cta"
];

export default function ConditionLiveView({
  initialCondition,
  allServices,
  allConditions,
  allTeam
}: {
  initialCondition: Condition;
  allServices: Service[];
  allConditions: Condition[];
  allTeam: TeamMember[];
}) {
  const [condition, setCondition] = useState<Condition>(initialCondition);

  // Real-time synchronization with local admin updates
  useEffect(() => {
    function syncFromLocal() {
      try {
        const saved = localStorage.getItem("adm_conditions");
        if (saved) {
          const list: Condition[] = JSON.parse(saved);
          const found = list.find((c) => c.slug === initialCondition.slug || c.id === initialCondition.id);
          if (found) {
            setCondition(found);
          }
        }
      } catch {
        // ignore
      }
    }

    window.addEventListener("conditionsUpdated", syncFromLocal);
    window.addEventListener("storage", syncFromLocal);
    return () => {
      window.removeEventListener("conditionsUpdated", syncFromLocal);
      window.removeEventListener("storage", syncFromLocal);
    };
  }, [initialCondition]);

  const isHidden = (key: string) => (condition.hiddenSections || []).includes(key);
  const order = condition.sectionOrder && condition.sectionOrder.length > 0
    ? condition.sectionOrder
    : defaultConditionSectionOrder;

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
    const cfg = getCustomConfig(key);

    switch (key) {
      case "hero":
        return (
          <section key="hero" style={{ background: "linear-gradient(180deg, #f2f8fb 0%, #ffffff 100%)", padding: "clamp(36px, 4vw, 56px) 0 44px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "What We Treat", href: "/conditions" },
                  { label: condition.name }
                ]}
              />

              <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "clamp(32px, 4vw, 56px)", alignItems: "center" }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e6f4ea", color: "#5c9515", fontWeight: 700, fontSize: 13, fontFamily: "'Poppins',sans-serif", padding: "7px 14px", borderRadius: 999, marginBottom: 20 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6faf1c", display: "inline-block" }} />
                    {cfg?.eyebrow || "Targeted Clinical Care · Calgary North NW & NE"}
                  </div>

                  <h1 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(30px, 4.2vw, 48px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.12, marginBottom: 18 }}>
                    {cfg?.title || `${condition.name} Relief in Calgary`}
                  </h1>

                  <p style={{ fontSize: "clamp(16px, 1.5vw, 18.5px)", lineHeight: 1.65, color: "#48535c", marginBottom: 28, maxWidth: 580 }}>
                    {cfg?.content || condition.shortDescription || condition.description}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
                    <a
                      href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 9,
                        background: "#6faf1c",
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
                        color: "#0e78a8",
                        border: "2px solid #cfe6f2",
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
                        <span style={{ color: "#6faf1c", fontWeight: 800 }}>✓</span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ position: "relative" }}>
                  <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 24px 60px rgba(18,60,80,0.18)", aspectRatio: "4/3", background: "#e2e8f0" }}>
                    <img
                      src={cfg?.image || condition.heroImage || "/images/clinic/reception-three.jpg"}
                      alt={`${condition.name} treatment Calgary`}
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

      case "at_a_glance":
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
                {[
                  { icon: "⏱", label: "Recovery Assessment", val: "Comprehensive 1-on-1" },
                  { icon: "💳", label: "Direct Billing", val: "Available for Most Insurers" },
                  { icon: "🩺", label: "Referral Required", val: "No Doctor Referral Needed" },
                  { icon: "📍", label: "Clinic Location", val: "Beddington SE (Free Parking)" },
                ].map((item, idx) => (
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

      case "clinical_overview": {
        const bgStyle =
          cfg?.background === "teal"
            ? { background: "#12303d", color: "#ffffff" }
            : cfg?.background === "light"
            ? { background: "#f2f8fb", color: "#1d2b34" }
            : { background: "#ffffff", color: "#1d2b34" };

        const isDark = cfg?.background === "teal";
        const image = cfg?.image || condition.heroImage;
        const pos = cfg?.imagePosition || (image ? "right" : "none");
        const hasLeftImg = pos === "left" && image;
        const hasRightImg = pos === "right" && image;
        const hasTopImg = pos === "top" && image;
        const hasBottomImg = pos === "bottom" && image;
        const hasNoImg = pos === "none" || !image;

        return (
          <section key="clinical_overview" style={{ ...bgStyle, padding: "clamp(56px, 7vw, 96px) 0" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              
              {hasTopImg && (
                <div style={{ marginBottom: 36, borderRadius: 18, overflow: "hidden", maxHeight: 440, boxShadow: "0 20px 48px rgba(18,60,80,0.14)" }}>
                  <img src={image!} alt="Clinical overview" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
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
                    <img src={image!} alt="Clinical overview" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                )}

                <div style={{ maxWidth: hasNoImg ? 880 : "none" }}>
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
                          <span style={{ color: isDark ? "#8cc63f" : "#6faf1c", fontWeight: 800 }}>✓</span>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {cfg?.ctaText && cfg?.ctaHref && (
                    <div style={{ marginTop: 24 }}>
                      <a href={cfg.ctaHref} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1c9fd8", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9, textDecoration: "none" }}>
                        {cfg.ctaText} &rarr;
                      </a>
                    </div>
                  )}
                </div>

                {hasRightImg && (
                  <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 20px 48px rgba(18,60,80,0.14)", aspectRatio: "4/3" }}>
                    <img src={image!} alt="Clinical overview" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                )}
              </div>

              {hasBottomImg && (
                <div style={{ marginTop: 36, borderRadius: 18, overflow: "hidden", maxHeight: 440, boxShadow: "0 20px 48px rgba(18,60,80,0.14)" }}>
                  <img src={image!} alt="Clinical overview" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              )}
            </div>
          </section>
        );
      }

      case "custom_sections":
        if (!condition.customSections || condition.customSections.length === 0) return null;
        return (
          <div key="custom_sections">
            {condition.customSections.map((sec, idx) => {
              const bgStyle =
                sec.background === "teal"
                  ? { background: "#12303d", color: "#ffffff" }
                  : sec.background === "light"
                  ? { background: "#f2f8fb", color: "#1d2b34" }
                  : { background: "#ffffff", color: "#1d2b34" };

              const isDark = sec.background === "teal";
              const isImageLeft = sec.imagePosition === "left";
              const isImageNone = sec.imagePosition === "none" || !sec.image;
              const isImageTop = sec.imagePosition === "top";
              const isImageBottom = sec.imagePosition === "bottom";

              return (
                <section key={sec.id || idx} style={{ ...bgStyle, padding: "clamp(56px, 7vw, 96px) 0", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
                    
                    {isImageTop && sec.image && (
                      <div style={{ marginBottom: 36, borderRadius: 18, overflow: "hidden", maxHeight: 440, boxShadow: "0 20px 48px rgba(18,60,80,0.14)" }}>
                        <img src={sec.image} alt={sec.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      </div>
                    )}

                    <div
                      style={{
                        display: isImageNone || isImageTop || isImageBottom ? "block" : "grid",
                        gridTemplateColumns: isImageNone ? "1fr" : "repeat(auto-fit, minmax(320px, 1fr))",
                        gap: "clamp(32px, 5vw, 64px)",
                        alignItems: "center"
                      }}
                    >
                      {isImageLeft && sec.image && (
                        <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 20px 48px rgba(18,60,80,0.14)", aspectRatio: "4/3" }}>
                          <img src={sec.image} alt={sec.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </div>
                      )}

                      <div style={{ maxWidth: isImageNone ? 880 : "none" }}>
                        {sec.eyebrow && eyebrowEl(sec.eyebrow, sec.eyebrowColor || (isDark ? "#8cc63f" : "#1c9fd8"))}

                        <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: isDark ? "#fff" : "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.15, marginBottom: 18 }}>
                          {sec.title}
                        </h2>

                        {sec.subtitle && (
                          <div style={{ fontSize: 18, fontWeight: 600, color: isDark ? "#93c5fd" : "#0e78a8", marginBottom: 18 }}>
                            {sec.subtitle}
                          </div>
                        )}

                        <FormattedNarrative
                          content={sec.content || ""}
                          isDark={isDark}
                          style={{ fontSize: "clamp(15.5px, 1.1vw, 17px)", lineHeight: 1.75, color: isDark ? "#cbdbe4" : "#48535c", marginBottom: 24 }}
                        />

                        {sec.bullets && sec.bullets.length > 0 && (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 28 }}>
                            {sec.bullets.map((bullet, bIdx) => (
                              <div key={bIdx} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                <span style={{ color: isDark ? "#8cc63f" : "#6faf1c", fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>✓</span>
                                <span style={{ fontSize: 14.5, color: isDark ? "#e2e8f0" : "#334155", fontWeight: 500 }}>{bullet}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {sec.ctaText && sec.ctaHref && (
                          <a
                            href={sec.ctaHref}
                            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1c9fd8", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9, textDecoration: "none" }}
                          >
                            {sec.ctaText} &rarr;
                          </a>
                        )}
                      </div>

                      {!isImageLeft && !isImageNone && !isImageTop && !isImageBottom && sec.image && (
                        <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 20px 48px rgba(18,60,80,0.14)", aspectRatio: "4/3" }}>
                          <img src={sec.image} alt={sec.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </div>
                      )}
                    </div>

                    {isImageBottom && sec.image && (
                      <div style={{ marginTop: 36, borderRadius: 18, overflow: "hidden", maxHeight: 440, boxShadow: "0 20px 48px rgba(18,60,80,0.14)" }}>
                        <img src={sec.image} alt={sec.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        );

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
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: isDark ? "#8cc63f" : "#e6f4ea", color: isDark ? "#12303d" : "#5c9515", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>✓</div>
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
                {eyebrowEl(cfg?.eyebrow || "Common Symptoms", cfg?.eyebrowColor || (isDark ? "#8cc63f" : "#1c9fd8"))}
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: isDark ? "#fff" : "#1d2b34", letterSpacing: "-0.5px" }}>
                  {cfg?.title || `Key Warning Signs & Symptoms of ${condition.name}`}
                </h2>
                {cfg?.subtitle && <p style={{ fontSize: 16, color: isDark ? "#cbd5e1" : "#5a6570", marginTop: 12, lineHeight: 1.6 }}>{cfg.subtitle}</p>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                {symptomsList.map((s, i) => (
                  <div key={i} style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#fff", padding: "18px 22px", borderRadius: 14, border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e7edf1", boxShadow: "0 6px 18px rgba(18,60,80,0.04)", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6faf1c", display: "inline-block", flexShrink: 0 }} />
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
                {eyebrowEl(cfg?.eyebrow || "Proven Clinical Approach", cfg?.eyebrowColor || "#8cc63f")}
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: isLight ? "#1d2b34" : "#fff", letterSpacing: "-0.5px" }}>
                  {cfg?.title || "Our 4-Step Recovery Protocol"}
                </h2>
                {cfg?.subtitle && <p style={{ fontSize: 16, color: isLight ? "#5a6570" : "#cbdbe4", marginTop: 12, lineHeight: 1.6 }}>{cfg.subtitle}</p>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
                {approachList.map((step, i) => (
                  <div key={i} style={{ background: isLight ? "#fff" : "rgba(255,255,255,0.06)", border: isLight ? "1px solid #e7edf1" : "1px solid rgba(255,255,255,0.12)", padding: 28, borderRadius: 16, boxShadow: "0 6px 20px rgba(18,60,80,0.05)" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#6faf1c", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17, marginBottom: 18 }}>
                      {i + 1}
                    </div>
                    <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 18, fontWeight: 700, color: isLight ? "#1d2b34" : "#fff", marginBottom: 10 }}>Step {i + 1}</h3>
                    <p style={{ margin: 0, fontSize: 14.5, color: isLight ? "#48535c" : "#cbdbe4", lineHeight: 1.65 }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case "related_therapies":
        if (relatedServiceObjects.length === 0) return null;
        return (
          <section key="related_therapies" style={{ padding: "clamp(56px, 7vw, 96px) 0", background: "#f2f8fb" }}>
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
        );

      case "team_carousel":
        return (
          <div key="team_carousel">
            <TeamCarousel members={allTeam} />
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
        const testList = condition.testimonials && condition.testimonials.length > 0 ? condition.testimonials : [
          {
            name: "Sarah M.",
            quote: `The team at Nose Creek Physiotherapy helped me fully recover from severe ${condition.name}. The personalized care and attention were exceptional!`,
            condition: condition.name,
            borderColor: "#1c9fd8",
            meta: "Beddington Patient"
          },
          {
            name: "David K.",
            quote: `One-on-one registered care and targeted exercises resolved my condition when other clinics couldn't. Highly recommended!`,
            condition: "Spinal & Nerve Recovery",
            borderColor: "#6faf1c",
            meta: "Calgary North"
          },
          {
            name: "Elena R.",
            quote: `Direct insurance billing and compassionate clinicians. I can finally sleep and move pain-free again.`,
            condition: "Complete Pain Relief",
            borderColor: "#1c9fd8",
            meta: "Thorncliffe Resident"
          }
        ];
        const isDark = cfg?.background === "teal";
        const bgStyle = isDark ? { background: "#12303d", color: "#fff" } : cfg?.background === "light" ? { background: "#f2f8fb", color: "#1d2b34" } : { background: "#fff", color: "#1d2b34" };

        return (
          <section key="testimonials" style={{ ...bgStyle, padding: "clamp(56px, 7vw, 96px) 0", borderTop: "1px solid #e7edf1" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 44px" }}>
                {eyebrowEl(cfg?.eyebrow || "Real patient stories", cfg?.eyebrowColor || (isDark ? "#8cc63f" : "#6faf1c"))}
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: isDark ? "#fff" : "#1d2b34", letterSpacing: "-0.5px" }}>
                  {cfg?.title || `Calgary Patients Relieved from ${condition.name}`}
                </h2>
                {cfg?.subtitle && <p style={{ fontSize: 16, color: isDark ? "#cbd5e1" : "#5a6570", marginTop: 12, lineHeight: 1.6 }}>{cfg.subtitle}</p>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 26 }}>
                {testList.map((t: any, i: number) => (
                  <div key={i} style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#fff", borderRadius: 18, padding: 30, boxShadow: "0 10px 30px rgba(18,60,80,0.07)", borderTop: `4px solid ${t.borderColor || (i % 2 === 0 ? "#1c9fd8" : "#6faf1c")}`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ color: "#f6c945", fontSize: 18, letterSpacing: 2, marginBottom: 14 }}>★★★★★</div>
                      <p style={{ fontSize: 16, lineHeight: 1.7, color: isDark ? "#e2e8f0" : "#3a444d" }}>
                        &ldquo;{t.quote || t.content}&rdquo;
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22, borderTop: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #f1f5f9", paddingTop: 14 }}>
                      <div>
                        <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color: isDark ? "#fff" : "#1d2b34" }}>{t.name || "Verified Patient"}</div>
                        <div style={{ fontSize: 13, color: isDark ? "#93c5fd" : "#7a848d" }}>{t.meta || t.condition || "Calgary Patient"}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case "decision_ctas":
        return (
          <section key="decision_ctas" style={{ padding: "clamp(56px, 7vw, 96px) 0" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 40px" }}>
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(26px, 3.8vw, 42px)", fontWeight: 800, letterSpacing: "-0.5px" }}>Want help deciding if physio is right for you?</h2>
                <p style={{ marginTop: 14, fontSize: 16, color: "#5a6570", lineHeight: 1.6 }}>
                  Not quite ready to book? We offer two free, no-pressure ways to get your questions answered first.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
                <div style={{ background: "linear-gradient(160deg, #6faf1c, #5c9515)", color: "#fff", borderRadius: 20, padding: 34 }}>
                  <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>Free Discovery Session</h3>
                  <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: "#eaf6da" }}>
                    Unsure if physiotherapy will resolve your {condition.name}? Come in, see the clinic and find out for yourself how we can help — no treatment, no pressure.
                  </p>
                  <a href="/contact" style={{ display: "inline-block", marginTop: 20, background: "#fff", color: "#5c9515", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9, textDecoration: "none" }}>
                    Apply for a Free Discovery Session &rarr;
                  </a>
                </div>
                <div style={{ background: "linear-gradient(160deg, #1c9fd8, #1179ab)", color: "#fff", borderRadius: 20, padding: 34 }}>
                  <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>Talk to a Physio First</h3>
                  <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: "#e2f2fa" }}>
                    Have questions about your {condition.name} and want to be 100% sure we can help before booking? Schedule a free phone consult with our clinical team.
                  </p>
                  <a href="tel:4032958590" style={{ display: "inline-block", marginTop: 20, background: "#fff", color: "#1179ab", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9, textDecoration: "none" }}>
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

      case "other_links":
        return (
          <section key="other_links" style={{ padding: "clamp(56px, 7vw, 96px) 0", background: "#f2f8fb", borderTop: "1px solid #e7edf1" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", marginBottom: 36 }}>
                {eyebrowEl(cfg?.eyebrow || "Complete Pain Care", cfg?.eyebrowColor || "#1c9fd8")}
                <h2 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "clamp(26px, 3.2vw, 38px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px" }}>
                  {cfg?.title || "Other Conditions We Treat in Calgary"}
                </h2>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
                {otherConditions.map((c) => (
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
                <Link href="/conditions" style={{ color: "#0e78a8", fontWeight: 700, fontSize: 14, textDecoration: "underline", textUnderlineOffset: 4 }}>
                  Browse All Conditions &rarr;
                </Link>
                <span style={{ color: "#cbd5e1" }}>|</span>
                <Link href="/services" style={{ color: "#0e78a8", fontWeight: 700, fontSize: 14, textDecoration: "underline", textUnderlineOffset: 4 }}>
                  Our Clinical Services &rarr;
                </Link>
                <span style={{ color: "#cbd5e1" }}>|</span>
                <Link href="/" style={{ color: "#0e78a8", fontWeight: 700, fontSize: 14, textDecoration: "underline", textUnderlineOffset: 4 }}>
                  Return to Homepage &rarr;
                </Link>
              </div>
            </div>
          </section>
        );

      case "bottom_cta":
        return (
          <section key="bottom_cta" style={{ background: "linear-gradient(120deg, #1c9fd8, #1179ab)", color: "#fff" }}>
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(48px, 6vw, 80px) 24px", textAlign: "center" }}>
              <h2 style={{ fontFamily: "'Poppins',sans-serif", color: "#fff", fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.12 }}>
                {cfg?.title || `Stop Living With ${condition.name}`}
              </h2>
              <p style={{ marginTop: 16, fontSize: 17, color: "#e2f2fa", lineHeight: 1.6, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
                {cfg?.content || "Book your comprehensive assessment at Nose Creek Physiotherapy and get a clear, step-by-step recovery plan today."}
              </p>
              <div style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
                <a
                  href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "#8cc63f",
                    color: "#12303d",
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
      {order.map((sectionKey) => renderSection(sectionKey))}
    </div>
  );
}
