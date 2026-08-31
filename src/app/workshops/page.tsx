"use client";
import React, { useState } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import WorkshopRegistrationForm from "@/components/forms/WorkshopRegistrationForm";
import WorkshopReplayModal from "@/components/forms/WorkshopReplayModal";

const benefitsList = [
  "All those painkillers and anti-inflammatories just don't seem to help anymore",
  "You've been told by your doctor to just 'rest' or 'take pills' and nothing else can be done",
  "You had surgery or previous treatments, but the lasting recovery you hoped for never happened",
  "You experience back or hip pain when sitting or standing for longer than a few minutes",
  "You suffer with severe leg or sciatica shooting pain when you sit down or stand up",
  "The only way you get brief relief from back pain is when you lean forward or rest in specific postures",
  "You experience your back frequently 'giving out', or your knees 'giving way' unexpectedly",
  "You suffer from repeat tension migraines and cervicogenic headaches originating from the neck",
  "You struggle to turn your neck far enough to check blind spots or reach overhead without shoulder impingement",
  "You feel sharp or aching pain walking up and down stairs, making normal daily life difficult",
  "You are worried that leaving your pain untreated will lead to immobility, dependency, or surgery"
];

const expectationsList = [
  {
    title: "A Room Full of Like-Minded People",
    desc: "You'll connect with fellow Calgarians facing similar pain challenges who are actively seeking real answers and natural solutions."
  },
  {
    title: "Personalized Q&A With Clinical Experts",
    desc: "We take time to listen to your specific questions, previous experiences, and what you need answered before making healthcare decisions."
  },
  {
    title: "Learn How to Make the Best Treatment Decision",
    desc: "Understand the differences between manual therapy, chiropractic, IMS needling, and exercise rehab so you choose what fits you best."
  },
  {
    title: "Uncover Common Mistakes That Worsen Pain",
    desc: "Discover everyday sitting habits, incorrect stretches, and unhelpful exercises that unintentionally delay your recovery."
  },
  {
    title: "Discover the Root Cause, Not Just the Symptom",
    desc: "Learn why treating just the pain site often fails if postural misalignment, joint stiffness, or muscular imbalances are ignored."
  },
  {
    title: "A Roadmap to Long-Lasting Natural Relief",
    desc: "See what real, drug-free rehabilitation looks like without relying on invasive surgeries, steroid injections, or endless medications."
  },
  {
    title: "100% Free With Zero Sales Pressure",
    desc: "Our workshops are strictly educational. There is no obligation to book paid appointments — our goal is to empower your recovery."
  }
];

const workshopTable = [
  {
    title: "Knee Pain / Arthritis Workshop",
    date: "Event Passed",
    time: "On-Demand",
    topicVal: "Knee Pain"
  },
  {
    title: "Back Pain & Sciatica Workshop",
    date: "Event Passed",
    time: "On-Demand",
    topicVal: "Back Pain"
  },
  {
    title: "Neck & Shoulder Pain Workshop",
    date: "Event Passed",
    time: "On-Demand",
    topicVal: "Neck Pain"
  }
];

export default function WorkshopsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("Knee Pain");

  const openReplayModal = (topic: string) => {
    setSelectedTopic(topic);
    setModalOpen(true);
  };

  return (
    <div style={{ width: "100%", overflowX: "hidden", backgroundColor: "#fff" }}>
      
      {/* ── 1. HERO HEADER ── */}
      <section style={{ background: "linear-gradient(180deg, #f2f8fb 0%, #ffffff 100%)", padding: "clamp(40px, 5vw, 68px) 0 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <Breadcrumbs items={[{ label: "Workshops & Classes", href: "/workshops" }]} />

          <div style={{ textAlign: "center", maxWidth: 860, margin: "24px auto 0" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e6f4ea", color: "#5c9515", fontWeight: 700, fontSize: 13, fontFamily: "'Poppins',sans-serif", padding: "6px 16px", borderRadius: 999, marginBottom: 16 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6faf1c", display: "inline-block" }} />
              Exclusive Calgary Health Education Classes
            </div>

            <h1 style={{ fontSize: "clamp(30px, 4.4vw, 48px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.15, marginBottom: 18 }}>
              Find Out More About Our Exclusive <span style={{ color: "#1c9fd8" }}>Health Education Classes</span>
            </h1>

            <p style={{ fontSize: "clamp(16px, 1.8vw, 19px)", color: "#48535c", lineHeight: 1.6, marginBottom: 28, fontStyle: "italic", maxWidth: 780, marginLeft: "auto", marginRight: "auto" }}>
              &ldquo;Do you want to get an <strong style={{ color: "#1d2b34" }}>expert second opinion</strong> or simply find out what is causing your back, knee, or neck/shoulder pain before you commit to paying for a course of physio treatment? If so, our educational classes are perfect for you.&rdquo;
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
              <a
                href="#register"
                style={{
                  background: "#6faf1c",
                  color: "#fff",
                  fontFamily: "'Poppins',sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  padding: "14px 28px",
                  borderRadius: 10,
                  textDecoration: "none",
                  boxShadow: "0 8px 20px rgba(111,175,28,0.3)"
                }}
              >
                Request Next Class Info &darr;
              </a>
              <button
                onClick={() => openReplayModal("Knee Pain")}
                style={{
                  background: "#fff",
                  border: "1px solid #cfdce4",
                  color: "#0e78a8",
                  fontFamily: "'Poppins',sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  padding: "14px 26px",
                  borderRadius: 10,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.04)"
                }}
              >
                🎥 View Workshop Replays
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. WORKSHOP SCHEDULE & REPLAY TABLE (MATCHING ORIGINAL WORDPRESS) ── */}
      <section style={{ padding: "clamp(44px, 5vw, 64px) 0", background: "#ffffff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
          
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.4px" }}>
              Or Click Below to <span style={{ color: "#1c9fd8" }}>Access Your Preferred Workshop...</span>
            </h2>
          </div>

          <div style={{ overflowX: "auto", border: "1px solid #e7edf1", borderRadius: 16, boxShadow: "0 8px 24px rgba(18,60,80,0.06)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 600 }}>
              <thead>
                <tr style={{ background: "#1c9fd8", color: "#fff", fontFamily: "'Poppins',sans-serif", fontSize: 15, fontWeight: 700 }}>
                  <th style={{ padding: "16px 20px" }}>Workshop</th>
                  <th style={{ padding: "16px 20px" }}>Date</th>
                  <th style={{ padding: "16px 20px" }}>Access</th>
                  <th style={{ padding: "16px 20px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {workshopTable.map((row, idx) => (
                  <tr
                    key={row.title}
                    style={{
                      background: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                      borderBottom: "1px solid #eef3f6"
                    }}
                  >
                    <td style={{ padding: "18px 20px", fontWeight: 700, color: "#1d2b34", fontSize: 15.5 }}>
                      {row.title}
                    </td>
                    <td style={{ padding: "18px 20px", color: "#e65100", fontWeight: 700, fontSize: 14 }}>
                      {row.date}
                    </td>
                    <td style={{ padding: "18px 20px", color: "#5a6570", fontSize: 14 }}>
                      {row.time}
                    </td>
                    <td style={{ padding: "18px 20px", textAlign: "right" }}>
                      <button
                        onClick={() => openReplayModal(row.topicVal)}
                        style={{
                          background: "#6faf1c",
                          color: "#fff",
                          fontFamily: "'Poppins',sans-serif",
                          fontWeight: 700,
                          fontSize: 13.5,
                          padding: "10px 18px",
                          borderRadius: 8,
                          border: "none",
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(111,175,28,0.25)",
                          transition: "background 0.2s ease"
                        }}
                      >
                        View Workshop Replay &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* ── 3. FEATURED WEBINAR: ORTHOTICS WEBINAR ── */}
      <section id="webinars" style={{ padding: "clamp(48px, 6vw, 80px) 0", background: "#f8fafc", borderTop: "1px solid #e7edf1", borderBottom: "1px solid #e7edf1" }}>
        <div style={{ maxWidth: 1050, margin: "0 auto", padding: "0 24px" }}>
          
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color: "#1c9fd8", letterSpacing: "1.5px", fontSize: 13, textTransform: "uppercase", marginBottom: 8 }}>
              Upcoming Health Education Class
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3.6vw, 38px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px" }}>
              Orthotics <span style={{ color: "#1c9fd8" }}>Webinar</span>
            </h2>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1px solid #e7edf1",
              boxShadow: "0 12px 36px rgba(18,60,80,0.08)",
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 0,
              alignItems: "center"
            }}
          >
            {/* Webinar Poster Image */}
            <div style={{ padding: "clamp(24px, 4vw, 36px)", background: "linear-gradient(135deg, #f0f7fa 0%, #e2f0f7 100%)", display: "flex", justifyContent: "center", alignItems: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/workshops/orthotics-webinar.jpg"
                alt="Orthotics Webinar with Dr. Alex Toutant"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/images/workshops/orthotics-webinar.jpg";
                }}
                style={{
                  maxWidth: "280px",
                  width: "100%",
                  height: "auto",
                  borderRadius: 14,
                  boxShadow: "0 10px 30px rgba(18,60,80,0.16)",
                  display: "block"
                }}
              />
            </div>

            {/* Webinar Details & Registration */}
            <div style={{ padding: "clamp(28px, 4vw, 44px)" }}>
              <div style={{ display: "inline-block", background: "#eef6e4", color: "#486e24", fontWeight: 700, fontSize: 13, padding: "6px 14px", borderRadius: 999, marginBottom: 14, fontFamily: "'Poppins',sans-serif" }}>
                Bonus: Attend &amp; Win a FREE 60-Minute Massage!
              </div>

              <h3 style={{ fontSize: "clamp(22px, 2.8vw, 28px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.4px", lineHeight: 1.25, marginBottom: 14 }}>
                Manage Foot Pain &amp; Discover If Custom Orthotics Are Right For You
              </h3>

              <p style={{ fontSize: 15.5, color: "#48535c", lineHeight: 1.65, marginBottom: 20 }}>
                Join our <strong>Orthotics Webinar</strong> on <strong>Wednesday, April 16th at 7:00 PM</strong> hosted by <strong>Dr. Alex Toutant</strong> live over Zoom. We will provide actionable guidance to help you manage foot pain, improve biomechanics, and find out if custom orthotics can restore your pain-free mobility.
              </p>

              <div style={{ background: "#f8fafc", border: "1px solid #e7edf1", borderRadius: 12, padding: "16px 20px", marginBottom: 24, fontSize: 14.5, color: "#1d2b34", lineHeight: 1.7 }}>
                <div><strong>Date &amp; Time:</strong> Wednesday, April 16th at 7:00 PM</div>
                <div><strong>Host:</strong> Dr. Alex Toutant, DC</div>
                <div><strong>Location:</strong> Interactive Live Zoom Webinar</div>
                <div><strong>Cost:</strong> 100% Free (Registration Required)</div>
              </div>

              <a
                href="#register"
                style={{
                  display: "inline-block",
                  background: "#1c9fd8",
                  color: "#fff",
                  fontFamily: "'Poppins',sans-serif",
                  fontWeight: 700,
                  fontSize: 15.5,
                  padding: "13px 28px",
                  borderRadius: 9,
                  textDecoration: "none",
                  boxShadow: "0 6px 16px rgba(28,159,216,0.32)",
                  transition: "background 0.2s ease"
                }}
              >
                Click Here to Register &raquo;
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ── 4. WHO WILL BENEFIT (CHECKLIST) ── */}
      <section style={{ padding: "clamp(56px, 7vw, 92px) 0", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          
          <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 48px" }}>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color: "#1c9fd8", letterSpacing: "1.5px", fontSize: 13, textTransform: "uppercase", marginBottom: 8 }}>
              Who Should Attend?
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px" }}>
              These Educational Workshops Are Perfect If:
            </h2>
            <p style={{ fontSize: 16, color: "#5a6570", marginTop: 10, lineHeight: 1.55 }}>
              We know some people feel unsure, nervous, or skeptical about physical therapy. If you want honest answers without commitment, here is who benefits most:
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
            {benefitsList.map((benefit, i) => (
              <div
                key={i}
                style={{
                  background: "#f9fbfd",
                  border: "1px solid #e7edf1",
                  borderRadius: 14,
                  padding: "20px 22px",
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  boxShadow: "0 4px 14px rgba(18,60,80,0.03)"
                }}
              >
                <span style={{ width: 26, height: 26, borderRadius: "50%", background: "#eef6e4", color: "#6faf1c", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>
                  ✓
                </span>
                <span style={{ fontSize: 15, color: "#2d3748", lineHeight: 1.5, fontWeight: 500 }}>
                  {benefit}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 5. WHAT TO EXPECT (7 PILLARS) ── */}
      <section style={{ padding: "clamp(56px, 7vw, 92px) 0", background: "#f2f8fb", borderTop: "1px solid #e2ebf0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          
          <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 48px" }}>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color: "#1c9fd8", letterSpacing: "1.5px", fontSize: 13, textTransform: "uppercase", marginBottom: 8 }}>
              Inside The Workshop
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3.6vw, 40px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px" }}>
              Here&apos;s Exactly <span style={{ color: "#1c9fd8" }}>What to Expect</span>
            </h2>
            <p style={{ fontSize: 16, color: "#5a6570", marginTop: 10, lineHeight: 1.55 }}>
              A comfortable, open, educational environment focused entirely on your health goals.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {expectationsList.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid #e7edf1",
                  padding: "28px 24px",
                  boxShadow: "0 8px 24px rgba(18,60,80,0.06)",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 10, background: "#e8f4f9", color: "#0e78a8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, marginBottom: 16, fontFamily: "'Poppins',sans-serif" }}>
                  0{idx + 1}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1d2b34", marginBottom: 8 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 14.5, color: "#5a6570", lineHeight: 1.55, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 6. REGISTRATION FORM SECTION ── */}
      <section id="register" style={{ padding: "clamp(56px, 7vw, 92px) 0", background: "linear-gradient(135deg, #12303d 0%, #1a4254 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px" }}>
          
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ color: "#fff", fontSize: "clamp(26px, 3.8vw, 42px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
              Reserve Your Seat Or Request Replay Access
            </h2>
            <p style={{ color: "#c6dfea", fontSize: 16, marginTop: 10, maxWidth: 580, marginLeft: "auto", marginRight: "auto" }}>
              Fill out this quick form and our clinical team will send you the schedule, dates, and direct Zoom invitations.
            </p>
          </div>

          <WorkshopRegistrationForm />

        </div>
      </section>

      {/* ── 7. ONE CLINIC LOCATION SECTION (MATCHING HOME & OTHER PAGES) ── */}
      <section style={{ padding: "clamp(48px, 6vw, 76px) 0", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ background: "#f8fafc", border: "1px solid #e7edf1", borderRadius: 20, padding: "clamp(28px, 4vw, 44px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color: "#1c9fd8", letterSpacing: "1.5px", fontSize: 13, textTransform: "uppercase", marginBottom: 8 }}>
                Clinic Location
              </div>
              <h3 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.4px", marginBottom: 12 }}>
                One Clinic, Ideally Located in North Calgary
              </h3>
              <p style={{ fontSize: 15, color: "#5a6570", lineHeight: 1.6, marginBottom: 18 }}>
                Conveniently located in Beddington Co-op Mall on Centre Street North with free, abundant parking right in front of our doors.
              </p>
              <div style={{ fontSize: 14.5, color: "#1d2b34", lineHeight: 1.8 }}>
                <div><strong>Address:</strong> #153, 8220 Centre St NE, Calgary, AB T3K 1J7</div>
                <div><strong>Phone:</strong> <a href="tel:+14032958590" style={{ color: "#0e78a8", fontWeight: 700, textDecoration: "none" }}>403.295.8590</a></div>
                <div><strong>Fax:</strong> 403.295.8598</div>
              </div>
            </div>

            <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #cfdce4", height: 240 }}>
              <iframe
                title="Nose Creek Physiotherapy Map"
                src="https://maps.google.com/maps?q=Nose%20Creek%20Physiotherapy%208220%20Centre%20St%20NE%20Calgary&t=&z=14&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. BOTTOM CTA BANNER ── */}
      <section style={{ background: "linear-gradient(120deg,#1c9fd8,#1179ab)", color: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(48px,6vw,72px) 24px", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.15 }}>
            Prefer to speak directly with a physiotherapist?
          </h2>
          <p style={{ marginTop: 14, fontSize: 16.5, color: "#e2f2fa", lineHeight: 1.6, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
            If you have urgent questions about an injury, you can book an assessment online or request a free telephone consultation today.
          </p>
          <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
            <a
              href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: "#8cc63f", color: "#12303d", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 16, padding: "15px 28px", borderRadius: 10, boxShadow: "0 10px 24px rgba(0,0,0,0.16)", textDecoration: "none" }}
            >
              Book Treatment Online
            </a>
            <a
              href="tel:+14032958590"
              style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.5)", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 16, padding: "14px 26px", borderRadius: 10, textDecoration: "none" }}
            >
              Call 403.295.8590
            </a>
          </div>
        </div>
      </section>

      {/* ── WORKSHOP REPLAY POPUP LIGHTBOX MODAL ── */}
      <WorkshopReplayModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultWorkshop={selectedTopic}
      />

    </div>
  );
}
