"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/components/admin/RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Condition } from "@/types/content";
import conditionsData from "@/data/conditions.json";
import LivePreviewPane from "@/components/admin/LivePreviewPane";

export default function AdminConditionsPage() {
  const { isAdmin, canDelete, canEditSlugs } = useRole();
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
              symptoms: d.symptoms || [],
              treatmentApproach: d.treatment_approach || [],
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
      await supabase.from("conditions").upsert({
        id: cond.id || `cond-${cond.slug}`,
        slug: cond.slug,
        name: cond.name,
        short_description: cond.shortDescription,
        description: cond.description,
        hero_image: cond.heroImage || null,
        symptoms: cond.symptoms || [],
        treatment_approach: cond.treatmentApproach || [],
        related_services: cond.relatedServices || [],
        category: cond.category || "general",
        seo: cond.seo || {},
        is_published: true
      });
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
      alert("In Client Safe Mode, deleting core conditions is disabled to preserve SEO structure.");
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
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, fontFamily: "var(--adm-font-display)" }}>
            Treatable Conditions Manager
          </h2>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "2px 0 0 0" }}>
            Manage condition descriptions, common symptoms, and treatment protocols
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
                relatedServices: []
              })
            }
            className="adm-btn adm-btn-primary"
          >
            + Add New Condition
          </button>
        )}
      </div>

      <div className="adm-card" style={{ padding: 16, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="🔍 Search conditions..."
          className="adm-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="adm-card">
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Condition Name</th>
                <th>URL Slug</th>
                <th>Symptoms</th>
                <th>Treatments</th>
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
                      <span style={{ fontSize: 12.5, color: "#475569" }}>
                        {cond.symptoms?.length || 0} Symptoms
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, color: "#475569" }}>
                        {cond.treatmentApproach?.length || 0} Approaches
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => setPreviewUrl(`/conditions/${cond.slug}`)}
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        style={{ marginRight: 6 }}
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

      {editingCondition && (
        <ConditionEditorModal
          condition={editingCondition}
          canEditSlugs={canEditSlugs}
          onClose={() => setEditingCondition(null)}
          onSave={handleSave}
          onPreview={(slug) => setPreviewUrl(`/conditions/${slug}`)}
        />
      )}

      <LivePreviewPane
        url={previewUrl || "/"}
        isOpen={Boolean(previewUrl)}
        onClose={() => setPreviewUrl(null)}
        title={`Live Preview: ${previewUrl}`}
      />
    </div>
  );
}

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
  const [newSymptom, setNewSymptom] = useState("");
  const [newApproach, setNewApproach] = useState("");

  const addSymptom = () => {
    if (!newSymptom.trim()) return;
    setCond((p) => ({ ...p, symptoms: [...(p.symptoms || []), newSymptom.trim()] }));
    setNewSymptom("");
  };

  const removeSymptom = (i: number) => {
    setCond((p) => ({ ...p, symptoms: p.symptoms?.filter((_, idx) => idx !== i) }));
  };

  const addApproach = () => {
    if (!newApproach.trim()) return;
    setCond((p) => ({ ...p, treatmentApproach: [...(p.treatmentApproach || []), newApproach.trim()] }));
    setNewApproach("");
  };

  const removeApproach = (i: number) => {
    setCond((p) => ({ ...p, treatmentApproach: p.treatmentApproach?.filter((_, idx) => idx !== i) }));
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
              Edit Condition: {cond.name}
            </h3>
            <span style={{ fontSize: 13, color: "#64748b" }}>/conditions/{cond.slug}</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => onPreview(cond.slug)}
              className="adm-btn adm-btn-secondary adm-btn-sm"
            >
              👁️ Preview Live
            </button>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>
              ✕
            </button>
          </div>
        </div>

        <div className="adm-modal-body">
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
            <label className="adm-form-label">URL Slug {canEditSlugs ? "" : "(Guarded in Client Mode)"}</label>
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
            <label className="adm-form-label">Description</label>
            <textarea
              className="adm-textarea"
              style={{ minHeight: 100 }}
              value={cond.description}
              onChange={(e) => setCond({ ...cond, description: e.target.value })}
            />
          </div>

          {/* Symptoms List */}
          <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, marginBottom: 18, border: "1px solid #e2e8f0" }}>
            <label className="adm-form-label">Common Symptoms</label>
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
            <label className="adm-form-label">Treatment Protocols & Approaches</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input
                type="text"
                placeholder="E.g., Spinal manual decompression and dry needling"
                className="adm-input"
                value={newApproach}
                onChange={(e) => setNewApproach(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addApproach(); } }}
              />
              <button type="button" onClick={addApproach} className="adm-btn adm-btn-primary adm-btn-sm">
                Add
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {cond.treatmentApproach?.map((t, idx) => (
                <span key={idx} style={{ background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: 999, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {t}
                  <button type="button" onClick={() => removeApproach(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#16a34a", fontWeight: 700 }}>✕</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="adm-modal-footer">
          <button type="button" onClick={onClose} className="adm-btn adm-btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={() => onSave(cond)} className="adm-btn adm-btn-success">
            💾 Save Condition
          </button>
        </div>
      </div>
    </div>
  );
}
