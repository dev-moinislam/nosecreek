import React from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getBlogPosts } from "@/lib/api";

export const metadata = {
  title: "Health & Wellness Blog | Nose Creek Physiotherapy Calgary",
  description: "Read the latest physiotherapy tips, injury recovery advice, exercises, and health guides from our Calgary practitioners."
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="section section-offset" style={{ padding: "60px 0" }}>
      <div className="container">
        <Breadcrumbs items={[{ label: "Blog", href: "/blog" }]} />
        
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color: "#1c9fd8", letterSpacing: "1.5px", fontSize: 13, textTransform: "uppercase", marginBottom: 12 }}>
            From our blog
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800 }}>Physiotherapy Tips &amp; Articles</h1>
          <p style={{ color: "#5a6570", maxWidth: "600px", margin: "12px auto 0", fontSize: 16 }}>
            Educational articles and expert advice written by our licensed physiotherapists and health practitioners.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "28px" }}>
          {posts.map((post) => {
            const formattedDate = post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "";
            return (
              <div
                key={post.id || post.slug}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "14px",
                  border: "1px solid #e7edf1",
                  overflow: "hidden",
                  boxShadow: "0 6px 20px rgba(18,60,80,0.06)",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {/* Featured Image */}
                {post.featuredImage && (
                  <Link href={`/blog/${post.slug}`} style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", backgroundColor: "#eef3f6", display: "block" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Link>
                )}

                <div style={{ padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      fontSize: "0.75rem",
                      color: "#8a97a1",
                      marginBottom: "10px",
                      fontWeight: 600,
                      fontFamily: "'Poppins',sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}
                  >
                    <span>{post.category}</span>
                    {post.readingTime && (
                      <>
                        <span>•</span>
                        <span>{post.readingTime}</span>
                      </>
                    )}
                    {formattedDate && (
                      <>
                        <span>•</span>
                        <span>{formattedDate}</span>
                      </>
                    )}
                  </div>
                  
                  <h2 style={{ fontSize: "1.25rem", margin: "0 0 10px 0", color: "#1d2b34", fontWeight: 700, lineHeight: 1.3 }}>
                    <Link href={`/blog/${post.slug}`} style={{ color: "#1d2b34", textDecoration: "none" }}>
                      {post.title}
                    </Link>
                  </h2>
                  
                  <p style={{ fontSize: "0.875rem", color: "#5a6570", lineHeight: "1.6", marginBottom: "20px", flexGrow: 1 }}>
                    {post.excerpt}
                  </p>
                  
                  <div style={{ borderTop: "1px solid #e7edf1", paddingTop: "14px", marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8125rem", color: "#48535c", fontWeight: "600" }}>
                      By {post.author}
                    </span>
                    <Link href={`/blog/${post.slug}`} style={{ color: "#0e78a8", fontWeight: 700, fontSize: "0.875rem" }}>
                      Read Full &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
