import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thank You | Nose Creek Physiotherapy",
  description: "Thank you for getting in touch with Nose Creek Physiotherapy. We have received your inquiry and will contact you shortly.",
  robots: "noindex, nofollow"
};

export default function ThanksPage() {
  return (
    <div style={{ background: "#f8fafc", minHeight: "80vh", padding: "60px 20px" }}>
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          textAlign: "center"
        }}
      >
        {/* Top Accent Ribbon */}
        <div style={{ height: 6, background: "linear-gradient(90deg, #0e78a8, #6faf1c)" }} />

        <div style={{ padding: "48px 32px" }}>
          {/* Success Animated Icon */}
          <div
            style={{
              width: 76,
              height: 76,
              background: "#ecfdf5",
              color: "#059669",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 38,
              margin: "0 auto 24px auto",
              border: "2px solid #a7f3d0"
            }}
          >
            ✓
          </div>

          <span
            style={{
              display: "inline-block",
              background: "#e0f2fe",
              color: "#0284c7",
              fontWeight: 700,
              fontSize: 12,
              padding: "4px 14px",
              borderRadius: 20,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              marginBottom: 16
            }}
          >
            Inquiry Received
          </span>

          <h1
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "clamp(26px, 4vw, 34px)",
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.2,
              marginBottom: 16
            }}
          >
            Thank You for Reaching Out!
          </h1>

          <p
            style={{
              fontSize: 16,
              color: "#475569",
              lineHeight: 1.6,
              maxWidth: 520,
              margin: "0 auto 28px auto"
            }}
          >
            We have safely received your details. One of our dedicated clinical team members will contact you within <strong>1 business day</strong> (often much sooner) to discuss your goals and arrange the best time for you.
          </p>

          {/* Urgent Need Box */}
          <div
            style={{
              background: "#f1f5f9",
              borderRadius: 12,
              padding: "20px",
              marginBottom: 32,
              textAlign: "left",
              border: "1px solid #cbd5e1"
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 6 }}>
              ⚡ In severe pain or need an immediate answer?
            </div>
            <p style={{ fontSize: 13.5, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
              You can call our reception team directly during clinic hours:
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                marginTop: 12,
                paddingTop: 12,
                borderTop: "1px dashed #cbd5e1"
              }}
            >
              <div>
                <span style={{ fontSize: 12, color: "#64748b", display: "block" }}>Beddington Clinic:</span>
                <a
                  href="tel:4032958590"
                  style={{ color: "#0e78a8", fontWeight: 700, textDecoration: "none", fontSize: 15 }}
                >
                  📞 (403) 295-8590
                </a>
              </div>
              <div>
                <span style={{ fontSize: 12, color: "#64748b", display: "block" }}>Thorncliffe Clinic:</span>
                <a
                  href="tel:4032757728"
                  style={{ color: "#0e78a8", fontWeight: 700, textDecoration: "none", fontSize: 15 }}
                >
                  📞 (403) 275-7728
                </a>
              </div>
            </div>
          </div>

          {/* Navigation CTA Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <Link
              href="/"
              style={{
                background: "#0e78a8",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
                transition: "background 0.2s"
              }}
            >
              Return to Homepage
            </Link>
            <Link
              href="/services"
              style={{
                background: "#ffffff",
                color: "#0f172a",
                border: "1px solid #cbd5e1",
                padding: "12px 24px",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
                transition: "border-color 0.2s"
              }}
            >
              Explore Our Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
