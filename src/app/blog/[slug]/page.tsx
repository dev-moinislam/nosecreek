import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import SchemaMarkup from "@/components/seo/SchemaMarkup";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/api";
import styles from "./blog-post.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | Nose Creek Physiotherapy"
    };
  }

  return {
    title: `${post.seo?.title || post.title} | Nose Creek Physiotherapy`,
    description: post.seo?.description || post.excerpt,
    openGraph: {
      title: post.seo?.ogTitle || post.title,
      description: post.seo?.ogDescription || post.excerpt,
      images: [{ url: post.seo?.ogImage || post.featuredImage }]
    }
  };
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getBlogPosts();
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
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px" }}>
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

            <h1 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px", lineHeight: 1.18, marginBottom: 20 }}>
              {post.title}
            </h1>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 24px", fontSize: 14, color: "#5a6570", fontWeight: 600, fontFamily: "'Poppins',sans-serif" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 30, height: 30, borderRadius: "50%", background: "#1c9fd8", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
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

      {/* ── 2. FULL-WIDTH ARTICLE BODY (NO SIDEBAR) ── */}
      <section style={{ padding: "0 0 clamp(56px, 7vw, 96px) 0" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px" }}>
          
          {/* Featured Image */}
          {post.featuredImage && (
            <div style={{ marginBottom: 40, borderRadius: 20, overflow: "hidden", boxShadow: "0 18px 48px rgba(18,60,80,0.12)", aspectRatio: "16/9", maxHeight: 520, backgroundColor: "#eef3f6" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.featuredImage}
                alt={post.title}
                referrerPolicy="no-referrer"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          )}

          <article>
            {/* Lead Excerpt */}
            {post.excerpt && (
              <div style={{ fontSize: "1.2rem", lineHeight: 1.7, color: "#1d2b34", fontWeight: 600, borderLeft: "4px solid #6faf1c", paddingLeft: 22, marginBottom: 36, fontStyle: "italic", background: "#f8fafc", padding: "18px 22px", borderRadius: "0 14px 14px 0" }}>
                {post.excerpt}
              </div>
            )}

            {/* Main HTML Content */}
            <div
              className={styles.articleBody}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags Section */}
            {post.tags && post.tags.length > 0 && (
              <div style={{ marginTop: 44, paddingTop: 24, borderTop: "1px solid #e7edf1" }}>
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
            <div style={{ marginTop: 40, background: "#f8fafc", borderRadius: 18, border: "1px solid #e2ebf0", padding: "28px 24px", display: "flex", gap: 20, alignItems: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#12303d", color: "#8cc63f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, flexShrink: 0 }}>
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
              <div style={{ maxWidth: 500 }}>
                <div style={{ display: "inline-block", background: "rgba(140,198,63,0.18)", color: "#8cc63f", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "1px", padding: "4px 10px", borderRadius: 6, marginBottom: 10, fontFamily: "'Poppins',sans-serif" }}>
                  Direct Insurance Billing Available
                </div>
                <h3 style={{ color: "#fff", fontSize: 22, fontWeight: 800, letterSpacing: "-0.4px", margin: "0 0 8px" }}>
                  Dealing with pain or an injury?
                </h3>
                <p style={{ fontSize: 14.5, color: "#cbdbe4", margin: 0, lineHeight: 1.5 }}>
                  Our experienced Calgary team is here to assess and treat the root cause of your symptoms.
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                <a
                  href="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: "#6faf1c", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15, padding: "12px 22px", borderRadius: 9, textDecoration: "none", boxShadow: "0 6px 16px rgba(111,175,28,0.3)" }}
                >
                  Book Assessment Online
                </a>
                <a
                  href="tel:+14032958590"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15, padding: "12px 20px", borderRadius: 9, textDecoration: "none" }}
                >
                  Call 403.295.8590
                </a>
              </div>
            </div>

          </article>
        </div>
      </section>

      {/* ── 3. RELATED ARTICLES (3-COLUMN HORIZONTAL GRID) ── */}
      {relatedPosts.length > 0 && (
        <section style={{ background: "#f8fafc", padding: "clamp(56px, 7vw, 84px) 0", borderTop: "1px solid #e7edf1", borderBottom: "1px solid #e7edf1" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 40px" }}>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color: "#1c9fd8", letterSpacing: "1.5px", fontSize: 13, textTransform: "uppercase", marginBottom: 8 }}>
                Keep Reading
              </div>
              <h2 style={{ fontSize: "clamp(24px, 3.2vw, 36px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.5px" }}>
                Related Articles &amp; Advice
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
              {relatedPosts.map((rPost) => (
                <Link
                  key={rPost.slug}
                  href={`/blog/${rPost.slug}`}
                  style={{ display: "flex", flexDirection: "column", background: "#fff", borderRadius: 16, border: "1px solid #e7edf1", overflow: "hidden", textDecoration: "none", boxShadow: "0 6px 20px rgba(18,60,80,0.05)", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
                >
                  {rPost.featuredImage && (
                    <div style={{ aspectRatio: "16/10", overflow: "hidden", backgroundColor: "#eef3f6" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={rPost.featuredImage}
                        alt={rPost.title}
                        referrerPolicy="no-referrer"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <div style={{ padding: "22px 20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <div style={{ fontSize: 12, color: "#6faf1c", fontWeight: 700, textTransform: "uppercase", fontFamily: "'Poppins',sans-serif", marginBottom: 6 }}>
                      {rPost.category}
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1d2b34", lineHeight: 1.35, marginBottom: 10 }}>
                      {rPost.title}
                    </h3>
                    <p style={{ fontSize: 14, color: "#5a6570", lineHeight: 1.55, margin: "0 0 16px", flexGrow: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {rPost.excerpt}
                    </p>
                    <span style={{ fontSize: 14, color: "#0e78a8", fontWeight: 700, marginTop: "auto" }}>
                      Read Article &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. BOTTOM CTA BANNER ── */}
      <section style={{ background: "linear-gradient(120deg,#1c9fd8,#1179ab)", color: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(48px,6vw,72px) 24px", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(26px,3.8vw,42px)", fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.15 }}>
            Ready to move faster and feel better?
          </h2>
          <p style={{ marginTop: 14, fontSize: 16.5, color: "#e2f2fa", lineHeight: 1.6, maxWidth: 540, marginLeft: "auto", marginRight: "auto" }}>
            Book your appointment online in under two minutes, or give us a call — our team is here to help you recover.
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

      <SchemaMarkup type="Article" data={post} />
    </div>
  );
}
