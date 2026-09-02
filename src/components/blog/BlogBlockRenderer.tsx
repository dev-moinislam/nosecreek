"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BlogContentBlock } from "@/types/content";
import styles from "@/app/blog/[slug]/blog-post.module.css";

interface BlogBlockRendererProps {
  blocks?: BlogContentBlock[];
  fallbackHtml?: string;
}

export default function BlogBlockRenderer({ blocks, fallbackHtml }: BlogBlockRendererProps) {
  // If no blocks, fallback to standard single HTML content
  if (!blocks || blocks.length === 0) {
    if (!fallbackHtml) return null;
    return (
      <div
        className={styles.articleBody}
        dangerouslySetInnerHTML={{ __html: fallbackHtml }}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36, width: "100%" }}>
      {blocks.map((block, idx) => (
        <SingleBlockView key={block.id || `block-${idx}`} block={block} />
      ))}
    </div>
  );
}

function SingleBlockView({ block }: { block: BlogContentBlock }) {
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({});

  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  switch (block.type) {
    // ── 1. RICH TEXT CONTENT BLOCK ──
    case "richtext":
      return (
        <div
          className={styles.articleBody}
          style={{ width: "100%" }}
          dangerouslySetInnerHTML={{ __html: block.content || "" }}
        />
      );

    // ── 2. CUSTOM SECTION (IMAGE + BULLETS + CTA) ──
    case "custom_section": {
      const isDark = block.background === "gradient";
      const bgMap: Record<string, string> = {
        white: "#ffffff",
        light: "#f8fafc",
        teal: "#f2f8fb",
        gradient: "linear-gradient(135deg, #12303d 0%, #1e4555 100%)"
      };
      const bgStyle = bgMap[block.background || "white"] || "#ffffff";
      const textColor = isDark ? "#ffffff" : "#1d2b34";
      const mutedColor = isDark ? "#cbdbe4" : "#5a6570";
      const borderColor = isDark ? "rgba(255,255,255,0.12)" : "#e7edf1";

      const imagePosition = block.imagePosition || (block.image ? "right" : "none");
      const hasImage = Boolean(block.image && imagePosition !== "none");

      return (
        <div
          style={{
            background: bgStyle,
            color: textColor,
            border: `1px solid ${borderColor}`,
            borderRadius: 20,
            padding: "clamp(24px, 3.5vw, 40px)",
            boxShadow: "0 8px 28px rgba(18,60,80,0.06)",
            width: "100%",
            margin: "8px 0"
          }}
        >
          {/* Top Banner Image if selected */}
          {hasImage && imagePosition === "top" && (
            <div style={{ marginBottom: 24, borderRadius: 14, overflow: "hidden", maxHeight: 380 }}>
              <img
                src={block.image!}
                alt={block.title || "Section visual"}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          )}

          <div
            style={{
              display: hasImage && (imagePosition === "left" || imagePosition === "right") ? "grid" : "block",
              gridTemplateColumns:
                hasImage && (imagePosition === "left" || imagePosition === "right")
                  ? "repeat(auto-fit, minmax(300px, 1fr))"
                  : "1fr",
              gap: 32,
              alignItems: "center"
            }}
          >
            {/* Left Image */}
            {hasImage && imagePosition === "left" && (
              <div style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 6px 20px rgba(0,0,0,0.08)", order: 1 }}>
                <img
                  src={block.image!}
                  alt={block.title || "Section illustration"}
                  style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }}
                />
              </div>
            )}

            {/* Text Content */}
            <div style={{ order: imagePosition === "left" ? 2 : 1 }}>
              {block.eyebrow && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: 12,
                    background: isDark ? "rgba(140,198,63,0.18)" : "#e6f4ea",
                    color: block.eyebrowColor || (isDark ? "#8cc63f" : "#5c9515"),
                    fontFamily: "'Poppins',sans-serif"
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: block.eyebrowColor || "#6faf1c" }} />
                  {block.eyebrow}
                </div>
              )}

              {block.title && (
                <h3
                  style={{
                    fontSize: "clamp(22px, 2.5vw, 28px)",
                    fontWeight: 800,
                    lineHeight: 1.25,
                    color: textColor,
                    margin: "0 0 10px 0"
                  }}
                >
                  {block.title}
                </h3>
              )}

              {block.subtitle && (
                <p style={{ fontSize: 16, fontWeight: 600, color: mutedColor, margin: "0 0 16px 0", lineHeight: 1.5 }}>
                  {block.subtitle}
                </p>
              )}

              {block.content && (
                <div
                  style={{
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: mutedColor,
                    marginBottom: block.bullets && block.bullets.length > 0 ? 18 : 0
                  }}
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              )}

              {/* Bullets with green checkmarks */}
              {block.bullets && block.bullets.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
                  {block.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: isDark ? "#8cc63f" : "#6faf1c",
                          color: "#fff",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 800,
                          flexShrink: 0,
                          marginTop: 2
                        }}
                      >
                        ✓
                      </span>
                      <span style={{ fontSize: 14.5, lineHeight: 1.5, color: textColor, fontWeight: 500 }}>
                        {bullet}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Call to action button */}
              {block.ctaText && (
                <div style={{ marginTop: 22 }}>
                  <Link
                    href={block.ctaHref || "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: isDark ? "#8cc63f" : "#0e78a8",
                      color: isDark ? "#12303d" : "#ffffff",
                      padding: "11px 22px",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 14.5,
                      textDecoration: "none",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                      transition: "transform 0.2s"
                    }}
                  >
                    <span>{block.ctaText}</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Right Image */}
            {hasImage && imagePosition === "right" && (
              <div style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 6px 20px rgba(0,0,0,0.08)", order: 2 }}>
                <img
                  src={block.image!}
                  alt={block.title || "Section illustration"}
                  style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }}
                />
              </div>
            )}
          </div>

          {/* Bottom Banner Image if selected */}
          {hasImage && imagePosition === "bottom" && (
            <div style={{ marginTop: 24, borderRadius: 14, overflow: "hidden", maxHeight: 380 }}>
              <img
                src={block.image!}
                alt={block.title || "Section visual"}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          )}
        </div>
      );
    }

    // ── 3. KEY TAKEAWAYS BOX ──
    case "key_takeaways":
      return (
        <div
          style={{
            background: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderLeft: "6px solid #0284c7",
            borderRadius: 16,
            padding: "24px 28px",
            margin: "12px 0",
            boxShadow: "0 4px 16px rgba(2,132,199,0.06)"
          }}
        >
          <h4
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "#0369a1",
              margin: "0 0 14px 0",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "'Poppins',sans-serif"
            }}
          >
            <span>💡</span>
            <span>{block.title || "Key Takeaways for Patients"}</span>
          </h4>
          {block.content && (
            <p style={{ fontSize: 14.5, color: "#334155", lineHeight: 1.6, margin: "0 0 14px 0" }}>
              {block.content}
            </p>
          )}
          {block.bullets && block.bullets.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8, color: "#1e293b", fontSize: 14.5 }}>
              {block.bullets.map((b, i) => (
                <li key={i} style={{ lineHeight: 1.55 }}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      );

    // ── 4. CALLOUT / QUOTE BLOCK ──
    case "callout":
      return (
        <blockquote
          style={{
            background: "#f8fafc",
            borderLeft: "5px solid #16a34a",
            borderRadius: "0 16px 16px 0",
            padding: "22px 28px",
            margin: "16px 0",
            fontStyle: "italic",
            color: "#1e293b",
            fontSize: "1.15rem",
            lineHeight: 1.7
          }}
        >
          <p style={{ margin: "0 0 8px 0" }}>&ldquo;{block.content || block.title}&rdquo;</p>
          {block.quoteAuthor && (
            <cite style={{ display: "block", fontSize: 13, color: "#64748b", fontWeight: 700, fontStyle: "normal", marginTop: 8 }}>
              — {block.quoteAuthor}
            </cite>
          )}
        </blockquote>
      );

    // ── 5. IMAGE BANNER BLOCK ──
    case "image_banner":
      if (!block.image) return null;
      return (
        <figure style={{ margin: "16px 0", width: "100%" }}>
          <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 30px rgba(18,60,80,0.1)", maxHeight: 500 }}>
            <img
              src={block.image}
              alt={block.title || "Article visual"}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
          {block.title && (
            <figcaption style={{ fontSize: 13, color: "#64748b", textAlign: "center", marginTop: 8, fontStyle: "italic" }}>
              {block.title}
            </figcaption>
          )}
        </figure>
      );

    // ── 6. FAQ ACCORDION BLOCK ──
    case "faq":
      if (!block.faqs || block.faqs.length === 0) return null;
      return (
        <div style={{ margin: "20px 0", width: "100%" }}>
          {block.title && (
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "#1d2b34", marginBottom: 14 }}>
              {block.title}
            </h3>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {block.faqs.map((faq, fIdx) => {
              const isOpen = openFaqs[fIdx] ?? (fIdx === 0);
              return (
                <div
                  key={fIdx}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "#ffffff"
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(fIdx)}
                    style={{
                      width: "100%",
                      padding: "16px 20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: isOpen ? "#f8fafc" : "#ffffff",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: 15.5,
                      fontWeight: 700,
                      color: "#1e293b",
                      transition: "background 0.2s"
                    }}
                  >
                    <span>{faq.question}</span>
                    <span style={{ fontSize: 18, color: "#0e78a8", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                      ▾
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: "14px 20px 18px", color: "#475569", fontSize: 14.5, lineHeight: 1.65, borderTop: "1px solid #f1f5f9" }}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );

    default:
      return null;
  }
}
