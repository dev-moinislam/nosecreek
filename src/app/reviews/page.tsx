import React from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ReviewCarousel from "@/components/ui/ReviewCarousel";
import { getTestimonials } from "@/lib/api";
import { resolvePageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return resolvePageMetadata("/reviews", {
    title: "Patient Reviews & Testimonials | Nose Creek Physiotherapy Calgary",
    description:
      "Read real 5-star reviews from over 545 Calgary patients. See how our physiotherapists and chiropractors helped them overcome chronic back, neck, and joint pain."
  });
}

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const testimonials = await getTestimonials();

  const reviewsSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: "Nose Creek Physiotherapy",
    url: "https://www.nosecreekphysiotherapy.com",
    telephone: "+14032958590",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      bestRating: "5",
      worstRating: "1",
      ratingCount: "545",
      reviewCount: "545"
    },
    review: testimonials.slice(0, 10).map((t) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: t.author
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: t.rating || 5,
        bestRating: "5"
      },
      reviewBody: t.text
    }))
  };

  return (
    <div style={{ width: "100%", overflowX: "hidden", backgroundColor: "#fff" }}>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsSchema) }}
      />

      {/* Hero Header */}
      <section
        style={{
          background: "linear-gradient(180deg, #f2f8fb 0%, #ffffff 100%)",
          padding: "clamp(36px, 4vw, 56px) 0 36px"
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Patient Reviews" }]}
          />

          <div
            style={{
              marginTop: 24,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 36,
              alignItems: "center"
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#e6f4ea",
                  color: "#5c9515",
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: "'Poppins',sans-serif",
                  padding: "6px 14px",
                  borderRadius: 999,
                  marginBottom: 16
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#6faf1c",
                    display: "inline-block"
                  }}
                />
                Verified Patient Experiences
              </div>

              <h1
                style={{
                  fontSize: "clamp(30px, 4vw, 48px)",
                  fontWeight: 800,
                  color: "#1d2b34",
                  letterSpacing: "-0.5px",
                  lineHeight: 1.15,
                  marginBottom: 18
                }}
              >
                Real 5-Star Reviews From Our Calgary Patients
              </h1>

              <p
                style={{
                  fontSize: "clamp(16px, 1.5vw, 18.5px)",
                  lineHeight: 1.65,
                  color: "#48535c",
                  marginBottom: 24
                }}
              >
                Discover why over <strong>545+ Calgary residents</strong> trust
                Nose Creek Physiotherapy for lasting relief from joint stiffness,
                sports injuries, back pain, and chronic tension.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                <a
                  href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "#6faf1c",
                    color: "#fff",
                    fontFamily: "'Poppins',sans-serif",
                    fontWeight: 700,
                    fontSize: 15.5,
                    padding: "13px 26px",
                    borderRadius: 9,
                    boxShadow: "0 8px 20px rgba(111,175,28,0.3)",
                    textDecoration: "none"
                  }}
                >
                  Book Your Appointment →
                </a>
                <Link
                  href="/contact"
                  style={{
                    background: "#fff",
                    color: "#0e78a8",
                    border: "2px solid #cfe6f2",
                    fontFamily: "'Poppins',sans-serif",
                    fontWeight: 700,
                    fontSize: 15.5,
                    padding: "11px 22px",
                    borderRadius: 9,
                    textDecoration: "none"
                  }}
                >
                  Ask a Question
                </Link>
              </div>
            </div>

            {/* Google Rating Summary Card */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #d7e6ef",
                borderRadius: 20,
                padding: "clamp(28px, 4vw, 36px)",
                boxShadow: "0 16px 40px rgba(18,60,80,0.08)",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span
                  style={{
                    fontFamily: "'Poppins',sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#1d2b34"
                  }}
                >
                  Google Rating
                </span>
              </div>

              <div
                style={{
                  fontSize: 52,
                  fontWeight: 900,
                  fontFamily: "'Poppins',sans-serif",
                  color: "#1d2b34",
                  lineHeight: 1
                }}
              >
                4.9
              </div>

              <div
                style={{
                  color: "#f59e0b",
                  fontSize: 24,
                  margin: "8px 0 6px",
                  letterSpacing: 3
                }}
              >
                ★★★★★
              </div>

              <p style={{ fontSize: 14.5, color: "#5a6570", margin: "0 0 18px" }}>
                Based on <strong>545+ authentic patient reviews</strong> across Calgary
              </p>

              <div
                style={{
                  display: "inline-block",
                  background: "#f0f8ff",
                  border: "1px solid #c9e4f5",
                  borderRadius: 10,
                  padding: "8px 16px",
                  fontSize: 13,
                  color: "#0e78a8",
                  fontWeight: 600
                }}
              >
                ✓ 100% Authentic Patient Testimonials
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Google Reviews Widget Feed */}
      <ReviewCarousel id="patient-reviews-feed" layout="masonry" testimonials={testimonials} />

      {/* Cross-linking to Services and Conditions */}
      <section style={{ padding: "0 0 clamp(48px, 6vw, 80px) 0", backgroundColor: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

          {/* Cross-linking to Services and Conditions */}
          <div
            style={{
              marginTop: 64,
              background: "#f2f8fb",
              borderRadius: 20,
              padding: "clamp(32px, 4vw, 48px)",
              border: "1px solid #d7e6ef"
            }}
          >
            <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 32px" }}>
              <h2
                style={{
                  fontSize: "clamp(22px, 3vw, 32px)",
                  fontWeight: 800,
                  color: "#1d2b34",
                  marginBottom: 10
                }}
              >
                Ready to Experience Pain Relief Yourself?
              </h2>
              <p style={{ fontSize: 16, color: "#5a6570", lineHeight: 1.6 }}>
                Explore the conditions we treat or meet our experienced Calgary clinical team:
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16
              }}
            >
              {[
                { title: "Back Pain & Sciatica", href: "/conditions/back-pain-sciatica" },
                { title: "Neck Pain & Headaches", href: "/conditions/neck-pain-headaches" },
                { title: "Knee Pain & Arthritis", href: "/conditions/knee-pain" },
                { title: "Shoulder Pain & Rotator Cuff", href: "/conditions/shoulder-pain" },
                { title: "Physiotherapy Services", href: "/services/physiotherapy" },
                { title: "Chiropractic Care", href: "/services/chiropractic" },
                { title: "IMS Dry Needling", href: "/services/dry-needling" },
                { title: "Meet The Clinical Team", href: "/team" }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    background: "#fff",
                    border: "1px solid #dbe6ec",
                    borderRadius: 12,
                    padding: "16px 20px",
                    fontWeight: 700,
                    color: "#0e78a8",
                    fontSize: 14.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    textDecoration: "none",
                    boxShadow: "0 2px 8px rgba(18,60,80,0.03)"
                  }}
                >
                  <span>{item.title}</span>
                  <span style={{ color: "#6faf1c" }}>&rarr;</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Booking CTA */}
      <section
        style={{
          background: "linear-gradient(120deg,#1c9fd8,#1179ab)",
          color: "#fff",
          padding: "clamp(48px, 6vw, 76px) 24px",
          textAlign: "center"
        }}
      >
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          <h2
            style={{
              color: "#fff",
              fontSize: "clamp(26px, 3.8vw, 44px)",
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: 16
            }}
          >
            Start Your Recovery Journey Today
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "#e2f2fa",
              lineHeight: 1.6,
              maxWidth: 580,
              margin: "0 auto 28px"
            }}
          >
            Direct billing available. No doctor referral required. Same-week appointments
            available at our North Calgary clinic.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              justifyContent: "center"
            }}
          >
            <a
              href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "#8cc63f",
                color: "#12303d",
                fontFamily: "'Poppins',sans-serif",
                fontWeight: 700,
                fontSize: 16.5,
                padding: "15px 30px",
                borderRadius: 10,
                boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
                textDecoration: "none"
              }}
            >
              Book Online Now
            </a>
            <a
              href="tel:+14032958590"
              style={{
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.5)",
                color: "#fff",
                fontFamily: "'Poppins',sans-serif",
                fontWeight: 700,
                fontSize: 16.5,
                padding: "14px 28px",
                borderRadius: 10,
                textDecoration: "none"
              }}
            >
              Call 403.295.8590
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
