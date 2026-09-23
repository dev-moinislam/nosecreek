import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomPageBySlug, getCustomPages } from "@/lib/api";
import { resolvePageMetadata } from "@/lib/seo";
import FormattedNarrative from "@/components/ui/FormattedNarrative";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

export async function generateStaticParams() {
  try {
    const pages = await getCustomPages();
    return pages
      .filter((p) => (p.isPublished !== false && p.is_published !== false) && p.slug)
      .map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = await getCustomPageBySlug(slug);

  if (!page) {
    return {
      title: "Page Not Found | Nose Creek Physiotherapy"
    };
  }

  const pathUrl = `/${slug}`;
  const defaultTitle = page.seoTitle || `${page.title} | Nose Creek Physiotherapy Calgary`;
  const defaultDesc = page.seoDescription || page.heroSubtitle || undefined;

  return resolvePageMetadata(pathUrl, {
    title: defaultTitle,
    description: defaultDesc,
    openGraph: {
      title: defaultTitle,
      description: defaultDesc,
      url: `https://www.nosecreekphysiotherapy.com/${slug}`,
      siteName: "Nose Creek Physiotherapy",
      type: "website"
    }
  });
}

export default async function DynamicCustomLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getCustomPageBySlug(slug);

  if (!page) {
    notFound();
  }

  // Generate FAQ schema if FAQs are present
  const faqSchema = page.faqs && page.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": page.faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  const isTwoCol = page.layout === "two-column" && Boolean(page.columnTwoContent);

  return (
    <div style={{ width: "100%", overflowX: "hidden", backgroundColor: "#fff", color: "#1e293b" }}>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(135deg, #0a2540 0%, #162e4a 65%, #1c9fd8 100%)",
          color: "#ffffff",
          padding: "70px 24px 60px",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ maxWidth: 1140, margin: "0 auto", position: "relative", zIndex: 2 }}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: 20, fontSize: 13, color: "#94a3b8" }}>
            <Link href="/" style={{ color: "#38bdf8", textDecoration: "none" }}>Home</Link>
            <span style={{ margin: "0 8px", color: "#64748b" }}>/</span>
            <span style={{ color: "#e2e8f0" }}>{page.title}</span>
          </nav>

          {/* Badge */}
          {page.heroBadge && (
            <div style={{ marginBottom: 16 }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 14px",
                  borderRadius: 20,
                  backgroundColor: "rgba(56, 189, 248, 0.15)",
                  color: "#38bdf8",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  border: "1px solid rgba(56, 189, 248, 0.3)"
                }}
              >
                {page.heroBadge}
              </span>
            </div>
          )}

          {/* Heading */}
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 46px)",
              fontWeight: 800,
              lineHeight: 1.18,
              margin: "0 0 16px 0",
              color: "#ffffff",
              letterSpacing: "-0.02em",
              maxWidth: 900
            }}
          >
            {page.heroTitle || page.title}
          </h1>

          {/* Subtitle */}
          {page.heroSubtitle && (
            <p
              style={{
                fontSize: "clamp(16px, 1.8vw, 19px)",
                lineHeight: 1.6,
                color: "#e2e8f0",
                maxWidth: 820,
                margin: "0 0 32px 0"
              }}
            >
              {page.heroSubtitle}
            </p>
          )}

          {/* CTAs */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginBottom: 36 }}>
            <Link
              href={page.primaryCtaUrl || "/inquire"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "14px 28px",
                borderRadius: 8,
                backgroundColor: "#E75D2A",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
                boxShadow: "0 10px 20px -5px rgba(231, 93, 42, 0.4)",
                transition: "all 0.2s ease"
              }}
            >
              {page.primaryCtaText || "Book an Appointment"}
            </Link>

            {page.secondaryCtaText && page.secondaryCtaUrl && (
              <Link
                href={page.secondaryCtaUrl}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 26px",
                  borderRadius: 8,
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: "none",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  backdropFilter: "blur(4px)",
                  transition: "all 0.2s ease"
                }}
              >
                {page.secondaryCtaText}
              </Link>
            )}

            <a
              href="tel:4032958590"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "#93c5fd",
                fontSize: 14.5,
                fontWeight: 600,
                textDecoration: "none",
                marginLeft: 6
              }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Call (403) 295-8590</span>
            </a>
          </div>

          {/* Quick Trust Highlights */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              paddingTop: 24,
              borderTop: "1px solid rgba(255, 255, 255, 0.12)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#f59e0b", fontSize: 18 }}>★</span>
              <span style={{ fontSize: 13.5, color: "#e2e8f0" }}><strong>4.9 Rating</strong> (540+ Reviews)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#38bdf8", fontSize: 18 }}>🏥</span>
              <span style={{ fontSize: 13.5, color: "#e2e8f0" }}><strong>2 Calgary Locations</strong> (Beddington &amp; Thorncliffe)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#34d399", fontSize: 18 }}>✓</span>
              <span style={{ fontSize: 13.5, color: "#e2e8f0" }}><strong>Direct Billing</strong> to Major Insurers</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#a78bfa", fontSize: 18 }}>⚡</span>
              <span style={{ fontSize: 13.5, color: "#e2e8f0" }}><strong>Same-Day</strong> Appointments Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "60px 24px" }}>
        {isTwoCol ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 40,
              alignItems: "start"
            }}
          >
            <div>
              <FormattedNarrative content={page.content || ""} />
            </div>
            <div>
              <FormattedNarrative content={page.columnTwoContent || page.content_col2 || ""} />
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <FormattedNarrative content={page.content || ""} />
          </div>
        )}

        {/* Local Calgary Proximity Card */}
        <div
          style={{
            marginTop: 50,
            padding: "32px 28px",
            background: "#f8fafc",
            borderRadius: 16,
            border: "1px solid #e2e8f0"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "#0284c7",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18
              }}
            >
              📍
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                Convenient Calgary Locations Serving {page.neighborhoodName || "Your Community"}
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                Easy access with free parking and extended early morning &amp; evening hours
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
              marginTop: 20
            }}
          >
            <div style={{ padding: 20, background: "#ffffff", borderRadius: 12, border: "1px solid #cbd5e1" }}>
              <h4 style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 700, color: "#0284c7" }}>
                Beddington Clinic
              </h4>
              <p style={{ margin: "0 0 10px 0", fontSize: 13.5, color: "#475569", lineHeight: 1.5 }}>
                #8, 8180 11th Street NE, Calgary, AB T2E 7H6<br />
                <span style={{ fontSize: 12.5, color: "#64748b" }}>(Inside Beddington Towne Centre area)</span>
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 13 }}>
                <a href="tel:4032958590" style={{ color: "#0284c7", fontWeight: 600, textDecoration: "none" }}>
                  📞 (403) 295-8590
                </a>
                <Link href="/locations/beddington" style={{ color: "#64748b", textDecoration: "underline" }}>
                  Directions &amp; Hours →
                </Link>
              </div>
            </div>

            <div style={{ padding: 20, background: "#ffffff", borderRadius: 12, border: "1px solid #cbd5e1" }}>
              <h4 style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 700, color: "#0284c7" }}>
                Thorncliffe Clinic
              </h4>
              <p style={{ margin: "0 0 10px 0", fontSize: 13.5, color: "#475569", lineHeight: 1.5 }}>
                #201, 5615 4th Street NW, Calgary, AB T2K 1A9<br />
                <span style={{ fontSize: 12.5, color: "#64748b" }}>(Easily accessible off 4th St &amp; McKnight Blvd)</span>
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 13 }}>
                <a href="tel:4035710970" style={{ color: "#0284c7", fontWeight: 600, textDecoration: "none" }}>
                  📞 (403) 571-0970
                </a>
                <Link href="/locations/thorncliffe" style={{ color: "#64748b", textDecoration: "underline" }}>
                  Directions &amp; Hours →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs Accordion */}
        {page.faqs && page.faqs.length > 0 && (
          <div style={{ marginTop: 60 }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>
                Frequently Asked Questions
              </h2>
              <p style={{ fontSize: 15, color: "#64748b", margin: 0 }}>
                Got questions about care, appointments, or insurance coverage? We have answers.
              </p>
            </div>

            <div style={{ maxWidth: 840, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
              {page.faqs.map((faq, index) => (
                <details
                  key={index}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: "18px 22px",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                  }}
                >
                  <summary
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#1e293b",
                      listStyle: "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12
                    }}
                  >
                    <span>{faq.question}</span>
                    <span style={{ color: "#0284c7", fontSize: 18, fontWeight: 700 }}>+</span>
                  </summary>
                  <div
                    style={{
                      marginTop: 14,
                      paddingTop: 14,
                      borderTop: "1px solid #f1f5f9",
                      fontSize: 14.5,
                      color: "#475569",
                      lineHeight: 1.65
                    }}
                  >
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Bottom CTA Banner */}
      <section
        style={{
          background: "linear-gradient(135deg, #0a2540 0%, #162e4a 100%)",
          color: "#ffffff",
          padding: "60px 24px",
          textAlign: "center"
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, margin: "0 0 14px 0", color: "#ffffff" }}>
            Ready to Get Back to Doing What You Love?
          </h2>
          <p style={{ fontSize: 16, color: "#cbd5e1", lineHeight: 1.6, margin: "0 0 28px 0" }}>
            Our experienced Calgary physiotherapists are ready to help you recover faster with personalized, one-on-one care. No doctor referral required.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/inquire"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "14px 30px",
                borderRadius: 8,
                backgroundColor: "#E75D2A",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
                boxShadow: "0 10px 20px -5px rgba(231, 93, 42, 0.4)"
              }}
            >
              Inquire About Cost &amp; Availability
            </Link>

            <Link
              href="/free-discovery-session"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "14px 26px",
                borderRadius: 8,
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                border: "1px solid rgba(255, 255, 255, 0.25)"
              }}
            >
              Free Discovery Session
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
