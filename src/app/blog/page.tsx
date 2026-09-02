import React from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getBlogPosts } from "@/lib/api";

import BlogIndexGrid from "@/components/ui/BlogIndexGrid";

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

        <BlogIndexGrid initialPosts={posts} />
      </div>
    </div>
  );
}
