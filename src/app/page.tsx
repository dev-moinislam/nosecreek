import React from "react";
import Link from "next/link";
import TeamCarousel from "@/components/ui/TeamCarousel";
import ReviewCarousel from "@/components/ui/ReviewCarousel";
import ConditionTiles from "@/components/ui/ConditionTiles";
import ServiceIcon from "@/components/ui/ServiceIcon";
import { getTeamMembers, getBlogPosts, getServices, getConditions, getTestimonials } from "@/lib/api";

// ─── Reusable inline helpers ──────────────────────────────────────────────────
const eyebrow = (text: string, color = "#1c9fd8") => (
  <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color, letterSpacing: "1.5px", fontSize: 13, textTransform: "uppercase" as const, marginBottom: 12 }}>
    {text}
  </div>
);

export default async function HomePage() {
  const [allTeam, blogPosts, services, conditions, testimonials] = await Promise.all([
    getTeamMembers(),
    getBlogPosts(),
    getServices(),
    getConditions(),
    getTestimonials()
  ]);

  // Find director (Blair Schachterle) and other team members
  const director = allTeam.find((m) => m.isDirector || m.slug === "blair-schachterle") || allTeam[0];
  const carouselTeam = allTeam.filter((m) => m.slug !== director?.slug && !m.isDirector);

  // Homepage strictly displays maximum 3 latest blog posts
  const latestBlogPosts = blogPosts.slice(0, 3);

  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>

      {/* ══════════════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ background: "linear-gradient(180deg,#f2f8fb 0%,#ffffff 100%)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(40px,6vw,80px) 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "clamp(32px,4vw,56px)", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e6f4ea", color: "#5c9515", fontWeight: 700, fontSize: 13, fontFamily: "'Poppins',sans-serif", padding: "7px 14px", borderRadius: 999, marginBottom: 20 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6faf1c", display: "inline-block" }} />
              Trusted in Calgary North since 2001
            </div>

            <h1 style={{ fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.1 }}>
              <span style={{ display: "block", fontSize: "clamp(20px,2.4vw,28px)", color: "#1d2b34", marginBottom: 6 }}>
                Physiotherapy in Calgary North
              </span>
              <span style={{ display: "block", fontSize: "clamp(30px,4.2vw,50px)", color: "#1c9fd8", lineHeight: 1.08 }}>
                Restore your mobility, strength &amp; balance naturally.
              </span>
            </h1>

            <p style={{ marginTop: 20, fontSize: "clamp(16px,1.5vw,19px)", lineHeight: 1.6, color: "#48535c", maxWidth: 560 }}>
              Serving NW &amp; NE Calgary. Our team of physiotherapists, massage &amp; movement specialists gets you moving faster and feeling better — with less dependence on medication, so you can get back to the life you deserve.
            </p>

            <div style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 14 }}>
              <a
                href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
                target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#6faf1c", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 16.5, padding: "16px 28px", borderRadius: 10, boxShadow: "0 10px 24px rgba(111,175,28,0.32)" }}
              >
                Book Your Treatment Online
              </a>
              <a
                href="tel:+14032958590"
                style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#fff", color: "#0e78a8", border: "2px solid #cfe6f2", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 16.5, padding: "14px 26px", borderRadius: 10 }}
              >
                Call 403.295.8590
              </a>
            </div>

            <div style={{ marginTop: 26, display: "flex", flexWrap: "wrap", gap: "8px 22px", fontSize: 14, color: "#5a6570", fontWeight: 600 }}>
              <span>✓ Extended-health direct billing</span>
              <span>✓ Open 7 days / evenings &amp; Saturdays</span>
              <span>✓ FCAMPT-certified team</span>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/clinic/reception-desktop.jpg"
              alt="Reception at Nose Creek Physiotherapy"
              style={{ width: "100%", borderRadius: 18, boxShadow: "0 24px 60px rgba(18,60,80,0.18)", objectFit: "cover", aspectRatio: "4/3" }}
            />
            <div style={{ position: "absolute", left: 18, bottom: -22, background: "#fff", borderRadius: 14, padding: "14px 18px", boxShadow: "0 14px 34px rgba(18,60,80,0.16)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 30, color: "#1d2b34", lineHeight: 1 }}>
                4.9<span style={{ fontSize: 16, color: "#f6c945" }}> ★</span>
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#5a6570", lineHeight: 1.3 }}>545 Google<br />reviews</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          2. INSURANCE BILLING BAR (green)
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ background: "#e6f4ea" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px", display: "flex", flexWrap: "wrap", gap: "12px 28px", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 15, color: "#3a6412" }}>
          <span>Insurance-covered physiotherapy</span>
          <span style={{ color: "#a9c98a" }}>•</span>
          <span>Extended-health direct billing available</span>
          <span style={{ color: "#a9c98a" }}>•</span>
          <span>No doctor referral needed to start</span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          3. TRUST STATS BAR (dark)
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ background: "#12303d", color: "#eaf3f8" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(30px,4vw,44px) 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 24, textAlign: "center" }}>
          {[
            { num: "2001",  label: "Serving Calgary since" },
            { num: "24+",   label: "Years of care" },
            { num: "7",     label: "Therapy services" },
            { num: "4.9★",  label: "545 Google reviews" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.4vw,38px)", color: "#8cc63f" }}>{s.num}</div>
              <div style={{ fontSize: 13.5, color: "#b9cdd8", fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          4. SERVICES
      ══════════════════════════════════════════════════════════════ */}
      <section id="services" style={{ padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 44px" }}>
            {eyebrow("Our exceptional services in NE Calgary")}
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
              Everything you need to move well, under one roof
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 22 }}>
            {services.map((svc) => (
              <Link
                key={svc.id || svc.slug}
                href={`/services/${svc.slug}`}
                style={{ display: "block", textDecoration: "none" }}
              >
                <div style={{ background: "#fff", border: "1px solid #e7edf1", borderRadius: 16, padding: 28, boxShadow: "0 6px 20px rgba(18,60,80,0.05)", height: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: svc.iconBg || "#e9f5fb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <ServiceIcon type={svc.iconType} color={svc.iconColor || "#1c9fd8"} size={26} />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#1d2b34" }}>{svc.title}</h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#5a6570", flexGrow: 1 }}>{svc.shortDescription}</p>
                  <span style={{ display: "inline-block", marginTop: 14, color: svc.ctaMuted ? "#8a97a1" : "#0e78a8", fontWeight: 700, fontSize: 14 }}>
                    {svc.ctaText || "Learn more →"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          5. WHAT WE TREAT
      ══════════════════════════════════════════════════════════════ */}
      <section id="treat" style={{ background: "#f2f8fb", padding: "clamp(56px,7vw,96px) 0" }}>
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

      {/* ══════════════════════════════════════════════════════════════
          6. ABOUT CLINIC
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "clamp(32px,4vw,56px)", alignItems: "center" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/clinic/clinic-mobile.jpg" alt="Nose Creek Physiotherapy clinic entrance"
              style={{ width: "100%", borderRadius: 14, objectFit: "cover", aspectRatio: "3/4", gridRow: "span 2" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/clinic/reception-three.jpg" alt="Treatment area"
              style={{ width: "100%", borderRadius: 14, objectFit: "cover", aspectRatio: "4/3" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/clinic/reception-four.jpg" alt="Reception desk"
              style={{ width: "100%", borderRadius: 14, objectFit: "cover", aspectRatio: "4/3" }} />
          </div>
          <div>
            {eyebrow("About Nose Creek Physiotherapy")}
            <h2 style={{ fontSize: "clamp(26px,3.6vw,40px)", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.15 }}>
              A Calgary clinic built on 20+ years of trust
            </h2>
            <p style={{ marginTop: 18, fontSize: 16, lineHeight: 1.7, color: "#48535c" }}>
              Blair Schachterle founded Nose Creek Physiotherapy in 2001. The physio and massage therapy clinic first opened in Calgary&apos;s Beddington Co-op Shopping Mall with four staff members. The response was overwhelming, and it later expanded to 2,600 square feet with five physiotherapists and two massage therapists. In 2018, we expanded again — taking on more space to meet the demand for our service.
            </p>
            <a href="https://www.nosecreekphysiotherapy.com/about/" style={{ display: "inline-block", marginTop: 22, color: "#0e78a8", fontFamily: "'Poppins',sans-serif", fontWeight: 700 }}>
              Follow our story →
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          7. TESTIMONIALS (Hidden temporarily per user request)
      ══════════════════════════════════════════════════════════════ */}
      {/* 
      <section style={{ background: "#f2f8fb", padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 44px" }}>
            {eyebrow("Real patient stories", "#6faf1c")}
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.5px" }}>What people just like you are saying</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 26 }}>
            {[
              {
                borderColor: "#1c9fd8",
                text: `"I wound up in shoulder surgery after an injury so I couldn't lift much more than about five pounds. Pre-surgery we built up the muscles so that post-surgery I'd have a faster, better recovery — which is what happened. I can now lift up to 30 pounds with my arm."`,
                img: "/images/mark.jpg",
                name: "Mark", meta: "Late 50's · Thorncliffe",
              },
              {
                borderColor: "#6faf1c",
                text: `"Am I ever glad I came to see Blair — it's changed my life! At first my husband had to drive me because with the frozen shoulder I couldn't drive or brush my teeth. Now I'm at at least 95 percent and so happy I kept coming. If you need help, I'd suggest starting here first."`,
                img: "/images/jayne.jpg",
                name: "Jayne", meta: "Early 50's · Beddington",
              },
            ].map((t) => (
              <div key={t.name} style={{ background: "#fff", borderRadius: 18, padding: 30, boxShadow: "0 10px 30px rgba(18,60,80,0.07)", borderTop: `4px solid ${t.borderColor}` }}>
                <div style={{ color: "#f6c945", fontSize: 18, letterSpacing: 2, marginBottom: 14 }}>★★★★★</div>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: "#3a444d" }}>{t.text}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22 }}>
                  <img src={t.img} alt={t.name} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }} />
                  <div>
                    <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color: "#1d2b34" }}>{t.name}</div>
                    <div style={{ fontSize: 13, color: "#7a848d" }}>{t.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 34 }}>
            <a href="https://www.nosecreekphysiotherapy.com/reviews/"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #d7e6ef", borderRadius: 999, padding: "12px 22px", fontFamily: "'Poppins',sans-serif", fontWeight: 700, color: "#1d2b34" }}>
              <span style={{ color: "#f6c945" }}>★</span> 4.9 from 545 Google reviews →
            </a>
          </div>
        </div>
      </section>
      */}

      {/* ══════════════════════════════════════════════════════════════
          8. ABOUT BLAIR (DIRECTOR) - DYNAMIC
      ══════════════════════════════════════════════════════════════ */}
      {director && (
        <section style={{ background: "#12303d", color: "#eaf3f8", padding: "clamp(56px,7vw,96px) 0" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "clamp(32px,4vw,56px)", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={director.profileImage}
                alt={`${director.name}, ${director.role}`}
                referrerPolicy="no-referrer"
                style={{ width: "min(300px,80%)", aspectRatio: "1/1", objectFit: "cover", borderRadius: "50%", border: "6px solid #1c9fd8", margin: "0 auto", boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}
              />
            </div>
            <div>
              {eyebrow("Meet the founder", "#8cc63f")}
              <h2 style={{ fontSize: "clamp(26px,3.6vw,40px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>{director.name}</h2>
              <p style={{ marginTop: 6, fontSize: 14, color: "#9fc9d9", fontWeight: 600 }}>
                {director.role}{director.title ? ` — ${director.title}` : ""}
              </p>
              <p style={{ marginTop: 16, fontSize: 15.5, lineHeight: 1.7, color: "#cbdbe4" }}>
                {director.fullBio || director.shortBio}
              </p>
              <a href={director.href || `/team/${director.slug}`}
                style={{ display: "inline-block", marginTop: 22, background: "#1c9fd8", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9 }}>
                Meet our team →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          9. TEAM CAROUSEL (DYNAMIC)
      ══════════════════════════════════════════════════════════════ */}
      <TeamCarousel members={allTeam} />

      {/* ══════════════════════════════════════════════════════════════
          10. FREE ADVICE REPORTS
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ background: "#f2f8fb", padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 40px" }}>
            {eyebrow("Free advice reports", "#6faf1c")}
            <h2 style={{ fontSize: "clamp(26px,3.6vw,42px)", fontWeight: 800, letterSpacing: "-0.5px" }}>Written by Blair Schachterle</h2>
            <p style={{ marginTop: 14, fontSize: 16, color: "#5a6570", lineHeight: 1.6 }}>
              Download a free guide for your area of concern — practical advice you can start using right away.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20 }}>
            {[
              { href: "https://www.nosecreekphysiotherapy.com/back-pain/",         bg: "linear-gradient(150deg,#e9f5fb,#cfe9f6)", titleColor: "#1c9fd8", title: "How To End\nBack Pain",            sub: "without pills or surgery",     label: "Back Pain Report" },
              { href: "https://www.nosecreekphysiotherapy.com/knee-pain/",         bg: "linear-gradient(150deg,#eef6e4,#d8ecbe)", titleColor: "#5c9515", title: "How To Stop\nKnee Pain",           sub: "without injections or a brace",label: "Knee Pain Report" },
              { href: "https://www.nosecreekphysiotherapy.com/neck-shoulder-pain/",bg: "linear-gradient(150deg,#e9f5fb,#cfe9f6)", titleColor: "#1c9fd8", title: "How To Ease\nNeck & Shoulder Pain",sub: "naturally",                    label: "Neck / Shoulder Report" },
              { href: "https://www.nosecreekphysiotherapy.com/foot-pain/",         bg: "linear-gradient(150deg,#efe9f7,#ddd0ee)", titleColor: "#7a4fb0", title: "How To Ease\nFoot Pain",           sub: "naturally",                    label: "Foot Pain Report" },
            ].map((r) => (
              <a key={r.label} href={r.href} style={{ background: "#fff", border: "1px solid #e2ebf0", borderRadius: 16, overflow: "hidden", boxShadow: "0 6px 20px rgba(18,60,80,0.06)", display: "block", textDecoration: "none" }}>
                <div style={{ aspectRatio: "1/1", background: r.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 24, textAlign: "center" }}>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: "1.5px", color: "#5a6570", textTransform: "uppercase" }}>Free Report</span>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 22, color: r.titleColor, lineHeight: 1.1, whiteSpace: "pre-line" }}>{r.title}</span>
                  <span style={{ fontSize: 12, color: "#7a848d" }}>{r.sub}</span>
                </div>
                <div style={{ padding: 16, textAlign: "center", fontFamily: "'Poppins',sans-serif", fontWeight: 700, color: "#1c9fd8" }}>{r.label}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          11. CREDENTIALS / ASSOCIATIONS
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "clamp(40px,5vw,64px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <p style={{ textAlign: "center", fontFamily: "'Poppins',sans-serif", fontWeight: 600, color: "#8a97a1", letterSpacing: "1px", fontSize: 13, textTransform: "uppercase", marginBottom: 28 }}>
            Associations &amp; credentials
          </p>
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

      {/* ══════════════════════════════════════════════════════════════
          11B. REAL 5-STAR PATIENT REVIEWS CAROUSEL
      ══════════════════════════════════════════════════════════════ */}
      <ReviewCarousel testimonials={testimonials} />

      {/* ══════════════════════════════════════════════════════════════
          12. DECIDE CTAs — FREE DISCOVERY + TALK TO PHYSIO
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 40px" }}>
            <h2 style={{ fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 800, letterSpacing: "-0.5px" }}>Want help deciding if physio is right for you?</h2>
            <p style={{ marginTop: 14, fontSize: 16, color: "#5a6570", lineHeight: 1.6 }}>
              Not quite ready to book? We offer two free, no-pressure ways to get your questions answered first.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
            <div style={{ background: "linear-gradient(160deg,#6faf1c,#5c9515)", color: "#fff", borderRadius: 20, padding: 34 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Free Discovery Session</h3>
              <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: "#eaf6da" }}>
                Unsure if physio will work for you, or had a bad experience in the past? Come in, see the clinic and find out for yourself how we can help — no treatment, no pressure.
              </p>
              <a href="https://www.nosecreekphysiotherapy.com/free-discovery-session/"
                style={{ display: "inline-block", marginTop: 20, background: "#fff", color: "#5c9515", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9 }}>
                Apply for a Free Discovery Session →
              </a>
            </div>
            <div style={{ background: "linear-gradient(160deg,#1c9fd8,#1179ab)", color: "#fff", borderRadius: 20, padding: 34 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Talk to a Physio First</h3>
              <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: "#e2f2fa" }}>
                Have questions and want to be 100% sure we can help before booking? Schedule a free call and one of our physios will answer everything over the phone.
              </p>
              <a href="https://www.nosecreekphysiotherapy.com/telephone-consultation/"
                style={{ display: "inline-block", marginTop: 20, background: "#fff", color: "#1179ab", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9 }}>
                Arrange a free phone consult →
              </a>
            </div>
          </div>
          <p style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: "#8a97a1" }}>
            There is no treatment given at a discovery session — it&apos;s for you to ask questions and for us to confirm whether we can help.
          </p>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <a href="https://www.nosecreekphysiotherapy.com/inquire/" style={{ color: "#0e78a8", fontFamily: "'Poppins',sans-serif", fontWeight: 700 }}>
              Just want to know cost &amp; availability? Inquire here →
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          13. WORKSHOPS
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ background: "#eef6e4", padding: "clamp(44px,5vw,70px) 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(24px,3.4vw,36px)", fontWeight: 800, color: "#3a6412" }}>
            Join a free health education or posture workshop
          </h2>
          <p style={{ marginTop: 14, fontSize: 16, color: "#4d6b28", lineHeight: 1.6 }}>
            Our workshops are 100% free. Request the dates and times of our next event and get practical tips you can start using right away.
          </p>
          <a href="https://www.nosecreekphysiotherapy.com/workshops/"
            style={{ display: "inline-block", marginTop: 24, background: "#6faf1c", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 16, padding: "15px 30px", borderRadius: 10, boxShadow: "0 10px 24px rgba(111,175,28,0.28)" }}>
            Request Dates &amp; Times →
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          14. SEO COPY
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "clamp(56px,7vw,90px) 0" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(26px,3.6vw,40px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
            Looking for a physiotherapist near you in Calgary?
          </h2>
          <p style={{ marginTop: 20, fontSize: 16.5, lineHeight: 1.75, color: "#48535c" }}>
            Searching for &quot;physiotherapy near me&quot; in Calgary, AB can feel overwhelming — you&apos;ve reached the right place. However big or small your issue feels, our experienced physiotherapists are eager to get started, and we take pride in every service we offer.
          </p>
          <p style={{ marginTop: 16, fontSize: 16.5, lineHeight: 1.75, color: "#48535c" }}>
            Nose Creek Physiotherapy strives to provide unequalled patient care throughout every stage of your therapy — from your first evaluation to your final billing. Every client is valuable to us, and we treat you that way from the moment you step through our doors.
          </p>
          <div style={{ marginTop: 26, display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", fontSize: 14.5, fontWeight: 600 }}>
            {[
              { label: "Calgary NW",           href: "https://www.nosecreekphysiotherapy.com/service-areas/" },
              { label: "Calgary NE",           href: "https://www.nosecreekphysiotherapy.com/service-areas/" },
              { label: "Beddington",           href: "https://www.nosecreekphysiotherapy.com/beddington/" },
              { label: "Thorncliffe & more",   href: "https://www.nosecreekphysiotherapy.com/service-areas/" },
            ].map((a) => (
              <a key={a.label} href={a.href} style={{ background: "#f2f8fb", border: "1px solid #d7e6ef", borderRadius: 999, padding: "9px 18px", color: "#1d2b34" }}>{a.label}</a>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          15. BLOG (DYNAMIC - MAX 3 POSTS ON HOMEPAGE)
      ══════════════════════════════════════════════════════════════ */}
      <section id="blog" style={{ padding: "clamp(56px,7vw,96px) 0" }}>
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

      {/* ══════════════════════════════════════════════════════════════
          16. FAQ
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ background: "#f2f8fb", padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 38 }}>
            {eyebrow("FAQ")}
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.5px" }}>Frequently asked questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                q: "What other services do you provide?",
                a: "Our team provides massage therapy, shockwave therapy, online physiotherapy (tele-health), rehabilitation, foot care and custom orthotics, acute injury management, injury recovery programs and expert advice on pain — all delivered by experienced therapists.",
              },
              {
                q: "What conditions can physiotherapy treat?",
                a: "Physiotherapy can help with a wide range of issues including back and neck pain, knee pain, shoulder and joint problems, sports injuries, motor-vehicle injuries, chronic pain, vertigo and balance issues, frozen shoulder, TMJ/jaw dysfunction, soft-tissue and connective-tissue problems, spinal stenosis, pelvic health concerns and limited range of motion.",
              },
              {
                q: "Is physiotherapy covered by my insurance?",
                a: "Physiotherapy and many of our other services are covered by extended health insurance plans, and we offer direct billing where available. No doctor referral is needed to start.",
              },
            ].map((faq) => (
              <details key={faq.q} style={{ background: "#fff", border: "1px solid #e2ebf0", borderRadius: 14, padding: "4px 22px" }}>
                <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "18px 0", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 17, color: "#1d2b34" }}>
                  {faq.q}
                  <span className="faqPlus" style={{ color: "#1c9fd8", fontSize: 24, transition: "transform .2s", flex: "0 0 auto" }}>+</span>
                </summary>
                <p style={{ padding: "0 0 20px", fontSize: 15, lineHeight: 1.7, color: "#5a6570" }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          17. LOCATION + HOURS
      ══════════════════════════════════════════════════════════════ */}
      <section id="contact" style={{ padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 44px" }}>
            {eyebrow("Visit us", "#6faf1c")}
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.5px" }}>One clinic, ideally located in Calgary</h2>
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
                <a href="tel:+14032958590" style={{ background: "#8cc63f", color: "#12303d", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "12px 20px", borderRadius: 9 }}>
                  Call 403.295.8590
                </a>
                <a href="https://www.google.com/maps/dir//Nose+Creek+Physiotherapy" target="_blank" rel="noopener noreferrer"
                  style={{ border: "1px solid #3d5b68", color: "#eaf3f8", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "12px 20px", borderRadius: 9 }}>
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

      {/* ══════════════════════════════════════════════════════════════
          18. FINAL CTA
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ background: "linear-gradient(120deg,#1c9fd8,#1179ab)", color: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(48px,6vw,80px) 24px", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.12 }}>
            Ready to move faster and feel better?
          </h2>
          <p style={{ marginTop: 16, fontSize: 17, color: "#e2f2fa", lineHeight: 1.6, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
            Book your appointment online in under two minutes, or give us a call — we&apos;d love to help you get back to the life you deserve.
          </p>
          <div style={{ marginTop: 30, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
            <a href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington" target="_blank" rel="noopener noreferrer"
              style={{ background: "#8cc63f", color: "#12303d", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 17, padding: "16px 30px", borderRadius: 10, boxShadow: "0 12px 28px rgba(0,0,0,0.18)" }}>
              Book Your Treatment Online
            </a>
            <a href="tel:+14032958590"
              style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.5)", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 17, padding: "15px 28px", borderRadius: 10 }}>
              Call 403.295.8590
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
