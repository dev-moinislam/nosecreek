"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BlogPost } from "@/types/content";
import defaultBlogData from "@/data/blog.json";

interface BlogIndexGridProps {
  initialPosts?: BlogPost[];
}

export default function BlogIndexGrid({ initialPosts }: BlogIndexGridProps) {
  const [posts, setPosts] = useState<BlogPost[]>(
    initialPosts && initialPosts.length > 0
      ? initialPosts
      : (defaultBlogData as BlogPost[])
  );

  useEffect(() => {
    function sync() {
      try {
        const saved = localStorage.getItem("adm_blog");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setPosts(parsed);
          }
        }
      } catch {}
    }
    sync();
    window.addEventListener("blogUpdated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("blogUpdated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
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
              borderRadius: "16px",
              border: "1px solid #e7edf1",
              overflow: "hidden",
              boxShadow: "0 6px 20px rgba(18,60,80,0.06)",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
          >
            {/* Featured Image Thumbnail */}
            {post.featuredImage && (
              <Link
                href={`/blog/${post.slug}`}
                style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", backgroundColor: "#eef3f6", display: "block" }}
              >
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
              {/* Clean Single-line Meta Row matching existing blog cards */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.72rem",
                  color: "#8a97a1",
                  marginBottom: "12px",
                  fontWeight: 600,
                  fontFamily: "'Poppins',sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                  whiteSpace: "nowrap",
                  overflow: "hidden"
                }}
              >
                <span style={{ color: "#0e78a8", fontWeight: 700 }}>
                  {post.category || "General"}
                </span>

                {post.readingTime && (
                  <>
                    <span style={{ color: "#cbd5e1" }}>•</span>
                    <span>{post.readingTime}</span>
                  </>
                )}

                {formattedDate && (
                  <>
                    <span style={{ color: "#cbd5e1" }}>•</span>
                    <span>{formattedDate}</span>
                  </>
                )}
              </div>

              {/* Title */}
              <h2 style={{ fontSize: "1.25rem", margin: "0 0 10px 0", color: "#1d2b34", fontWeight: 700, lineHeight: 1.3 }}>
                <Link href={`/blog/${post.slug}`} style={{ color: "#1d2b34", textDecoration: "none" }}>
                  {post.title}
                </Link>
              </h2>

              {/* Excerpt */}
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#5a6570",
                  lineHeight: "1.6",
                  marginBottom: "20px",
                  flexGrow: 1,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}
              >
                {post.excerpt}
              </p>

              {/* Footer */}
              <div
                style={{
                  borderTop: "1px solid #e7edf1",
                  paddingTop: "14px",
                  marginTop: "auto",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span style={{ fontSize: "0.8125rem", color: "#48535c", fontWeight: "600" }}>
                  By {post.author}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  style={{
                    color: "#0e78a8",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textDecoration: "none"
                  }}
                >
                  Read Full &rarr;
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
