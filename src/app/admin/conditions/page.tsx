"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/components/admin/RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Condition, ServiceCustomSection, FAQItem } from "@/types/content";
import conditionsData from "@/data/conditions.json";
import LivePreviewPane from "@/components/admin/LivePreviewPane";

export default function AdminConditionsPage() {
  const { role, isAdmin, canDelete, canEditSlugs } = useRole();
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCondition, setEditingCondition] = useState<Condition | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchConditions = async () => {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("conditions")
          .select("*")
          .order("sort_order", { ascending: true });
        if (!error && data && data.length > 0) {
          setConditions(
            data.map((d: any) => ({
              id: d.id,
              slug: d.slug,
              name: d.name,
              shortDescription: d.short_description || "",
              description: d.description || "",
              heroImage: d.hero_image,
              sideImage: d.side_image,
              ctaText: d.cta_text || "Book Assessment Online",
              ctaMuted: d.cta_muted || false,
              benefits: d.benefits || [],
              symptoms: d.symptoms || [],
              treatmentApproach: d.treatment_approach || [],
              customSections: d.custom_sections || [],
              faqs: d.faqs || [],
              hiddenSections: d.hidden_sections || [],
              relatedServices: d.related_services || [],
              category: d.category || "general",
              seo: d.seo || {}
            }))
          );
        } else {
          setConditions(conditionsData as Condition[]);
        }
      } catch {
        setConditions(conditionsData as Condition[]);
      }
    } else if (typeof window !== "undefined") {
      const local = localStorage.getItem("adm_conditions");
      if (local) {
        setConditions(JSON.parse(local));
      } else {
        setConditions(conditionsData as Condition[]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConditions();
  }, []);

  const handleSave = async (cond: Condition) => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("conditions").upsert({
          id: cond.id || `cond-${cond.slug}`,
          slug: cond.slug,
          name: cond.name,
          short_description: cond.shortDescription || null,
          description: cond.description,
          hero_image: cond.heroImage || null,
          side_image: cond.sideImage || null,
          cta_text: cond.ctaText || "Book Assessment Online",
          cta_muted: cond.ctaMuted || false,
          benefits: cond.benefits || [],
          symptoms: cond.symptoms || [],
          treatment_approach: cond.treatmentApproach || [],
          custom_sections: cond.customSections || [],
          faqs: cond.faqs || [],
          hidden_sections: cond.hiddenSections || [],
          related_services: cond.relatedServices || [],
          category: cond.category || "general",
          seo: cond.seo || {},
          is_published: true
        });
      } catch (err) {
        console.error("Save condition failed:", err);
      }
    } else if (typeof window !== "undefined") {
      const updated = conditions.map((c) => (c.slug === cond.slug ? cond : c));
      if (!updated.find((c) => c.slug === cond.slug)) {
        updated.push(cond);
      }
      localStorage.setItem("adm_conditions", JSON.stringify(updated));
      setConditions(updated);
    }
    fetchConditions();
    alert("✓ Condition saved successfully!");
    setEditingCondition(null);
  };

  const handleDelete = async (slug: string) => {
    if (!canDelete) {
      alert("In Client Safe Mode, deleting core conditions is disabled to preserve SEO rankings. Switch to Master Admin mode if needed.");
      return;
    }
    if (!confirm(`Are you sure you want to delete the condition "${slug}"?`)) return;

    if (isSupabaseConfigured && supabase) {
      await supabase.from("conditions").delete().eq("slug", slug);
    } else if (typeof window !== "undefined") {
      const updated = conditions.filter((c) => c.slug !== slug);
      localStorage.setItem("adm_conditions", JSON.stringify(updated));
      setConditions(updated);
    }
    fetchConditions();
  };

  const filtered = conditions.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, fontFamily: "var(--adm-font-display)" }}>
            Treatable Conditions Manager
          </h2>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "2px 0 0 0" }}>
            Manage pain conditions, page sections, custom visual blocks, FAQs, symptoms, and treatment roadmaps
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() =>
              setEditingCondition({
                id: `cond-${Date.now()}`,
                slug: "new-condition",
                name: "New Condition",
                description: "",
                symptoms: [],
                treatmentApproach: [],
                customSections: [],
                faqs: [],
                benefits: [],
                hiddenSections: [],
                relatedServices: []
              })
            }
            className="adm-btn adm-btn-primary"
          >
            + Add New Condition
          </button>
        )}
      </div>

      {/* Role Banner if in Client Mode */}
      {!isAdmin && (
        <div className="adm-guarded-banner">
          <span>🛡️</span>
          <div>
            <strong>Client Safe Mode Active:</strong> You can safely edit descriptions, images, custom sections, symptoms, and FAQs. Condition URLs (slugs) and core deletions are protected to preserve SEO rankings.
          </div>
        </div>
      )}

      {/* Search Filter */}
      <div className="adm-card" style={{ padding: 16, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="🔍 Search conditions by name or description..."
          className="adm-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Conditions Table */}
      <div className="adm-card">
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Condition Name</th>
                <th>URL Slug</th>
                <th>Sections & FAQs</th>
                <th>Symptoms & Protocols</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 36, color: "#64748b" }}>
                    Loading conditions...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 36, color: "#64748b" }}>
                    No conditions found.
                  </td>
                </tr>
              ) : (
                filtered.map((cond) => (
                  <tr key={cond.slug}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{cond.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b", maxWidth: 280, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {cond.shortDescription || cond.description}
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: 12, background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>
                        /conditions/{cond.slug}
                      </code>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: "#0369a1", background: "#e0f2fe", padding: "3px 8px", borderRadius: 6, marginRight: 6 }}>
                        {cond.customSections?.length || 0} Sections
                      </span>
                      <span style={{ fontSize: 12, color: "#15803d", background: "#dcfce7", padding: "3px 8px", borderRadius: 6 }}>
                        {cond.faqs?.length || 0} FAQs
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, color: "#475569" }}>
                        {cond.symptoms?.length || 0} Symptoms · {cond.treatmentApproach?.length || 0} Steps
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => setPreviewUrl(`/conditions/${cond.slug}`)}
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        style={{ marginRight: 6 }}
                        title="View Live Visual Preview"
                      >
                        👁️ Preview
                      </button>
                      <button
                        onClick={() => setEditingCondition(JSON.parse(JSON.stringify(cond)))}
                        className="adm-btn adm-btn-primary adm-btn-sm"
                        style={{ marginRight: 6 }}
                      >
                        ✏️ Edit
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(cond.slug)}
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                          style={{ color: "#dc2626" }}
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Condition Visual Editor Modal */}
      {editingCondition && (
        <ConditionEditorModal
          condition={editingCondition}
          canEditSlugs={canEditSlugs}
          onClose={() => setEditingCondition(null)}
          onSave={handleSave}
          onPreview={(slug) => setPreviewUrl(`/conditions/${slug}`)}
        />
      )}

      {/* Live Preview Pane */}
      <LivePreviewPane
        url={previewUrl || "/conditions"}
        isOpen={Boolean(previewUrl)}
        onClose={() => setPreviewUrl(null)}
        title={`Live Preview: ${previewUrl}`}
      />
    </div>
  );
}

// Sub-component: Rich Condition Editor Modal with Modular Section Manager
function ConditionEditorModal({
  condition: initial,
  canEditSlugs,
  onClose,
  onSave,
  onPreview
}: {
  condition: Condition;
  canEditSlugs: boolean;
  onClose: () => void;
  onSave: (cond: Condition) => void;
  onPreview: (slug: string) => void;
}) {
  const [cond, setCond] = useState<Condition>(initial);
  const [activeTab, setActiveTab] = useState<"layout" | "general" | "sections" | "faqs" | "symptoms">("layout");
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);

  // Section Visibility toggle helper
  const hiddenSections = cond.hiddenSections || [];
  const isSectionHidden = (key: string) => hiddenSections.includes(key);

  const toggleSectionVisibility = (key: string) => {
    setCond((prev) => {
      const curHidden = prev.hiddenSections || [];
      const updatedHidden = curHidden.includes(key)
        ? curHidden.filter((k) => k !== key)
        : [...curHidden, key];
      return { ...prev, hiddenSections: updatedHidden };
    });
  };

  const [newSymptom, setNewSymptom] = useState("");
  const [newApproach, setNewApproach] = useState("");
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");

  // Symptom helpers
  const addSymptom = () => {
    if (!newSymptom.trim()) return;
    setCond((p) => ({ ...p, symptoms: [...(p.symptoms || []), newSymptom.trim()] }));
    setNewSymptom("");
  };

  const removeSymptom = (i: number) => {
    setCond((p) => ({ ...p, symptoms: p.symptoms?.filter((_, idx) => idx !== i) }));
  };

  // Approach helpers
  const addApproach = () => {
    if (!newApproach.trim()) return;
    setCond((p) => ({ ...p, treatmentApproach: [...(p.treatmentApproach || []), newApproach.trim()] }));
    setNewApproach("");
  };

  const removeApproach = (i: number) => {
    setCond((p) => ({ ...p, treatmentApproach: p.treatmentApproach?.filter((_, idx) => idx !== i) }));
  };

  // FAQ helpers
  const addFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    setCond((prev) => ({
      ...prev,
      faqs: [...(prev.faqs || []), { question: newFaqQ.trim(), answer: newFaqA.trim() }]
    }));
    setNewFaqQ("");
    setNewFaqA("");
  };

  const removeFaq = (idx: number) => {
    setCond((prev) => ({
      ...prev,
      faqs: prev.faqs?.filter((_, i) => i !== idx)
    }));
  };

  // Custom Sections Helper
  const addCustomSection = (pos: "right" | "left" | "top" | "bottom" | "none" = "right") => {
    const newSec: ServiceCustomSection = {
      id: `sec-${Date.now()}`,
      eyebrow: "Personalized Care Protocol",
      eyebrowColor: "#1c9fd8",
      title: `Understanding ${cond.name} & Recovery Protocol`,
      subtitle: "Targeted orthopaedic & manual assessment",
      content: "Explain your clinical approach, causes, and biomechanical adjustments here.",
      bullets: ["Direct billing available", "No physician referral required", "Personalized exercise conditioning"],
      image: "/images/clinic/treatment-hands-on.jpg",
      imagePosition: pos,
      background: "white"
    };
    setCond((prev) => ({
      ...prev,
      customSections: [...(prev.customSections || []), newSec]
    }));
    setActiveTab("sections");
  };

  const updateCustomSection = (idx: number, updated: Partial<ServiceCustomSection>) => {
    setCond((prev) => {
      const clone = [...(prev.customSections || [])];
      clone[idx] = { ...clone[idx], ...updated };
      return { ...prev, customSections: clone };
    });
  };

  const removeCustomSection = (idx: number) => {
    setCond((prev) => ({
      ...prev,
      customSections: prev.customSections?.filter((_, i) => i !== idx)
    }));
  };

  // Standard Page Sections Registry
  const pageSections = [
    {
      key: "hero",
      title: "Hero Header & Assessment Banner",
      desc: "Top banner with title, badges, ratings, and assessment booking button.",
      category: "Header"
    },
    {
      key: "at_a_glance",
      title: "Treatment At-A-Glance Bar",
      desc: "4 highlight cards: Duration, Direct Billing, Referral info, Care Plan.",
      category: "Summary"
    },
    {
      key: "clinical_overview",
      title: "Clinical Overview & Root Cause",
      desc: "Understanding this condition and how we fix the mechanical dysfunction.",
      category: "Overview"
    },
    {
      key: "custom_sections",
      title: `Custom Visual Sections (${cond.customSections?.length || 0} Sections)`,
      desc: "Rich storytelling sections with left/right/top/bottom image placement.",
      category: "Custom Content"
    },
    {
      key: "symptoms",
      title: `Common Symptoms Grid (${cond.symptoms?.length || 0} Signs)`,
      desc: "Recognize the signs and symptoms patients experience.",
      category: "Symptoms"
    },
    {
      key: "treatment_approach",
      title: `Our 4-Step Treatment Roadmap (${cond.treatmentApproach?.length || 0} Steps)`,
      desc: "Structured rehabilitation protocol from assessment to prevention.",
      category: "Roadmap"
    },
    {
      key: "related_therapies",
      title: "Recommended Treatments & Therapies",
      desc: "Cards linking to physiotherapy, massage, acupuncture, etc.",
      category: "Services"
    },
    {
      key: "team_carousel",
      title: "Meet Our Team Carousel",
      desc: "Scrolling carousel of registered physiotherapists & staff.",
      category: "Team"
    },
    {
      key: "faqs",
      title: `Frequently Asked Questions (${cond.faqs?.length || 0} FAQs)`,
      desc: "Interactive accordion answering patient questions & insurance.",
      category: "FAQ"
    },
    {
      key: "location_map",
      title: "Clinic Location & Interactive Google Map",
      desc: "Beddington location details, hours of operation, phone, and Google map.",
      category: "Location"
    },
    {
      key: "decision_ctas",
      title: "Decision CTAs (Free Discovery & Phone Consult)",
      desc: "Two cards offering Free Discovery Session or Telephone Consult.",
      category: "Conversion"
    },
    {
      key: "other_links",
      title: "Explore Other 17 Conditions",
      desc: "Pill buttons linking to other physical conditions.",
      category: "Navigation"
    },
    {
      key: "bottom_cta",
      title: "Bottom Booking Call-to-Action Banner",
      desc: "Full-width high-contrast booking banner at the bottom of the page.",
      category: "Conversion"
    }
  ];

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal wide" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "92vh", width: "95%", maxWidth: 1050 }}>
        
        {/* Header */}
        <div className="adm-modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
              Edit Condition: {cond.name}
            </h3>
            <span style={{ fontSize: 13, color: "var(--adm-text-muted)" }}>
              /conditions/{cond.slug}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => onPreview(cond.slug)}
              className="adm-btn adm-btn-secondary adm-btn-sm"
            >
              👁️ Preview Live
            </button>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", padding: "0 20px", overflowX: "auto" }}>
          {[
            { id: "layout", label: "🧩 Page Sections & Layout" },
            { id: "general", label: "📝 General & Details" },
            { id: "sections", label: `🎨 Custom Sections (${cond.customSections?.length || 0})` },
            { id: "faqs", label: `❓ FAQ Builder (${cond.faqs?.length || 0})` },
            { id: "symptoms", label: `🩺 Symptoms & Roadmap (${cond.symptoms?.length || 0})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: "12px 18px",
                border: "none",
                background: "none",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                color: activeTab === tab.id ? "var(--adm-primary)" : "#64748b",
                borderBottom: activeTab === tab.id ? "2px solid var(--adm-primary)" : "2px solid transparent"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="adm-modal-body">

          {/* ── TAB 1: PAGE SECTIONS & MODULAR BLOCK MANAGER ── */}
          {activeTab === "layout" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, background: "#f0f9ff", border: "1px solid #bae6fd", padding: "14px 18px", borderRadius: 10 }}>
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: 14, fontWeight: 700, color: "#0369a1" }}>
                    Modular Condition Page Section Manager
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: "#0284c7" }}>
                    Turn sections ON or OFF, hide sections you don&apos;t need (e.g. Clinical Overview), or add new custom storytelling blocks.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(true)}
                  className="adm-btn adm-btn-primary adm-btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <span style={{ fontSize: 16 }}>+</span> Add / Insert Section
                </button>
              </div>

              {/* Sections List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {pageSections.map((sec, idx) => {
                  const hidden = isSectionHidden(sec.key);
                  return (
                    <div
                      key={sec.key}
                      style={{
                        background: hidden ? "#f8fafc" : "#ffffff",
                        border: hidden ? "1px dashed #cbd5e1" : "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "14px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 16,
                        opacity: hidden ? 0.65 : 1,
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: hidden ? "#e2e8f0" : "#e0f2fe",
                            color: hidden ? "#64748b" : "#0284c7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 13
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <strong style={{ fontSize: 14, color: hidden ? "#64748b" : "#1e293b" }}>
                              {sec.title}
                            </strong>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "2px 7px",
                                borderRadius: 999,
                                background: hidden ? "#fee2e2" : "#dcfce7",
                                color: hidden ? "#991b1b" : "#166534"
                              }}
                            >
                              {hidden ? "🚫 Hidden / Deleted" : "🟢 Visible"}
                            </span>
                          </div>
                          <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>
                            {sec.desc}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {sec.key === "custom_sections" && (
                          <button
                            type="button"
                            onClick={() => setActiveTab("sections")}
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                          >
                            🎨 Edit Sections
                          </button>
                        )}
                        {sec.key === "faqs" && (
                          <button
                            type="button"
                            onClick={() => setActiveTab("faqs")}
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                          >
                            ❓ Edit FAQs
                          </button>
                        )}
                        {sec.key === "symptoms" && (
                          <button
                            type="button"
                            onClick={() => setActiveTab("symptoms")}
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                          >
                            🩺 Edit Symptoms
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleSectionVisibility(sec.key)}
                          className={`adm-btn adm-btn-sm ${hidden ? "adm-btn-primary" : "adm-btn-secondary"}`}
                          style={{ minWidth: 100 }}
                        >
                          {hidden ? "👁️ Restore" : "🗑️ Delete / Hide"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TAB 2: GENERAL & DETAILS ── */}
          {activeTab === "general" && (
            <div>
              <div className="adm-form-group">
                <label className="adm-form-label">Condition Name</label>
                <input
                  type="text"
                  className="adm-input"
                  value={cond.name}
                  onChange={(e) => setCond({ ...cond, name: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">
                  URL Slug {canEditSlugs ? "" : "(Protected in Client Mode)"}
                </label>
                <input
                  type="text"
                  className="adm-input"
                  value={cond.slug}
                  disabled={!canEditSlugs}
                  onChange={(e) => setCond({ ...cond, slug: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Short Summary (Featured in cards & search)</label>
                <textarea
                  className="adm-textarea"
                  style={{ minHeight: 70 }}
                  value={cond.shortDescription || ""}
                  onChange={(e) => setCond({ ...cond, shortDescription: e.target.value })}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Clinical Overview & Root Cause Explanation</label>
                <textarea
                  className="adm-textarea"
                  style={{ minHeight: 120 }}
                  value={cond.description}
                  onChange={(e) => setCond({ ...cond, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Hero / Featured Image Path</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={cond.heroImage || ""}
                    onChange={(e) => setCond({ ...cond, heroImage: e.target.value })}
                    placeholder="/images/clinic/reception-desktop.jpg"
                  />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Primary Call to Action Text</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={cond.ctaText || "Book Assessment Online"}
                    onChange={(e) => setCond({ ...cond, ctaText: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: CUSTOM SECTIONS BUILDER ── */}
          {activeTab === "sections" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Create rich storytelling sections with image left/right/top/bottom placement, badge styling, and checklist items.
                </span>
                <button
                  type="button"
                  onClick={() => addCustomSection("right")}
                  className="adm-btn adm-btn-primary adm-btn-sm"
                >
                  + Add Custom Section
                </button>
              </div>

              {cond.customSections?.length === 0 ? (
                <div style={{ textAlign: "center", padding: 36, background: "#f8fafc", borderRadius: 12, border: "2px dashed #e2e8f0" }}>
                  <p style={{ color: "#64748b", margin: "0 0 12px 0" }}>No custom sections created yet.</p>
                  <button type="button" onClick={() => addCustomSection("right")} className="adm-btn adm-btn-primary adm-btn-sm">
                    + Add First Section
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {cond.customSections?.map((sec, idx) => (
                    <div key={idx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>Section #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeCustomSection(idx)}
                          style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                        >
                          🗑️ Delete Section
                        </button>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
                        <div>
                          <label className="adm-form-label">Section Title</label>
                          <input
                            type="text"
                            className="adm-input"
                            value={sec.title}
                            onChange={(e) => updateCustomSection(idx, { title: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="adm-form-label">Eyebrow / Badge Text</label>
                          <input
                            type="text"
                            className="adm-input"
                            value={sec.eyebrow || ""}
                            onChange={(e) => updateCustomSection(idx, { eyebrow: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="adm-form-group">
                        <label className="adm-form-label">Body Content</label>
                        <textarea
                          className="adm-textarea"
                          style={{ minHeight: 80 }}
                          value={sec.content || ""}
                          onChange={(e) => updateCustomSection(idx, { content: e.target.value })}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        <div>
                          <label className="adm-form-label">Image Path</label>
                          <input
                            type="text"
                            className="adm-input"
                            value={sec.image || ""}
                            onChange={(e) => updateCustomSection(idx, { image: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="adm-form-label">Image Position</label>
                          <select
                            className="adm-select"
                            value={sec.imagePosition || "right"}
                            onChange={(e) => updateCustomSection(idx, { imagePosition: e.target.value as any })}
                          >
                            <option value="right">Right Side</option>
                            <option value="left">Left Side</option>
                            <option value="top">Top Banner</option>
                            <option value="bottom">Bottom Image</option>
                            <option value="none">No Image (Text Only)</option>
                          </select>
                        </div>
                        <div>
                          <label className="adm-form-label">Background Style</label>
                          <select
                            className="adm-select"
                            value={sec.background || "white"}
                            onChange={(e) => updateCustomSection(idx, { background: e.target.value as any })}
                          >
                            <option value="white">Clean White</option>
                            <option value="light">Soft Light Blue (#f8fafc)</option>
                            <option value="teal">Dark Teal Theme</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 4: FAQ BUILDER ── */}
          {activeTab === "faqs" && (
            <div>
              <div style={{ background: "#f1f5f9", padding: 16, borderRadius: 12, marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 700 }}>+ Add New Question & Answer</h4>
                <div className="adm-form-group">
                  <input
                    type="text"
                    placeholder={`E.g., Do I need a doctor's referral for ${cond.name}?`}
                    className="adm-input"
                    value={newFaqQ}
                    onChange={(e) => setNewFaqQ(e.target.value)}
                  />
                </div>
                <div className="adm-form-group">
                  <textarea
                    placeholder="Enter full answer..."
                    className="adm-textarea"
                    style={{ minHeight: 70 }}
                    value={newFaqA}
                    onChange={(e) => setNewFaqA(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={addFaq}
                  className="adm-btn adm-btn-primary adm-btn-sm"
                >
                  Add FAQ
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {cond.faqs?.map((faq, idx) => (
                  <div key={idx} style={{ background: "#fff", border: "1px solid #e2e8f0", padding: 14, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div>
                      <strong style={{ fontSize: 13.5, color: "#1e293b", display: "block", marginBottom: 4 }}>
                        Q: {faq.question}
                      </strong>
                      <p style={{ margin: 0, fontSize: 13, color: "#475569" }}>
                        {faq.answer}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFaq(idx)}
                      style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 5: SYMPTOMS & ROADMAP ── */}
          {activeTab === "symptoms" && (
            <div>
              {/* Symptoms */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: 15, fontWeight: 700 }}>Recognizable Symptoms</h4>
                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <input
                    type="text"
                    placeholder="E.g., Sharp shooting pain down the back of the leg"
                    className="adm-input"
                    value={newSymptom}
                    onChange={(e) => setNewSymptom(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSymptom(); } }}
                  />
                  <button type="button" onClick={addSymptom} className="adm-btn adm-btn-primary adm-btn-sm">
                    Add Symptom
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cond.symptoms?.map((s, idx) => (
                    <div key={idx} style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "8px 12px", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13.5 }}>• {s}</span>
                      <button type="button" onClick={() => removeSymptom(idx)} style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Treatment Approach */}
              <div>
                <h4 style={{ margin: "0 0 10px 0", fontSize: 15, fontWeight: 700 }}>4-Step Treatment Roadmap</h4>
                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <input
                    type="text"
                    placeholder="E.g., CAMPT-certified joint mobilizations and spinal manual therapy"
                    className="adm-input"
                    value={newApproach}
                    onChange={(e) => setNewApproach(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addApproach(); } }}
                  />
                  <button type="button" onClick={addApproach} className="adm-btn adm-btn-primary adm-btn-sm">
                    Add Step
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cond.treatmentApproach?.map((step, idx) => (
                    <div key={idx} style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "8px 12px", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13.5 }}><strong>Step {idx + 1}:</strong> {step}</span>
                      <button type="button" onClick={() => removeApproach(idx)} style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="adm-modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="adm-btn adm-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(cond)}
            className="adm-btn adm-btn-success"
          >
            💾 Save Condition Changes
          </button>
        </div>

      </div>

      {/* ── MODAL: SECTION BLOCK PICKER (+ ADD / INSERT SECTION) ── */}
      {showAddSectionModal && (
        <div
          className="adm-modal-overlay"
          style={{ zIndex: 1100 }}
          onClick={() => setShowAddSectionModal(false)}
        >
          <div
            className="adm-modal"
            style={{ maxWidth: 640 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-modal-header">
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                + Add / Insert Page Section
              </h3>
              <button
                onClick={() => setShowAddSectionModal(false)}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}
              >
                ✕
              </button>
            </div>
            
            <div className="adm-modal-body">
              <p style={{ margin: "0 0 16px 0", fontSize: 13.5, color: "#64748b" }}>
                Select what kind of section you want to add to this condition page:
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  {
                    icon: "🎨",
                    title: "Custom Storytelling Section",
                    desc: "Add left/right image, badge, text, and checklist bullets.",
                    action: () => {
                      addCustomSection("right");
                      setShowAddSectionModal(false);
                    }
                  },
                  {
                    icon: "📋",
                    title: "Clinical Overview Block",
                    desc: "Explain the root cause and why treatment works.",
                    action: () => {
                      if (isSectionHidden("clinical_overview")) toggleSectionVisibility("clinical_overview");
                      setActiveTab("general");
                      setShowAddSectionModal(false);
                    }
                  },
                  {
                    icon: "🩺",
                    title: "Recognizable Symptoms Block",
                    desc: "Grid of recognizable symptom warning signs.",
                    action: () => {
                      if (isSectionHidden("symptoms")) toggleSectionVisibility("symptoms");
                      setActiveTab("symptoms");
                      setShowAddSectionModal(false);
                    }
                  },
                  {
                    icon: "🛣️",
                    title: "Treatment Steps Roadmap",
                    desc: "4-step clinical recovery roadmap.",
                    action: () => {
                      if (isSectionHidden("treatment_approach")) toggleSectionVisibility("treatment_approach");
                      setActiveTab("symptoms");
                      setShowAddSectionModal(false);
                    }
                  },
                  {
                    icon: "❓",
                    title: "FAQ Accordion Block",
                    desc: "Patient questions, doctor referrals, and insurance.",
                    action: () => {
                      if (isSectionHidden("faqs")) toggleSectionVisibility("faqs");
                      setActiveTab("faqs");
                      setShowAddSectionModal(false);
                    }
                  },
                  {
                    icon: "👥",
                    title: "Meet The Team Carousel",
                    desc: "Showcase clinic therapists and staff.",
                    action: () => {
                      if (isSectionHidden("team_carousel")) toggleSectionVisibility("team_carousel");
                      setShowAddSectionModal(false);
                    }
                  },
                  {
                    icon: "📍",
                    title: "Location Map & Hours Card",
                    desc: "Beddington location map, directions, and hours.",
                    action: () => {
                      if (isSectionHidden("location_map")) toggleSectionVisibility("location_map");
                      setShowAddSectionModal(false);
                    }
                  },
                  {
                    icon: "💡",
                    title: "Free Discovery & Phone CTAs",
                    desc: "Two cards for free consultations before booking.",
                    action: () => {
                      if (isSectionHidden("decision_ctas")) toggleSectionVisibility("decision_ctas");
                      setShowAddSectionModal(false);
                    }
                  }
                ].map((item, i) => (
                  <div
                    key={i}
                    onClick={item.action}
                    style={{
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 10,
                      padding: 14,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--adm-primary)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(28,159,216,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      <strong style={{ fontSize: 13.5, color: "#1e293b" }}>{item.title}</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                onClick={() => setShowAddSectionModal(false)}
                className="adm-btn adm-btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
