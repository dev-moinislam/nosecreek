import React from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ContactInquiryForm from "@/components/forms/ContactInquiryForm";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import settingsData from "@/data/settings.json";

export const metadata = {
  title: "Contact Nose Creek Physiotherapy | Calgary NE & NW Clinic",
  description: "Get in touch with Nose Creek Physiotherapy in Calgary. Phone: 403.295.8590. Located at 8220 Centre St NE #153. Direct insurance billing and free parking.",
  openGraph: {
    title: "Contact Nose Creek Physiotherapy | Calgary Physio Clinic",
    description: "Send an inquiry, book treatment, or call our Calgary North clinic at 403.295.8590.",
    url: "https://www.nosecreekphysiotherapy.com/contact/"
  }
};

export default function ContactPage() {
  return (
    <div style={{ width: "100%", overflowX: "hidden", backgroundColor: "#f8fafc", paddingBottom: "70px" }}>
      
      {/* ── 1. CLEAN HEADER ── */}
      <section style={{ background: "#ffffff", borderBottom: "1px solid #e7edf1", padding: "36px 0 32px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact Us" }]} />

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <h1 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", margin: "0 0 10px" }}>
              CONTACT NOSE CREEK PHYSIOTHERAPY
            </h1>
            <p style={{ fontSize: "clamp(16px, 1.4vw, 19px)", color: "#5a6570", margin: 0, lineHeight: 1.5 }}>
              Want to <strong style={{ color: "#1c9fd8" }}>Get in Touch</strong> With This Physio Clinic? Send Us an <strong style={{ color: "#6faf1c" }}>Inquiry</strong>
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. INQUIRY FORM (CENTERED & CLEAN) ── */}
      <section style={{ padding: "40px 0 20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px" }}>
          <ContactInquiryForm />
        </div>
      </section>

      {/* ── 3. CALL US & WRITE TO US (2-COLUMN CLEAN INFO BOXES) ── */}
      <section style={{ padding: "30px 0" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, alignItems: "stretch" }}>
            
            {/* Box 1: Call Us */}
            <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #e2ebf0", padding: "32px 28px", boxShadow: "0 4px 16px rgba(18,60,80,0.04)", display: "flex", flexDirection: "column" }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1d2b34", textAlign: "center", margin: "0 0 20px", borderBottom: "2px solid #eef3f6", paddingBottom: 12 }}>
                Call Us
              </h2>
              
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#1d2b34", marginBottom: 6 }}>Nose Creek Physiotherapy</div>
                <div style={{ fontSize: 15.5, color: "#5a6570", marginBottom: 4 }}>
                  <span style={{ color: "#6faf1c", fontWeight: 700 }}>📞 Phone:</span> <a href="tel:+14032958590" style={{ color: "#1d2b34", fontWeight: 700, textDecoration: "none" }}>403.295.8590</a> / <a href="tel:+15873333229" style={{ color: "#1d2b34", fontWeight: 700, textDecoration: "none" }}>587.333.3229</a>
                </div>
                <div style={{ fontSize: 15.5, color: "#5a6570" }}>
                  <span style={{ color: "#6faf1c", fontWeight: 700 }}>📠 Fax:</span> <strong style={{ color: "#1d2b34" }}>403.516.3271</strong>
                </div>
              </div>

              <div style={{ background: "#f8fafc", borderRadius: 12, padding: "16px 20px", marginTop: "auto", border: "1px solid #eef3f6" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#8a97a1", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center", marginBottom: 10 }}>
                  Clinic Hours
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#5a6570" }}>Monday – Friday:</span>
                    <strong style={{ color: "#1d2b34" }}>6:45 AM – 7:15 PM</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#5a6570" }}>Saturday:</span>
                    <strong style={{ color: "#1d2b34" }}>8:00 AM – 2:00 PM</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#5a6570" }}>Sunday:</span>
                    <strong style={{ color: "#e63946" }}>Closed</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Write To Us & Map */}
            <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #e2ebf0", padding: "32px 28px", boxShadow: "0 4px 16px rgba(18,60,80,0.04)", display: "flex", flexDirection: "column" }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1d2b34", textAlign: "center", margin: "0 0 20px", borderBottom: "2px solid #eef3f6", paddingBottom: 12 }}>
                Write To Us / Visit
              </h2>

              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 15.5, color: "#5a6570", lineHeight: 1.5 }}>
                  <span style={{ color: "#6faf1c", fontWeight: 700 }}>📍 Address:</span><br />
                  <strong style={{ color: "#1d2b34" }}>8220 Centre St NE #153, Calgary, AB T3K 1J7</strong><br />
                  <span style={{ fontSize: 13.5, color: "#8a97a1" }}>(In Beddington Co-op Shopping Centre)</span>
                </div>
              </div>

              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e2ebf0", height: 210, width: "100%", marginTop: "auto" }}>
                <iframe
                  title="Nose Creek Physiotherapy Map"
                  src="https://www.google.com/maps?q=Nose%20Creek%20Physiotherapy%208220%20Centre%20St%20NE%20Suite%20153%2C%20Calgary%2C%20AB%20T3K%201J7&output=embed"
                  style={{ width: "100%", height: "100%", border: 0, display: "block" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. "STILL THINKING ABOUT BOOKING?" 3 BUTTONS ── */}
      <section style={{ padding: "30px 0 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          
          <h3 style={{ fontSize: "clamp(19px, 2.2vw, 24px)", fontWeight: 700, color: "#1d2b34", marginBottom: 20 }}>
            Or if You&apos;re Still Thinking About Booking an Appointment...
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
            <a
              href="https://www.nosecreekphysiotherapy.com/inquire/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#6faf1c",
                color: "#ffffff",
                fontFamily: "'Poppins',sans-serif",
                fontWeight: 700,
                fontSize: 15,
                padding: "16px 20px",
                borderRadius: 10,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(111,175,28,0.25)",
                transition: "all 0.2s ease"
              }}
            >
              Inquire About Cost &amp; Availability
            </a>

            <a
              href="https://www.nosecreekphysiotherapy.com/telephone-consultation/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#6faf1c",
                color: "#ffffff",
                fontFamily: "'Poppins',sans-serif",
                fontWeight: 700,
                fontSize: 15,
                padding: "16px 20px",
                borderRadius: 10,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(111,175,28,0.25)",
                transition: "all 0.2s ease"
              }}
            >
              Request a Free Telephone Consultation
            </a>

            <a
              href="https://www.nosecreekphysiotherapy.com/free-discovery-session/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#6faf1c",
                color: "#ffffff",
                fontFamily: "'Poppins',sans-serif",
                fontWeight: 700,
                fontSize: 15,
                padding: "16px 20px",
                borderRadius: 10,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(111,175,28,0.25)",
                transition: "all 0.2s ease"
              }}
            >
              Apply for a Free Discovery Session
            </a>
          </div>

        </div>
      </section>

      <SchemaMarkup type="MedicalBusiness" data={settingsData} />
    </div>
  );
}
