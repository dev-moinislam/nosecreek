"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { BlogPost } from "@/types/content";
import BlogBlockRenderer from "./BlogBlockRenderer";

interface BlogPostLiveViewProps {
  initialPost: BlogPost;
  allPosts: BlogPost[];
}

export default function BlogPostLiveView({ initialPost, allPosts }: BlogPostLiveViewProps) {
  const [post, setPost] = useState<BlogPost>(initialPost);

  // Real-time synchronization with local admin updates
  useEffect(() => {
    function syncFromLocal() {
      try {
        const saved = localStorage.getItem("adm_blog");
        if (saved) {
          const list: BlogPost[] = JSON.parse(saved);
          const found = list.find((p) => p.slug === initialPost.slug || p.id === initialPost.id);
          if (found) {
            setPost(found);
          }
        }
      } catch {
        // ignore
      }
    }

    window.addEventListener("blogUpdated", syncFromLocal);
    window.addEventListener("storage", syncFromLocal);
    return () => {
      window.removeEventListener("blogUpdated", syncFromLocal);
      window.removeEventListener("storage", syncFromLocal);
    };
  }, [initialPost]);

  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : "";

  return (
    <div style={{ width: "100%", overflowX: "hidden", backgroundColor: "#fff" }}>
      
      {/* ── 1. ARTICLE HEADER HERO ── */}
      <section style={{ background: "linear-gradient(180deg, #f2f8fb 0%, #ffffff 100%)", padding: "clamp(36px, 4vw, 56px) 0 32px" }}>
        {/* Generous wider container */}
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 24px" }}>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: post.title }
            ]}
          />

          <div style={{ marginTop: 24, textAlign: "left" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e6f4ea", color: "#5c9515", fontWeight: 700, fontSize: 13, fontFamily: "'Poppins',sans-serif", padding: "6px 14px", borderRadius: 999, marginBottom: 18 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6faf1c", display: "inline-block" }} />
              {post.category || "Physiotherapy & Wellness"}
            </div>

            <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.18, marginBottom: 20 }}>
              {post.title}
            </h1>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 24px", fontSize: 14, color: "#5a6570", fontWeight: 600, fontFamily: "'Poppins',sans-serif" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#1c9fd8", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
                  {post.author ? post.author.charAt(0) : "N"}
                </span>
                <span style={{ color: "#1d2b34" }}>{post.author}</span>
              </div>
              {formattedDate && (
                <span>📅 {formattedDate}</span>
              )}
              {post.readingTime && (
                <span>⏱️ {post.readingTime}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. FULL-WIDTH ARTICLE BODY WITH WIDE CONTAINER (MAX 1060PX) ── */}
      <section style={{ padding: "0 0 clamp(56px, 7vw, 96px) 0" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 24px" }}>
          
          {/* Prominent Featured Image / Thumbnail */}
          {post.featuredImage && (
            <div style={{ marginBottom: 40, borderRadius: 20, overflow: "hidden", boxShadow: "0 18px 48px rgba(18,60,80,0.12)", aspectRatio: "16/9", maxHeight: 540, backgroundColor: "#eef3f6" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.featuredImage}
                alt={post.title}
                referrerPolicy="no-referrer"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          )}

          <article style={{ width: "100%" }}>
            {/* Lead Excerpt */}
            {post.excerpt && (
              <div style={{ fontSize: "1.2rem", lineHeight: 1.7, color: "#1d2b34", fontWeight: 600, borderLeft: "5px solid #6faf1c", paddingLeft: 22, marginBottom: 36, fontStyle: "italic", background: "#f8fafc", padding: "20px 24px", borderRadius: "0 14px 14px 0" }}>
                {post.excerpt}
              </div>
            )}

            {/* Flexible Content Blocks & Custom Sections (Interleaved Rich Text + Custom Sections) */}
            <BlogBlockRenderer
              blocks={post.contentBlocks}
              fallbackHtml={post.content}
            />

            {/* Tags Section */}
            {post.tags && post.tags.length > 0 && (
              <div style={{ marginTop: 48, paddingTop: 28, borderTop: "1px solid #e7edf1" }}>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13, color: "#8a97a1", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
                  Related Topics
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background: "#f2f8fb",
                        color: "#0e78a8",
                        border: "1px solid #d7e6ef",
                        borderRadius: 999,
                        padding: "6px 14px",
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: "'Poppins',sans-serif"
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio Box */}
            <div style={{ marginTop: 44, background: "#f8fafc", borderRadius: 18, border: "1px solid #e2ebf0", padding: "28px 24px", display: "flex", gap: 20, alignItems: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#12303d", color: "#8cc63f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, flexShrink: 0 }}>
                {post.author ? post.author.charAt(0) : "N"}
              </div>
              <div>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 18, color: "#1d2b34" }}>
                  Written by {post.author}
                </div>
                <p style={{ fontSize: 14.5, color: "#5a6570", marginTop: 4, lineHeight: 1.55, margin: "4px 0 0" }}>
                  Clinical practitioner at Nose Creek Physiotherapy in Calgary. Dedicated to evidence-based active rehabilitation, joint mobilization, and natural pain relief.
                </p>
              </div>
            </div>

            {/* Inline Booking Callout Card */}
            <div style={{ marginTop: 44, background: "#12303d", color: "#eaf3f8", borderRadius: 18, padding: "clamp(28px, 4vw, 36px)", boxShadow: "0 12px 32px rgba(18,48,61,0.14)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
              <div style={{ maxWidth: 540 }}>
                <div style={{ display: "inline-block", background: "rgba(140,198,63,0.18)", color: "#8cc63f", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "1px", padding: "4px 10px", borderRadius: 6, marginBottom: 10, fontFamily: "'Poppins',sans-serif" }}>
                  Direct Insurance Billing Available
                </div>
                <h3 style={{ color: "#fff", fontSize: 24, fontWeight: 800, letterSpacing: "-0.4px", margin: "0 0 8px" }}>
                  Dealing with pain or an injury?
                </h3>
                <p style={{ fontSize: 15, color: "#cbdbe4", margin: 0, lineHeight: 1.55 }}>
                  Our experienced Calgary team is here to assess and treat the root cause of your symptoms.
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <a
                  href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: "#6faf1c", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15, padding: "12px 24px", borderRadius: 9, textDecoration: "none", boxShadow: "0 6px 16px rgba(111,175,28,0.3)" }}
                >
                  Book Assessment Online
                </a>
                <a
                  href="tel:4032958590"
                  style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15, padding: "12px 20px", borderRadius: 9, textDecoration: "none" }}
                >
                  Call (403) 295-8590
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ── 3. RELATED ARTICLES ── */}
      {relatedPosts.length > 0 && (
        <section style={{ backgroundColor: "#f2f8fb", padding: "clamp(48px, 6vw, 80px) 0", borderTop: "1px solid #e2ebf0" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ display: "inline-block", background: "#e6f4ea", color: "#5c9515", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 12.5, textTransform: "uppercase", letterSpacing: "1px", padding: "4px 12px", borderRadius: 6, marginBottom: 8 }}>
                Keep Reading
              </div>
              <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", margin: 0 }}>
                Related Clinical Articles
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  style={{ textDecoration: "none", display: "flex", flexDirection: "column", background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #e7edf1", boxShadow: "0 6px 20px rgba(18,60,80,0.06)", transition: "transform 0.2s" }}
                >
                  {related.featuredImage && (
                    <div style={{ height: 180, width: "100%", overflow: "hidden", backgroundColor: "#eef3f6" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={related.featuredImage}
                        alt={related.title}
                        referrerPolicy="no-referrer"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <div style={{ padding: "20px 22px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ color: "#0e78a8", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                      {related.category}
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1d2b34", lineHeight: 1.3, marginBottom: 10 }}>
                      {related.title}
                    </h3>
                    <p style={{ fontSize: 14, color: "#5a6570", lineHeight: 1.55, margin: "0 0 16px 0", flexGrow: 1 }}>
                      {related.excerpt}
                    </p>
                    <span style={{ color: "#0e78a8", fontWeight: 700, fontSize: 14, marginTop: "auto" }}>
                      Read Article &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
