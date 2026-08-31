import React from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ReviewCarousel from "@/components/ui/ReviewCarousel";
import { getTestimonials } from "@/lib/api";

export const metadata = {
  title: "About Us | Nose Creek Physiotherapy Calgary",
  description: "We help people aged 30+ in Calgary restore mobility, strength, and balance with less dependence on medication. Founded by Blair Schachterle."
};

const eyebrow = (text: string, color = "#1c9fd8") => (
  <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color, letterSpacing: "1.5px", fontSize: 13, textTransform: "uppercase" as const, marginBottom: 12 }}>
    {text}
  </div>
);

export default async function AboutPage() {
  const testimonials = await getTestimonials();
  return (
    <div style={{ width: "100%", overflowX: "hidden", backgroundColor: "#fff" }}>
      
      {/* ── 1. HERO HEADER ── */}
      <section style={{ background: "linear-gradient(180deg, #f2f8fb 0%, #ffffff 100%)", padding: "clamp(36px, 4vw, 56px) 0 36px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About Us" }]} />

          <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "clamp(32px, 4vw, 48px)", alignItems: "center" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e6f4ea", color: "#5c9515", fontWeight: 700, fontSize: 13, fontFamily: "'Poppins',sans-serif", padding: "6px 14px", borderRadius: 999, marginBottom: 18 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6faf1c", display: "inline-block" }} />
                We Are Nose Creek Physiotherapy
              </div>

              <h1 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.15, marginBottom: 18 }}>
                Helping People Aged 30+ in Calgary Restore Mobility &amp; Live Pain-Free
              </h1>

              <p style={{ fontSize: "clamp(16px, 1.5vw, 18.5px)", lineHeight: 1.65, color: "#48535c", marginBottom: 28 }}>
                We help you regain strength and balance to your full potential with <strong>less dependence on medication</strong>, fewer doctor visits, and no fear of pain holding you back from living the life you deserve.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                <a
                  href="https://www.nosecreekphysiotherapy.com/free-discovery-session/"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#6faf1c", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15.5, padding: "14px 26px", borderRadius: 9, boxShadow: "0 10px 24px rgba(111,175,28,0.32)" }}
                >
                  Apply For A FREE Discovery Session →
                </a>
                <a
                  href="https://www.nosecreekphysiotherapy.com/telephone-consultation/"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "#0e78a8", border: "2px solid #cfe6f2", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15.5, padding: "12px 22px", borderRadius: 9 }}
                >
                  Request A Phone Consult
                </a>
              </div>

              <div style={{ marginTop: 22, display: "flex", flexWrap: "wrap", gap: "6px 18px", fontSize: 13.5, color: "#5a6570", fontWeight: 600 }}>
                <span>✓ Direct Insurance Billing</span>
                <span>✓ No Doctor Referral Required</span>
                <span>✓ 545+ 5-Star Reviews</span>
              </div>
            </div>

            {/* Right Clinic Hero Image */}
            <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 50px rgba(18,60,80,0.14)", aspectRatio: "4/3" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/clinic/reception-desktop.jpg"
                alt="Nose Creek Physiotherapy Clinic in Calgary"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST STATS BAR ── */}
      <section style={{ background: "#12303d", color: "#eaf3f8" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(24px,3vw,36px) 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 24, textAlign: "center" }}>
          {[
            { num: "2001",  label: "Serving Calgary since" },
            { num: "24+",   label: "Years of trusted care" },
            { num: "14+",   label: "Expert clinicians" },
            { num: "4.9★",  label: "545 Google reviews" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "clamp(26px,3vw,34px)", color: "#8cc63f" }}>{s.num}</div>
              <div style={{ fontSize: 13, color: "#b9cdd8", fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. LIVING THE LIFE YOU DESERVE & THE QUICK FIX TRAP ── */}
      <section style={{ padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "clamp(36px, 5vw, 64px)", alignItems: "center" }}>
            <div>
              {eyebrow("Our Mission", "#6faf1c")}
              <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: 20 }}>
                Get Back to Living the Life You Deserve
              </h2>
              <p style={{ fontSize: 16.5, lineHeight: 1.75, color: "#48535c", marginBottom: 18 }}>
                At <strong>Nose Creek Physiotherapy</strong>, we love to help people in their 40’s, 50’s, 60’s, and above. Our objective is simple: help you get back to living the active life you deserve.
              </p>
              <p style={{ fontSize: 16.5, lineHeight: 1.75, color: "#48535c", marginBottom: 18 }}>
                Above all, we all deserve a life <strong>free from painkillers</strong>. A life where doctor appointments are not on your to-do list every single week. Lives where you can enjoy all the things you love without the constant fear of pain holding you back.
              </p>
              <p style={{ fontSize: 16.5, lineHeight: 1.75, color: "#48535c" }}>
                When pain strikes in your knee, lower back, neck, shoulder, or foot — or if you experience an injury from sport — it is tempting to ignore it and hope it will simply “go away on its own” with time. But in reality, waiting often allows compensations to develop, making the pain far worse.
              </p>
            </div>

            {/* The Quick Fix Callout Card */}
            <div style={{ background: "#f2f8fb", borderRadius: 20, border: "1px solid #d7e6ef", padding: "clamp(30px, 4vw, 44px)", boxShadow: "0 10px 30px rgba(18,60,80,0.06)" }}>
              <div style={{ display: "inline-block", background: "#e0eff7", color: "#0e78a8", fontWeight: 700, fontSize: 12.5, textTransform: "uppercase", letterSpacing: "1px", padding: "4px 12px", borderRadius: 6, marginBottom: 16, fontFamily: "'Poppins',sans-serif" }}>
                The Quick Fix Trap
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#1d2b34", marginBottom: 14, lineHeight: 1.3 }}>
                Painkillers Only Mask the Problem
              </h3>
              <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "#5a6570", marginBottom: 16 }}>
                We know the easiest short-term fix is reaching into the medicine cabinet for pain relievers. They may take the edge off temporarily, but painkillers are <strong>not good for long-term health</strong>. They do nothing to correct the underlying biomechanical root cause.
              </p>
              <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "#5a6570" }}>
                Or maybe you are skeptical because you sought advice from healthcare professionals or another physio in the past, and nothing seemed to help. <em>If that sounds like you, you are not alone. At Nose Creek Physiotherapy, we hear this every day.</em>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. DOES ANY OF THIS SOUND FAMILIAR? ── */}
      <section style={{ background: "#f8fafc", padding: "clamp(56px,7vw,96px) 0", borderTop: "1px solid #e7edf1", borderBottom: "1px solid #e7edf1" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 48px" }}>
            {eyebrow("Sound Familiar?", "#e67e22")}
            <h2 style={{ fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
              Have You Experienced Any of These Frustrations?
            </h2>
            <p style={{ marginTop: 12, fontSize: 16.5, color: "#5a6570", lineHeight: 1.6 }}>
              Most of our patients experienced one or more of these common roadblocks before coming to see us:
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {[
              {
                title: "Hoped it would go away on its own",
                desc: "You rested and waited for days or weeks hoping it was just a temporary ache — but the pain lingered or grew worse."
              },
              {
                title: "Doctor prescribed 'Rest & More Pills'",
                desc: "Multiple visits to the doctor, only to be told to rest and take painkillers — then weeks later prescribed an even higher dose."
              },
              {
                title: "Waited months for a generic exercise sheet",
                desc: "Waited months for hospital AHS physio, only to be handed a generic printout of exercises that did nothing to quickly ease the pain."
              },
              {
                title: "YouTube exercises made it 10x worse",
                desc: "Tried exercises from YouTube or the internet, but without a diagnosis, they either did nothing or aggravated the injury further."
              },
              {
                title: "Resting made you stiffer and tighter",
                desc: "When exercise didn't help, you tried complete rest — only to find the affected joints and muscles became even stiffer and tighter."
              },
              {
                title: "Told it's 'just a part of aging'",
                desc: "Accepted the common myth that aches and pains are just what happens as you get older, instead of addressing the real physical cause."
              }
            ].map((item, idx) => (
              <div key={idx} style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2ebf0", padding: "26px 24px", boxShadow: "0 4px 16px rgba(18,60,80,0.04)", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#feebe7", color: "#e67e22", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                  ✕
                </div>
                <div>
                  <h3 style={{ fontSize: 17.5, fontWeight: 700, color: "#1d2b34", marginBottom: 8, lineHeight: 1.3 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 14.5, color: "#5a6570", lineHeight: 1.6, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Reassurance Banner */}
          <div style={{ marginTop: 40, background: "linear-gradient(135deg, #eef6e4 0%, #dcf0c4 100%)", border: "1px solid #cfe6b8", borderRadius: 18, padding: "28px 32px", textAlign: "center", maxWidth: 880, margin: "40px auto 0" }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#3a6412", marginBottom: 10 }}>
              Trying those things is actually a GOOD THING!
            </h3>
            <p style={{ fontSize: 15.5, color: "#4d6b28", lineHeight: 1.6, margin: 0 }}>
              When you know what doesn’t work, you are one step closer to finding what <strong>DOES</strong> work! Our team is dedicated to uncovering the true mechanical cause and building your custom recovery plan.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. FOUNDER STORY - BLAIR SCHACHTERLE ── */}
      <section id="founder" style={{ padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "clamp(36px, 5vw, 64px)", alignItems: "center" }}>
            
            {/* Blair Image Card */}
            <div style={{ position: "relative" }}>
              <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 50px rgba(18,60,80,0.15)", aspectRatio: "4/5" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/team/blair-schachterle.jpg"
                  alt="Blair Schachterle, Founder of Nose Creek Physiotherapy"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
              <div style={{ position: "absolute", bottom: 20, left: 20, right: 20, background: "rgba(18,48,61,0.94)", backdropFilter: "blur(6px)", color: "#fff", padding: "16px 20px", borderRadius: 14 }}>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 18 }}>Blair Schachterle</div>
                <div style={{ fontSize: 13, color: "#8cc63f", fontWeight: 700 }}>Founder &amp; Clinical Director · FCAMPT, BScPT</div>
              </div>
            </div>

            {/* Founder Narrative */}
            <div>
              {eyebrow("Our Story", "#1c9fd8")}
              <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: 20 }}>
                Founded by Blair Schachterle
              </h2>
              <p style={{ fontSize: 16.5, lineHeight: 1.75, color: "#48535c", marginBottom: 18 }}>
                Nose Creek Physiotherapy was founded by <strong>Blair Schachterle</strong>, a Fellow of the Canadian Academy of Manipulative Physiotherapy (FCAMPT). Blair has been helping Calgary residents overcome debilitating pain for over 24 years.
              </p>
              <p style={{ fontSize: 16.5, lineHeight: 1.75, color: "#48535c", marginBottom: 18 }}>
                Blair’s passion is helping anyone who wants to stay healthy and keep active so they can live their best life. We strongly believe that people aged 40+ should have access to world-class, personalized care that helps them stay mobile and painkiller-free.
              </p>
              
              <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 14 }}>
                <Link
                  href="/team"
                  style={{ background: "#12303d", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15, padding: "13px 24px", borderRadius: 9, textDecoration: "none" }}
                >
                  Meet Our Full Clinical Team →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 6. WHY CHOOSE US / 5 CORE PILLARS ── */}
      <section id="why-choose-us" style={{ background: "#f2f8fb", padding: "clamp(56px,7vw,96px) 0", scrollMarginTop: 90 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
            {eyebrow("Why Choose Us", "#6faf1c")}
            <h2 style={{ fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
              We Love To Help People: 5 Core Promises
            </h2>
            <p style={{ marginTop: 12, fontSize: 16.5, color: "#5a6570", lineHeight: 1.6 }}>
              Here is what sets Nose Creek Physiotherapy apart and why over 545 Calgarians have given us 5-star reviews:
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {[
              {
                num: "1",
                title: "Keep Active",
                desc: "Run after your kids all day, take your grandchildren to the park with ease, and enjoy a round of golf, run, or walk anytime that suits you without hesitation."
              },
              {
                num: "2",
                title: "Stay Free from Painkillers",
                desc: "Avoid reaching for medication to mask the symptoms. Painkillers are dangerous long-term; we fix the physical cause so you don't need them."
              },
              {
                num: "3",
                title: "Avoid Dangerous Surgery",
                desc: "Our team will quickly help you get to the root cause of what's going on — often within 20 minutes — so you can heal naturally without invasive surgery."
              },
              {
                num: "4",
                title: "Find Out What's Wrong",
                desc: "Get total peace of mind knowing your issue is properly diagnosed and healed with the perfect customized exercise and therapy prescription."
              },
              {
                num: "5",
                title: "Enjoy Your Best Life",
                desc: "Addressing your pain allows you to enjoy all the daily joys, hobbies, and family activities that chronic aches and stiffness stole from you."
              }
            ].map((pillar) => (
              <div key={pillar.num} style={{ background: "#fff", border: "1px solid #e7edf1", borderRadius: 18, padding: 30, boxShadow: "0 6px 20px rgba(18,60,80,0.05)", display: "flex", flexDirection: "column" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#eef6e4", color: "#5c9515", fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  {pillar.num}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1d2b34", marginBottom: 10 }}>
                  {pillar.title}
                </h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "#5a6570", margin: 0 }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CLIENT REVIEWS CAROUSEL ── */}
      <ReviewCarousel
        id="client-reviews"
        testimonials={testimonials}
        title="Real Patient Stories & 5-Star Experiences"
        subtitle="Read feedback from patients who came to see us in pain and left feeling healthy, active, and mobile"
      />

      {/* ── 8. AREAS WE SERVE ── */}
      <section id="areas-we-serve" style={{ background: "#f8fafc", padding: "clamp(48px,6vw,76px) 0", borderTop: "1px solid #e7edf1", scrollMarginTop: 90 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          {eyebrow("Convenient Calgary North Location", "#6faf1c")}
          <h2 style={{ fontSize: "clamp(24px,3.2vw,36px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.4px", marginBottom: 14 }}>
            Proudly Serving Calgary &amp; Surrounding Communities
          </h2>
          <p style={{ maxWidth: 700, margin: "0 auto 28px", fontSize: 15.5, color: "#5a6570", lineHeight: 1.6 }}>
            Our Beddington clinic is conveniently located at <strong>8220 Centre St NE #153</strong>, easily accessible with free parking for patients across North Calgary:
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, maxWidth: 840, margin: "0 auto" }}>
            {[
              "Beddington Heights", "Huntington Hills", "Thorncliffe", "Country Hills",
              "Panorama Hills", "Coventry Hills", "Evanston", "Sage Hill",
              "Harvest Hills", "Greenview", "Calgary NW", "Calgary NE"
            ].map((area) => (
              <span key={area} style={{ background: "#fff", border: "1px solid #dbe6ec", color: "#1d2b34", fontWeight: 600, fontSize: 13.5, padding: "8px 16px", borderRadius: 999 }}>
                ✓ {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. FREE DISCOVERY SESSION & COST INQUIRY ── */}
      <section style={{ background: "#f2f8fb", padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 40px" }}>
            <h2 style={{ fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
              Take the Next Step With Zero Financial Risk
            </h2>
            <p style={{ marginTop: 14, fontSize: 16, color: "#5a6570", lineHeight: 1.6 }}>
              Whether you are ready to book or want to know what it costs and check availability first:
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
            <div style={{ background: "linear-gradient(160deg,#6faf1c,#5c9515)", color: "#fff", borderRadius: 20, padding: 34 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Apply For A FREE Discovery Session</h3>
              <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: "#eaf6da" }}>
                Unsure if Physiotherapy is right for you? Come in and chat with us first. Completely free, no-obligation, and risk-free on your part.
              </p>
              <a href="https://www.nosecreekphysiotherapy.com/free-discovery-session/"
                style={{ display: "inline-block", marginTop: 20, background: "#fff", color: "#5c9515", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9 }}>
                Apply For A Free Discovery Session →
              </a>
            </div>
            <div style={{ background: "linear-gradient(160deg,#1c9fd8,#1179ab)", color: "#fff", borderRadius: 20, padding: 34 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Inquire About Cost &amp; Availability</h3>
              <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: "#e2f2fa" }}>
                Want to know treatment costs, direct billing options, and upcoming appointment availability at our clinic? Complete our quick inquiry form.
              </p>
              <a href="https://www.nosecreekphysiotherapy.com/inquire/"
                style={{ display: "inline-block", marginTop: 20, background: "#fff", color: "#1179ab", fontFamily: "'Poppins',sans-serif", fontWeight: 700, padding: "13px 24px", borderRadius: 9 }}>
                Inquire About Cost &amp; Availability →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. BOTTOM CTA BANNER ── */}
      <section style={{ background: "linear-gradient(120deg,#1c9fd8,#1179ab)", color: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(48px,6vw,76px) 24px", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(26px,3.8vw,44px)", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.15 }}>
            We would be honoured to help you manage your pain
          </h2>
          <p style={{ marginTop: 16, fontSize: 17, color: "#e2f2fa", lineHeight: 1.6, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
            We are just a phone call away. Schedule your appointment online today, or call our Calgary clinic directly.
          </p>
          <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
            <a
              href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
              target="_blank" rel="noopener noreferrer"
              style={{ background: "#8cc63f", color: "#12303d", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 16.5, padding: "15px 30px", borderRadius: 10, boxShadow: "0 12px 28px rgba(0,0,0,0.18)" }}
            >
              Book Your Appointment Online
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
