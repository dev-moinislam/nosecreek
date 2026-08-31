import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ServiceIcon from "@/components/ui/ServiceIcon";
import TeamCarousel from "@/components/ui/TeamCarousel";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import {
  getConditionBySlug,
  getConditions,
  getServices,
  getTeamMembers
} from "@/lib/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

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

const eyebrow = (text: string, color = "#1c9fd8") => (
  <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color, letterSpacing: "1.5px", fontSize: 13, textTransform: "uppercase" as const, marginBottom: 12 }}>
    {text}
  </div>
);

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

  const relatedServiceObjects = allServices.filter((s) =>
    (condition.relatedServices ?? []).includes(s.id) || (condition.relatedServices ?? []).includes(s.slug)
  );

  const otherConditions = allConditions.filter((c) => c.slug !== condition.slug);

  return (
    <div style={{ width: "100%", overflowX: "hidden", backgroundColor: "#fff" }}>
      
      {/* ── 1. HERO HEADER ── */}
      <section style={{ background: "linear-gradient(180deg, #f2f8fb 0%, #ffffff 100%)", padding: "clamp(36px, 4vw, 56px) 0 36px" }}>
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
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e6f4ea", color: "#5c9515", fontWeight: 700, fontSize: 13, fontFamily: "'Poppins',sans-serif", padding: "6px 14px", borderRadius: 999, marginBottom: 18 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6faf1c", display: "inline-block" }} />
                Targeted Care · Calgary North NW &amp; NE
              </div>

              <h1 style={{ fontSize: "clamp(30px, 4.2vw, 48px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.12, marginBottom: 18 }}>
                {condition.name} Relief in Calgary
              </h1>

              <p style={{ fontSize: "clamp(16px, 1.5vw, 18.5px)", lineHeight: 1.65, color: "#48535c", marginBottom: 28 }}>
                {condition.shortDescription || (condition.description ? condition.description.substring(0, 180) + "..." : "Targeted physiotherapy, joint mobilization, and exercise therapy to eliminate pain and restore function.")}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                <a
                  href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#6faf1c", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15.5, padding: "14px 28px", borderRadius: 9, boxShadow: "0 10px 24px rgba(111,175,28,0.32)", textDecoration: "none" }}
                >
                  Book Assessment Online
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

            {/* Right Hero Image Card with Rating Badge */}
            <div style={{ position: "relative" }}>
              <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 50px rgba(18,60,80,0.14)", aspectRatio: "4/3", backgroundColor: "#eef3f6" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={condition.heroImage || "/images/clinic/reception-desktop.jpg"}
                  alt={`${condition.name} Treatment at Nose Creek Physiotherapy`}
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

      {/* ── 2. TREATMENT AT-A-GLANCE BAR ── */}
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

      {/* ── 3. CLINICAL OVERVIEW & ROOT CAUSE ── */}
      <section style={{ padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
            {eyebrow("Clinical Overview", "#6faf1c")}
            <h2 style={{ fontSize: "clamp(26px, 3.8vw, 42px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: 20 }}>
              Understanding {condition.name} &amp; How We Fix the Root Cause
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.8, color: "#48535c", marginBottom: 20 }}>
              {condition.description}
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "#5a6570" }}>
              Ignoring chronic pain or relying solely on painkillers only masks the symptoms while allowing scar tissue, muscle imbalances, and joint stiffness to worsen. At Nose Creek Physiotherapy, our licensed clinicians conduct a full orthopaedic assessment to target the actual mechanical dysfunction, ensuring long-term recovery and preventing recurrence.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. COMMON SYMPTOMS GRID ── */}
      {condition.symptoms && condition.symptoms.length > 0 && (
        <section style={{ background: "#f2f8fb", padding: "clamp(56px,7vw,96px) 0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
              {eyebrow("Recognize the Signs", "#e67e22")}
              <h2 style={{ fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
                Common Symptoms of {condition.name}
              </h2>
              <p style={{ marginTop: 12, fontSize: 16.5, color: "#5a6570", lineHeight: 1.6 }}>
                If you are experiencing any of the following, our specialized Calgary physiotherapy team can help:
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              {condition.symptoms.map((symptom, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "24px 22px", border: "1px solid #e2ebf0", boxShadow: "0 6px 20px rgba(18,60,80,0.04)", display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#fff2e6", color: "#e67e22", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                    !
                  </div>
                  <div style={{ color: "#1d2b34", fontSize: 15.5, lineHeight: 1.55, fontWeight: 600 }}>
                    {symptom}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. OUR 4-STEP TREATMENT APPROACH ── */}
      <section style={{ padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
            {eyebrow("Our Treatment Roadmap", "#1c9fd8")}
            <h2 style={{ fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
              How We Treat {condition.name}
            </h2>
            <p style={{ marginTop: 12, fontSize: 16.5, color: "#5a6570", lineHeight: 1.6 }}>
              A structured, evidence-based plan tailored to your specific biomechanics and recovery goals:
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {(condition.treatmentApproach && condition.treatmentApproach.length > 0 ? condition.treatmentApproach : [
              "Thorough orthopaedic assessment and biomechanical movement analysis",
              "Hands-on joint mobilization, spinal manipulation, and soft tissue release",
              "Targeted exercise conditioning and postural re-education",
              "Personalized maintenance plan to prevent future re-injury"
            ]).map((stepText, idx) => (
              <div key={idx} style={{ background: "#fff", border: "1px solid #e2ebf0", borderRadius: 18, padding: "30px 24px", boxShadow: "0 6px 20px rgba(18,60,80,0.05)", display: "flex", flexDirection: "column" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#1c9fd8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, marginBottom: 18 }}>
                  {idx + 1}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1d2b34", marginBottom: 10 }}>Step {idx + 1}</h3>
                <p style={{ color: "#5a6570", fontSize: 14.5, lineHeight: 1.65, margin: 0 }}>{stepText}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. RECOMMENDED THERAPIES ── */}
      {relatedServiceObjects.length > 0 && (
        <section style={{ background: "#f8fafc", padding: "clamp(56px,7vw,96px) 0", borderTop: "1px solid #e7edf1", borderBottom: "1px solid #e7edf1" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
              {eyebrow("Effective Therapies", "#6faf1c")}
              <h2 style={{ fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
                Recommended Treatments for {condition.name}
              </h2>
              <p style={{ marginTop: 12, fontSize: 16.5, color: "#5a6570", lineHeight: 1.6 }}>
                Depending on your assessment, our team may recommend one or more of these specialized modalities:
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
              {relatedServiceObjects.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  style={{ display: "flex", flexDirection: "column", background: "#fff", padding: "28px 24px", borderRadius: 18, border: "1px solid #e7edf1", boxShadow: "0 6px 20px rgba(18,60,80,0.05)", textDecoration: "none" }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: service.iconBg || "#e9f5fb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <ServiceIcon type={service.iconType} color={service.iconColor || "#1c9fd8"} size={24} />
                  </div>
                  <h3 style={{ fontSize: 19, fontWeight: 700, color: "#1d2b34", marginBottom: 8 }}>{service.title}</h3>
                  <p style={{ fontSize: 14, color: "#5a6570", lineHeight: 1.6, marginBottom: 16, flexGrow: 1 }}>{service.shortDescription}</p>
                  <span style={{ fontSize: 14, color: "#0e78a8", fontWeight: 700 }}>Explore {service.title.toLowerCase()} &rarr;</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 7. MEET THE TEAM CAROUSEL (EXACTLY LIKE HOMEPAGE) ── */}
      <TeamCarousel members={allTeam} />

      {/* ── 8. FREQUENTLY ASKED QUESTIONS (EXACT HOMEPAGE STYLE) ── */}
      <section style={{ background: "#f2f8fb", padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 38 }}>
            {eyebrow("FAQ")}
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
              Frequently asked questions
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                q: `Do I need a doctor's referral to get treatment for ${condition.name}?`,
                a: "No, in Alberta you do not need a doctor's referral to see a licensed physiotherapist. You can book an appointment directly with our clinic today."
              },
              {
                q: "Is treatment covered by extended health insurance?",
                a: "Yes, physiotherapy, massage therapy, and chiropractic care for conditions like this are covered by most extended health plans, and we offer direct billing."
              },
              {
                q: `How many sessions will I need to recover from ${condition.name.toLowerCase()}?`,
                a: "Most patients experience significant pain relief and improved mobility within 3 to 6 tailored sessions. Your physiotherapist will outline a clear roadmap on your first visit."
              }
            ].map((faq, idx) => (
              <details key={idx} style={{ background: "#fff", border: "1px solid #e2ebf0", borderRadius: 14, padding: "4px 22px" }}>
                <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "18px 0", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 17, color: "#1d2b34" }}>
                  {faq.q}
                  <span className="faqPlus" style={{ color: "#1c9fd8", fontSize: 24, transition: "transform .2s", flex: "0 0 auto" }}>+</span>
                </summary>
                <p style={{ padding: "0 0 20px", fontSize: 15, lineHeight: 1.7, color: "#5a6570", margin: 0 }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. ONE CLINIC, IDEALLY LOCATED IN CALGARY (EXACT HOMEPAGE SECTION) ── */}
      <section id="contact" style={{ padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 44px" }}>
            {eyebrow("Visit us", "#6faf1c")}
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
              One clinic, ideally located in Calgary
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 28, alignItems: "stretch" }}>
            {/* Map */}
            <div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "0 10px 30px rgba(18,60,80,0.1)", minHeight: 340 }}>
              <iframe
                title="Map to Nose Creek Physiotherapy"
                src="https://www.google.com/maps?q=Nose%20Creek%20Physiotherapy%208220%20Centre%20St%20NE%20Suite%20153%2C%20Calgary%2C%20AB%20T3K%201J7&output=embed"
                style={{ width: "100%", height: "100%", minHeight: 340, border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            {/* Info card */}
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

      {/* ── 10. DECISION CTAs (Discovery + Phone Consult) ── */}
      <section style={{ background: "#f2f8fb", padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 40px" }}>
            <h2 style={{ fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
              Want help deciding if physio is right for your {condition.name.toLowerCase()}?
            </h2>
            <p style={{ marginTop: 14, fontSize: 16, color: "#5a6570", lineHeight: 1.6 }}>
              We offer two free, no-pressure ways to get all your questions answered before booking.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
            <div style={{ background: "linear-gradient(160deg,#6faf1c,#5c9515)", color: "#fff", borderRadius: 20, padding: 34 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Free Discovery Session</h3>
              <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: "#eaf6da" }}>
                Unsure if physio will resolve your pain? Come in, see the clinic and chat with a therapist — no treatment, no pressure.
              </p>
              <a href="https://www.nosecreekphysiotherapy.com/free-discovery-session/"
                style={{ display: "inline-block", marginTop: 20, background: "#fff", color: "#5c9515", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9, textDecoration: "none" }}>
                Apply for a Free Discovery Session →
              </a>
            </div>
            <div style={{ background: "linear-gradient(160deg,#1c9fd8,#1179ab)", color: "#fff", borderRadius: 20, padding: 34 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Talk to a Physio First</h3>
              <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: "#e2f2fa" }}>
                Have questions about {condition.name.toLowerCase()}? Schedule a free phone call and one of our physiotherapists will answer everything.
              </p>
              <a href="https://www.nosecreekphysiotherapy.com/telephone-consultation/"
                style={{ display: "inline-block", marginTop: 20, background: "#fff", color: "#1179ab", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9, textDecoration: "none" }}>
                Arrange a free phone consult →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. OTHER CONDITIONS EXPLORER ── */}
      <section style={{ padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          {eyebrow("Other Conditions We Treat")}
          <h2 style={{ fontSize: "clamp(24px,3.4vw,38px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", marginBottom: 24 }}>
            Explore All 17 Physical Conditions
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
            {otherConditions.map((other) => (
              <Link
                key={other.slug}
                href={`/conditions/${other.slug}`}
                style={{ background: "#f2f8fb", border: "1px solid #d7e6ef", color: "#1d2b34", padding: "10px 18px", borderRadius: 999, fontSize: 14, fontWeight: 600, textDecoration: "none" }}
              >
                {other.name} &rarr;
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. BOTTOM CTA BANNER ── */}
      <section style={{ background: "linear-gradient(120deg,#1c9fd8,#1179ab)", color: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(48px,6vw,76px) 24px", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(26px,3.8vw,44px)", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.15 }}>
            Ready to end your {condition.name.toLowerCase()} naturally?
          </h2>
          <p style={{ marginTop: 14, fontSize: 16.5, color: "#e2f2fa", lineHeight: 1.6, maxWidth: 540, marginLeft: "auto", marginRight: "auto" }}>
            Schedule your comprehensive assessment with our Calgary physiotherapists today and take your first step toward pain-free movement.
          </p>
          <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
            <a
              href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
              target="_blank" rel="noopener noreferrer"
              style={{ background: "#8cc63f", color: "#12303d", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 16, padding: "15px 30px", borderRadius: 10, boxShadow: "0 10px 24px rgba(0,0,0,0.16)", textDecoration: "none" }}
            >
              Book Assessment Online
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

      <SchemaMarkup type="MedicalBusiness" data={condition} />
    </div>
  );
}
