"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TeamCarousel from "@/components/ui/TeamCarousel";
import { Service, TeamMember, Condition } from "@/types/content";

const eyebrow = (text: string, color = "#1c9fd8") => (
  <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color, letterSpacing: "1.5px", fontSize: 13, textTransform: "uppercase" as const, marginBottom: 12 }}>
    {text}
  </div>
);

const defaultServiceSectionOrder = [
  "hero",
  "at_a_glance",
  "clinical_overview",
  "custom_sections",
  "benefits",
  "symptoms",
  "treatment_approach",
  "team_carousel",
  "faqs",
  "location_map",
  "decision_ctas",
  "bottom_cta"
];

export default function ServiceLiveView({
  initialService,
  allTeam,
  allConditions
}: {
  initialService: Service;
  allTeam: TeamMember[];
  allConditions: Condition[];
}) {
  const [service, setService] = useState<Service>(initialService);

  // Real-time synchronization with localStorage and browser events
  useEffect(() => {
    function syncFromLocal() {
      try {
        const saved = localStorage.getItem("adm_services");
        if (saved) {
          const list: Service[] = JSON.parse(saved);
          const found = list.find((s) => s.slug === initialService.slug || s.id === initialService.id);
          if (found) {
            setService(found);
          }
        }
      } catch {
        // ignore
      }
    }

    syncFromLocal();
    window.addEventListener("servicesUpdated", syncFromLocal);
    window.addEventListener("storage", syncFromLocal);
    return () => {
      window.removeEventListener("servicesUpdated", syncFromLocal);
      window.removeEventListener("storage", syncFromLocal);
    };
  }, [initialService]);

  const isHidden = (key: string) => (service.hiddenSections || []).includes(key);
  const order = service.sectionOrder && service.sectionOrder.length > 0
    ? service.sectionOrder
    : defaultServiceSectionOrder;

  // Render individual section block
  const renderSection = (key: string) => {
    if (isHidden(key)) return null;

    switch (key) {
      case "hero":
        return (
          <section key="hero" style={{ background: "linear-gradient(180deg, #f2f8fb 0%, #ffffff 100%)", padding: "clamp(36px, 4vw, 56px) 0 36px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Services", href: "/services" },
                  { label: service.title }
                ]}
              />

              <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "clamp(32px, 4vw, 56px)", alignItems: "center" }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e6f4ea", color: "#5c9515", fontWeight: 700, fontSize: 13, fontFamily: "'Poppins',sans-serif", padding: "6px 14px", borderRadius: 999, marginBottom: 18 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6faf1c", display: "inline-block" }} />
                    Evidence-Based Clinical Care · Calgary North
                  </div>

                  <h1 style={{ fontSize: "clamp(30px, 4.2vw, 48px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.12, marginBottom: 18 }}>
                    {service.title} in Calgary North
                  </h1>

                  <p style={{ fontSize: "clamp(16px, 1.5vw, 18.5px)", lineHeight: 1.65, color: "#48535c", marginBottom: 28 }}>
                    {service.shortDescription}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
                    <a
                      href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ padding: "14px 28px", fontSize: 16, fontWeight: 700, borderRadius: 8, textDecoration: "none", boxShadow: "0 4px 14px rgba(28, 159, 216, 0.35)" }}
                    >
                      {service.ctaText || "Book Your Assessment"} &rarr;
                    </a>
                    <a
                      href="tel:4032958590"
                      className="btn btn-secondary"
                      style={{ padding: "14px 24px", fontSize: 15, fontWeight: 700, borderRadius: 8, textDecoration: "none" }}
                    >
                      📞 Call (403) 295-8590
                    </a>
                  </div>

                  {/* Trust Micro-Badges */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 28, paddingTop: 20, borderTop: "1px solid #e7edf1" }}>
                    {[
                      { icon: "✓", text: "Direct Billing Available" },
                      { icon: "✓", text: "No Referral Needed" },
                      { icon: "✓", text: "Free Dedicated Parking" },
                    ].map((b, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "#334155", fontWeight: 600 }}>
                        <span style={{ color: "#6faf1c", fontWeight: 800 }}>{b.icon}</span>
                        <span>{b.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ position: "relative" }}>
                  <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 48px rgba(18,48,61,0.15)", aspectRatio: "4/3", background: "#e2e8f0" }}>
                    <img
                      src={service.heroImage || "/images/clinic/reception-three.jpg"}
                      alt={`${service.title} clinic Calgary`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                  <div style={{ position: "absolute", bottom: -14, right: 20, background: "#12303d", color: "#fff", padding: "10px 18px", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#f6c945", fontSize: 17 }}>★★★★★</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700 }}>4.9★ from 545+ Calgary Reviews</span>
                  </div>
                </div>

              </div>
            </div>
          </section>
        );

      case "at_a_glance":
        return (
          <section key="at_a_glance" style={{ background: "#f8fafc", borderTop: "1px solid #e7edf1", borderBottom: "1px solid #e7edf1", padding: "20px 0" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {[
                { icon: "⏱", label: "Session Duration", val: "30 – 60 Minutes" },
                { icon: "💳", label: "Direct Billing", val: "Available for Most Insurers" },
                { icon: "🩺", label: "Referral Required", val: "No Referral Needed" },
                { icon: "📍", label: "Clinic Location", val: "Beddington SE (Free Parking)" },
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: 24 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b" }}>{item.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case "clinical_overview":
        return (
          <section key="clinical_overview" style={{ padding: "clamp(48px, 5vw, 72px) 0", background: "#fff" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ maxWidth: 860 }}>
                {eyebrow("Clinical Excellence")}
                <h2 style={{ fontSize: "clamp(26px, 3.2vw, 38px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: 20 }}>
                  Understanding {service.title} &amp; How We Help You Recover
                </h2>
                <div style={{ fontSize: "clamp(16px, 1.2vw, 17.5px)", lineHeight: 1.8, color: "#48535c" }}>
                  {service.description ? (
                    service.description.split("\n\n").map((para, i) => (
                      <p key={i} style={{ marginBottom: 18 }}>{para}</p>
                    ))
                  ) : (
                    <p>Comprehensive clinical assessment and personalized care protocols at Nose Creek Physiotherapy.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        );

      case "custom_sections":
        if (!service.customSections || service.customSections.length === 0) return null;
        return (
          <div key="custom_sections">
            {service.customSections.map((sec, idx) => {
              const bgStyle =
                sec.background === "teal"
                  ? { background: "#12303d", color: "#ffffff" }
                  : sec.background === "light"
                  ? { background: "#f8fafc", color: "#1d2b34" }
                  : { background: "#ffffff", color: "#1d2b34" };

              const isDark = sec.background === "teal";
              const isImageLeft = sec.imagePosition === "left";
              const isImageNone = sec.imagePosition === "none" || !sec.image;
              const isImageTop = sec.imagePosition === "top";
              const isImageBottom = sec.imagePosition === "bottom";

              return (
                <section key={sec.id || idx} style={{ ...bgStyle, padding: "clamp(48px, 6vw, 80px) 0", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
                    
                    {/* Top Image Layout */}
                    {isImageTop && sec.image && (
                      <div style={{ marginBottom: 36, borderRadius: 16, overflow: "hidden", maxHeight: 420, boxShadow: "0 12px 36px rgba(0,0,0,0.1)" }}>
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
                      {/* Left Image */}
                      {isImageLeft && sec.image && (
                        <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,0.12)", aspectRatio: "4/3" }}>
                          <img src={sec.image} alt={sec.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </div>
                      )}

                      {/* Content Column */}
                      <div style={{ maxWidth: isImageNone ? 880 : "none" }}>
                        {sec.eyebrow && eyebrow(sec.eyebrow, sec.eyebrowColor || (isDark ? "#8cc63f" : "#1c9fd8"))}

                        <h2 style={{ fontSize: "clamp(26px, 3.2vw, 38px)", fontWeight: 800, color: isDark ? "#fff" : "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: 16 }}>
                          {sec.title}
                        </h2>

                        {sec.subtitle && (
                          <div style={{ fontSize: 18, fontWeight: 600, color: isDark ? "#93c5fd" : "#0e78a8", marginBottom: 18 }}>
                            {sec.subtitle}
                          </div>
                        )}

                        <div style={{ fontSize: "clamp(15.5px, 1.1vw, 17px)", lineHeight: 1.75, color: isDark ? "#cbd5e1" : "#48535c", marginBottom: 24 }}>
                          {(sec.content || "").split("\n\n").map((para, pIdx) => (
                            <p key={pIdx} style={{ marginBottom: 14 }}>{para}</p>
                          ))}
                        </div>

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
                            className="btn btn-primary"
                            style={{ padding: "12px 24px", fontSize: 15, fontWeight: 700, borderRadius: 8, textDecoration: "none", display: "inline-block" }}
                          >
                            {sec.ctaText} &rarr;
                          </a>
                        )}
                      </div>

                      {/* Right Image */}
                      {!isImageLeft && !isImageNone && !isImageTop && !isImageBottom && sec.image && (
                        <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,0.12)", aspectRatio: "4/3" }}>
                          <img src={sec.image} alt={sec.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </div>
                      )}

                    </div>

                    {/* Bottom Image Layout */}
                    {isImageBottom && sec.image && (
                      <div style={{ marginTop: 36, borderRadius: 16, overflow: "hidden", maxHeight: 420, boxShadow: "0 12px 36px rgba(0,0,0,0.1)" }}>
                        <img src={sec.image} alt={sec.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      </div>
                    )}

                  </div>
                </section>
              );
            })}
          </div>
        );

      case "benefits":
        if (!service.benefits || service.benefits.length === 0) return null;
        return (
          <section key="benefits" style={{ padding: "clamp(48px, 5vw, 72px) 0", background: "#f8fafc", borderTop: "1px solid #e7edf1", borderBottom: "1px solid #e7edf1" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 40px" }}>
                {eyebrow("Proven Clinical Outcomes")}
                <h2 style={{ fontSize: "clamp(26px, 3.2vw, 38px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px" }}>
                  Key Benefits of Our {service.title} Care
                </h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
                {service.benefits.map((b, i) => (
                  <div key={i} style={{ background: "#fff", padding: "20px 24px", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e6f4ea", color: "#5c9515", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>✓</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", lineHeight: 1.5 }}>{b}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "symptoms":
        if (!service.symptoms || service.symptoms.length === 0) return null;
        return (
          <section key="symptoms" style={{ padding: "clamp(48px, 5vw, 72px) 0", background: "#fff" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ maxWidth: 860, marginBottom: 36 }}>
                {eyebrow("Targeted Relief")}
                <h2 style={{ fontSize: "clamp(26px, 3.2vw, 38px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px" }}>
                  Conditions &amp; Complaints We Treat with {service.title}
                </h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                {service.symptoms.map((s, i) => (
                  <div key={i} style={{ background: "#f8fafc", padding: "16px 20px", borderRadius: 10, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#1c9fd8", fontSize: 18 }}>•</span>
                    <span style={{ fontSize: 14.5, fontWeight: 600, color: "#334155" }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "treatment_approach":
        if (!service.treatmentApproach || service.treatmentApproach.length === 0) return null;
        return (
          <section key="treatment_approach" style={{ padding: "clamp(48px, 5vw, 72px) 0", background: "#12303d", color: "#fff" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 48px" }}>
                {eyebrow("Our Clinical Roadmap", "#8cc63f")}
                <h2 style={{ fontSize: "clamp(26px, 3.2vw, 38px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
                  Your 4-Step Journey to Pain Relief &amp; Recovery
                </h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
                {service.treatmentApproach.map((step, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", padding: 24, borderRadius: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#6faf1c", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, marginBottom: 16 }}>
                      {i + 1}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Step {i + 1}</h3>
                    <p style={{ margin: 0, fontSize: 14, color: "#cbd5e1", lineHeight: 1.6 }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "team_carousel":
        return (
          <section key="team_carousel" style={{ padding: "clamp(48px, 5vw, 72px) 0", background: "#fff" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 40px" }}>
                {eyebrow("Expert Clinicians")}
                <h2 style={{ fontSize: "clamp(26px, 3.2vw, 38px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px" }}>
                  Meet Our Registered Therapists
                </h2>
              </div>
              <TeamCarousel members={allTeam} />
            </div>
          </section>
        );

      case "faqs":
        if (!service.faqs || service.faqs.length === 0) return null;
        return (
          <section key="faqs" style={{ padding: "clamp(48px, 5vw, 72px) 0", background: "#f8fafc", borderTop: "1px solid #e7edf1" }}>
            <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                {eyebrow("Common Questions")}
                <h2 style={{ fontSize: "clamp(26px, 3.2vw, 38px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px" }}>
                  Frequently Asked Questions About {service.title}
                </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {service.faqs.map((faq, i) => (
                  <details key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
                    <summary style={{ fontWeight: 700, fontSize: 15.5, color: "#1e293b", cursor: "pointer" }}>
                      {faq.question}
                    </summary>
                    <p style={{ margin: "12px 0 0 0", fontSize: 14.5, lineHeight: 1.7, color: "#475569" }}>
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
          <section key="location_map" style={{ padding: "clamp(48px, 5vw, 72px) 0", background: "#fff" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, alignItems: "center" }}>
                <div>
                  {eyebrow("Visit Our Clinic")}
                  <h2 style={{ fontSize: "clamp(26px, 3.2vw, 38px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", marginBottom: 18 }}>
                    Beddington SE Calgary North Clinic
                  </h2>
                  <p style={{ fontSize: 15.5, color: "#48535c", lineHeight: 1.7, marginBottom: 20 }}>
                    Located at #204, 8120 Beddington Blvd NW, Calgary, AB with dedicated free surface parking and full wheelchair accessibility.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14.5, color: "#334155" }}>
                    <div><strong>📍 Address:</strong> #204, 8120 Beddington Blvd NW, Calgary, AB T3K 2A8</div>
                    <div><strong>📞 Phone:</strong> <a href="tel:4032958590" style={{ color: "#1c9fd8", fontWeight: 700 }}>(403) 295-8590</a></div>
                    <div><strong>⏱ Hours:</strong> Mon–Thu 7am–8pm · Fri 7am–6pm · Sat 8am–1pm</div>
                  </div>
                </div>
                <div style={{ borderRadius: 16, overflow: "hidden", height: 320, border: "1px solid #e2e8f0" }}>
                  <iframe
                    title="Nose Creek Physiotherapy Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2504.6293993710777!2d-114.10375682337775!3d51.11531777172704!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x537164ff9cb0cfc1%3A0x6fb837a77e2ecf99!2sNose%20Creek%20Physiotherapy!5e0!3m2!1sen!2sca!4v1700000000000!5m2!1sen!2sca"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </section>
        );

      case "decision_ctas":
        return (
          <section key="decision_ctas" style={{ padding: "clamp(36px, 4vw, 56px) 0", background: "#f8fafc", borderTop: "1px solid #e7edf1" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
              <div style={{ background: "#fff", border: "1px solid #bae6fd", borderRadius: 14, padding: 28, boxShadow: "0 4px 14px rgba(28, 159, 216, 0.08)" }}>
                <span style={{ fontSize: 28, display: "block", marginBottom: 12 }}>💡</span>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0369a1", marginBottom: 8 }}>Free Discovery Visit</h3>
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 20 }}>Unsure if {service.title} is right for you? Come in for a free 15-minute one-on-one discovery consult.</p>
                <Link href="/contact" className="btn btn-secondary" style={{ padding: "10px 20px", fontSize: 14, fontWeight: 700, borderRadius: 6, textDecoration: "none", display: "inline-block" }}>
                  Claim Free Discovery Visit &rarr;
                </Link>
              </div>
              <div style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 14, padding: 28, boxShadow: "0 4px 14px rgba(111, 175, 28, 0.08)" }}>
                <span style={{ fontSize: 28, display: "block", marginBottom: 12 }}>📞</span>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#15803d", marginBottom: 8 }}>Free Telephone Consult</h3>
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 20 }}>Speak with our head physiotherapist over the phone about your symptoms and care plan.</p>
                <a href="tel:4032958590" className="btn btn-primary" style={{ padding: "10px 20px", fontSize: 14, fontWeight: 700, borderRadius: 6, textDecoration: "none", display: "inline-block" }}>
                  Call (403) 295-8590 &rarr;
                </a>
              </div>
            </div>
          </section>
        );

      case "bottom_cta":
        return (
          <section key="bottom_cta" style={{ background: "linear-gradient(135deg, #1c9fd8 0%, #0e78a8 100%)", color: "#fff", padding: "clamp(56px, 6vw, 84px) 0", textAlign: "center" }}>
            <div style={{ maxWidth: 840, margin: "0 auto", padding: "0 24px" }}>
              <h2 style={{ fontSize: "clamp(28px, 3.6vw, 44px)", fontWeight: 800, color: "#fff", marginBottom: 16 }}>
                Ready to Start Your {service.title} Care?
              </h2>
              <p style={{ fontSize: "clamp(16px, 1.4vw, 19px)", color: "#e0f2fe", marginBottom: 32, lineHeight: 1.6 }}>
                Take the first step toward lasting mobility, pain relief, and peak physical function today.
              </p>
              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 16 }}>
                <a
                  href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ background: "#fff", color: "#0369a1", padding: "16px 36px", fontSize: 16, fontWeight: 800, borderRadius: 8, textDecoration: "none" }}
                >
                  Book Online Now &rarr;
                </a>
                <a
                  href="tel:4032958590"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", padding: "16px 28px", fontSize: 16, fontWeight: 700, borderRadius: 8, textDecoration: "none" }}
                >
                  Call (403) 295-8590
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
