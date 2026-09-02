import React from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ContactInquiryForm from "@/components/forms/ContactInquiryForm";
import VisitUsSection from "@/components/content/VisitUsSection";
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

      {/* ── 3. DYNAMIC GLOBAL VISIT US SECTION (SYNCED WITH SUPABASE & ADMIN LOCATIONS) ── */}
      <VisitUsSection />

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
