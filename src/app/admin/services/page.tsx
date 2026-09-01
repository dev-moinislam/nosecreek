"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/components/admin/RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Service, ServiceCustomSection, FAQItem } from "@/types/content";
import servicesData from "@/data/services.json";
import LivePreviewPane from "@/components/admin/LivePreviewPane";

export default function AdminServicesPage() {
  const { role, isAdmin, canDelete, canEditSlugs } = useRole();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchServices = async () => {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .order("sort_order", { ascending: true });
        if (!error && data && data.length > 0) {
          setServices(data.map((d: any) => ({
            id: d.id,
            slug: d.slug,
            title: d.title,
            shortDescription: d.short_description || "",
            description: d.description || "",
            heroImage: d.hero_image,
            sideImage: d.side_image,
            iconType: d.icon_type,
            iconBg: d.icon_bg,
            iconColor: d.icon_color,
            ctaText: d.cta_text,
            ctaMuted: d.cta_muted,
            benefits: d.benefits || [],
            symptoms: d.symptoms || [],
            treatmentApproach: d.treatment_approach || [],
            customSections: d.custom_sections || [],
            faqs: d.faqs || [],
            relatedServices: d.related_services || [],
            relatedConditions: d.related_conditions || [],
            teamMembers: d.team_members || [],
            locations: d.locations || [],
            testimonials: d.testimonials || [],
            seo: d.seo || {}
          })));
        } else {
          setServices(servicesData as Service[]);
        }
      } catch {
        setServices(servicesData as Service[]);
      }
    } else if (typeof window !== "undefined") {
      const local = localStorage.getItem("adm_services");
      if (local) {
        setServices(JSON.parse(local));
      } else {
        setServices(servicesData as Service[]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSaveService = async (service: Service) => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("services").upsert({
          id: service.id || `service-${service.slug}`,
          slug: service.slug,
          title: service.title,
          short_description: service.shortDescription,
          description: service.description,
          hero_image: service.heroImage || null,
          side_image: service.sideImage || null,
          icon_type: service.iconType || null,
          icon_bg: service.iconBg || null,
          icon_color: service.iconColor || null,
          cta_text: service.ctaText || "Book Online",
          cta_muted: service.ctaMuted || false,
          benefits: service.benefits || [],
          symptoms: service.symptoms || [],
          treatment_approach: service.treatmentApproach || [],
          custom_sections: service.customSections || [],
          faqs: service.faqs || [],
          related_services: service.relatedServices || [],
          related_conditions: service.relatedConditions || [],
          team_members: service.teamMembers || [],
          locations: service.locations || [],
          testimonials: service.testimonials || [],
          seo: service.seo || {},
          is_published: true
        });
      } catch (e) {
        console.error("Save failed:", e);
      }
    } else if (typeof window !== "undefined") {
      const updated = services.map((s) => (s.slug === service.slug ? service : s));
      if (!updated.find((s) => s.slug === service.slug)) {
        updated.push(service);
      }
      localStorage.setItem("adm_services", JSON.stringify(updated));
      setServices(updated);
    }
    fetchServices();
    setEditingService(null);
  };

  const handleDeleteService = async (slug: string) => {
    if (!canDelete) {
      alert("In Client Safe Mode, deleting core services is disabled to protect website structure and SEO rankings. Switch to Admin mode if necessary.");
      return;
    }
    if (!confirm(`Are you sure you want to delete the service "${slug}"?`)) return;

    if (isSupabaseConfigured && supabase) {
      await supabase.from("services").delete().eq("slug", slug);
    } else if (typeof window !== "undefined") {
      const updated = services.filter((s) => s.slug !== slug);
      localStorage.setItem("adm_services", JSON.stringify(updated));
      setServices(updated);
    }
    fetchServices();
  };

  const filtered = services.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase()) ||
      s.shortDescription.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, fontFamily: "var(--adm-font-display)" }}>
            Clinical Services Manager
          </h2>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "2px 0 0 0" }}>
            Manage treatments, descriptions, rich custom sections, benefits, and service FAQs
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() =>
              setEditingService({
                id: `service-${Date.now()}`,
                slug: "new-service",
                title: "New Clinical Service",
                shortDescription: "",
                description: "",
                benefits: [],
                symptoms: [],
                treatmentApproach: [],
                customSections: [],
                faqs: [],
                relatedServices: [],
                relatedConditions: []
              })
            }
            className="adm-btn adm-btn-primary"
          >
            + Add New Service
          </button>
        )}
      </div>

      {/* Role Banner if in Client Mode */}
      {!isAdmin && (
        <div className="adm-guarded-banner">
          <span>🛡️</span>
          <div>
            <strong>Client Safe Mode Active:</strong> You can safely edit descriptions, images, bullet points, and FAQs. Service URLs (slugs) and core deletions are protected to preserve SEO.
          </div>
        </div>
      )}

      {/* Search Filter */}
      <div className="adm-card" style={{ padding: 16, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="🔍 Search services by name or description..."
          className="adm-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Services List Table */}
      <div className="adm-card">
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>URL Slug</th>
                <th>Sections & FAQs</th>
                <th>Benefits</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 36, color: "#64748b" }}>
                    Loading clinical services...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 36, color: "#64748b" }}>
                    No services found.
                  </td>
                </tr>
              ) : (
                filtered.map((service) => (
                  <tr key={service.slug}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{service.title}</div>
                      <div style={{ fontSize: 12, color: "#64748b", maxWidth: 280, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {service.shortDescription}
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: 12, background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>
                        /services/{service.slug}
                      </code>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: "#0369a1", background: "#e0f2fe", padding: "3px 8px", borderRadius: 6, marginRight: 6 }}>
                        {service.customSections?.length || 0} Sections
                      </span>
                      <span style={{ fontSize: 12, color: "#15803d", background: "#dcfce7", padding: "3px 8px", borderRadius: 6 }}>
                        {service.faqs?.length || 0} FAQs
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, color: "#475569" }}>
                        {service.benefits?.length || 0} bullet points
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => setPreviewUrl(`/services/${service.slug}`)}
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        style={{ marginRight: 6 }}
                        title="View Live Preview"
                      >
                        👁️ Preview
                      </button>
                      <button
                        onClick={() => setEditingService(JSON.parse(JSON.stringify(service)))}
                        className="adm-btn adm-btn-primary adm-btn-sm"
                        style={{ marginRight: 6 }}
                      >
                        ✏️ Edit
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteService(service.slug)}
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

      {/* Service Visual Editor Modal */}
      {editingService && (
        <ServiceEditorModal
          service={editingService}
          canEditSlugs={canEditSlugs}
          onClose={() => setEditingService(null)}
          onSave={handleSaveService}
          onPreview={(slug) => setPreviewUrl(`/services/${slug}`)}
        />
      )}

      {/* Live Preview Pane */}
      <LivePreviewPane
        url={previewUrl || "/"}
        isOpen={Boolean(previewUrl)}
        onClose={() => setPreviewUrl(null)}
        title={`Live Preview: ${previewUrl}`}
      />
    </div>
  );
}

// Sub-component: Service Editor Modal
function ServiceEditorModal({
  service: initialService,
  canEditSlugs,
  onClose,
  onSave,
  onPreview
}: {
  service: Service;
  canEditSlugs: boolean;
  onClose: () => void;
  onSave: (service: Service) => void;
  onPreview: (slug: string) => void;
}) {
  const [service, setService] = useState<Service>(initialService);
  const [activeTab, setActiveTab] = useState<"general" | "sections" | "faqs" | "bullets">("general");

  // Benefits & Symptoms helpers
  const [newBenefit, setNewBenefit] = useState("");
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");

  const addBenefit = () => {
    if (!newBenefit.trim()) return;
    setService((prev) => ({
      ...prev,
      benefits: [...(prev.benefits || []), newBenefit.trim()]
    }));
    setNewBenefit("");
  };

  const removeBenefit = (idx: number) => {
    setService((prev) => ({
      ...prev,
      benefits: prev.benefits?.filter((_, i) => i !== idx)
    }));
  };

  const addFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    setService((prev) => ({
      ...prev,
      faqs: [...(prev.faqs || []), { question: newFaqQ.trim(), answer: newFaqA.trim() }]
    }));
    setNewFaqQ("");
    setNewFaqA("");
  };

  const removeFaq = (idx: number) => {
    setService((prev) => ({
      ...prev,
      faqs: prev.faqs?.filter((_, i) => i !== idx)
    }));
  };

  // Custom Sections Helper
  const addCustomSection = () => {
    const newSec: ServiceCustomSection = {
      id: `sec-${Date.now()}`,
      title: "New Featured Care Section",
      subtitle: "Personalized clinical evaluation",
      content: "Explain your comprehensive treatment protocol here.",
      bullets: ["Direct billing available", "One-on-one manual assessment"],
      image: "/images/clinic/reception-three.jpg",
      imagePosition: "right"
    };
    setService((prev) => ({
      ...prev,
      customSections: [...(prev.customSections || []), newSec]
    }));
  };

  const updateCustomSection = (idx: number, updated: Partial<ServiceCustomSection>) => {
    setService((prev) => {
      const clone = [...(prev.customSections || [])];
      clone[idx] = { ...clone[idx], ...updated };
      return { ...prev, customSections: clone };
    });
  };

  const removeCustomSection = (idx: number) => {
    setService((prev) => ({
      ...prev,
      customSections: prev.customSections?.filter((_, i) => i !== idx)
    }));
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal wide" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "92vh" }}>
        <div className="adm-modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
              Edit Service: {service.title}
            </h3>
            <span style={{ fontSize: 13, color: "var(--adm-text-muted)" }}>
              /services/{service.slug}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => onPreview(service.slug)}
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
            { id: "general", label: "📝 General & SEO" },
            { id: "sections", label: `🎨 Custom Sections (${service.customSections?.length || 0})` },
            { id: "faqs", label: `❓ FAQ Builder (${service.faqs?.length || 0})` },
            { id: "bullets", label: `✨ Benefits & Bullets (${service.benefits?.length || 0})` }
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
          {activeTab === "general" && (
            <div>
              <div className="adm-form-group">
                <label className="adm-form-label">Service Title</label>
                <input
                  type="text"
                  className="adm-input"
                  value={service.title}
                  onChange={(e) => setService({ ...service, title: e.target.value })}
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
                  value={service.slug}
                  disabled={!canEditSlugs}
                  onChange={(e) => setService({ ...service, slug: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Short Summary (Featured in grids & cards)</label>
                <textarea
                  className="adm-textarea"
                  style={{ minHeight: 70 }}
                  value={service.shortDescription}
                  onChange={(e) => setService({ ...service, shortDescription: e.target.value })}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Full Clinical Description</label>
                <textarea
                  className="adm-textarea"
                  style={{ minHeight: 130 }}
                  value={service.description}
                  onChange={(e) => setService({ ...service, description: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="adm-form-group">
                  <label className="adm-form-label">Hero Image URL</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={service.heroImage || ""}
                    onChange={(e) => setService({ ...service, heroImage: e.target.value })}
                  />
                </div>
                <div className="adm-form-group">
                  <label className="adm-form-label">Primary Call to Action Text</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={service.ctaText || "Book Online"}
                    onChange={(e) => setService({ ...service, ctaText: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "sections" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Add rich visual storytelling sections with custom images, subheaders, and badge highlights.
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
                {service.customSections?.map((sec, idx) => (
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

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
                          <option value="none">No Image (Text Only)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "faqs" && (
            <div>
              {/* Add FAQ Form */}
              <div style={{ background: "#f1f5f9", padding: 16, borderRadius: 12, marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 700 }}>+ Add New Question & Answer</h4>
                <div className="adm-form-group">
                  <input
                    type="text"
                    placeholder="E.g., Do I need a doctor's referral for this treatment?"
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

              {/* FAQs List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {service.faqs?.map((faq, idx) => (
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

          {activeTab === "bullets" && (
            <div>
              <div style={{ background: "#f1f5f9", padding: 16, borderRadius: 12, marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 700 }}>+ Add Key Benefit / Clinical Outcome</h4>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="text"
                    placeholder="E.g., Rapid relief from acute cervical nerve compression"
                    className="adm-input"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBenefit(); } }}
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="adm-btn adm-btn-primary adm-btn-sm"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {service.benefits?.map((b, idx) => (
                  <div key={idx} style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13.5 }}>✓ {b}</span>
                    <button
                      type="button"
                      onClick={() => removeBenefit(idx)}
                      style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
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
            onClick={() => onSave(service)}
            className="adm-btn adm-btn-success"
          >
            💾 Save Service Changes
          </button>
        </div>
      </div>
    </div>
  );
}
