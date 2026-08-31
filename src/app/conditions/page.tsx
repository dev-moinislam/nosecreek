import React from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getConditions } from "@/lib/api";

export const metadata = {
  title: "Conditions We Treat | Nose Creek Physiotherapy Calgary",
  description: "Explore the wide range of musculoskeletal, spinal, and sports injury conditions treated at Nose Creek Physiotherapy in Calgary NW & NE."
};

const eyebrow = (text: string, color = "#1c9fd8") => (
  <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color, letterSpacing: "1.5px", fontSize: 13, textTransform: "uppercase" as const, marginBottom: 12 }}>
    {text}
  </div>
);

export default async function ConditionsPage() {
  const conditions = await getConditions();

  return (
    <div style={{ width: "100%", overflowX: "hidden", backgroundColor: "#fff" }}>
      
      {/* ── 1. HERO BANNER ── */}
      <section style={{ background: "linear-gradient(180deg, #f2f8fb 0%, #ffffff 100%)", padding: "clamp(36px, 4vw, 56px) 0 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "What We Treat" }]} />
          
          <div style={{ textAlign: "center", maxWidth: 760, margin: "24px auto 0" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e6f4ea", color: "#5c9515", fontWeight: 700, fontSize: 13, fontFamily: "'Poppins',sans-serif", padding: "6px 14px", borderRadius: 999, marginBottom: 18 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6faf1c", display: "inline-block" }} />
              Where Does It Hurt?
            </div>
            
            <h1 style={{ fontSize: "clamp(30px, 4.2vw, 48px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.15 }}>
              Conditions We Treat in Calgary
            </h1>
            
            <p style={{ marginTop: 16, fontSize: "clamp(16px, 1.5vw, 18px)", color: "#5a6570", lineHeight: 1.6 }}>
              Whether you are recovering from a sports injury, struggling with chronic back pain, or dealing with whiplash from a collision, our experienced physiotherapists provide targeted, hands-on treatment for long-term recovery.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST STATS BAR ── */}
      <section style={{ background: "#12303d", color: "#eaf3f8" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(24px,3vw,36px) 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 24, textAlign: "center" }}>
          {[
            { num: "2001",  label: "Serving Calgary since" },
            { num: "24+",   label: "Years of trusted care" },
            { num: "17+",   label: "Conditions treated" },
            { num: "4.9★",  label: "545 Google reviews" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "clamp(26px,3vw,34px)", color: "#8cc63f" }}>{s.num}</div>
              <div style={{ fontSize: 13, color: "#b9cdd8", fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. CONDITIONS CARD GRID ── */}
      <section style={{ padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 48px" }}>
            {eyebrow("Find Your Area of Concern", "#6faf1c")}
            <h2 style={{ fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
              Click on your condition to see how we help
            </h2>
            <p style={{ marginTop: 12, fontSize: 16, color: "#5a6570", lineHeight: 1.6 }}>
              Select any card below to explore our targeted treatment approaches, common symptoms, and recovery plans.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {conditions.map((condition) => (
              <div
                key={condition.slug || condition.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e7edf1",
                  borderRadius: 18,
                  padding: 28,
                  boxShadow: "0 6px 20px rgba(18,60,80,0.06)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {condition.category && (
                  <div style={{
                    display: "inline-block",
                    background: "#f2f8fb",
                    color: "#0e78a8",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    padding: "4px 10px",
                    borderRadius: 6,
                    marginBottom: 14,
                    width: "fit-content",
                    fontFamily: "'Poppins',sans-serif"
                  }}>
                    {condition.category}
                  </div>
                )}
                
                <h3 style={{ fontSize: 21, fontWeight: 700, marginBottom: 10, color: "#1d2b34", lineHeight: 1.25 }}>
                  <Link href={`/conditions/${condition.slug}`} style={{ color: "#1d2b34", textDecoration: "none" }}>
                    {condition.name}
                  </Link>
                </h3>
                
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#5a6570", flexGrow: 1, marginBottom: 20 }}>
                  {condition.shortDescription || condition.description.substring(0, 140) + "..."}
                </p>
                
                <div style={{ borderTop: "1px solid #f0f4f7", paddingTop: 14, marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Link
                    href={`/conditions/${condition.slug}`}
                    style={{
                      color: "#0e78a8",
                      fontWeight: 700,
                      fontSize: 14.5,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    View treatment plan <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. DECISION CTAs (Discovery + Phone) ── */}
      <section style={{ background: "#f2f8fb", padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 40px" }}>
            <h2 style={{ fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
              Unsure what is causing your pain?
            </h2>
            <p style={{ marginTop: 14, fontSize: 16, color: "#5a6570", lineHeight: 1.6 }}>
              We offer two free ways to talk with our experienced physiotherapists before booking.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
            <div style={{ background: "linear-gradient(160deg,#6faf1c,#5c9515)", color: "#fff", borderRadius: 20, padding: 34 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Free Discovery Session</h3>
              <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: "#eaf6da" }}>
                Unsure if physio will work for your condition? Come in, meet our team, and let us confirm whether we can help — no treatment, no pressure.
              </p>
              <a href="https://www.nosecreekphysiotherapy.com/free-discovery-session/"
                style={{ display: "inline-block", marginTop: 20, background: "#fff", color: "#5c9515", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9 }}>
                Apply for a Free Discovery Session →
              </a>
            </div>
            <div style={{ background: "linear-gradient(160deg,#1c9fd8,#1179ab)", color: "#fff", borderRadius: 20, padding: 34 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Talk to a Physio First</h3>
              <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: "#e2f2fa" }}>
                Have questions about your symptoms? Schedule a free telephone consultation and one of our physiotherapists will answer everything over the phone.
              </p>
              <a href="https://www.nosecreekphysiotherapy.com/telephone-consultation/"
                style={{ display: "inline-block", marginTop: 20, background: "#fff", color: "#1179ab", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9 }}>
                Arrange a free phone consult →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. BOTTOM CTA BANNER ── */}
      <section style={{ background: "linear-gradient(120deg,#1c9fd8,#1179ab)", color: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(48px,6vw,76px) 24px", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(26px,3.8vw,44px)", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.15 }}>
            Ready to live without persistent pain?
          </h2>
          <p style={{ marginTop: 16, fontSize: 17, color: "#e2f2fa", lineHeight: 1.6, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
            Book your assessment online in under two minutes, or give us a call — extended-health direct billing available.
          </p>
          <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
            <a
              href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
              target="_blank" rel="noopener noreferrer"
              style={{ background: "#8cc63f", color: "#12303d", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 16.5, padding: "15px 30px", borderRadius: 10, boxShadow: "0 12px 28px rgba(0,0,0,0.18)" }}
            >
              Book Your Assessment Online
            </a>
            <a
              href="tel:+14032958590"
              style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.5)", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 16.5, padding: "14px 28px", borderRadius: 10 }}
            >
              Call 403.295.8590
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
