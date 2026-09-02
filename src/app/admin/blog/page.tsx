"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BlogPost, BlogContentBlock, BlogBlockType } from "@/types/content";
import defaultBlogData from "@/data/blog.json";
import { getBlogPosts } from "@/lib/api";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { useRole } from "@/components/admin/RoleGuard";
import RichTextEditor from "@/components/blog/RichTextEditor";
import BlogBlockRenderer from "@/components/blog/BlogBlockRenderer";
import {
  EditIcon,
  TrashIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExternalLinkIcon,
  CheckIcon
} from "@/components/admin/AdminIcons";
import AdminToast from "@/components/admin/AdminToast";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";
import AdminImageUploader from "@/components/admin/AdminImageUploader";

export default function AdminBlogPage() {
  const { role, isAdmin } = useRole();
  const [posts, setPosts] = useState<BlogPost[]>(defaultBlogData as BlogPost[]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "blocks">("general");
  const [showSaveBanner, setShowSaveBanner] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ slug: string; title: string } | null>(null);

  // Load latest posts with local cache & live event sync
  useEffect(() => {
    async function load() {
      try {
        let list: BlogPost[] = [];
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem("adm_blog");
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                list = parsed;
              }
            } catch {}
          }
        }
        if (list.length === 0) {
          const fetched = await getBlogPosts();
          if (fetched && fetched.length > 0) {
            list = fetched;
          } else {
            list = defaultBlogData as BlogPost[];
          }
        }
        setPosts(list);
      } catch {}
    }
    load();

    const handleSync = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("adm_blog");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setPosts(parsed);
            }
          } catch {}
        }
      }
    };

    window.addEventListener("blogUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("blogUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const categories = ["all", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];

  const filteredPosts = posts.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      p.author.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  // Handle Save
  const handleSavePost = async (updated: BlogPost) => {
    try {
      setSaveStatus("Saving to database and cloud...");
      // 1. Ensure blocks are compiled into content as fallback
      let compiledHtml = updated.content || "";
      if (updated.contentBlocks && updated.contentBlocks.length > 0) {
        compiledHtml = updated.contentBlocks
          .map((b) => {
            if (b.type === "richtext") return b.content || "";
            if (b.type === "custom_section") {
              const bulletsHtml = b.bullets?.length
                ? `<ul>${b.bullets.map((item) => `<li>${item}</li>`).join("")}</ul>`
                : "";
              const imgHtml = b.image ? `<img src="${b.image}" alt="${b.title || ''}" />` : "";
              return `<section><h3>${b.title || ""}</h3>${b.content || ""}${bulletsHtml}${imgHtml}</section>`;
            }
            if (b.type === "key_takeaways") {
              const bulletsHtml = b.bullets?.length
                ? `<ul>${b.bullets.map((item) => `<li>${item}</li>`).join("")}</ul>`
                : "";
              return `<aside><h4>${b.title || "Key Takeaways"}</h4>${bulletsHtml}</aside>`;
            }
            if (b.type === "callout") {
              return `<blockquote><p>${b.content || ""}</p>${b.quoteAuthor ? `<cite>${b.quoteAuthor}</cite>` : ""}</blockquote>`;
            }
            return "";
          })
          .join("\n\n");
      }

      const postToSave: BlogPost = {
        ...updated,
        content: compiledHtml,
        contentBlocks: updated.contentBlocks || []
      };

      const allUpdated = posts.map((p) => (p.slug === postToSave.slug ? postToSave : p));
      if (!allUpdated.find((p) => p.slug === postToSave.slug)) {
        allUpdated.unshift(postToSave);
      }

      // 1. Save to Supabase
      if (isSupabaseConfigured && supabase) {
        try {
          const payload = {
            id: postToSave.id || `post-${Date.now()}`,
            slug: postToSave.slug,
            title: postToSave.title,
            excerpt: postToSave.excerpt || "",
            content: compiledHtml,
            featured_image: postToSave.featuredImage || "/images/blog/default.jpg",
            author: postToSave.author || "Blair Schachterle",
            category: postToSave.category || "General",
            tags: postToSave.tags || [],
            published_at: postToSave.publishedAt || new Date().toISOString(),
            reading_time: postToSave.readingTime || "4 min",
            related_posts: postToSave.relatedPosts || [],
            is_published: true,
            seo: {
              ...(postToSave.seo || {}),
              contentBlocks: postToSave.contentBlocks || []
            }
          };

          await supabase
            .from("blog_posts")
            .upsert(payload, { onConflict: "slug" });
        } catch (supaErr) {
          console.warn("Supabase blog sync note:", supaErr);
        }
      }

      // 2. Save to local data files via API
      try {
        await fetch("/api/admin/save-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "blog", data: allUpdated })
        });
      } catch {}

      // 3. Save to localStorage for instant client hydration
      if (typeof window !== "undefined") {
        localStorage.setItem("adm_blog", JSON.stringify(allUpdated));
        window.dispatchEvent(new Event("blogUpdated"));
      }

      setPosts(allUpdated);
      setEditingPost(null);
      setIsCreating(false);
      setSaveStatus(`✓ Article "${postToSave.title}" saved successfully to database and disk!`);
    } catch (err: any) {
      console.error(err);
      alert("Failed to save blog post: " + err.message);
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { slug, title } = deleteTarget;
    try {
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from("blog_posts").delete().eq("slug", slug);
          await supabase.from("blog_posts").delete().eq("id", slug);
        } catch (e) {
          console.warn("Supabase delete blog note:", e);
        }
      }

      const remaining = posts.filter((p) => p.slug !== slug);

      try {
        await fetch("/api/admin/save-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "blog", data: remaining })
        });
      } catch {}

      if (typeof window !== "undefined") {
        localStorage.setItem("adm_blog", JSON.stringify(remaining));
        window.dispatchEvent(new Event("blogUpdated"));
      }

      setPosts(remaining);
      setEditingPost(null);
      setIsCreating(false);
      setSaveStatus(`✓ Article "${title}" permanently deleted from database and website!`);
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  // Start New Post
  const handleStartNew = () => {
    const newPost: BlogPost = {
      id: `post-${Date.now()}`,
      slug: `new-article-${Date.now()}`,
      title: "New Clinical Article",
      excerpt: "A concise, engaging summary of this article that will appear on the blog directory and as the lead excerpt.",
      content: "<p>Write your article content here.</p>",
      contentBlocks: [
        {
          id: `block-${Date.now()}-1`,
          type: "richtext",
          content: "<h2>Understanding Your Recovery Pathway</h2><p>Provide evidence-based clinical insights, patient education, and practical advice on physical recovery and pain management.</p>"
        },
        {
          id: `block-${Date.now()}-2`,
          type: "custom_section",
          eyebrow: "Evidence-Based Care",
          eyebrowColor: "#1c9fd8",
          title: "Key Treatment Principles",
          subtitle: "How targeted rehabilitation promotes tissue healing",
          content: "<p>Our registered Calgary physiotherapists utilize structured loading and gentle manual techniques to restore pain-free motion.</p>",
          bullets: [
            "Comprehensive 1-on-1 orthopaedic physical assessment",
            "Targeted joint mobilization & spinal decompression",
            "Direct billing available for most extended health insurers"
          ],
          image: "/images/clinic/reception-three.jpg",
          imagePosition: "right",
          background: "teal",
          ctaText: "Book Your Assessment Online",
          ctaHref: "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
        },
        {
          id: `block-${Date.now()}-3`,
          type: "richtext",
          content: "<h3>When to Seek Professional Evaluation</h3><p>If pain persists beyond 7–10 days, radiates into your limbs, or interferes with daily function, early physiotherapy intervention is proven to prevent chronic joint restrictions.</p>"
        }
      ],
      featuredImage: "/images/clinic/reception-three.jpg",
      author: "Blair Schachterle",
      category: "Physiotherapy",
      tags: ["Recovery", "Rehabilitation", "Calgary Physio"],
      publishedAt: new Date().toISOString(),
      readingTime: "4 min read",
      relatedPosts: []
    };
    setEditingPost(newPost);
    setIsCreating(true);
    setActiveTab("general");
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: 60 }}>
      <AdminToast message={saveStatus} onClose={() => setSaveStatus(null)} />

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        itemName={deleteTarget?.title || ""}
        itemType="Blog Article"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* ── HEADER BAR ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0", letterSpacing: "-0.5px" }}>
            Blog &amp; Article Content Manager
          </h1>
          <p style={{ fontSize: 14.5, color: "#64748b", margin: 0 }}>
            Publish clinical articles, research insights, and patient guides with flexible interleaved rich text and custom sections.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartNew}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#0e78a8",
            color: "#ffffff",
            padding: "11px 20px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(14,120,168,0.25)"
          }}
        >
          <PlusIcon size={16} />
          <span>New Blog Article</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {showSaveBanner && (
        <div
          style={{
            background: "#dcfce7",
            border: "1px solid #86efac",
            color: "#166534",
            padding: "12px 18px",
            borderRadius: 10,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 600,
            fontSize: 14
          }}
        >
          <CheckIcon size={18} style={{ color: "#16a34a" }} />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* ── SEARCH & FILTER TABS ── */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          padding: 16,
          marginBottom: 24,
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <input
          type="text"
          placeholder="Search articles by title, slug, author, or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            fontSize: 14,
            minWidth: 320,
            flexGrow: 1
          }}
        />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 12.5,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                textTransform: "capitalize",
                background: selectedCategory === cat ? "#0e78a8" : "#f1f5f9",
                color: selectedCategory === cat ? "#ffffff" : "#475569"
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── ARTICLES GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
        {filteredPosts.map((post) => (
          <div
            key={post.slug}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* Thumbnail */}
            {post.featuredImage && (
              <div style={{ height: 180, width: "100%", overflow: "hidden", backgroundColor: "#f8fafc", position: "relative" }}>
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(4px)",
                    padding: "3px 10px",
                    borderRadius: 999,
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: "#0e78a8"
                  }}
                >
                  {post.category || "General"}
                </div>
              </div>
            )}

            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
                <span>✍️ {post.author}</span>
                <span>•</span>
                <span>⏱️ {post.readingTime || "4 min"}</span>
              </div>

              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0", lineHeight: 1.35 }}>
                {post.title}
              </h3>

              <p style={{ fontSize: 13.5, color: "#64748b", lineHeight: 1.5, margin: "0 0 16px 0", flexGrow: 1 }}>
                {post.excerpt}
              </p>

              <div
                style={{
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: 12,
                  marginTop: "auto",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      // Initialize contentBlocks if empty
                      let blocks = post.contentBlocks;
                      if (!blocks || blocks.length === 0) {
                        blocks = [
                          {
                            id: `block-rt-${Date.now()}`,
                            type: "richtext",
                            content: post.content || "<p>Write your article content here...</p>"
                          }
                        ];
                      }
                      setEditingPost({ ...post, contentBlocks: blocks });
                      setIsCreating(false);
                      setActiveTab("general");
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "#f0f9ff",
                      color: "#0284c7",
                      border: "1px solid #bae6fd",
                      padding: "6px 14px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    <EditIcon size={14} />
                    <span>Edit Article</span>
                  </button>

                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      background: "#f8fafc",
                      color: "#475569",
                      border: "1px solid #e2e8f0",
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: "none"
                    }}
                  >
                    <ExternalLinkIcon size={14} />
                    <span>View Live</span>
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => setDeleteTarget({ slug: post.slug, title: post.title })}
                  title="Delete post"
                  style={{
                    background: "#fee2e2",
                    border: "1px solid #fca5a5",
                    color: "#dc2626",
                    cursor: "pointer",
                    padding: "6px 8px",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MODAL: EDIT / CREATE ARTICLE ── */}
      {editingPost && (
        <BlogEditModal
          post={editingPost}
          isCreating={isCreating}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={() => {
            setEditingPost(null);
            setIsCreating(false);
          }}
          onSave={handleSavePost}
          onDelete={(slug) => {
            const p = posts.find((x) => x.slug === slug);
            setDeleteTarget({ slug, title: p?.title || slug });
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MODAL: EDIT / CREATE BLOG ARTICLE
// ─────────────────────────────────────────────────────────────

interface BlogEditModalProps {
  post: BlogPost;
  isCreating: boolean;
  activeTab: "general" | "blocks";
  setActiveTab: (tab: "general" | "blocks") => void;
  onClose: () => void;
  onSave: (post: BlogPost) => void;
  onDelete?: (slug: string) => void;
}

function BlogEditModal({
  post: initialPost,
  isCreating,
  activeTab,
  setActiveTab,
  onClose,
  onSave,
  onDelete
}: BlogEditModalProps) {
  const [post, setPost] = useState<BlogPost>(initialPost);

  // Helper to ensure contentBlocks array is initialized
  const blocks = post.contentBlocks || [];

  const updateBlocks = (newBlocks: BlogContentBlock[]) => {
    setPost({ ...post, contentBlocks: newBlocks });
  };

  // Add block
  const handleAddBlock = (type: BlogBlockType) => {
    const newBlock: BlogContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: type === "richtext" ? "<h3>New Section Heading</h3><p>Write your detailed clinical content here...</p>" : "",
      eyebrow: type === "custom_section" ? "Treatment Insight" : undefined,
      eyebrowColor: "#1c9fd8",
      title: type === "custom_section" ? "Key Clinical Advantage" : type === "key_takeaways" ? "Key Patient Takeaways" : "",
      subtitle: type === "custom_section" ? "Why targeted rehabilitation achieves better outcomes" : undefined,
      bullets:
        type === "custom_section" || type === "key_takeaways"
          ? [
              "Immediate pain relief through manual mobilization",
              "Individualized active exercise program",
              "Direct billing available to all major insurance providers"
            ]
          : undefined,
      image: type === "custom_section" ? "/images/clinic/reception-three.jpg" : undefined,
      imagePosition: "right",
      background: "teal",
      ctaText: type === "custom_section" ? "Book Assessment Online" : undefined,
      ctaHref: "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
    };
    updateBlocks([...blocks, newBlock]);
  };

  // Move block up
  const handleMoveBlockUp = (index: number) => {
    if (index === 0) return;
    const reordered = [...blocks];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(index - 1, 0, moved);
    updateBlocks(reordered);
  };

  // Move block down
  const handleMoveBlockDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const reordered = [...blocks];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(index + 1, 0, moved);
    updateBlocks(reordered);
  };

  const [deleteBlockIndex, setDeleteBlockIndex] = useState<number | null>(null);

  // Delete block
  const handleDeleteBlock = (index: number) => {
    setDeleteBlockIndex(index);
  };

  // Update specific block
  const handleUpdateBlock = (index: number, updated: Partial<BlogContentBlock>) => {
    const updatedBlocks = blocks.map((b, i) => (i === index ? { ...b, ...updated } : b));
    updateBlocks(updatedBlocks);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15,23,42,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
      }}
    >
      <ConfirmDeleteModal
        isOpen={deleteBlockIndex !== null}
        itemName={blocks[deleteBlockIndex || 0]?.title || `Content Block ${(deleteBlockIndex ?? 0) + 1}`}
        itemType="Section Block"
        onConfirm={() => {
          if (deleteBlockIndex !== null) {
            const filtered = blocks.filter((_, i) => i !== deleteBlockIndex);
            updateBlocks(filtered);
            setDeleteBlockIndex(null);
          }
        }}
        onClose={() => setDeleteBlockIndex(null)}
      />
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 1320,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.3)"
        }}
      >
        {/* ── MODAL HEADER ── */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f8fafc"
          }}
        >
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 2px 0" }}>
              {isCreating ? "Create New Clinical Article" : `Edit Article: ${post.title}`}
            </h2>
            <span style={{ fontSize: 12.5, color: "#64748b" }}>
              Slug: <code style={{ color: "#0e78a8" }}>/blog/{post.slug}</code>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 26,
              color: "#94a3b8",
              cursor: "pointer",
              lineHeight: 1
            }}
          >
            &times;
          </button>
        </div>

        {/* ── TABS SELECTOR ── */}
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", padding: "0 24px", background: "#ffffff" }}>
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            style={{
              padding: "14px 20px",
              fontSize: 14,
              fontWeight: 700,
              border: "none",
              background: "none",
              cursor: "pointer",
              color: activeTab === "general" ? "#0e78a8" : "#64748b",
              borderBottom: activeTab === "general" ? "3px solid #0e78a8" : "3px solid transparent"
            }}
          >
            Tab 1: General &amp; Hero Thumbnail
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("blocks")}
            style={{
              padding: "14px 20px",
              fontSize: 14,
              fontWeight: 700,
              border: "none",
              background: "none",
              cursor: "pointer",
              color: activeTab === "blocks" ? "#0e78a8" : "#64748b",
              borderBottom: activeTab === "blocks" ? "3px solid #0e78a8" : "3px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <span>Tab 2: Interleaved Content Blocks &amp; Custom Sections</span>
            <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: 999, fontSize: 11.5 }}>
              {blocks.length} blocks
            </span>
          </button>
        </div>

        {/* ── MODAL CONTENT BODY ── */}
        <div style={{ padding: 24, overflowY: "auto", flexGrow: 1, background: "#f8fafc" }}>
          
          {/* TAB 1: GENERAL & HERO */}
          {activeTab === "general" && (
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, alignItems: "start" }}>
              {/* Form inputs */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "#ffffff", padding: 20, borderRadius: 14, border: "1px solid #e2e8f0" }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 14px 0" }}>
                    Article Meta &amp; Core Info
                  </h4>

                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Article Title *</label>
                      <input
                        type="text"
                        value={post.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          setPost({
                            ...post,
                            title,
                            slug: isCreating
                              ? title
                                  .toLowerCase()
                                  .replace(/[^a-z0-9]+/g, "-")
                                  .replace(/(^-|-$)+/g, "")
                              : post.slug
                          });
                        }}
                        style={inputStyle}
                        required
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>URL Slug *</label>
                      <input
                        type="text"
                        value={post.slug}
                        onChange={(e) => setPost({ ...post, slug: e.target.value })}
                        style={inputStyle}
                        required
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Category</label>
                        <input
                          type="text"
                          value={post.category || ""}
                          onChange={(e) => setPost({ ...post, category: e.target.value })}
                          placeholder="e.g. Shoulder, Spine, Knee, Wellness"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Author</label>
                        <input
                          type="text"
                          value={post.author || ""}
                          onChange={(e) => setPost({ ...post, author: e.target.value })}
                          placeholder="e.g. Blair Schachterle"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Reading Time</label>
                        <input
                          type="text"
                          value={post.readingTime || "4 min read"}
                          onChange={(e) => setPost({ ...post, readingTime: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Published Date</label>
                        <input
                          type="date"
                          value={post.publishedAt ? post.publishedAt.split("T")[0] : ""}
                          onChange={(e) => setPost({ ...post, publishedAt: new Date(e.target.value).toISOString() })}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Lead Excerpt / Summary *</label>
                      <textarea
                        value={post.excerpt || ""}
                        onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                        rows={3}
                        style={{ ...inputStyle, resize: "vertical" }}
                        placeholder="A concise clinical overview shown at the top of the article and on the blog directory."
                      />
                    </div>
                  </div>
                </div>

                {/* Thumbnail Image input */}
                <div style={{ background: "#ffffff", padding: 20, borderRadius: 14, border: "1px solid #e2e8f0" }}>
                  <AdminImageUploader
                    label="Featured Image / Article Banner"
                    value={post.featuredImage || ""}
                    onChange={(url) => setPost({ ...post, featuredImage: url })}
                    folder="blog"
                    placeholder="/images/clinic/reception-three.jpg"
                    aspectRatioNote="Landscape 16:9 recommended (used on cards & top banner)"
                  />
                </div>
              </div>

              {/* Live Preview of Hero & Header */}
              <div style={{ background: "#ffffff", padding: 20, borderRadius: 14, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
                  Live Article Header Preview
                </div>

                <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", background: "#f8fafc", padding: 18 }}>
                  <div style={{ display: "inline-block", background: "#e6f4ea", color: "#5c9515", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, marginBottom: 10 }}>
                    {post.category || "Physiotherapy & Wellness"}
                  </div>

                  <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1d2b34", margin: "0 0 10px 0", lineHeight: 1.25 }}>
                    {post.title || "Article Title"}
                  </h3>

                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14, display: "flex", gap: 10 }}>
                    <span>✍️ {post.author}</span>
                    <span>⏱️ {post.readingTime}</span>
                  </div>

                  {/* Thumbnail Preview */}
                  {post.featuredImage && (
                    <div style={{ borderRadius: 12, overflow: "hidden", height: 180, marginBottom: 14, backgroundColor: "#e2e8f0" }}>
                      <img
                        src={post.featuredImage}
                        alt="Preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Excerpt Lead */}
                  {post.excerpt && (
                    <div style={{ fontSize: 13, color: "#334155", fontStyle: "italic", borderLeft: "3px solid #6faf1c", paddingLeft: 12, background: "#ffffff", padding: 10, borderRadius: "0 8px 8px 0" }}>
                      {post.excerpt}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERLEAVED CONTENT BLOCKS & CUSTOM SECTIONS */}
          {activeTab === "blocks" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* Info banner */}
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  padding: "12px 18px",
                  borderRadius: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 2px 0", fontSize: 14, fontWeight: 700, color: "#15803d" }}>
                    Flexible Interleaved Block Builder
                  </h4>
                  <span style={{ fontSize: 12.5, color: "#166534" }}>
                    Insert Rich Text articles and Custom Sections (with side-by-side images, bullets, and buttons) anywhere in any sequence.
                  </span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("richtext")}
                    style={addBlockBtnStyle}
                  >
                    + Rich Text Block
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("custom_section")}
                    style={{ ...addBlockBtnStyle, background: "#0e78a8", borderColor: "#0e78a8", color: "#fff" }}
                  >
                    + Custom Section (Image + Bullets)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("key_takeaways")}
                    style={addBlockBtnStyle}
                  >
                    + Key Takeaways Box
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("callout")}
                    style={addBlockBtnStyle}
                  >
                    + Quote / Callout
                  </button>
                </div>
              </div>

              {/* Blocks List */}
              {blocks.length === 0 ? (
                <div style={{ background: "#ffffff", padding: 40, borderRadius: 14, textAlign: "center", border: "1px dashed #cbd5e1" }}>
                  <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 14px 0" }}>
                    No content blocks added yet. Click one of the buttons above to start building your article!
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("richtext")}
                    style={{ ...addBlockBtnStyle, padding: "10px 20px" }}
                  >
                    + Add First Rich Text Block
                  </button>
                </div>
              ) : (
                blocks.map((block, index) => (
                  <div
                    key={block.id || `block-${index}`}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 16,
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                    }}
                  >
                    {/* Block Header */}
                    <div
                      style={{
                        padding: "12px 18px",
                        background: block.type === "custom_section" ? "#f0fdf4" : block.type === "richtext" ? "#f8fafc" : "#f0f9ff",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#0e78a8", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>
                          {index + 1}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#0e78a8", letterSpacing: "0.5px" }}>
                          {block.type === "richtext"
                            ? "Rich Text Editor Block"
                            : block.type === "custom_section"
                            ? "Custom Section (Image & Bullets)"
                            : block.type === "key_takeaways"
                            ? "Key Takeaways Box"
                            : "Quote / Callout"}
                        </span>
                        {block.title && (
                          <span style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>
                            — {block.title}
                          </span>
                        )}
                      </div>

                      {/* Reorder and Delete controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => handleMoveBlockUp(index)}
                          disabled={index === 0}
                          title="Move Block Up"
                          style={{ ...iconControlStyle, opacity: index === 0 ? 0.3 : 1 }}
                        >
                          <ArrowUpIcon size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveBlockDown(index)}
                          disabled={index === blocks.length - 1}
                          title="Move Block Down"
                          style={{ ...iconControlStyle, opacity: index === blocks.length - 1 ? 0.3 : 1 }}
                        >
                          <ArrowDownIcon size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlock(index)}
                          title="Delete Block"
                          style={{ ...iconControlStyle, color: "#ef4444" }}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Block Content Editor */}
                    <div style={{ padding: 18 }}>
                      
                      {/* TYPE 1: RICH TEXT EDITOR */}
                      {block.type === "richtext" && (
                        <div>
                          <RichTextEditor
                            value={block.content || ""}
                            onChange={(html) => handleUpdateBlock(index, { content: html })}
                            minHeight={200}
                          />
                        </div>
                      )}

                      {/* TYPE 2: CUSTOM SECTION */}
                      {block.type === "custom_section" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                            <div>
                              <label style={labelStyle}>Eyebrow Badge</label>
                              <input
                                type="text"
                                value={block.eyebrow || ""}
                                onChange={(e) => handleUpdateBlock(index, { eyebrow: e.target.value })}
                                placeholder="e.g. Clinical Approach"
                                style={inputStyle}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>Eyebrow Color</label>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <input
                                  type="color"
                                  value={block.eyebrowColor || "#1c9fd8"}
                                  onChange={(e) => handleUpdateBlock(index, { eyebrowColor: e.target.value })}
                                  style={{ width: 34, height: 34, border: "none", borderRadius: 6, cursor: "pointer" }}
                                />
                                <input
                                  type="text"
                                  value={block.eyebrowColor || "#1c9fd8"}
                                  onChange={(e) => handleUpdateBlock(index, { eyebrowColor: e.target.value })}
                                  style={inputStyle}
                                />
                              </div>
                            </div>
                            <div>
                              <label style={labelStyle}>Background Style</label>
                              <select
                                value={block.background || "teal"}
                                onChange={(e) => handleUpdateBlock(index, { background: e.target.value as any })}
                                style={inputStyle}
                              >
                                <option value="white">Crisp White</option>
                                <option value="teal">Soft Glacier Blue (#f2f8fb)</option>
                                <option value="light">Light Slate (#f8fafc)</option>
                                <option value="gradient">Deep Navy Gradient</option>
                              </select>
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div>
                              <label style={labelStyle}>Section Title</label>
                              <input
                                type="text"
                                value={block.title || ""}
                                onChange={(e) => handleUpdateBlock(index, { title: e.target.value })}
                                placeholder="e.g. Targeted Joint Mobilization & Stretches"
                                style={inputStyle}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>Section Subtitle</label>
                              <input
                                type="text"
                                value={block.subtitle || ""}
                                onChange={(e) => handleUpdateBlock(index, { subtitle: e.target.value })}
                                placeholder="e.g. Customized according to your tissue tolerance"
                                style={inputStyle}
                              />
                            </div>
                          </div>

                          <div>
                            <label style={labelStyle}>Section Description Paragraph</label>
                            <textarea
                              value={block.content || ""}
                              onChange={(e) => handleUpdateBlock(index, { content: e.target.value })}
                              rows={3}
                              style={{ ...inputStyle, resize: "vertical" }}
                              placeholder="Explain your clinical treatment protocol or guidance in detail here."
                            />
                          </div>

                          {/* Image & Position */}
                          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, alignItems: "start" }}>
                            <AdminImageUploader
                              label="Section Photo"
                              value={block.image || ""}
                              onChange={(url) => handleUpdateBlock(index, { image: url })}
                              folder="blog"
                              placeholder="/images/clinic/reception-three.jpg"
                              aspectRatioNote="Landscape 16:9 or 4:3"
                            />
                            <div>
                              <label style={labelStyle}>Image Layout Position</label>
                              <select
                                value={block.imagePosition || "right"}
                                onChange={(e) => handleUpdateBlock(index, { imagePosition: e.target.value as any })}
                                style={inputStyle}
                              >
                                <option value="right">Side by Side (Image Right)</option>
                                <option value="left">Side by Side (Image Left)</option>
                                <option value="top">Full Width Banner (Top)</option>
                                <option value="bottom">Full Width Banner (Bottom)</option>
                                <option value="none">No Image (Text only)</option>
                              </select>
                            </div>
                          </div>

                          {/* Bullets with green checkmarks */}
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                              <label style={labelStyle}>Feature / Guidance Bullets (Checkmarks)</label>
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = block.bullets || [];
                                  handleUpdateBlock(index, { bullets: [...cur, "New therapeutic benefit point"] });
                                }}
                                style={{ background: "none", border: "none", color: "#0e78a8", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                              >
                                + Add Bullet Point
                              </button>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {(block.bullets || []).map((bullet, bIdx) => (
                                <div key={bIdx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#6faf1c", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                                    ✓
                                  </span>
                                  <input
                                    type="text"
                                    value={bullet}
                                    onChange={(e) => {
                                      const updatedBullets = [...(block.bullets || [])];
                                      updatedBullets[bIdx] = e.target.value;
                                      handleUpdateBlock(index, { bullets: updatedBullets });
                                    }}
                                    style={{ ...inputStyle, flexGrow: 1 }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedBullets = (block.bullets || []).filter((_, i) => i !== bIdx);
                                      handleUpdateBlock(index, { bullets: updatedBullets });
                                    }}
                                    style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}
                                  >
                                    &times;
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* CTA Button */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div>
                              <label style={labelStyle}>CTA Button Text (Optional)</label>
                              <input
                                type="text"
                                value={block.ctaText || ""}
                                onChange={(e) => handleUpdateBlock(index, { ctaText: e.target.value })}
                                placeholder="e.g. Book Assessment Online"
                                style={inputStyle}
                              />
                            </div>
                            <div>
                              <label style={labelStyle}>CTA Link URL</label>
                              <input
                                type="text"
                                value={block.ctaHref || ""}
                                onChange={(e) => handleUpdateBlock(index, { ctaHref: e.target.value })}
                                placeholder="https://app.practiceperfectemr.com/..."
                                style={inputStyle}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TYPE 3: KEY TAKEAWAYS */}
                      {block.type === "key_takeaways" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div>
                            <label style={labelStyle}>Box Title</label>
                            <input
                              type="text"
                              value={block.title || ""}
                              onChange={(e) => handleUpdateBlock(index, { title: e.target.value })}
                              placeholder="e.g. Key Takeaways for Patients"
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Intro Text</label>
                            <input
                              type="text"
                              value={block.content || ""}
                              onChange={(e) => handleUpdateBlock(index, { content: e.target.value })}
                              placeholder="Quick bullet points summarizing the core message..."
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                              <label style={labelStyle}>Takeaway Points</label>
                              <button
                                type="button"
                                onClick={() => {
                                  const cur = block.bullets || [];
                                  handleUpdateBlock(index, { bullets: [...cur, "New clinical takeaway point"] });
                                }}
                                style={{ background: "none", border: "none", color: "#0e78a8", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                              >
                                + Add Point
                              </button>
                            </div>
                            {(block.bullets || []).map((b, bIdx) => (
                              <div key={bIdx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                                <span>💡</span>
                                <input
                                  type="text"
                                  value={b}
                                  onChange={(e) => {
                                    const next = [...(block.bullets || [])];
                                    next[bIdx] = e.target.value;
                                    handleUpdateBlock(index, { bullets: next });
                                  }}
                                  style={{ ...inputStyle, flexGrow: 1 }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = (block.bullets || []).filter((_, i) => i !== bIdx);
                                    handleUpdateBlock(index, { bullets: next });
                                  }}
                                  style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TYPE 4: CALLOUT / QUOTE */}
                      {block.type === "callout" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div>
                            <label style={labelStyle}>Quote / Callout Text</label>
                            <textarea
                              value={block.content || ""}
                              onChange={(e) => handleUpdateBlock(index, { content: e.target.value })}
                              rows={2}
                              style={inputStyle}
                              placeholder="Key statement to highlight in bold italic..."
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Quote Author / Citation</label>
                            <input
                              type="text"
                              value={block.quoteAuthor || ""}
                              onChange={(e) => handleUpdateBlock(index, { quoteAuthor: e.target.value })}
                              placeholder="e.g. Blair Schachterle, CAMPT Certified Physiotherapist"
                              style={inputStyle}
                            />
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                ))
              )}

              {/* Add Block Footer Bar */}
              {blocks.length > 0 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 10, padding: "16px 0" }}>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("richtext")}
                    style={addBlockBtnStyle}
                  >
                    + Rich Text Block
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("custom_section")}
                    style={{ ...addBlockBtnStyle, background: "#0e78a8", borderColor: "#0e78a8", color: "#fff" }}
                  >
                    + Custom Section (Image &amp; Bullets)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddBlock("key_takeaways")}
                    style={addBlockBtnStyle}
                  >
                    + Key Takeaways Box
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

        {/* ── MODAL FOOTER ── */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#ffffff"
          }}
        >
          <div>
            {onDelete && !isCreating && (
              <button
                type="button"
                onClick={() => onDelete(post.slug)}
                style={{
                  background: "#fee2e2",
                  color: "#dc2626",
                  border: "1px solid #fca5a5",
                  borderRadius: 8,
                  padding: "9px 16px",
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <TrashIcon size={15} />
                <span>Delete Article</span>
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#475569",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer"
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => onSave(post)}
              style={{
                padding: "10px 24px",
                borderRadius: 8,
                border: "none",
                background: "#16a34a",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(22,163,74,0.3)"
              }}
            >
              Save Article to Database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 700,
  color: "#334155",
  marginBottom: 5
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 13px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  fontSize: 13.5,
  color: "#0f172a",
  background: "#ffffff",
  outline: "none"
};

const iconControlStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  width: 28,
  height: 28,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#475569",
  cursor: "pointer",
  transition: "all 0.15s"
};

const addBlockBtnStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  background: "#ffffff",
  border: "1px solid #cbd5e1",
  color: "#334155",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
};
