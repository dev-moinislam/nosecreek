"use client";

import React, { useId } from "react";
import FormattedNarrative from "@/components/ui/FormattedNarrative";
import { ServiceCustomSection } from "@/types/content";
import OptimizedImage from "@/components/ui/OptimizedImage";

const eyebrow = (text: string, color = "var(--primary, #1c9fd8)", isCenter = false) => (
  <div
    style={{
      fontFamily: "'Poppins',sans-serif",
      fontWeight: 700,
      color,
      letterSpacing: "1.5px",
      fontSize: 13,
      textTransform: "uppercase",
      marginBottom: 12,
      textAlign: isCenter ? "center" : "left"
    }}
  >
    {text}
  </div>
);

export default function CustomStorySection({ section }: { section: ServiceCustomSection }) {
  const reactId = useId().replace(/:/g, "");
  const sectionId = section.id ? section.id.replace(/[^a-zA-Z0-9_-]/g, "") : `story-${reactId}`;
  const gridClass = `nc-story-grid-${sectionId}`;

  const isDark = section.background === "teal";
  const bg =
    section.background === "teal"
      ? "var(--dark, #12303d)"
      : section.background === "light"
      ? "#f8fafc"
      : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#1d2b34";
  const descColor = isDark ? "#cbdbe4" : "#48535c";
  const eyebrowColor = section.eyebrowColor || (isDark ? "var(--accent, #8cc63f)" : "var(--primary, #1c9fd8)");

  const isCenter = section.align === "center";
  const imagePosition = section.imagePosition || (section.image ? "right" : "none");
  const hasImage = Boolean(section.image && imagePosition !== "none");
  const isMobileReverse = Boolean(section.reverseMobileOrder || (section as any)?.reverse_mobile_order);

  // Mode: 2-Column Pure Text (No Image)
  const isTwoColText =
    (!hasImage || imagePosition === "none") &&
    (section.contentLayout === "2-column" || Boolean(section.contentCol2?.trim()));

  return (
    <section style={{ background: bg, color: textColor, padding: "clamp(56px,7vw,96px) 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Top Banner Image */}
        {hasImage && imagePosition === "top" && (
          <div style={{ marginBottom: 36, borderRadius: 18, overflow: "hidden", maxHeight: 440, boxShadow: "0 18px 48px rgba(0,0,0,0.12)" }}>
            <OptimizedImage
              src={section.image!}
              alt={section.title}
              width={1200}
              height={440}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        )}

        {/* ─── CASE 1: 2-COLUMN TEXT + TEXT (NO IMAGE) ─── */}
        {isTwoColText ? (
          <div>
            {/* Header above both columns */}
            <div
              style={{
                textAlign: isCenter ? "center" : "left",
                maxWidth: isCenter ? 860 : "none",
                margin: isCenter ? "0 auto 36px" : "0 0 36px"
              }}
            >
              {section.eyebrow && eyebrow(section.eyebrow, eyebrowColor, isCenter)}
              <h2 style={{ fontSize: "clamp(26px,3.6vw,42px)", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.18, color: textColor }}>
                {section.title}
              </h2>
              {section.subtitle && (
                <p style={{ marginTop: 8, fontSize: 16, fontWeight: 600, color: eyebrowColor }}>
                  {section.subtitle}
                </p>
              )}
            </div>

            {/* 2 Side-by-Side Narrative Columns */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "clamp(28px, 4.5vw, 56px)",
                alignItems: "start"
              }}
            >
              <div className="story-column-1" style={{ textAlign: isCenter ? "center" : "left" }}>
                <FormattedNarrative content={section.content || ""} isDark={isDark} />
              </div>

              <div className="story-column-2" style={{ textAlign: isCenter ? "center" : "left" }}>
                <FormattedNarrative content={section.contentCol2 || ""} isDark={isDark} />

                {section.bullets && section.bullets.length > 0 && (
                  <div
                    style={{
                      marginTop: 22,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isCenter ? "center" : "flex-start",
                      gap: 10
                    }}
                  >
                    {section.bullets.map((b, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          fontSize: 15,
                          color: descColor,
                          textAlign: isCenter ? "center" : "left"
                        }}
                      >
                        <span style={{ color: eyebrowColor, fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>✓</span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                )}

                {(section.buttonText || section.ctaText) && (
                  <div style={{ marginTop: 26, textAlign: isCenter ? "center" : "left" }}>
                    <a
                      href={section.buttonUrl || section.ctaHref || "#"}
                      style={{
                        display: "inline-block",
                        background: isDark ? "var(--accent, #8cc63f)" : "var(--primary, #1c9fd8)",
                        color: isDark ? "var(--dark, #12303d)" : "#fff",
                        fontFamily: "'Poppins',sans-serif",
                        fontWeight: 700,
                        padding: "13px 26px",
                        borderRadius: 10,
                        textDecoration: "none"
                      }}
                    >
                      {section.buttonText || section.ctaText}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ─── CASE 2: 1-COLUMN TEXT OR 2-COLUMN TEXT + IMAGE ─── */
          <>
            {/* Mobile reverse responsive style tag */}
            {hasImage && (imagePosition === "left" || imagePosition === "right") && (
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                    @media (max-width: 768px) {
                      .${gridClass} {
                        display: flex !important;
                        flex-direction: ${isMobileReverse ? "column-reverse" : "column"} !important;
                      }
                    }
                  `
                }}
              />
            )}

            <div
              className={gridClass}
              style={{
                display: hasImage && (imagePosition === "left" || imagePosition === "right") ? "grid" : "block",
                gridTemplateColumns:
                  hasImage && (imagePosition === "left" || imagePosition === "right")
                    ? "repeat(auto-fit, minmax(320px, 1fr))"
                    : "1fr",
                gap: "clamp(32px,4vw,56px)",
                alignItems: "center"
              }}
            >
              {hasImage && imagePosition === "left" && (
                <div style={{ flex: 1 }}>
                  <OptimizedImage
                    src={section.image!}
                    alt={section.title}
                    width={600}
                    height={450}
                    style={{ width: "100%", borderRadius: 18, objectFit: "cover", aspectRatio: "4/3", boxShadow: "0 18px 48px rgba(0,0,0,0.12)" }}
                  />
                </div>
              )}

              <div
                style={{
                  flex: 1,
                  textAlign: isCenter ? "center" : "left",
                  maxWidth: !hasImage || imagePosition === "none" ? (isCenter ? 860 : "none") : "none",
                  margin: !hasImage || imagePosition === "none" ? (isCenter ? "0 auto" : 0) : 0
                }}
              >
                {section.eyebrow && eyebrow(section.eyebrow, eyebrowColor, isCenter)}
                <h2 style={{ fontSize: "clamp(26px,3.6vw,40px)", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.18, color: textColor }}>
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p style={{ marginTop: 8, fontSize: 16, fontWeight: 600, color: eyebrowColor }}>
                    {section.subtitle}
                  </p>
                )}

                {Boolean(section.content) && (
                  <div style={{ marginTop: 16 }}>
                    <FormattedNarrative
                      content={section.content || ""}
                      isDark={isDark}
                    />
                  </div>
                )}

                {section.bullets && section.bullets.length > 0 && (
                  <div
                    style={{
                      marginTop: 22,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isCenter ? "center" : "flex-start",
                      gap: 10
                    }}
                  >
                    {section.bullets.map((b, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          fontSize: 15,
                          color: descColor,
                          textAlign: isCenter ? "center" : "left"
                        }}
                      >
                        <span style={{ color: eyebrowColor, fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>✓</span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                )}

                {(section.buttonText || section.ctaText) && (
                  <div style={{ marginTop: 26, textAlign: isCenter ? "center" : "left" }}>
                    <a
                      href={section.buttonUrl || section.ctaHref || "#"}
                      style={{
                        display: "inline-block",
                        background: isDark ? "var(--accent, #8cc63f)" : "var(--primary, #1c9fd8)",
                        color: isDark ? "var(--dark, #12303d)" : "#fff",
                        fontFamily: "'Poppins',sans-serif",
                        fontWeight: 700,
                        padding: "13px 26px",
                        borderRadius: 10,
                        textDecoration: "none"
                      }}
                    >
                      {section.buttonText || section.ctaText}
                    </a>
                  </div>
                )}
              </div>

              {hasImage && imagePosition === "right" && (
                <div style={{ flex: 1 }}>
                  <OptimizedImage
                    src={section.image!}
                    alt={section.title}
                    width={600}
                    height={450}
                    style={{ width: "100%", borderRadius: 18, objectFit: "cover", aspectRatio: "4/3", boxShadow: "0 18px 48px rgba(0,0,0,0.12)" }}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* Bottom Banner Image */}
        {hasImage && imagePosition === "bottom" && (
          <div style={{ marginTop: 36, borderRadius: 18, overflow: "hidden", maxHeight: 440, boxShadow: "0 18px 48px rgba(0,0,0,0.12)" }}>
            <OptimizedImage
              src={section.image!}
              alt={section.title}
              width={1200}
              height={440}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
