"use client";

import React from "react";
import FormattedNarrative from "@/components/ui/FormattedNarrative";
import { ServiceCustomSection } from "@/types/content";

const eyebrow = (text: string, color = "var(--primary, #1c9fd8)") => (
  <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color, letterSpacing: "1.5px", fontSize: 13, textTransform: "uppercase", marginBottom: 12 }}>
    {text}
  </div>
);

export default function CustomStorySection({ section }: { section: ServiceCustomSection }) {
  const isDark = section.background === "teal";
  const bg = section.background === "teal"
    ? "var(--dark, #12303d)"
    : section.background === "light"
    ? "#f8fafc"
    : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#1d2b34";
  const descColor = isDark ? "#cbdbe4" : "#48535c";
  const eyebrowColor = section.eyebrowColor || (isDark ? "var(--accent, #8cc63f)" : "var(--primary, #1c9fd8)");

  const imagePosition = section.imagePosition || (section.image ? "right" : "none");
  const hasImage = Boolean(section.image && imagePosition !== "none");

  return (
    <section style={{ background: bg, color: textColor, padding: "clamp(56px,7vw,96px) 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {hasImage && imagePosition === "top" && (
          <div style={{ marginBottom: 36, borderRadius: 18, overflow: "hidden", maxHeight: 440 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={section.image!}
              alt={section.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        )}

        <div
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
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={section.image!}
                alt={section.title}
                style={{ width: "100%", borderRadius: 18, objectFit: "cover", aspectRatio: "4/3", boxShadow: "0 18px 48px rgba(0,0,0,0.12)" }}
              />
            </div>
          )}

          <div>
            {section.eyebrow && eyebrow(section.eyebrow, eyebrowColor)}
            <h2 style={{ fontSize: "clamp(26px,3.6vw,40px)", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.18, color: textColor }}>
              {section.title}
            </h2>
            {section.subtitle && (
              <p style={{ marginTop: 8, fontSize: 16, fontWeight: 600, color: eyebrowColor }}>
                {section.subtitle}
              </p>
            )}
            {section.content && (
              <FormattedNarrative
                content={section.content}
                isDark={isDark}
                paragraphStyle={{ marginTop: 16, fontSize: 16, lineHeight: 1.7, color: descColor }}
              />
            )}

            {section.bullets && section.bullets.length > 0 && (
              <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                {section.bullets.map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, color: descColor }}>
                    <span style={{ color: eyebrowColor, fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            )}

            {(section.buttonText || section.ctaText) && (
              <div style={{ marginTop: 26 }}>
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
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={section.image!}
                alt={section.title}
                style={{ width: "100%", borderRadius: 18, objectFit: "cover", aspectRatio: "4/3", boxShadow: "0 18px 48px rgba(0,0,0,0.12)" }}
              />
            </div>
          )}
        </div>

        {hasImage && imagePosition === "bottom" && (
          <div style={{ marginTop: 36, borderRadius: 18, overflow: "hidden", maxHeight: 440 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={section.image!}
              alt={section.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
