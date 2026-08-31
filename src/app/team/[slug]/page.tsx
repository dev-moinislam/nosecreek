import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ServiceIcon from "@/components/ui/ServiceIcon";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import {
  getTeamMemberBySlug,
  getTeamMembers,
  getServices,
  getLocations
} from "@/lib/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const team = await getTeamMembers();
  return team.map((m) => ({
    slug: m.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);

  if (!member) {
    return {
      title: "Practitioner Not Found | Nose Creek Physiotherapy"
    };
  }

  return {
    title: `${member.name} | ${member.role} | Nose Creek Physiotherapy Calgary`,
    description: member.seo?.description || member.shortBio || member.fullBio,
    openGraph: {
      title: member.seo?.ogTitle || `${member.name} | Nose Creek Physiotherapy`,
      description: member.seo?.ogDescription || member.shortBio,
      images: [{ url: member.profileImage }]
    }
  };
}

const eyebrow = (text: string, color = "#1c9fd8") => (
  <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color, letterSpacing: "1.5px", fontSize: 13, textTransform: "uppercase" as const, marginBottom: 12 }}>
    {text}
  </div>
);

export default async function TeamMemberDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);

  if (!member) {
    notFound();
  }

  // Cross-reference data
  const [allTeam, allServices, allLocations] = await Promise.all([
    getTeamMembers(),
    getServices(),
    getLocations()
  ]);

  const memberServices = allServices.filter((s) =>
    (member.services ?? []).includes(s.id) || (member.services ?? []).includes(s.slug)
  );

  const memberLocations = allLocations.filter((l) =>
    (member.locations ?? []).includes(l.slug) || (member.locations ?? []).includes(l.id)
  );

  const otherTeamMembers = allTeam.filter((m) => m.slug !== member.slug);

  return (
    <div style={{ width: "100%", overflowX: "hidden", backgroundColor: "#fff" }}>
      
      {/* ── 1. HERO HEADER BANNER ── */}
      <section style={{ background: "linear-gradient(180deg, #f2f8fb 0%, #ffffff 100%)", padding: "clamp(36px, 4vw, 56px) 0 36px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Our Team", href: "/team" },
              { label: member.name }
            ]}
          />

          <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "clamp(28px, 4vw, 44px)", alignItems: "center" }}>
            
            {/* Avatar Headshot */}
            <div style={{ maxWidth: 320, borderRadius: 20, overflow: "hidden", boxShadow: "0 18px 45px rgba(18,60,80,0.14)", aspectRatio: "3/4", backgroundColor: "#eef3f6" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={member.profileImage}
                alt={member.name}
                referrerPolicy="no-referrer"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
              />
            </div>

            {/* Header Info */}
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e6f4ea", color: "#5c9515", fontWeight: 700, fontSize: 13, fontFamily: "'Poppins',sans-serif", padding: "6px 14px", borderRadius: 999, marginBottom: 14 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6faf1c", display: "inline-block" }} />
                {member.role}
              </div>

              <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.15, marginBottom: 8 }}>
                {member.name}
              </h1>

              {member.title && (
                <div style={{ fontSize: 15, color: "#0e78a8", fontWeight: 600, fontFamily: "'Poppins',sans-serif", marginBottom: 16 }}>
                  {member.title}
                </div>
              )}

              <p style={{ fontSize: 16.5, lineHeight: 1.65, color: "#48535c", marginBottom: 24, maxWidth: 620 }}>
                {member.shortBio}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                <a
                  href={member.bookingUrl || "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#6faf1c", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15.5, padding: "13px 26px", borderRadius: 9, boxShadow: "0 10px 24px rgba(111,175,28,0.32)", textDecoration: "none" }}
                >
                  Book With {member.name.split(" ")[0]}
                </a>
                <a
                  href="tel:+14032958590"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "#0e78a8", border: "2px solid #cfe6f2", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15.5, padding: "11px 22px", borderRadius: 9, textDecoration: "none" }}
                >
                  Call 403.295.8590
                </a>
              </div>

              <div style={{ marginTop: 22, display: "flex", flexWrap: "wrap", gap: "6px 18px", fontSize: 13.5, color: "#5a6570", fontWeight: 600 }}>
                <span>✓ Direct Insurance Billing</span>
                <span>✓ Personalized Care</span>
                <span>✓ Open 7 Days / Evenings</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. MAIN DETAILS & SIDEBAR LAYOUT ── */}
      <section style={{ padding: "clamp(48px, 6vw, 84px) 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "clamp(36px, 5vw, 64px)", alignItems: "start" }}>
            
            {/* Left Column: Biography, Specialties, Education, Services */}
            <div style={{ flex: "1 1 640px" }}>
              
              {/* Biography */}
              <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e7edf1", padding: "clamp(28px, 4vw, 40px)", boxShadow: "0 8px 24px rgba(18,60,80,0.05)", marginBottom: 36 }}>
                {eyebrow("Background & Philosophy", "#6faf1c")}
                <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.4px", marginBottom: 18 }}>
                  About {member.name}
                </h2>
                <p style={{ fontSize: "1.0625rem", lineHeight: 1.8, color: "#48535c" }}>
                  {member.fullBio || member.shortBio}
                </p>

                {/* Specialties */}
                {member.specialties && member.specialties.length > 0 && (
                  <div style={{ marginTop: 28, borderTop: "1px solid #f0f4f7", paddingTop: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1d2b34", marginBottom: 14 }}>
                      Clinical Specialties &amp; Focus Areas
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {member.specialties.map((spec, i) => (
                        <span
                          key={i}
                          style={{
                            background: "#f2f8fb",
                            color: "#0e78a8",
                            border: "1px solid #d7e6ef",
                            padding: "6px 14px",
                            borderRadius: 999,
                            fontSize: 13.5,
                            fontWeight: 600,
                            fontFamily: "'Poppins',sans-serif"
                          }}
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Education & Certifications */}
              {((member.education && member.education.length > 0) || (member.certifications && member.certifications.length > 0) || (member.credentials && member.credentials.length > 0)) && (
                <div style={{ background: "#f2f8fb", borderRadius: 18, border: "1px solid #d7e6ef", padding: "clamp(28px, 4vw, 40px)", marginBottom: 36 }}>
                  {eyebrow("Qualifications")}
                  <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.4px", marginBottom: 20 }}>
                    Education &amp; Certifications
                  </h2>

                  {member.education && member.education.length > 0 && (
                    <div style={{ marginBottom: 22 }}>
                      <h3 style={{ fontSize: 16.5, fontWeight: 700, color: "#1d2b34", marginBottom: 10 }}>
                        Academic Background
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {member.education.map((edu, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, color: "#48535c", background: "#fff", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2ebf0" }}>
                            <span style={{ color: "#5c9515", fontWeight: 800 }}>✓</span>
                            <span>{edu}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {member.certifications && member.certifications.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: 16.5, fontWeight: 700, color: "#1d2b34", marginBottom: 10 }}>
                        Specialized Certifications
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {member.certifications.map((cert, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, color: "#48535c", background: "#fff", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2ebf0" }}>
                            <span style={{ color: "#1c9fd8", fontWeight: 800 }}>★</span>
                            <span>{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Services Offered */}
              {memberServices.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e7edf1", padding: "clamp(28px, 4vw, 40px)", boxShadow: "0 8px 24px rgba(18,60,80,0.05)" }}>
                  {eyebrow("Therapies Provided", "#6faf1c")}
                  <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.4px", marginBottom: 20 }}>
                    Services Offered by {member.name.split(" ")[0]}
                  </h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                    {memberServices.map((service) => (
                      <Link
                        key={service.slug}
                        href={`/services/${service.slug}`}
                        style={{ display: "block", background: "#f8fafc", padding: 20, borderRadius: 14, border: "1px solid #e7edf1", textDecoration: "none" }}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: service.iconBg || "#e9f5fb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                          <ServiceIcon type={service.iconType} color={service.iconColor || "#1c9fd8"} size={22} />
                        </div>
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1d2b34", marginBottom: 6 }}>{service.title}</h3>
                        <p style={{ fontSize: 13, color: "#5a6570", lineHeight: 1.5, marginBottom: 10 }}>{service.shortDescription}</p>
                        <span style={{ fontSize: 13, color: "#0e78a8", fontWeight: 700 }}>View service details &rarr;</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Sidebar */}
            <aside style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              
              {/* Card 1: Book Appointment Widget (Dark Teal Theme) */}
              <div style={{ background: "#12303d", color: "#eaf3f8", borderRadius: 18, padding: "32px 26px", boxShadow: "0 14px 34px rgba(18,48,61,0.2)" }}>
                <div style={{ display: "inline-block", background: "rgba(140,198,63,0.18)", color: "#8cc63f", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "1px", padding: "4px 10px", borderRadius: 6, marginBottom: 14, fontFamily: "'Poppins',sans-serif" }}>
                  Direct Booking
                </div>
                <h3 style={{ color: "#fff", fontSize: 22, fontWeight: 800, lineHeight: 1.25, letterSpacing: "-0.3px", marginBottom: 12 }}>
                  Schedule With {member.name.split(" ")[0]}
                </h3>
                <p style={{ fontSize: 14.5, color: "#cbdbe4", lineHeight: 1.6, marginBottom: 22 }}>
                  Book your appointment online directly, or call our Calgary clinic.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <a
                    href={member.bookingUrl || "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      background: "#6faf1c",
                      color: "#fff",
                      fontFamily: "'Poppins',sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      padding: "14px 20px",
                      borderRadius: 9,
                      textAlign: "center",
                      boxShadow: "0 6px 16px rgba(111,175,28,0.32)",
                      textDecoration: "none"
                    }}
                  >
                    Book Online Now
                  </a>
                  <a
                    href="tel:+14032958590"
                    style={{
                      display: "block",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      color: "#fff",
                      fontFamily: "'Poppins',sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      padding: "13px 20px",
                      borderRadius: 9,
                      textAlign: "center",
                      textDecoration: "none"
                    }}
                  >
                    Call 403.295.8590
                  </a>
                </div>

                <div style={{ borderTop: "1px solid #244452", marginTop: 22, paddingTop: 16, fontSize: 13, color: "#9fc9d9", lineHeight: 1.55 }}>
                  ✓ Extended health direct billing<br />
                  ✓ No doctor referral required<br />
                  ✓ Early morning &amp; evening hours
                </div>
              </div>

              {/* Card 2: Practitioner Quick Details */}
              <div style={{ background: "#fff", border: "1px solid #e7edf1", borderRadius: 18, padding: "28px 24px", boxShadow: "0 6px 20px rgba(18,60,80,0.05)" }}>
                <h4 style={{ fontSize: 18, fontWeight: 800, color: "#1d2b34", marginBottom: 16, letterSpacing: "-0.3px" }}>
                  Practitioner Overview
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 14 }}>
                  {member.experience && (
                    <div style={{ borderBottom: "1px solid #f0f4f7", paddingBottom: 10 }}>
                      <span style={{ color: "#8a97a1", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Experience</span>
                      <div style={{ fontWeight: 600, color: "#1d2b34", marginTop: 2 }}>{member.experience}</div>
                    </div>
                  )}
                  {member.languages && member.languages.length > 0 && (
                    <div style={{ borderBottom: "1px solid #f0f4f7", paddingBottom: 10 }}>
                      <span style={{ color: "#8a97a1", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Languages Spoken</span>
                      <div style={{ fontWeight: 600, color: "#1d2b34", marginTop: 2 }}>{member.languages.join(", ")}</div>
                    </div>
                  )}
                  {member.phone && (
                    <div style={{ borderBottom: "1px solid #f0f4f7", paddingBottom: 10 }}>
                      <span style={{ color: "#8a97a1", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Direct Clinic Phone</span>
                      <div style={{ fontWeight: 600, color: "#1d2b34", marginTop: 2 }}>
                        <a href="tel:+14032958590" style={{ color: "#0e78a8", textDecoration: "none" }}>{member.phone}</a>
                      </div>
                    </div>
                  )}
                  <div>
                    <span style={{ color: "#8a97a1", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Clinic Location</span>
                    <div style={{ fontWeight: 600, color: "#1d2b34", marginTop: 2 }}>
                      Nose Creek Physiotherapy<br />
                      <span style={{ fontSize: 13, color: "#5a6570", fontWeight: 400 }}>8220 Centre St NE #153, Calgary, AB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Other Team Members */}
              <div style={{ background: "#fff", border: "1px solid #e7edf1", borderRadius: 18, padding: "28px 24px", boxShadow: "0 6px 20px rgba(18,60,80,0.05)" }}>
                <h4 style={{ fontSize: 18, fontWeight: 800, color: "#1d2b34", marginBottom: 16, letterSpacing: "-0.3px" }}>
                  Other Team Members
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 320, overflowY: "auto" }}>
                  {otherTeamMembers.slice(0, 6).map((other) => (
                    <Link
                      key={other.slug}
                      href={`/team/${other.slug}`}
                      style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", padding: "6px 8px", borderRadius: 10, background: "#f8fafc" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={other.profileImage}
                        alt={other.name}
                        referrerPolicy="no-referrer"
                        style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1d2b34", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{other.name}</div>
                        <div style={{ fontSize: 12, color: "#6faf1c", fontWeight: 600 }}>{other.role}</div>
                      </div>
                    </Link>
                  ))}
                  <Link href="/team" style={{ textAlign: "center", color: "#0e78a8", fontWeight: 700, fontSize: 13.5, marginTop: 8, textDecoration: "none" }}>
                    View all 14 team members →
                  </Link>
                </div>
              </div>

              {/* Card 4: Free Discovery Session */}
              <div style={{ background: "linear-gradient(160deg, #eef6e4 0%, #dcf0c4 100%)", border: "1px solid #cfe6b8", borderRadius: 18, padding: "28px 24px" }}>
                <h4 style={{ fontSize: 18, fontWeight: 800, color: "#3a6412", marginBottom: 8 }}>
                  Free Discovery Session
                </h4>
                <p style={{ fontSize: 13.5, color: "#4d6b28", lineHeight: 1.5, marginBottom: 16 }}>
                  Unsure if physio is right for you? Come in and chat with our team first — no treatment, no obligation.
                </p>
                <a
                  href="https://www.nosecreekphysiotherapy.com/free-discovery-session/"
                  style={{
                    display: "inline-block",
                    color: "#3a6412",
                    fontFamily: "'Poppins',sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: "none"
                  }}
                >
                  Apply for Free Session →
                </a>
              </div>

            </aside>

          </div>
        </div>
      </section>

      {/* ── 3. BOTTOM CTA BANNER ── */}
      <section style={{ background: "linear-gradient(120deg,#1c9fd8,#1179ab)", color: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(48px,6vw,76px) 24px", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(26px,3.8vw,44px)", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.15 }}>
            Ready to start your recovery with {member.name.split(" ")[0]}?
          </h2>
          <p style={{ marginTop: 14, fontSize: 16.5, color: "#e2f2fa", lineHeight: 1.6, maxWidth: 540, marginLeft: "auto", marginRight: "auto" }}>
            Book your session online today or contact our clinic to discuss appointment options.
          </p>
          <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
            <a
              href={member.bookingUrl || "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"}
              target="_blank" rel="noopener noreferrer"
              style={{ background: "#8cc63f", color: "#12303d", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 16, padding: "15px 30px", borderRadius: 10, boxShadow: "0 10px 24px rgba(0,0,0,0.16)", textDecoration: "none" }}
            >
              Book With {member.name.split(" ")[0]} Online
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

      <SchemaMarkup type="Person" data={member} />
    </div>
  );
}
