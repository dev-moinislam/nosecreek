import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import TeamCarousel from "@/components/ui/TeamCarousel";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import {
  getServiceBySlug,
  getTeamMembers,
  getConditions
} from "@/lib/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

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

const eyebrow = (text: string, color = "#1c9fd8") => (
  <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color, letterSpacing: "1.5px", fontSize: 13, textTransform: "uppercase" as const, marginBottom: 12 }}>
    {text}
  </div>
);

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

  const relatedConditionObjects = allConditions.filter((c) =>
    (service.relatedConditions ?? []).includes(c.id) || (service.relatedConditions ?? []).includes(c.slug)
  );

  const isHidden = (key: string) => (service.hiddenSections || []).includes(key);

  return (
    <div style={{ width: "100%", overflowX: "hidden", backgroundColor: "#fff" }}>
      
      {/* ── 1. HERO HEADER ── */}
      {!isHidden("hero") && (
      <section style={{ background: "linear-gradient(180deg, #f2f8fb 0%, #ffffff 100%)", padding: "clamp(36px, 4vw, 56px) 0 36px" }}>
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

              <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                <a
                  href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#6faf1c", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15.5, padding: "14px 28px", borderRadius: 9, boxShadow: "0 10px 24px rgba(111,175,28,0.32)", textDecoration: "none" }}
                >
                  Book Treatment Online
                </a>
                <a
                  href="tel:+14032958590"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "#0e78a8", border: "2px solid #cfe6f2", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15.5, padding: "12px 22px", borderRadius: 9, textDecoration: "none" }}
                >
                  Call 403.295.8590
                </a>
              </div>

              <div style={{ marginTop: 22, display: "flex", flexWrap: "wrap", gap: "6px 18px", fontSize: 13.5, color: "#5a6570", fontWeight: 600 }}>
                <span>✓ Direct Insurance Billing</span>
                <span>✓ No Doctor Referral Needed</span>
                <span>✓ Open 6:45am – 7:15pm</span>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 50px rgba(18,60,80,0.14)", aspectRatio: "4/3", backgroundColor: "#eef3f6" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.heroImage || "/images/clinic/reception-desktop.jpg"}
                  alt={`${service.title} at Nose Creek Physiotherapy Calgary`}
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
      )}

      {/* ── 2. TREATMENT AT-A-GLANCE BAR ── */}
      {!isHidden("at_a_glance") && (
      <section style={{ background: "#f8fafc", borderTop: "1px solid #e7edf1", borderBottom: "1px solid #e7edf1", padding: "20px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {[
            { icon: "⏱", label: "Session Duration", val: "30 – 60 Minutes" },
            { icon: "💳", label: "Direct Billing", val: "Available for Most Insurers" },
            { icon: "🩺", label: "Referral Required", val: "No Referral Needed" },
            { icon: "🔄", label: "Typical Care Plan", val: "3 – 6 Tailored Sessions" }
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2ebf0" }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 11.5, color: "#8a97a1", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: "'Poppins',sans-serif" }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1d2b34" }}>{item.val}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* ── 3. CLINICAL OVERVIEW & WHY IT WORKS ── */}
      {!isHidden("clinical_overview") && (
      <section style={{ padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
            {eyebrow("Clinical Overview", "#6faf1c")}
            <h2 style={{ fontSize: "clamp(26px, 3.8vw, 42px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: 20 }}>
              How {service.title} Works to Relieve Your Pain
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.8, color: "#48535c", marginBottom: 20 }}>
              {service.description}
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "#5a6570" }}>
              Unlike passive treatments or painkillers that only mask the problem, our Calgary clinicians identify the root biomechanical impairment. By combining targeted hands-on therapy, joint restoration, and personalized functional exercise, we ensure you achieve lasting recovery and reduce your chance of re-injury.
            </p>
          </div>
        </div>
      </section>
      )}

      {/* ── 4. DYNAMIC CUSTOM SECTIONS ENGINE ── */}
      {!isHidden("custom_sections") && service.customSections && service.customSections.map((sec, idx) => {
        const isLeft = sec.imagePosition === "left";
        const isTop = sec.imagePosition === "top";
        const isBottom = sec.imagePosition === "bottom";
        const isNone = sec.imagePosition === "none" || !sec.image;
        const bgStyle = sec.background === "light" ? "#f8fafc" : sec.background === "teal" ? "#12303d" : "#ffffff";
        const textColor = sec.background === "teal" ? "#ffffff" : "#1d2b34";
        const pColor = sec.background === "teal" ? "#cbdbe4" : "#48535c";

        return (
          <section
            key={sec.id || idx}
            style={{
              background: bgStyle,
              padding: "clamp(56px,7vw,96px) 0",
              borderTop: "1px solid #e7edf1",
              borderBottom: "1px solid #e7edf1"
            }}
          >
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
              
              {isTop && (
                <div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
                  {sec.image && (
                    <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 36, boxShadow: "0 14px 36px rgba(18,60,80,0.1)", aspectRatio: "16/9" }}>
                      <img src={sec.image} alt={sec.imageAlt || sec.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                  )}
                  {sec.eyebrow && eyebrow(sec.eyebrow, sec.eyebrowColor || "#1c9fd8")}
                  <h2 style={{ fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 800, color: textColor, letterSpacing: "-0.5px", marginBottom: 16 }}>
                    {sec.title}
                  </h2>
                  {sec.subtitle && (
                    <p style={{ fontSize: 18, fontWeight: 600, color: "#0e78a8", marginBottom: 16 }}>
                      {sec.subtitle}
                    </p>
                  )}
                  {sec.content && (
                    <p style={{ fontSize: 16.5, lineHeight: 1.8, color: pColor, marginBottom: 24 }}>
                      {sec.content}
                    </p>
                  )}
                  {sec.bullets && sec.bullets.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 20 }}>
                      {sec.bullets.map((b, i) => (
                        <span key={i} style={{ background: "#fff", border: "1px solid #d7e6ef", color: "#1d2b34", fontWeight: 600, fontSize: 14, padding: "8px 16px", borderRadius: 999 }}>
                          ✓ {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(isLeft || sec.imagePosition === "right") && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "clamp(36px, 5vw, 64px)", alignItems: "center" }}>
                  
                  {isLeft && sec.image && (
                    <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 18px 45px rgba(18,60,80,0.12)", aspectRatio: "4/3", backgroundColor: "#eef3f6" }}>
                      <img src={sec.image} alt={sec.imageAlt || sec.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                  )}

                  <div>
                    {sec.eyebrow && eyebrow(sec.eyebrow, sec.eyebrowColor || "#6faf1c")}
                    <h2 style={{ fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 800, color: textColor, letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: 16 }}>
                      {sec.title}
                    </h2>
                    {sec.subtitle && (
                      <div style={{ fontSize: 16.5, fontWeight: 700, color: "#0e78a8", marginBottom: 16, fontFamily: "'Poppins',sans-serif" }}>
                        {sec.subtitle}
                      </div>
                    )}
                    {sec.content && (
                      <p style={{ fontSize: 16, lineHeight: 1.75, color: pColor, marginBottom: 22 }}>
                        {sec.content}
                      </p>
                    )}
                    {sec.bullets && sec.bullets.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                        {sec.bullets.map((b, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, color: pColor }}>
                            <span style={{ color: "#6faf1c", fontWeight: 800 }}>✓</span>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {sec.ctaText && (
                      <a
                        href={sec.ctaHref || "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"}
                        target={sec.ctaHref?.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        style={{ display: "inline-block", background: "#6faf1c", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15, padding: "13px 24px", borderRadius: 9, textDecoration: "none" }}
                      >
                        {sec.ctaText}
                      </a>
                    )}
                  </div>

                  {!isLeft && sec.image && (
                    <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 18px 45px rgba(18,60,80,0.12)", aspectRatio: "4/3", backgroundColor: "#eef3f6" }}>
                      <img src={sec.image} alt={sec.imageAlt || sec.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                  )}

                </div>
              )}

              {isNone && (
                <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
                  {sec.eyebrow && eyebrow(sec.eyebrow, sec.eyebrowColor || "#1c9fd8")}
                  <h2 style={{ fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 800, color: textColor, letterSpacing: "-0.5px", marginBottom: 16 }}>
                    {sec.title}
                  </h2>
                  {sec.subtitle && (
                    <p style={{ fontSize: 18, fontWeight: 600, color: "#0e78a8", marginBottom: 16 }}>
                      {sec.subtitle}
                    </p>
                  )}
                  {sec.content && (
                    <p style={{ fontSize: 16.5, lineHeight: 1.8, color: pColor, marginBottom: 24 }}>
                      {sec.content}
                    </p>
                  )}
                  {sec.bullets && sec.bullets.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, textAlign: "left", marginTop: 24 }}>
                      {sec.bullets.map((b, i) => (
                        <div key={i} style={{ background: "#f8fafc", padding: "14px 18px", borderRadius: 12, border: "1px solid #e2ebf0", display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ color: "#6faf1c", fontWeight: 800, fontSize: 16 }}>✓</span>
                          <span style={{ fontSize: 14.5, fontWeight: 600, color: "#1d2b34" }}>{b}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {isBottom && (
                <div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
                  {sec.eyebrow && eyebrow(sec.eyebrow, sec.eyebrowColor || "#1c9fd8")}
                  <h2 style={{ fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 800, color: textColor, letterSpacing: "-0.5px", marginBottom: 16 }}>
                    {sec.title}
                  </h2>
                  {sec.subtitle && (
                    <p style={{ fontSize: 18, fontWeight: 600, color: "#0e78a8", marginBottom: 16 }}>
                      {sec.subtitle}
                    </p>
                  )}
                  {sec.content && (
                    <p style={{ fontSize: 16.5, lineHeight: 1.8, color: pColor, marginBottom: 24 }}>
                      {sec.content}
                    </p>
                  )}
                  {sec.image && (
                    <div style={{ borderRadius: 20, overflow: "hidden", marginTop: 36, boxShadow: "0 14px 36px rgba(18,60,80,0.1)", aspectRatio: "16/9" }}>
                      <img src={sec.image} alt={sec.imageAlt || sec.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                  )}
                </div>
              )}

            </div>
          </section>
        );
      })}

      {/* ── 5. KEY TREATMENT BENEFITS ── */}
      {!isHidden("benefits") && service.benefits && service.benefits.length > 0 && (
        <section style={{ background: "#f2f8fb", padding: "clamp(56px,7vw,96px) 0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
              {eyebrow("Proven Benefits", "#6faf1c")}
              <h2 style={{ fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
                Why Choose {service.title} at Nose Creek?
              </h2>
              <p style={{ marginTop: 12, fontSize: 16.5, color: "#5a6570", lineHeight: 1.6 }}>
                Patients across North Calgary trust our clinical team for long-term recovery and rapid pain relief:
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
              {service.benefits.map((benefit, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 18, padding: "28px 24px", border: "1px solid #e2ebf0", boxShadow: "0 6px 20px rgba(18,60,80,0.04)", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#eef6e4", color: "#5c9515", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20 }}>
                    ✓
                  </div>
                  <div style={{ color: "#1d2b34", fontSize: 16, lineHeight: 1.6, fontWeight: 700 }}>
                    {benefit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. CONDITIONS & SYMPTOMS TREATED ── */}
      {!isHidden("symptoms") && service.symptoms && service.symptoms.length > 0 && (
        <section style={{ padding: "clamp(56px,7vw,96px) 0" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 44px" }}>
              {eyebrow("Targeted Conditions", "#e67e22")}
              <h2 style={{ fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
                Common Symptoms &amp; Issues Addressed
              </h2>
              <p style={{ marginTop: 12, fontSize: 16.5, color: "#5a6570", lineHeight: 1.6 }}>
                Our {service.title.toLowerCase()} treatments are specifically customized for patients experiencing:
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 36 }}>
              {service.symptoms.map((symptom, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 15, color: "#3a444d", background: "#f8fafc", padding: "16px 20px", borderRadius: 12, border: "1px solid #edf2f5", fontWeight: 600 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#e67e22", flexShrink: 0 }} />
                  <span>{symptom}</span>
                </div>
              ))}
            </div>

            {/* Related Conditions Links */}
            {!isHidden("related_conditions") && relatedConditionObjects.length > 0 && (
              <div style={{ background: "#f2f8fb", borderRadius: 18, border: "1px solid #d7e6ef", padding: "26px 30px", textAlign: "center" }}>
                <div style={{ fontSize: 14, color: "#0e78a8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 14 }}>
                  Explore Specific Condition Guides:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
                  {relatedConditionObjects.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/conditions/${c.slug}`}
                      style={{ background: "#fff", color: "#1d2b34", padding: "8px 16px", borderRadius: 999, fontSize: 13.5, fontWeight: 600, textDecoration: "none", border: "1px solid #d7e6ef", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}
                    >
                      {c.name} &rarr;
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 7. PATIENT JOURNEY / WHAT TO EXPECT ── */}
      {!isHidden("treatment_approach") && (
      <section style={{ background: "#f8fafc", padding: "clamp(56px,7vw,96px) 0", borderTop: "1px solid #e7edf1", borderBottom: "1px solid #e7edf1" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
            {eyebrow("Your First Appointment", "#1c9fd8")}
            <h2 style={{ fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
              What to Expect at Your Visit
            </h2>
            <p style={{ marginTop: 12, fontSize: 16.5, color: "#5a6570", lineHeight: 1.6 }}>
              We ensure your path to recovery is transparent, gentle, and results-driven from day one:
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {[
              {
                step: "1",
                title: "Thorough Assessment",
                desc: "We perform a comprehensive orthopaedic evaluation to pinpoint the biomechanical root cause of your pain."
              },
              {
                step: "2",
                title: "Hands-On Treatment",
                desc: "You will receive hands-on therapy, joint mobilization, or modality treatments right on your very first appointment."
              },
              {
                step: "3",
                title: "Custom Recovery Plan",
                desc: "Your clinician provides an individualized at-home exercise plan and postural guidance to speed up your recovery."
              },
              {
                step: "4",
                title: "Long-Term Prevention",
                desc: "We help you rebuild muscle strength and joint stability to prevent future flare-ups so you stay active long term."
              }
            ].map((item) => (
              <div key={item.step} style={{ background: "#fff", border: "1px solid #e2ebf0", borderRadius: 18, padding: "30px 24px", boxShadow: "0 6px 20px rgba(18,60,80,0.05)", display: "flex", flexDirection: "column" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#1c9fd8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, marginBottom: 18 }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: "#1d2b34", marginBottom: 10 }}>{item.title}</h3>
                <p style={{ color: "#5a6570", fontSize: 14.5, lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ── 8. MEET THE TEAM CAROUSEL ── */}
      {!isHidden("team_carousel") && <TeamCarousel members={allTeam} />}

      {/* ── 9. FREQUENTLY ASKED QUESTIONS ── */}
      {!isHidden("faqs") && (
      <section style={{ background: "#f2f8fb", padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 38 }}>
            {eyebrow("FAQ")}
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
              Frequently asked questions
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {service.faqs && service.faqs.length > 0 ? (
              service.faqs.map((faq, idx) => (
                <details key={idx} style={{ background: "#fff", border: "1px solid #e2ebf0", borderRadius: 14, padding: "4px 22px" }}>
                  <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "18px 0", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 17, color: "#1d2b34" }}>
                    {faq.question}
                    <span className="faqPlus" style={{ color: "#1c9fd8", fontSize: 24, transition: "transform .2s", flex: "0 0 auto" }}>+</span>
                  </summary>
                  <p style={{ padding: "0 0 20px", fontSize: 15, lineHeight: 1.7, color: "#5a6570", margin: 0 }}>{faq.answer}</p>
                </details>
              ))
            ) : (
              <details style={{ background: "#fff", border: "1px solid #e2ebf0", borderRadius: 14, padding: "4px 22px" }}>
                <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "18px 0", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 17, color: "#1d2b34" }}>
                  Is this treatment covered by my insurance?
                  <span className="faqPlus" style={{ color: "#1c9fd8", fontSize: 24, transition: "transform .2s", flex: "0 0 auto" }}>+</span>
                </summary>
                <p style={{ padding: "0 0 20px", fontSize: 15, lineHeight: 1.7, color: "#5a6570", margin: 0 }}>
                  Yes, our treatments are covered by most extended health insurance plans in Alberta, and we direct bill on your behalf.
                </p>
              </details>
            )}
          </div>
        </div>
      </section>
      )}

      {/* ── 10. ONE CLINIC, IDEALLY LOCATED IN CALGARY ── */}
      {!isHidden("location_map") && (
      <section id="contact" style={{ padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 44px" }}>
            {eyebrow("Visit us", "#6faf1c")}
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
              One clinic, ideally located in Calgary
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 28, alignItems: "stretch" }}>
            <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 10px 30px rgba(18,60,80,0.1)", minHeight: 340 }}>
              <iframe
                title="Map to Nose Creek Physiotherapy"
                src="https://www.google.com/maps?q=Nose%20Creek%20Physiotherapy%208220%20Centre%20St%20NE%20Suite%20153%2C%20Calgary%2C%20AB%20T3K%201J7&output=embed"
                style={{ width: "100%", height: "100%", minHeight: 340, border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div style={{ background: "#12303d", color: "#eaf3f8", borderRadius: 18, padding: "clamp(26px,3vw,38px)", display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <h3 style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>Nose Creek Physiotherapy</h3>
                <p style={{ marginTop: 8, fontSize: 15, color: "#cbdbe4", lineHeight: 1.6 }}>8220 Centre St NE #153<br />Calgary, AB T3K 1J7, Canada</p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <a href="tel:+14032958590" style={{ background: "#8cc63f", color: "#12303d", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "12px 20px", borderRadius: 9, textDecoration: "none" }}>
                  Call 403.295.8590
                </a>
                <a href="https://www.google.com/maps/dir//Nose+Creek+Physiotherapy" target="_blank" rel="noopener noreferrer"
                  style={{ border: "1px solid #3d5b68", color: "#eaf3f8", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "12px 20px", borderRadius: 9, textDecoration: "none" }}>
                  Get directions
                </a>
              </div>
              <div style={{ borderTop: "1px solid #244452", paddingTop: 16 }}>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color: "#8cc63f", fontSize: 13, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>Opening hours</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 14.5 }}>
                  {[
                    { day: "Monday – Friday", hours: "6:45 AM – 7:15 PM" },
                    { day: "Saturday",        hours: "8:00 AM – 2:00 PM" },
                    { day: "Sunday",          hours: "Closed" },
                  ].map((row) => (
                    <div key={row.day} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                      <span style={{ color: "#b9cdd8" }}>{row.day}</span>
                      <span style={{ color: "#fff", fontWeight: 600 }}>{row.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#9fc9d9", marginTop: 2 }}>
                Insurance-covered physiotherapy · Extended-health direct billing available.
              </p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ── 11. DECISION CTAs ── */}
      {!isHidden("decision_ctas") && (
      <section style={{ background: "#f2f8fb", padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 40px" }}>
            <h2 style={{ fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
              Unsure if {service.title} is right for you?
            </h2>
            <p style={{ marginTop: 14, fontSize: 16, color: "#5a6570", lineHeight: 1.6 }}>
              We offer two free, no-pressure ways to get all your questions answered before booking.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
            <div style={{ background: "linear-gradient(160deg,#6faf1c,#5c9515)", color: "#fff", borderRadius: 20, padding: 34 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Free Discovery Session</h3>
              <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: "#eaf6da" }}>
                Unsure if {service.title.toLowerCase()} will work for you? Come in, see the clinic and chat with us first — no treatment, no pressure.
              </p>
              <a href="https://www.nosecreekphysiotherapy.com/free-discovery-session/"
                style={{ display: "inline-block", marginTop: 20, background: "#fff", color: "#5c9515", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9, textDecoration: "none" }}>
                Apply for a Free Discovery Session →
              </a>
            </div>
            <div style={{ background: "linear-gradient(160deg,#1c9fd8,#1179ab)", color: "#fff", borderRadius: 20, padding: 34 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Talk to a Physio First</h3>
              <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: "#e2f2fa" }}>
                Have questions about {service.title.toLowerCase()}? Schedule a free phone consultation and one of our therapists will answer everything.
              </p>
              <a href="https://www.nosecreekphysiotherapy.com/telephone-consultation/"
                style={{ display: "inline-block", marginTop: 20, background: "#fff", color: "#1179ab", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9, textDecoration: "none" }}>
                Arrange a free phone consult →
              </a>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ── 12. BOTTOM CTA BANNER ── */}
      {!isHidden("bottom_cta") && (
      <section style={{ background: "linear-gradient(120deg,#1c9fd8,#1179ab)", color: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(48px,6vw,76px) 24px", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(26px,3.8vw,44px)", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.15 }}>
            Ready to experience expert {service.title}?
          </h2>
          <p style={{ marginTop: 14, fontSize: 16.5, color: "#e2f2fa", lineHeight: 1.6, maxWidth: 540, marginLeft: "auto", marginRight: "auto" }}>
            Schedule your assessment with our Calgary team today and take the first step toward lasting pain relief.
          </p>
          <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
            <a
              href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
              target="_blank" rel="noopener noreferrer"
              style={{ background: "#8cc63f", color: "#12303d", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 16, padding: "15px 30px", borderRadius: 10, boxShadow: "0 10px 24px rgba(0,0,0,0.16)", textDecoration: "none" }}
            >
              Book {service.title} Online
            </a>
            <a
              href="tel:+14032958590"
              style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.5)", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 16, padding: "14px 28px", borderRadius: 10, textDecoration: "none" }}
            >
              Call 403.295.8590
            </a>
          </div>
        </div>
      </section>
      )}

      {service.faqs && service.faqs.length > 0 && (
        <SchemaMarkup type="FAQPage" data={service.faqs} />
      )}
    </div>
  );
}
