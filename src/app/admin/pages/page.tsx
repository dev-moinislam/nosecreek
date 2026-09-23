"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRole } from "@/components/admin/RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { CustomPage, FAQItem, PageMetaItem } from "@/types/content";
import { getCustomPages } from "@/lib/api";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { GlobeIcon, SearchIcon, PlusIcon } from "@/components/admin/AdminIcons";

// Pre-defined Calgary neighborhood presets for quick 1-click creation
const NEIGHBORHOOD_PRESETS = [
  {
    name: "Thorncliffe",
    slug: "thorncliffe",
    title: "Physiotherapy in Thorncliffe Calgary | Nose Creek Physiotherapy",
    subtitle: "Personalized, Compassionate Physical Rehabilitation Just Minutes From Thorncliffe",
    proximity: "just 4 minutes south of Beddington Towne Centre via Centre Street N",
    description: "<p>If you live or work in <strong>Thorncliffe, Calgary</strong> and are suffering from back pain, neck stiffness, sports injuries, or joint discomfort, <strong>Nose Creek Physiotherapy</strong> is your trusted neighborhood rehabilitation clinic.</p><p>Located just moments away at Beddington Towne Centre, our team of licensed physical therapists, chiropractors, and massage therapists provide one-on-one, hands-on treatment designed to resolve the root cause of your pain—not just mask the symptoms.</p>",
    descriptionCol2: "<h3>Why Thorncliffe Residents Choose Nose Creek Physio</h3><ul><li><strong>Fast, Convenient Access:</strong> Only a 4-minute drive from Thorncliffe with abundant free plaza parking.</li><li><strong>Direct Insurance Billing:</strong> We bill directly to over 25 major health insurance providers (Blue Cross, Sun Life, Manulife, Canada Life, and more).</li><li><strong>Experienced Clinicians:</strong> Over 23 years of clinical excellence with FCAMPT advanced manual therapy credentials.</li><li><strong>Evening & Saturday Appointments:</strong> Flexible scheduling before or after your workday.</li></ul>",
    faqs: [
      {
        question: "How far is Nose Creek Physiotherapy from Thorncliffe?",
        answer: "We are located at Beddington Towne Centre (#22, 8120 Beddington Blvd NW), which is approximately a 4-minute drive north from Thorncliffe via Centre Street N."
      },
      {
        question: "Do I need a doctor's referral for physiotherapy in Thorncliffe?",
        answer: "No. In Alberta, you have direct access to physiotherapy without requiring a physician's referral, though some private health insurance plans may require one for reimbursement."
      },
      {
        question: "Do you offer direct billing for Thorncliffe patients?",
        answer: "Yes, we direct bill to all major extended health insurance providers, as well as Alberta Blue Cross, WCB for workplace injuries, and auto insurance for motor vehicle accidents."
      }
    ]
  },
  {
    name: "Huntington Hills",
    slug: "huntington-hills",
    title: "Physiotherapy in Huntington Hills Calgary | Nose Creek Physiotherapy",
    subtitle: "Evidence-Based Physiotherapy & Chiropractic Care Serving Huntington Hills Residents",
    proximity: "directly adjacent to Huntington Hills along Beddington Blvd & 4th Street NW",
    description: "<p>Residents of <strong>Huntington Hills</strong> seeking top-tier physiotherapy, sports injury rehabilitation, or chronic pain relief have relied on <strong>Nose Creek Physiotherapy</strong> since 2001.</p><p>Whether you're recovering from a workplace injury, preparing for surgery, dealing with sciatica, or looking to regain your mobility, our multidisciplinary team provides personalized care tailored to your unique goals.</p>",
    descriptionCol2: "<h3>Comprehensive Care for Huntington Hills Patients</h3><ul><li><strong>Spinal & Joint Care:</strong> Targeted relief for lower back pain, sciatica, neck stiffness, and whiplash.</li><li><strong>Sports Rehabilitation:</strong> Evidence-informed therapy for runners, hockey players, soccer athletes, and weekend warriors.</li><li><strong>No Waitlists:</strong> Same-week and next-day appointment availability so you can start recovering immediately.</li><li><strong>Direct Billing:</strong> Instant claims processing for minimal out-of-pocket hassle.</li></ul>",
    faqs: [
      {
        question: "How close is your clinic to Huntington Hills?",
        answer: "We are located right next to Huntington Hills at Beddington Towne Centre, just 2-3 minutes away via 4th Street NW or Beddington Blvd."
      },
      {
        question: "What therapies do you offer for Huntington Hills residents?",
        answer: "Our services include manual therapy, therapeutic exercise prescription, intramuscular stimulation (IMS / dry needling), massage therapy, chiropractic adjustments, custom orthotics, and shockwave therapy."
      }
    ]
  },
  {
    name: "MacEwan",
    slug: "macewan",
    title: "Physiotherapy in MacEwan Calgary | Nose Creek Physiotherapy",
    subtitle: "Restore Mobility, Relieve Pain & Move Naturally Near MacEwan Glen",
    proximity: "just 5 minutes east from MacEwan via Berkshire Blvd & Beddington Trail",
    description: "<p>Looking for a caring, results-driven physiotherapy clinic near <strong>MacEwan, Calgary</strong>? At <strong>Nose Creek Physiotherapy</strong>, our mission is to help you overcome acute injuries and chronic limitations so you can get back to doing what you love.</p><p>We take the time to listen, perform thorough biomechanical assessments, and create custom treatment roadmaps that empower lasting wellness.</p>",
    descriptionCol2: "<h3>Clinic Advantages for MacEwan Families</h3><ul><li><strong>5 Minutes Away:</strong> Quick commute via Berkshire Blvd with stress-free free parking outside our clinic doors.</li><li><strong>Multidisciplinary Team:</strong> Access physiotherapists, massage therapists, and chiropractors under one supportive roof.</li><li><strong>Advanced Modalities:</strong> Equipped with Shockwave therapy, IMS dry needling, and gait analysis for custom orthotics.</li></ul>",
    faqs: [
      {
        question: "Where is the clinic located relative to MacEwan?",
        answer: "We are situated in Beddington Towne Centre, only 5 minutes from MacEwan. You can take Berkshire Blvd NW to Beddington Blvd NW."
      },
      {
        question: "Can I book appointments online?",
        answer: "Yes, our online booking portal is open 24/7 so you can select your preferred practitioner and time slot conveniently from your phone or computer."
      }
    ]
  },
  {
    name: "Beddington",
    slug: "beddington",
    title: "Physiotherapy in Beddington Calgary NW | Nose Creek Physiotherapy",
    subtitle: "Your Premier Local Physiotherapy Clinic in the Heart of Beddington Towne Centre",
    proximity: "located directly inside Beddington Towne Centre with free plaza parking",
    description: "<p>Conveniently situated right in <strong>Beddington Towne Centre</strong>, <strong>Nose Creek Physiotherapy</strong> has been the benchmark for clinical excellence in Calgary North for more than two decades.</p><p>From motor vehicle accident recovery to complex spinal rehabilitation, our practitioners combine proven manual techniques with modern therapeutic exercises to restore active living.</p>",
    descriptionCol2: "<h3>Why Beddington Chooses Nose Creek Physio</h3><ul><li><strong>Directly In Your Community:</strong> Located steps from local shopping with plenty of free parking.</li><li><strong>Direct Billing:</strong> Instant electronic billing for most private insurance carriers, WCB, and auto insurers.</li><li><strong>Dedicated One-on-One Sessions:</strong> No rushed assembly-line care; your recovery is our singular priority.</li></ul>",
    faqs: [
      {
        question: "Where exactly in Beddington are you located?",
        answer: "We are at #22, 8120 Beddington Blvd NW, Calgary, AB T3K 2A8, inside Beddington Towne Centre near major transit stops."
      },
      {
        question: "What are your clinic hours?",
        answer: "We are open Monday through Thursday 6:45am–7:15pm, Friday 6:45am–6:00pm, and Saturdays 8:00am–1:00pm."
      }
    ]
  }
];

export default function AdminPagesManager() {
  const { isAdmin } = useRole();
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showPresetPicker, setShowPresetPicker] = useState(false);

  // Load pages from Supabase
  const loadPages = async () => {
    setLoading(true);
    try {
      const data = await getCustomPages();
      setPages(data);
    } catch (err) {
      console.error("Error loading custom pages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  // Filter pages by category and search
  const filteredPages = pages.filter((p) => {
    const matchesCat = categoryFilter === "All" || p.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      (p.subtitle && p.subtitle.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  // Slug generator helper
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Open New Blank Page Modal
  const handleCreateNew = () => {
    setIsNew(true);
    setEditingPage({
      id: `page-${Date.now()}`,
      slug: "",
      title: "",
      subtitle: "",
      category: "Neighborhood",
      hero_image: "/images/clinic/clinic-mobile.jpg",
      content: "<p>Write your landing page introduction and narrative here...</p>",
      content_col2: "",
      content_layout: "1-column",
      cta_text: "Book Online",
      cta_url: "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington",
      secondary_cta_text: "Free Phone Consultation",
      secondary_cta_url: "/telephone-consultation",
      faqs: [],
      seo: {
        title: "",
        description: "",
        noIndex: false,
        noFollow: false
      },
      is_published: true
    });
  };

  // Apply Neighborhood Preset
  const handleApplyPreset = (preset: typeof NEIGHBORHOOD_PRESETS[0]) => {
    setIsNew(true);
    setShowPresetPicker(false);
    setEditingPage({
      id: `page-${preset.slug}`,
      slug: preset.slug,
      title: preset.title,
      subtitle: preset.subtitle,
      category: "Neighborhood",
      hero_image: "/images/clinic/reception-three.jpg",
      content: preset.description,
      content_col2: preset.descriptionCol2,
      content_layout: "2-column",
      cta_text: "Book Online",
      cta_url: "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington",
      secondary_cta_text: "Inquire About Cost & Availability",
      secondary_cta_url: "/inquire",
      faqs: preset.faqs,
      seo: {
        title: preset.title,
        description: preset.subtitle,
        noIndex: false,
        noFollow: false
      },
      is_published: true
    });
  };

  // Save Page Handler
  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    const cleanSlug = slugify(editingPage.slug);
    if (!cleanSlug) {
      alert("Please provide a valid URL slug (e.g. thorncliffe, huntington-hills).");
      return;
    }

    // Check for duplicate slug among other pages
    const isDuplicate = pages.some((p) => p.slug === cleanSlug && p.id !== editingPage.id);
    if (isDuplicate) {
      alert(`The URL slug "${cleanSlug}" is already in use by another page. Please choose a unique slug.`);
      return;
    }

    setSaving(true);
    setSaveStatus("Saving page...");

    const finalPage: CustomPage = {
      ...editingPage,
      slug: cleanSlug,
      title: editingPage.title.trim(),
      subtitle: editingPage.subtitle?.trim() || undefined,
      content_layout: editingPage.content_layout || "1-column",
      updated_at: new Date().toISOString()
    };

    const updatedPages = isNew
      ? [finalPage, ...pages]
      : pages.map((p) => (p.id === finalPage.id ? finalPage : p));

    try {
      // 1. Local / optimistic update
      setPages(updatedPages);
      if (typeof window !== "undefined") {
        localStorage.setItem("adm_custom_pages", JSON.stringify(updatedPages));
      }

      // 2. Persist via backend API
      const res = await fetch("/api/admin/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "custom_pages",
          data: updatedPages
        })
      });

      if (!res.ok) {
        throw new Error("Failed to save to server");
      }

      setSaveStatus("✓ Page saved successfully!");
      setTimeout(() => {
        setSaveStatus(null);
        setEditingPage(null);
        setIsNew(false);
      }, 700);
    } catch (err: any) {
      console.error("Save page error:", err);
      alert("Error saving page: " + (err.message || "Unknown error"));
      setSaveStatus(null);
    } finally {
      setSaving(false);
    }
  };

  // Delete Page Handler
  const handleDeletePage = async (page: CustomPage) => {
    if (!confirm(`Are you sure you want to delete "${page.title}" (/${page.slug})?`)) {
      return;
    }

    const updatedPages = pages.filter((p) => p.id !== page.id);
    setPages(updatedPages);
    if (typeof window !== "undefined") {
      localStorage.setItem("adm_custom_pages", JSON.stringify(updatedPages));
    }

    try {
      await fetch("/api/admin/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "custom_pages",
          data: updatedPages,
          deletedSlug: page.slug
        })
      });
    } catch (err) {
      console.error("Error deleting page:", err);
    }
  };

  // FAQ management inside modal
  const handleAddFaq = () => {
    if (!editingPage) return;
    const curFaqs = editingPage.faqs || [];
    setEditingPage({
      ...editingPage,
      faqs: [...curFaqs, { question: "", answer: "" }]
    });
  };

  const handleUpdateFaq = (index: number, field: "question" | "answer", val: string) => {
    if (!editingPage) return;
    const curFaqs = [...(editingPage.faqs || [])];
    curFaqs[index] = { ...curFaqs[index], [field]: val };
    setEditingPage({ ...editingPage, faqs: curFaqs });
  };

  const handleRemoveFaq = (index: number) => {
    if (!editingPage) return;
    const curFaqs = (editingPage.faqs || []).filter((_, i) => i !== index);
    setEditingPage({ ...editingPage, faqs: curFaqs });
  };

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>📍</span>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a" }}>
              Pages &amp; Neighborhood Landing Pages
            </h1>
          </div>
          <p style={{ margin: "6px 0 0 0", color: "#64748b", fontSize: 14 }}>
            Build, publish, and customize dedicated high-converting landing pages for Calgary communities (Thorncliffe, Huntington Hills, MacEwan, etc.) with 1-col / 2-col rich text, local FAQs, and robots directives.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {/* Quick Preset Generator */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowPresetPicker(!showPresetPicker)}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid #bae6fd",
                background: "#f0f9ff",
                color: "#0369a1",
                fontWeight: 700,
                fontSize: 13.5,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span>⚡ Neighborhood Presets</span>
              <span>▾</span>
            </button>

            {showPresetPicker && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 6,
                  width: 320,
                  background: "#ffffff",
                  borderRadius: 12,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                  border: "1px solid #e2e8f0",
                  padding: "8px 0",
                  zIndex: 100
                }}
              >
                <div style={{ padding: "8px 14px 6px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Select Calgary Community:
                </div>
                {NEIGHBORHOOD_PRESETS.map((p) => {
                  const alreadyExists = pages.some((page) => page.slug === p.slug);
                  return (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: 13,
                        color: "#1e293b",
                        transition: "background 0.1s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <div>
                        <strong>{p.name}</strong>
                        <div style={{ fontSize: 11, color: "#64748b" }}>/{p.slug}</div>
                      </div>
                      {alreadyExists ? (
                        <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "#dcfce7", color: "#166534", fontWeight: 700 }}>
                          Created
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: "#0284c7", fontWeight: 700 }}>+ Use</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Create Blank Page Button */}
          <button
            type="button"
            onClick={handleCreateNew}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #0e78a8 0%, #0369a1 100%)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 6px rgba(14,120,168,0.25)"
            }}
          >
            <span>+ Create New Page</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["All", "Neighborhood", "Landing Page", "General"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: "none",
                background: categoryFilter === cat ? "#0e78a8" : "#f1f5f9",
                color: categoryFilter === cat ? "#ffffff" : "#475569",
                fontWeight: 700,
                fontSize: 12.5,
                cursor: "pointer"
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ minWidth: 260, position: "relative" }}>
          <input
            type="text"
            placeholder="Search pages by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 34px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              fontSize: 13,
              outline: "none"
            }}
          />
          <span style={{ position: "absolute", left: 10, top: 9, color: "#94a3b8", pointerEvents: "none" }}>
            🔍
          </span>
        </div>
      </div>

      {/* Pages Table */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#64748b" }}>
            <div style={{ display: "inline-block", width: 24, height: 24, border: "3px solid #0e78a8", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 12 }} />
            <div>Loading pages...</div>
          </div>
        ) : filteredPages.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#64748b" }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>No landing pages found</p>
            <p style={{ margin: "6px 0 16px 0", fontSize: 13 }}>Get started quickly by using a pre-filled Calgary neighborhood preset or create a custom page from scratch.</p>
            <button
              type="button"
              onClick={() => handleApplyPreset(NEIGHBORHOOD_PRESETS[0])}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "none",
                background: "#0e78a8",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer"
              }}
            >
              + Create Thorncliffe Page
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 700 }}>
                  <th style={{ padding: "12px 18px", width: "30%" }}>Page &amp; Live Route</th>
                  <th style={{ padding: "12px 18px", width: "15%" }}>Category</th>
                  <th style={{ padding: "12px 18px", width: "12%" }}>Layout</th>
                  <th style={{ padding: "12px 18px", width: "15%" }}>Robots Status</th>
                  <th style={{ padding: "12px 18px", width: "12%" }}>Status</th>
                  <th style={{ padding: "12px 18px", width: "16%", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((page, idx) => {
                  const isNoIndex = Boolean(page.seo?.noIndex);
                  const isNoFollow = Boolean(page.seo?.noFollow);

                  return (
                    <tr
                      key={page.id}
                      style={{
                        borderBottom: idx < filteredPages.length - 1 ? "1px solid #f1f5f9" : "none",
                        transition: "background 0.15s ease"
                      }}
                    >
                      {/* Title & Slug */}
                      <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                        <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
                          {page.title}
                        </div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                          <code style={{ fontSize: 12, background: "#f1f5f9", padding: "2px 8px", borderRadius: 4, color: "#0369a1", fontWeight: 700 }}>
                            /{page.slug}
                          </code>
                          <a
                            href={`/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#64748b", textDecoration: "none", fontSize: 12, fontWeight: 700 }}
                            title="Open live page in new tab"
                          >
                            ↗ Live
                          </a>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: page.category === "Neighborhood" ? "#e0f2fe" : "#f1f5f9",
                          color: page.category === "Neighborhood" ? "#0369a1" : "#475569"
                        }}>
                          {page.category || "Neighborhood"}
                        </span>
                      </td>

                      {/* Layout */}
                      <td style={{ padding: "14px 18px", verticalAlign: "middle", color: "#475569", fontWeight: 600 }}>
                        {page.content_layout === "2-column" ? "2-Column Story" : "1-Column Standard"}
                      </td>

                      {/* Robots */}
                      <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                        {isNoIndex ? (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "#fee2e2", color: "#b91c1c" }}>
                            ⛔ noindex
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "#f0fdf4", color: "#166534" }}>
                            🟢 index{isNoFollow ? ", nofollow" : ", follow"}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 18px", verticalAlign: "middle" }}>
                        <span style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: page.is_published ? "#dcfce7" : "#fef3c7",
                          color: page.is_published ? "#15803d" : "#92400e"
                        }}>
                          {page.is_published ? "Published" : "Draft"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 18px", verticalAlign: "middle", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setIsNew(false);
                              setEditingPage({ ...page });
                            }}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              background: "#ffffff",
                              color: "#0f172a",
                              fontWeight: 700,
                              fontSize: 12,
                              cursor: "pointer"
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePage(page)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 6,
                              border: "1px solid #fecaca",
                              background: "#ffffff",
                              color: "#dc2626",
                              fontWeight: 700,
                              fontSize: 12,
                              cursor: "pointer"
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Page Edit Drawer Modal */}
      {editingPage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            justifyContent: "flex-end"
          }}
          onClick={() => setEditingPage(null)}
        >
          <div
            style={{
              width: "min(880px, 95vw)",
              height: "100%",
              background: "#ffffff",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              padding: "28px 32px"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 16, borderBottom: "1px solid #e2e8f0", marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {isNew ? "Creating New Landing Page" : "Editing Landing Page"}
                </span>
                <h2 style={{ margin: "2px 0 0 0", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
                  {editingPage.title || "Untitled Page"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingPage(null)}
                style={{
                  border: "none",
                  background: "#f1f5f9",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#64748b"
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePage} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Basic Meta Fields */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                    Page Title <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPage.title}
                    onChange={(e) => {
                      const t = e.target.value;
                      setEditingPage({
                        ...editingPage,
                        title: t,
                        slug: isNew && !editingPage.slug ? slugify(t) : editingPage.slug
                      });
                    }}
                    placeholder="e.g. Physiotherapy in Thorncliffe Calgary | Nose Creek"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13.5 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                    URL Slug <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ padding: "9px 10px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRight: "none", borderTopLeftRadius: 8, borderBottomLeftRadius: 8, fontSize: 13, color: "#64748b", fontWeight: 700 }}>
                      /
                    </span>
                    <input
                      type="text"
                      required
                      value={editingPage.slug}
                      onChange={(e) => setEditingPage({ ...editingPage, slug: slugify(e.target.value) })}
                      placeholder="thorncliffe"
                      style={{ width: "100%", padding: "9px 12px", borderTopRightRadius: 8, borderBottomRightRadius: 8, border: "1px solid #cbd5e1", fontSize: 13.5 }}
                    />
                  </div>
                </div>
              </div>

              {/* Subtitle & Category */}
              <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                    Subtitle / Hero Tagline
                  </label>
                  <input
                    type="text"
                    value={editingPage.subtitle || ""}
                    onChange={(e) => setEditingPage({ ...editingPage, subtitle: e.target.value })}
                    placeholder="e.g. Compassionate physical rehabilitation just 4 minutes from Thorncliffe"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13.5 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                    Category
                  </label>
                  <select
                    value={editingPage.category || "Neighborhood"}
                    onChange={(e) => setEditingPage({ ...editingPage, category: e.target.value as any })}
                    style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13.5, background: "#fff" }}
                  >
                    <option value="Neighborhood">Neighborhood</option>
                    <option value="Landing Page">Landing Page</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              {/* Layout Switcher (1-Col vs 2-Col) */}
              <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ fontSize: 13.5, color: "#0f172a" }}>Narrative Content Layout</strong>
                    <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#64748b" }}>
                      Choose whether this landing page features a single full-width column or a side-by-side 2-column story format.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setEditingPage({ ...editingPage, content_layout: "1-column" })}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 6,
                        border: "1px solid",
                        borderColor: editingPage.content_layout !== "2-column" ? "#0284c7" : "#cbd5e1",
                        background: editingPage.content_layout !== "2-column" ? "#e0f2fe" : "#ffffff",
                        color: editingPage.content_layout !== "2-column" ? "#0369a1" : "#475569",
                        fontWeight: 700,
                        fontSize: 12.5,
                        cursor: "pointer"
                      }}
                    >
                      1-Column
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPage({ ...editingPage, content_layout: "2-column" })}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 6,
                        border: "1px solid",
                        borderColor: editingPage.content_layout === "2-column" ? "#0284c7" : "#cbd5e1",
                        background: editingPage.content_layout === "2-column" ? "#e0f2fe" : "#ffffff",
                        color: editingPage.content_layout === "2-column" ? "#0369a1" : "#475569",
                        fontWeight: 700,
                        fontSize: 12.5,
                        cursor: "pointer"
                      }}
                    >
                      2-Column Story
                    </button>
                  </div>
                </div>
              </div>

              {/* Column 1 Narrative RichTextEditor */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                  {editingPage.content_layout === "2-column" ? "Column 1: Main Story & Overview" : "Page Narrative Content"}
                </label>
                <RichTextEditor
                  value={editingPage.content || ""}
                  onChange={(val) => setEditingPage({ ...editingPage, content: val })}
                  placeholder="Describe your clinic services, rehabilitation approach, and benefits for this community..."
                  minHeight={180}
                />
              </div>

              {/* Column 2 Narrative RichTextEditor (if 2-column) */}
              {editingPage.content_layout === "2-column" && (
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                    Column 2: Community Highlights &amp; Clinic Advantages
                  </label>
                  <RichTextEditor
                    value={editingPage.content_col2 || ""}
                    onChange={(val) => setEditingPage({ ...editingPage, content_col2: val })}
                    placeholder="List bullets, parking details, direct billing carriers, and practitioner qualifications..."
                    minHeight={180}
                  />
                </div>
              )}

              {/* Call to Action Buttons */}
              <div style={{ background: "#f8fafc", padding: 16, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <strong style={{ fontSize: 13.5, color: "#0f172a", display: "block", marginBottom: 12 }}>
                  🎯 Call-To-Action (CTA) Conversion Buttons
                </strong>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Primary Button Text
                    </label>
                    <input
                      type="text"
                      value={editingPage.cta_text || ""}
                      onChange={(e) => setEditingPage({ ...editingPage, cta_text: e.target.value })}
                      placeholder="Book Online"
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}
                    />
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginTop: 8, marginBottom: 4 }}>
                      Primary Button URL
                    </label>
                    <input
                      type="text"
                      value={editingPage.cta_url || ""}
                      onChange={(e) => setEditingPage({ ...editingPage, cta_url: e.target.value })}
                      placeholder="https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Secondary Button Text
                    </label>
                    <input
                      type="text"
                      value={editingPage.secondary_cta_text || ""}
                      onChange={(e) => setEditingPage({ ...editingPage, secondary_cta_text: e.target.value })}
                      placeholder="Free Phone Consultation"
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}
                    />
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginTop: 8, marginBottom: 4 }}>
                      Secondary Button URL
                    </label>
                    <input
                      type="text"
                      value={editingPage.secondary_cta_url || ""}
                      onChange={(e) => setEditingPage({ ...editingPage, secondary_cta_url: e.target.value })}
                      placeholder="/telephone-consultation"
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}
                    />
                  </div>
                </div>
              </div>

              {/* Local FAQs Section */}
              <div style={{ background: "#ffffff", padding: 16, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <strong style={{ fontSize: 13.5, color: "#0f172a" }}>Frequently Asked Questions (FAQs)</strong>
                    <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#64748b" }}>
                      Local questions inject rich FAQPage schema for higher Google click-through rates.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      border: "1px solid #cbd5e1",
                      background: "#f1f5f9",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer"
                    }}
                  >
                    + Add Question
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(editingPage.faqs || []).map((faq, i) => (
                    <div key={i} style={{ background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#0369a1" }}>Question #{i + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(i)}
                          style={{ border: "none", background: "none", color: "#dc2626", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
                        >
                          ✕ Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => handleUpdateFaq(i, "question", e.target.value)}
                        placeholder="e.g. How far is your clinic from Thorncliffe?"
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13, marginBottom: 8 }}
                      />
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => handleUpdateFaq(i, "answer", e.target.value)}
                        placeholder="Answer describing proximity, directions, or booking..."
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* SEO & Robots Directives */}
              <div style={{ background: "#f8fafc", padding: 16, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <strong style={{ fontSize: 13.5, color: "#0f172a", display: "block", marginBottom: 12 }}>
                  🔍 Search Engine Optimization (SEO) &amp; Robots Directives
                </strong>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Meta Title (Google Result Headline)
                    </label>
                    <input
                      type="text"
                      value={editingPage.seo?.title || ""}
                      onChange={(e) => setEditingPage({
                        ...editingPage,
                        seo: { ...(editingPage.seo || {}), title: e.target.value }
                      })}
                      placeholder="Defaults to Page Title..."
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                      Meta Description (Google Snippet)
                    </label>
                    <textarea
                      rows={2}
                      value={editingPage.seo?.description || ""}
                      onChange={(e) => setEditingPage({
                        ...editingPage,
                        seo: { ...(editingPage.seo || {}), description: e.target.value }
                      })}
                      placeholder="Defaults to Subtitle..."
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 13 }}
                    />
                  </div>

                  {/* Robots Checkboxes */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>
                    <label style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      cursor: "pointer",
                      background: editingPage.seo?.noIndex ? "#fee2e2" : "#ffffff",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: editingPage.seo?.noIndex ? "1px solid #fecaca" : "1px solid #cbd5e1"
                    }}>
                      <input
                        type="checkbox"
                        checked={Boolean(editingPage.seo?.noIndex)}
                        onChange={(e) => setEditingPage({
                          ...editingPage,
                          seo: { ...(editingPage.seo || {}), noIndex: e.target.checked }
                        })}
                        style={{ marginTop: 2, accentColor: "#dc2626" }}
                      />
                      <div>
                        <strong style={{ fontSize: 12.5, color: editingPage.seo?.noIndex ? "#b91c1c" : "#1e293b" }}>
                          Disallow Indexing (`noindex`)
                        </strong>
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          Removes page from Google &amp; XML Sitemaps.
                        </div>
                      </div>
                    </label>

                    <label style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      cursor: "pointer",
                      background: editingPage.seo?.noFollow ? "#fef3c7" : "#ffffff",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: editingPage.seo?.noFollow ? "1px solid #fef3c7" : "1px solid #cbd5e1"
                    }}>
                      <input
                        type="checkbox"
                        checked={Boolean(editingPage.seo?.noFollow)}
                        onChange={(e) => setEditingPage({
                          ...editingPage,
                          seo: { ...(editingPage.seo || {}), noFollow: e.target.checked }
                        })}
                        style={{ marginTop: 2, accentColor: "#d97706" }}
                      />
                      <div>
                        <strong style={{ fontSize: 12.5, color: editingPage.seo?.noFollow ? "#92400e" : "#1e293b" }}>
                          Disallow Following (`nofollow`)
                        </strong>
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          Tells crawlers not to endorse links on this page.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Publication Status & Action Buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
                  <input
                    type="checkbox"
                    checked={editingPage.is_published}
                    onChange={(e) => setEditingPage({ ...editingPage, is_published: e.target.checked })}
                    style={{ width: 18, height: 18, accentColor: "#15803d" }}
                  />
                  <span>Publish this page immediately</span>
                </label>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setEditingPage(null)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#475569",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: "10px 24px",
                      borderRadius: 8,
                      border: "none",
                      background: "linear-gradient(135deg, #0e78a8 0%, #0369a1 100%)",
                      color: "#ffffff",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {saving ? "Saving Page..." : "💾 Save Page"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
