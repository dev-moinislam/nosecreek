"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HomePageData, TeamMember, BlogPost, Service, Condition, Testimonial, ServiceCustomSection } from "@/types/content";
import defaultHomeData from "@/data/home.json";
import TeamCarousel from "@/components/ui/TeamCarousel";
import ReviewCarousel from "@/components/ui/ReviewCarousel";
import ConditionTiles from "@/components/ui/ConditionTiles";
import HomeServicesGrid from "@/components/ui/HomeServicesGrid";
import VisitUsSection from "@/components/content/VisitUsSection";

interface HomeLiveViewProps {
  initialHomeData: HomePageData;
  allTeam: TeamMember[];
  blogPosts: BlogPost[];
  services: Service[];
  conditions: Condition[];
  testimonials: Testimonial[];
}

const eyebrow = (text: string, color = "#1c9fd8") => (
  <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color, letterSpacing: "1.5px", fontSize: 13, textTransform: "uppercase", marginBottom: 12 }}>
    {text}
  </div>
);

export default function HomeLiveView({
  initialHomeData,
  allTeam,
  blogPosts,
  services,
  conditions,
  testimonials
}: HomeLiveViewProps) {
  const [homeData, setHomeData] = useState<HomePageData>(initialHomeData || (defaultHomeData as unknown as HomePageData));

  // Sync with local admin updates in real-time
  useEffect(() => {
    function sync() {
      try {
        const saved = localStorage.getItem("adm_home");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            setHomeData({
              ...(defaultHomeData as unknown as HomePageData),
              ...parsed
            });
          }
        }
      } catch {}
    }
    sync();
    window.addEventListener("homeUpdated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("homeUpdated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const hiddenSections = homeData.hiddenSections || [];
  const sectionOrder = homeData.sectionOrder && homeData.sectionOrder.length > 0
    ? homeData.sectionOrder
    : (defaultHomeData.sectionOrder as string[]);

  // Director fallback
  const directorMember = allTeam.find((m) => m.isDirector || m.slug === "blair-schachterle") || allTeam[0];

  // Latest 3 blog posts
  const latestBlogPosts = blogPosts.slice(0, 3);

  // Render individual sections dynamically
  const renderSectionByKey = (key: string) => {
    if (hiddenSections.includes(key)) return null;

    // Handle Custom Storytelling Sections
    if (key.startsWith("custom-")) {
      const idx = parseInt(key.replace("custom-", ""), 10);
      const customSec = homeData.customSections?.[idx];
      if (!customSec) return null;
      return <CustomStorySection key={key} section={customSec} />;
    }

    const cfg = homeData.sectionsData?.[key];

    switch (key) {
      // ── 1. HERO BANNER ──
      case "hero": {
        const h = homeData.hero || defaultHomeData.hero;
        const eyebrowText = cfg?.eyebrow || h.eyebrow;
        const titleLine1 = cfg?.title || h.titleLine1;
        const titleLine2 = cfg?.subtitle || h.titleLine2;
        const desc = cfg?.content || h.description;
        const heroImg = cfg?.image || h.image;
        const ctaBtnText = cfg?.ctaText || h.primaryCtaText;
        const ctaBtnUrl = cfg?.ctaHref || h.primaryCtaUrl;

        return (
          <section key="hero" style={{ background: "linear-gradient(180deg,#f2f8fb 0%,#ffffff 100%)" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(40px,6vw,80px) 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "clamp(32px,4vw,56px)", alignItems: "center" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e6f4ea", color: "#5c9515", fontWeight: 700, fontSize: 13, fontFamily: "'Poppins',sans-serif", padding: "7px 14px", borderRadius: 999, marginBottom: 20 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6faf1c", display: "inline-block" }} />
                  {eyebrowText}
                </div>

                <h1 style={{ fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.1 }}>
                  <span style={{ display: "block", fontSize: "clamp(20px,2.4vw,28px)", color: "#1d2b34", marginBottom: 6 }}>
                    {titleLine1}
                  </span>
                  <span style={{ display: "block", fontSize: "clamp(30px,4.2vw,50px)", color: "#1c9fd8", lineHeight: 1.08 }}>
                    {titleLine2}
                  </span>
                </h1>

                <p style={{ marginTop: 20, fontSize: "clamp(16px,1.5vw,19px)", lineHeight: 1.6, color: "#48535c", maxWidth: 560 }}>
                  {desc}
                </p>

                <div style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 14 }}>
                  <a
                    href={ctaBtnUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#6faf1c", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 16.5, padding: "16px 28px", borderRadius: 10, boxShadow: "0 10px 24px rgba(111,175,28,0.32)" }}
                  >
                    {ctaBtnText}
                  </a>
                  <a
                    href={h.phoneHref || `tel:${h.phone}`}
                    style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#fff", color: "#0e78a8", border: "2px solid #cfe6f2", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 16.5, padding: "14px 26px", borderRadius: 10 }}
                  >
                    Call {h.phone}
                  </a>
                </div>

                {h.badges && h.badges.length > 0 && (
                  <div style={{ marginTop: 26, display: "flex", flexWrap: "wrap", gap: "8px 22px", fontSize: 14, color: "#5a6570", fontWeight: 600 }}>
                    {h.badges.map((b, i) => (
                      <span key={i}>{b}</span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImg}
                  alt="Reception at Nose Creek Physiotherapy"
                  style={{ width: "100%", borderRadius: 18, boxShadow: "0 24px 60px rgba(18,60,80,0.18)", objectFit: "cover", aspectRatio: "4/3" }}
                />
                <div style={{ position: "absolute", left: 18, bottom: -22, background: "#fff", borderRadius: 14, padding: "14px 18px", boxShadow: "0 14px 34px rgba(18,60,80,0.16)", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 30, color: "#1d2b34", lineHeight: 1 }}>
                    {h.rating}<span style={{ fontSize: 16, color: "#f6c945" }}> ★</span>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#5a6570", lineHeight: 1.3 }}>{h.reviewCount}</div>
                </div>
              </div>
            </div>
          </section>
        );
      }

      // ── 2. QUICK FACTS ──
      case "quick_facts": {
        const facts = homeData.quickFacts || defaultHomeData.quickFacts;
        return (
          <section key="quick_facts" style={{ background: "#f8fafc", borderTop: "1px solid #e7edf1", borderBottom: "1px solid #e7edf1", padding: "24px 0" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                {facts.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: "#fff", borderRadius: 12, border: "1px solid #d7e6ef", boxShadow: "0 4px 12px rgba(18,60,80,0.04)" }}>
                    <span style={{ fontSize: 24 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b" }}>{item.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      // ── 3. TRUST STATS BAR ──
      case "stats": {
        const stats = homeData.stats || defaultHomeData.stats;
        return (
          <section key="stats" style={{ background: "#12303d", color: "#eaf3f8" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(30px,4vw,44px) 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 24, textAlign: "center" }}>
              {stats.map((s, idx) => (
                <div key={idx}>
                  <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.4vw,38px)", color: "#8cc63f" }}>{s.num}</div>
                  <div style={{ fontSize: 13.5, color: "#b9cdd8", fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        );
      }

      // ── 4. CLINICAL SERVICES (Dynamic Feed) ──
      case "services_grid": {
        return (
          <section key="services_grid" id="services" style={{ padding: "clamp(56px,7vw,96px) 0" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 44px" }}>
                {eyebrow("Our exceptional services in NE Calgary")}
                <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
                  Everything you need to move well, under one roof
                </h2>
              </div>
              <HomeServicesGrid initialServices={services} />
            </div>
          </section>
        );
      }

      // ── 5. CONDITIONS WE TREAT (Dynamic Feed) ──
      case "conditions": {
        return (
          <section key="conditions" id="treat" style={{ background: "#f2f8fb", padding: "clamp(56px,7vw,96px) 0" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 44px" }}>
                {eyebrow("Where does it hurt?", "#6faf1c")}
                <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.5px" }}>What we treat</h2>
                <p style={{ marginTop: 14, fontSize: 16, color: "#5a6570", lineHeight: 1.6 }}>
                  Find your area of concern below, then book an assessment — our team treats a wide range of conditions.
                </p>
              </div>
              <ConditionTiles conditions={conditions} />
            </div>
          </section>
        );
      }

      // ── 6. ABOUT NOSE CREEK CLINIC (Configurable) ──
      case "about_clinic": {
        const about = homeData.aboutClinic || defaultHomeData.aboutClinic;
        const title = cfg?.title || about.title;
        const eyebrowText = cfg?.eyebrow || about.eyebrow;
        const content = cfg?.content || about.content;
        const linkText = cfg?.ctaText || about.linkText;
        const linkUrl = cfg?.ctaHref || about.linkUrl;
        const bg = cfg?.background === "teal" ? "#12303d" : cfg?.background === "light" ? "#f8fafc" : "#ffffff";
        const isDark = bg === "#12303d";
        const textColor = isDark ? "#ffffff" : "#1d2b34";
        const descColor = isDark ? "#cbdbe4" : "#48535c";

        return (
          <section key="about_clinic" style={{ background: bg, color: textColor, padding: "clamp(56px,7vw,96px) 0" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "clamp(32px,4vw,56px)", alignItems: "center" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cfg?.image || "/images/clinic/clinic-mobile.jpg"} alt="Nose Creek clinic entrance"
                  style={{ width: "100%", borderRadius: 14, objectFit: "cover", aspectRatio: "3/4", gridRow: "span 2" }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/clinic/reception-three.jpg" alt="Treatment area"
                  style={{ width: "100%", borderRadius: 14, objectFit: "cover", aspectRatio: "4/3" }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/clinic/reception-four.jpg" alt="Reception desk"
                  style={{ width: "100%", borderRadius: 14, objectFit: "cover", aspectRatio: "4/3" }} />
              </div>
              <div>
                {eyebrow(eyebrowText, cfg?.eyebrowColor || (isDark ? "#8cc63f" : "#1c9fd8"))}
                <h2 style={{ fontSize: "clamp(26px,3.6vw,40px)", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.15, color: textColor }}>
                  {title}
                </h2>
                <p style={{ marginTop: 18, fontSize: 16, lineHeight: 1.7, color: descColor }}>
                  {content}
                </p>
                {linkUrl && (
                  <a href={linkUrl} style={{ display: "inline-block", marginTop: 22, color: isDark ? "#8cc63f" : "#0e78a8", fontFamily: "'Poppins',sans-serif", fontWeight: 700 }}>
                    {linkText || "Follow our story →"}
                  </a>
                )}
              </div>
            </div>
          </section>
        );
      }

      // ── 7. DIRECTOR SPOTLIGHT (Configurable) ──
      case "director": {
        const d = homeData.director || defaultHomeData.director;
        const title = cfg?.title || d.title;
        const role = cfg?.subtitle || `${d.role}${d.titleSuffix ? ` — ${d.titleSuffix}` : ""}`;
        const eyebrowText = cfg?.eyebrow || d.eyebrow;
        const bio = cfg?.content || d.bio;
        const image = cfg?.image || d.image;
        const ctaText = cfg?.ctaText || d.ctaText;
        const ctaUrl = cfg?.ctaHref || d.ctaUrl;
        const bg = cfg?.background === "white" ? "#ffffff" : cfg?.background === "light" ? "#f8fafc" : "#12303d";
        const isDark = bg === "#12303d";
        const textColor = isDark ? "#ffffff" : "#1d2b34";
        const descColor = isDark ? "#cbdbe4" : "#48535c";

        return (
          <section key="director" style={{ background: bg, color: textColor, padding: "clamp(56px,7vw,96px) 0" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "clamp(32px,4vw,56px)", alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={`${title}, ${role}`}
                  referrerPolicy="no-referrer"
                  style={{ width: "min(300px,80%)", aspectRatio: "1/1", objectFit: "cover", borderRadius: "50%", border: "6px solid #1c9fd8", margin: "0 auto", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}
                />
              </div>
              <div>
                {eyebrow(eyebrowText, cfg?.eyebrowColor || "#8cc63f")}
                <h2 style={{ fontSize: "clamp(26px,3.6vw,40px)", fontWeight: 800, color: textColor, letterSpacing: "-0.5px" }}>{title}</h2>
                <p style={{ marginTop: 6, fontSize: 14, color: isDark ? "#9fc9d9" : "#64748b", fontWeight: 600 }}>
                  {role}
                </p>
                <p style={{ marginTop: 16, fontSize: 15.5, lineHeight: 1.7, color: descColor }}>
                  {bio}
                </p>
                <a href={ctaUrl || `/team/blair-schachterle`}
                  style={{ display: "inline-block", marginTop: 22, background: isDark ? "#1c9fd8" : "#0e78a8", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9, textDecoration: "none" }}>
                  {ctaText || "Meet our team →"}
                </a>
              </div>
            </div>
          </section>
        );
      }

      // ── 8. TEAM CAROUSEL (Dynamic Feed) ──
      case "team_carousel": {
        return <TeamCarousel key="team_carousel" members={allTeam} />;
      }

      // ── 9. FREE ADVICE REPORTS (Configurable) ──
      case "free_reports": {
        const fr = homeData.freeReports;
        const eyebrowText = cfg?.eyebrow || fr?.eyebrow || "Free advice reports";
        const title = cfg?.title || fr?.title || "Written by Blair Schachterle";
        const desc = cfg?.content || fr?.description || "Download a free guide for your area of concern — practical advice you can start using right away.";
        const bg = cfg?.background === "white" ? "#ffffff" : cfg?.background === "teal" ? "#12303d" : "#f2f8fb";
        const defaultReportsList = [
          { href: "https://www.nosecreekphysiotherapy.com/back-pain/",         bg: "linear-gradient(150deg,#e9f5fb,#cfe9f6)", titleColor: "#1c9fd8", title: "How To End\nBack Pain",            sub: "without pills or surgery",     label: "Back Pain Report" },
          { href: "https://www.nosecreekphysiotherapy.com/knee-pain/",         bg: "linear-gradient(150deg,#eef6e4,#d8ecbe)", titleColor: "#5c9515", title: "How To Stop\nKnee Pain",           sub: "without injections or a brace",label: "Knee Pain Report" },
          { href: "https://www.nosecreekphysiotherapy.com/neck-shoulder-pain/",bg: "linear-gradient(150deg,#e9f5fb,#cfe9f6)", titleColor: "#1c9fd8", title: "How To Ease\nNeck & Shoulder Pain",sub: "naturally",                    label: "Neck / Shoulder Report" },
          { href: "https://www.nosecreekphysiotherapy.com/foot-pain/",         bg: "linear-gradient(150deg,#efe9f7,#ddd0ee)", titleColor: "#7a4fb0", title: "How To Ease\nFoot Pain",           sub: "naturally",                    label: "Foot Pain Report" },
        ];
        const reportsToRender = fr?.reports && fr.reports.length > 0 ? fr.reports : defaultReportsList;

        return (
          <section key="free_reports" style={{ background: bg, padding: "clamp(56px,7vw,96px) 0" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 40px" }}>
                {eyebrow(eyebrowText, cfg?.eyebrowColor || "#6faf1c")}
                <h2 style={{ fontSize: "clamp(26px,3.6vw,42px)", fontWeight: 800, letterSpacing: "-0.5px", color: bg === "#12303d" ? "#fff" : "#1d2b34" }}>{title}</h2>
                <p style={{ marginTop: 14, fontSize: 16, color: bg === "#12303d" ? "#cbdbe4" : "#5a6570", lineHeight: 1.6 }}>
                  {desc}
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20 }}>
                {reportsToRender.map((r: any) => (
                  <a key={r.label} href={r.href} style={{ background: "#fff", border: "1px solid #e2ebf0", borderRadius: 16, overflow: "hidden", boxShadow: "0 6px 20px rgba(18,60,80,0.06)", display: "block", textDecoration: "none" }}>
                    <div style={{ aspectRatio: "1/1", background: r.bg || "linear-gradient(150deg,#e9f5fb,#cfe9f6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 24, textAlign: "center" }}>
                      <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: "1.5px", color: "#5a6570", textTransform: "uppercase" }}>Free Report</span>
                      <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 22, color: r.titleColor || "#1c9fd8", lineHeight: 1.1, whiteSpace: "pre-line" }}>{r.title}</span>
                      <span style={{ fontSize: 12, color: "#7a848d" }}>{r.sub}</span>
                    </div>
                    <div style={{ padding: 16, textAlign: "center", fontFamily: "'Poppins',sans-serif", fontWeight: 700, color: "#1c9fd8" }}>{r.label}</div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        );
      }

      // ── 10. CREDENTIALS / ASSOCIATIONS (Configurable) ──
      case "credentials": {
        const eyebrowText = cfg?.eyebrow || "Associations & credentials";
        const title = cfg?.title;
        return (
          <section key="credentials" style={{ padding: "clamp(40px,5vw,64px) 0" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
              <p style={{ textAlign: "center", fontFamily: "'Poppins',sans-serif", fontWeight: 600, color: "#8a97a1", letterSpacing: "1px", fontSize: 13, textTransform: "uppercase", marginBottom: title ? 10 : 28 }}>
                {eyebrowText}
              </p>
              {title && (
                <h3 style={{ textAlign: "center", fontSize: 20, fontWeight: 700, color: "#1e293b", margin: "0 0 26px 0" }}>
                  {title}
                </h3>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "32px 48px" }}>
                {[
                  { src: "/images/credentials/pain-hero.png", alt: "PainHero", height: 48 },
                  { src: "/images/credentials/cpa.png", alt: "Canadian Physiotherapy Association", height: 52 },
                  { src: "/images/credentials/crmta.png", alt: "CRMTA - Certified Registered Massage Therapist Association", height: 56 },
                  { src: "/images/credentials/ortho-division.png", alt: "Orthopaedic Division - Canadian Physiotherapy Association", height: 52 },
                  { src: "/images/credentials/sport-physiotherapy-canada.png", alt: "Sport Physiotherapy Canada", height: 56 },
                ].map((logo) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={logo.alt}
                    src={logo.src}
                    alt={logo.alt}
                    style={{
                      height: logo.height || 52,
                      width: "auto",
                      maxWidth: "100%",
                      objectFit: "contain",
                      display: "inline-block",
                      transition: "transform 0.2s ease",
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        );
      }

      // ── 11. PATIENT REVIEWS CAROUSEL ──
      case "reviews": {
        return <ReviewCarousel key="reviews" testimonials={testimonials} />;
      }

      // ── 12. FREE DISCOVERY / PHONE CTAS (Configurable) ──
      case "decide_ctas": {
        const decide = homeData.decideCtas;
        const title = cfg?.title || decide?.title || "Want help deciding if physio is right for you?";
        const desc = cfg?.content || decide?.description || "Not quite ready to book? We offer two free, no-pressure ways to get your questions answered first.";
        const discTitle = decide?.discoveryTitle || "Free Discovery Session";
        const discDesc = decide?.discoveryDesc || "Unsure if physio will work for you, or had a bad experience in the past? Come in, see the clinic and find out for yourself how we can help — no treatment, no pressure.";
        const discBtn = decide?.discoveryBtnText || "Apply for a Free Discovery Session →";
        const discUrl = decide?.discoveryBtnUrl || "https://www.nosecreekphysiotherapy.com/free-discovery-session/";
        const phoneTitle = decide?.phoneTitle || "Talk to a Physio First";
        const phoneDesc = decide?.phoneDesc || "Have questions and want to be 100% sure we can help before booking? Schedule a free call and one of our physios will answer everything over the phone.";
        const phoneBtn = decide?.phoneBtnText || "Arrange a free phone consult →";
        const phoneUrl = decide?.phoneBtnUrl || "https://www.nosecreekphysiotherapy.com/telephone-consultation/";

        return (
          <section key="decide_ctas" style={{ padding: "clamp(56px,7vw,96px) 0" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 40px" }}>
                <h2 style={{ fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 800, letterSpacing: "-0.5px" }}>{title}</h2>
                <p style={{ marginTop: 14, fontSize: 16, color: "#5a6570", lineHeight: 1.6 }}>
                  {desc}
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
                <div style={{ background: "linear-gradient(160deg,#6faf1c,#5c9515)", color: "#fff", borderRadius: 20, padding: 34 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{discTitle}</h3>
                  <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: "#eaf6da" }}>
                    {discDesc}
                  </p>
                  <a href={discUrl}
                    style={{ display: "inline-block", marginTop: 20, background: "#fff", color: "#5c9515", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9, textDecoration: "none" }}>
                    {discBtn}
                  </a>
                </div>
                <div style={{ background: "linear-gradient(160deg,#1c9fd8,#1179ab)", color: "#fff", borderRadius: 20, padding: 34 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{phoneTitle}</h3>
                  <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: "#e2f2fa" }}>
                    {phoneDesc}
                  </p>
                  <a href={phoneUrl}
                    style={{ display: "inline-block", marginTop: 20, background: "#fff", color: "#1179ab", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9, textDecoration: "none" }}>
                    {phoneBtn}
                  </a>
                </div>
              </div>
              <p style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "#8a97a1" }}>
                {decide?.noteText || "There is no treatment given at a discovery session — it's for you to ask questions and for us to confirm whether we can help."}
              </p>
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <a href={decide?.costLinkUrl || "https://www.nosecreekphysiotherapy.com/inquire/"} style={{ color: "#0e78a8", fontFamily: "'Poppins',sans-serif", fontWeight: 700 }}>
                  {decide?.costLinkText || "Just want to know cost & availability? Inquire here →"}
                </a>
              </div>
            </div>
          </section>
        );
      }

      // ── 13. WORKSHOPS (Configurable) ──
      case "workshops": {
        const ws = homeData.workshops;
        const title = cfg?.title || ws?.title || "Join a free health education or posture workshop";
        const desc = cfg?.content || ws?.description || "Our workshops are 100% free. Request the dates and times of our next event and get practical tips you can start using right away.";
        const btnText = cfg?.ctaText || ws?.ctaText || "Request Dates & Times →";
        const btnUrl = cfg?.ctaHref || ws?.ctaUrl || "https://www.nosecreekphysiotherapy.com/workshops/";
        const bgTheme = cfg?.background || ws?.background || "light";
        const bg = bgTheme === "teal" ? "#12303d" : bgTheme === "white" ? "#ffffff" : "#eef6e4";
        const isDark = bg === "#12303d";

        return (
          <section key="workshops" style={{ background: bg, padding: "clamp(44px,5vw,70px) 0" }}>
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
              <h2 style={{ fontSize: "clamp(24px,3.4vw,36px)", fontWeight: 800, color: isDark ? "#8cc63f" : "#3a6412" }}>
                {title}
              </h2>
              <p style={{ marginTop: 14, fontSize: 16, color: isDark ? "#cbdbe4" : "#4d6b28", lineHeight: 1.6 }}>
                {desc}
              </p>
              <a href={btnUrl}
                style={{ display: "inline-block", marginTop: 24, background: "#6faf1c", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 16, padding: "15px 30px", borderRadius: 10, boxShadow: "0 10px 24px rgba(111,175,28,0.28)", textDecoration: "none" }}>
                {btnText}
              </a>
            </div>
          </section>
        );
      }

      // ── 14. SEO LOCAL COPY (Configurable) ──
      case "seo_copy": {
        const seo = homeData.seoCopy;
        const title = cfg?.title || seo?.title || "Looking for a physiotherapist near you in Calgary?";
        const content = cfg?.content;
        const defaultAreaLinks = [
          { label: "Calgary NW",           href: "https://www.nosecreekphysiotherapy.com/service-areas/" },
          { label: "Calgary NE",           href: "https://www.nosecreekphysiotherapy.com/service-areas/" },
          { label: "Beddington",           href: "https://www.nosecreekphysiotherapy.com/beddington/" },
          { label: "Thorncliffe & more",   href: "https://www.nosecreekphysiotherapy.com/service-areas/" },
        ];
        const areaLinks = seo?.areaLinks && seo.areaLinks.length > 0 ? seo.areaLinks : defaultAreaLinks;

        return (
          <section key="seo_copy" style={{ padding: "clamp(56px,7vw,90px) 0" }}>
            <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
              <h2 style={{ fontSize: "clamp(26px,3.6vw,40px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
                {title}
              </h2>
              {content ? (
                <p style={{ marginTop: 20, fontSize: 16.5, lineHeight: 1.75, color: "#48535c", whiteSpace: "pre-line" }}>
                  {content}
                </p>
              ) : (
                <>
                  <p style={{ marginTop: 20, fontSize: 16.5, lineHeight: 1.75, color: "#48535c" }}>
                    {seo?.paragraph1 || "Searching for 'physiotherapy near me' in Calgary, AB can feel overwhelming — you've reached the right place. However big or small your issue feels, our experienced physiotherapists are eager to get started, and we take pride in every service we offer."}
                  </p>
                  <p style={{ marginTop: 16, fontSize: 16.5, lineHeight: 1.75, color: "#48535c" }}>
                    {seo?.paragraph2 || "Nose Creek Physiotherapy strives to provide unequalled patient care throughout every stage of your therapy — from your first evaluation to your final billing. Every client is valuable to us, and we treat you that way from the moment you step through our doors."}
                  </p>
                </>
              )}
              <div style={{ marginTop: 26, display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", fontSize: 14.5, fontWeight: 600 }}>
                {areaLinks.map((a, i) => (
                  <a key={i} href={a.href} style={{ background: "#f2f8fb", border: "1px solid #d7e6ef", borderRadius: 999, padding: "9px 18px", color: "#1d2b34" }}>{a.label}</a>
                ))}
              </div>
            </div>
          </section>
        );
      }

      // ── 15. LATEST BLOG POSTS (Dynamic Feed) ──
      case "blog_section": {
        return (
          <section key="blog_section" id="blog" style={{ padding: "clamp(56px,7vw,96px) 0" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40 }}>
                <div>
                  {eyebrow("From our blog")}
                  <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.5px" }}>Physiotherapy tips &amp; health articles</h2>
                </div>
                <Link href="/blog" style={{ color: "#0e78a8", fontFamily: "'Poppins',sans-serif", fontWeight: 700, whiteSpace: "nowrap" }}>
                  View all articles →
                </Link>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
                {latestBlogPosts.map((post) => {
                  const formattedDate = post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "";
                  const metaText = post.author
                    ? `${post.author}${formattedDate ? ` · ${formattedDate}` : ""}`
                    : formattedDate;

                  return (
                    <Link
                      key={post.id || post.slug}
                      href={`/blog/${post.slug}`}
                      style={{ display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #e7edf1", borderRadius: 16, overflow: "hidden", boxShadow: "0 6px 20px rgba(18,60,80,0.05)", textDecoration: "none" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.featuredImage} alt={post.title} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }} />
                      <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                        {metaText && (
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#8a97a1", fontFamily: "'Poppins',sans-serif" }}>
                            {metaText}
                          </div>
                        )}
                        <h3 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3, color: "#1d2b34" }}>{post.title}</h3>
                        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#5a6570" }}>{post.excerpt}</p>
                        <span style={{ marginTop: "auto", paddingTop: 6, color: "#0e78a8", fontWeight: 700, fontSize: 14 }}>Read article →</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      // ── 16. FAQS (Configurable) ──
      case "faqs": {
        const faqs = homeData.faqs || defaultHomeData.faqs;
        const eyebrowText = cfg?.eyebrow || "FAQ";
        const title = cfg?.title || "Frequently asked questions";

        return (
          <section key="faqs" style={{ background: "#f2f8fb", padding: "clamp(56px,7vw,96px) 0" }}>
            <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", marginBottom: 38 }}>
                {eyebrow(eyebrowText, cfg?.eyebrowColor || "#1c9fd8")}
                <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.5px" }}>{title}</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {faqs.map((faq, idx) => (
                  <details key={idx} style={{ background: "#fff", border: "1px solid #e2ebf0", borderRadius: 14, padding: "4px 22px" }}>
                    <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "18px 0", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 17, color: "#1d2b34" }}>
                      {(faq as any).q || (faq as any).question}
                      <span className="faqPlus" style={{ color: "#1c9fd8", fontSize: 24, transition: "transform .2s", flex: "0 0 auto" }}>+</span>
                    </summary>
                    <p style={{ padding: "0 0 20px", fontSize: 15, lineHeight: 1.7, color: "#5a6570" }}>{(faq as any).a || (faq as any).answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        );
      }

      // ── 17. CLINIC LOCATION + MAP (Direct Add) ──
      case "location_map": {
        return <VisitUsSection key="location_map" />;
      }

      // ── 18. FINAL CALL TO ACTION (Configurable) ──
      case "final_cta": {
        const fc = homeData.finalCta;
        const title = cfg?.title || fc?.title || "Ready to move faster and feel better?";
        const desc = cfg?.content || fc?.description || "Book your appointment online in under two minutes, or give us a call — we'd love to help you get back to the life you deserve.";
        const btnText = cfg?.ctaText || fc?.ctaText || "Book Your Treatment Online";
        const btnUrl = cfg?.ctaHref || fc?.ctaUrl || "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington";
        const phone = fc?.phone || "403.295.8590";
        const phoneHref = fc?.phoneHref || "tel:+14032958590";

        return (
          <section key="final_cta" style={{ background: "linear-gradient(120deg,#1c9fd8,#1179ab)", color: "#fff" }}>
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(48px,6vw,80px) 24px", textAlign: "center" }}>
              <h2 style={{ color: "#fff", fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.12 }}>
                {title}
              </h2>
              <p style={{ marginTop: 16, fontSize: 17, color: "#e2f2fa", lineHeight: 1.6, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
                {desc}
              </p>
              <div style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
                <a href={btnUrl} target="_blank" rel="noopener noreferrer"
                  style={{ background: "#8cc63f", color: "#12303d", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 17, padding: "16px 30px", borderRadius: 10, boxShadow: "0 12px 28px rgba(0,0,0,0.18)", textDecoration: "none" }}>
                  {btnText}
                </a>
                <a href={phoneHref}
                  style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.5)", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 17, padding: "15px 28px", borderRadius: 10, textDecoration: "none" }}>
                  Call {phone}
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

  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>
      {sectionOrder.map((sectionKey) => renderSectionByKey(sectionKey))}
    </div>
  );
}

// ── CUSTOM STORYTELLING SECTION COMPONENT ──
function CustomStorySection({ section }: { section: ServiceCustomSection }) {
  const isDark = section.background === "teal";
  const bg = section.background === "teal"
    ? "#12303d"
    : section.background === "light"
    ? "#f8fafc"
    : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#1d2b34";
  const descColor = isDark ? "#cbdbe4" : "#48535c";
  const eyebrowColor = section.eyebrowColor || (isDark ? "#8cc63f" : "#1c9fd8");

  const imagePosition = section.imagePosition || (section.image ? "right" : "none");
  const hasImage = Boolean(section.image && imagePosition !== "none");

  return (
    <section style={{ background: bg, color: textColor, padding: "clamp(56px,7vw,96px) 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {hasImage && imagePosition === "top" && (
          <div style={{ marginBottom: 36, borderRadius: 18, overflow: "hidden", maxHeight: 440 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={section.image!}
              alt={section.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        )}

        <div
          style={{
            display: hasImage && (imagePosition === "left" || imagePosition === "right") ? "grid" : "block",
            gridTemplateColumns:
              hasImage && (imagePosition === "left" || imagePosition === "right")
                ? "repeat(auto-fit, minmax(320px, 1fr))"
                : "1fr",
            gap: "clamp(32px,4vw,56px)",
            alignItems: "center"
          }}
        >
          {hasImage && imagePosition === "left" && (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={section.image!}
                alt={section.title}
                style={{ width: "100%", borderRadius: 18, objectFit: "cover", aspectRatio: "4/3", boxShadow: "0 18px 48px rgba(0,0,0,0.12)" }}
              />
            </div>
          )}

          <div>
            {section.eyebrow && eyebrow(section.eyebrow, eyebrowColor)}
            <h2 style={{ fontSize: "clamp(26px,3.6vw,40px)", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.18, color: textColor }}>
              {section.title}
            </h2>
            {section.subtitle && (
              <p style={{ marginTop: 8, fontSize: 16, fontWeight: 600, color: eyebrowColor }}>
                {section.subtitle}
              </p>
            )}
            {section.content && (
              <p style={{ marginTop: 16, fontSize: 16, lineHeight: 1.7, color: descColor }}>
                {section.content}
              </p>
            )}

            {section.bullets && section.bullets.length > 0 && (
              <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                {section.bullets.map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, color: descColor }}>
                    <span style={{ color: eyebrowColor, fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            )}

            {(section.buttonText || section.ctaText) && (
              <div style={{ marginTop: 26 }}>
                <a
                  href={section.buttonUrl || section.ctaHref || "#"}
                  style={{
                    display: "inline-block",
                    background: isDark ? "#8cc63f" : "#1c9fd8",
                    color: isDark ? "#12303d" : "#fff",
                    fontFamily: "'Poppins',sans-serif",
                    fontWeight: 700,
                    padding: "13px 26px",
                    borderRadius: 10,
                    textDecoration: "none"
                  }}
                >
                  {section.buttonText || section.ctaText}
                </a>
              </div>
            )}
          </div>

          {hasImage && imagePosition === "right" && (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={section.image!}
                alt={section.title}
                style={{ width: "100%", borderRadius: 18, objectFit: "cover", aspectRatio: "4/3", boxShadow: "0 18px 48px rgba(0,0,0,0.12)" }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
