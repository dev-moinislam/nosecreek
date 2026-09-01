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
            Manage pain conditions, rich custom visual sections, FAQs, symptoms, and treatment protocols
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

// Sub-component: Rich Condition Editor Modal (Matches Services Editor)
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
  const [activeTab, setActiveTab] = useState<"general" | "sections" | "faqs" | "symptoms">("general");

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
  const addCustomSection = () => {
    const newSec: ServiceCustomSection = {
      id: `sec-${Date.now()}`,
      title: `Understanding ${cond.name} & Recovery Protocol`,
      subtitle: "Targeted orthopaedic & manual assessment",
      content: "Explain your clinical approach, causes, and biomechanical adjustments here.",
      bullets: ["Direct billing available", "No physician referral required", "Personalized exercise conditioning"],
      image: "/images/clinic/treatment-hands-on.jpg",
      imagePosition: "right",
      background: "white"
    };
    setCond((prev) => ({
      ...prev,
      customSections: [...(prev.customSections || []), newSec]
    }));
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

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal wide" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "92vh" }}>
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
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", padding: "0 24px" }}>
          {[
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
          {/* TAB 1: General */}
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
                  URL Slug {canEditSlugs ? "" : "(Guarded in Client Mode)"}
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
                <label className="adm-form-label">Full Clinical Description & Root Cause</label>
                <textarea
                  className="adm-textarea"
                  style={{ minHeight: 120 }}
                  value={cond.description}
                  onChange={(e) => setCond({ ...cond, description: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Hero Image URL</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={cond.heroImage || ""}
                    onChange={(e) => setCond({ ...cond, heroImage: e.target.value })}
                  />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Primary Call to Action Button Text</label>
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

          {/* TAB 2: Custom Sections Builder (Left / Right / Top / Bottom / None Image layout) */}
          {activeTab === "sections" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Add rich visual storytelling sections with custom images on the left, right, top, or text-only without image.
                </span>
                <button
                  type="button"
                  onClick={addCustomSection}
                  className="adm-btn adm-btn-primary adm-btn-sm"
                >
                  + Add Custom Section
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {cond.customSections?.length === 0 && (
                  <div style={{ textAlign: "center", padding: "32px", background: "#f8fafc", borderRadius: 12, border: "2px dashed #cbd5e1", color: "#64748b" }}>
                    <p style={{ margin: "0 0 10px 0" }}>No custom sections added yet for this condition.</p>
                    <button type="button" onClick={addCustomSection} className="adm-btn adm-btn-primary adm-btn-sm">
                      + Add Your First Custom Section
                    </button>
                  </div>
                )}

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
                      <label className="adm-form-label">Subtitle / Key Highlight</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={sec.subtitle || ""}
                        onChange={(e) => updateCustomSection(idx, { subtitle: e.target.value })}
                      />
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
                        <label className="adm-form-label">Image Path / URL</label>
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
                          <option value="right">Right Side (Image Right, Text Left)</option>
                          <option value="left">Left Side (Image Left, Text Right)</option>
                          <option value="top">Top (Centered)</option>
                          <option value="bottom">Bottom (Centered)</option>
                          <option value="none">No Image (Text & Bullets Only)</option>
                        </select>
                      </div>
                      <div>
                        <label className="adm-form-label">Background Color</label>
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
            </div>
          )}

          {/* TAB 3: FAQ Builder */}
          {activeTab === "faqs" && (
            <div>
              <div style={{ background: "#f1f5f9", padding: 16, borderRadius: 12, marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 700 }}>+ Add Question & Answer for {cond.name}</h4>
                <div className="adm-form-group">
                  <input
                    type="text"
                    placeholder={`E.g., How soon can I return to sports after treatment for ${cond.name.toLowerCase()}?`}
                    className="adm-input"
                    value={newFaqQ}
                    onChange={(e) => setNewFaqQ(e.target.value)}
                  />
                </div>
                <div className="adm-form-group">
                  <textarea
                    placeholder="Enter comprehensive answer..."
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
                  Add FAQ Item
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

          {/* TAB 4: Symptoms & Treatment Approaches */}
          {activeTab === "symptoms" && (
            <div>
              {/* Symptoms */}
              <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, marginBottom: 18, border: "1px solid #e2e8f0" }}>
                <label className="adm-form-label">Recognizable Symptoms</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input
                    type="text"
                    placeholder="E.g., Sharp shooting pain down posterior thigh"
                    className="adm-input"
                    value={newSymptom}
                    onChange={(e) => setNewSymptom(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSymptom(); } }}
                  />
                  <button type="button" onClick={addSymptom} className="adm-btn adm-btn-primary adm-btn-sm">
                    Add
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {cond.symptoms?.map((s, idx) => (
                    <span key={idx} style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 10px", borderRadius: 999, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
                      {s}
                      <button type="button" onClick={() => removeSymptom(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#0284c7", fontWeight: 700 }}>✕</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Treatment Approaches */}
              <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <label className="adm-form-label">Step-by-Step Treatment Protocol Roadmap</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input
                    type="text"
                    placeholder="E.g., Targeted joint mobilization, spinal decompression, and dry needling"
                    className="adm-input"
                    value={newApproach}
                    onChange={(e) => setNewApproach(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addApproach(); } }}
                  />
                  <button type="button" onClick={addApproach} className="adm-btn adm-btn-primary adm-btn-sm">
                    Add
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cond.treatmentApproach?.map((t, idx) => (
                    <div key={idx} style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13.5 }}>
                        <strong>Step {idx + 1}:</strong> {t}
                      </span>
                      <button type="button" onClick={() => removeApproach(idx)} style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="adm-modal-footer">
          <button type="button" onClick={onClose} className="adm-btn adm-btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={() => onSave(cond)} className="adm-btn adm-btn-success">
            💾 Save Condition Details
          </button>
        </div>
      </div>
    </div>
  );
}
