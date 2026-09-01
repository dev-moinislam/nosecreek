"use client";

import React, { useState, useEffect } from "react";
import { Service, ServiceCustomSection } from "@/types/content";
import { getServices } from "@/lib/api";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { useRole } from "@/components/admin/RoleGuard";
import LivePreviewPane from "@/components/admin/LivePreviewPane";

const defaultServiceSectionOrder = [
  "hero",
  "at_a_glance",
  "clinical_overview",
  "custom_sections",
  "benefits",
  "symptoms",
  "treatment_approach",
  "team_carousel",
  "faqs",
  "location_map",
  "decision_ctas",
  "bottom_cta"
];

const sectionDefinitions: Record<string, { title: string; desc: string; category: string; icon: string }> = {
  hero: {
    title: "Hero Header & Booking Banner",
    desc: "Top banner with title, badges, ratings, and primary booking button.",
    category: "Header",
    icon: "🚀"
  },
  at_a_glance: {
    title: "Treatment At-A-Glance Bar",
    desc: "4 highlight cards: Duration, Direct Billing, Referral info, Care Plan.",
    category: "Summary",
    icon: "⏱️"
  },
  clinical_overview: {
    title: "Clinical Overview & Root Cause",
    desc: "Detailed medical explanation of why this treatment works.",
    category: "Overview",
    icon: "📋"
  },
  custom_sections: {
    title: "Custom Visual Storytelling Sections",
    desc: "Rich storytelling sections with left/right/top/bottom image placement.",
    category: "Custom Content",
    icon: "🎨"
  },
  benefits: {
    title: "Key Treatment Benefits Grid",
    desc: "Checkmark grid highlighting proven benefits of this service.",
    category: "Benefits",
    icon: "✨"
  },
  symptoms: {
    title: "Targeted Symptoms & Conditions",
    desc: "List of conditions and complaints this treatment specifically addresses.",
    category: "Symptoms",
    icon: "🩺"
  },
  treatment_approach: {
    title: "Treatment Approach Roadmap (4 Steps)",
    desc: "Step-by-step patient journey from assessment to prevention.",
    category: "Roadmap",
    icon: "🛣️"
  },
  team_carousel: {
    title: "Meet Our Registered Team Carousel",
    desc: "Interactive scrolling carousel of registered physiotherapists & staff.",
    category: "Team",
    icon: "👥"
  },
  faqs: {
    title: "Frequently Asked Questions (Accordion)",
    desc: "Interactive accordion answering patient questions & insurance.",
    category: "FAQ",
    icon: "❓"
  },
  location_map: {
    title: "Clinic Location & Interactive Google Map",
    desc: "Beddington location details, hours of operation, phone, and Google map.",
    category: "Location",
    icon: "📍"
  },
  decision_ctas: {
    title: "Decision CTAs (Free Discovery & Phone Consult)",
    desc: "Two cards offering Free Discovery Session or Telephone Consult.",
    category: "Conversion",
    icon: "💡"
  },
  bottom_cta: {
    title: "Bottom Booking Call-to-Action Banner",
    desc: "Full-width high-contrast booking banner at the bottom of the page.",
    category: "Conversion",
    icon: "📣"
  }
};

export default function AdminServicesPage() {
  const { role, isAdmin, canDelete, canEditSlugs } = useRole();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Load services
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getServices();
        setServices(data);
      } catch (err) {
        console.error("Failed to load services", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = services.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase()) ||
      (s.shortDescription && s.shortDescription.toLowerCase().includes(search.toLowerCase()))
  );

  // Save Service
  const handleSaveService = async (updatedService: Service) => {
    try {
      const allUpdated = services.map((s) => (s.slug === updatedService.slug ? updatedService : s));
      if (!allUpdated.find((s) => s.slug === updatedService.slug)) {
        allUpdated.push(updatedService);
      }

      // 1. Save to Supabase (with resilient fallback)
      if (isSupabaseConfigured && supabase) {
        try {
          const payload = {
            id: updatedService.id || `srv-${updatedService.slug}`,
            slug: updatedService.slug,
            title: updatedService.title,
            short_description: updatedService.shortDescription || null,
            description: updatedService.description || "",
            hero_image: updatedService.heroImage || null,
            side_image: updatedService.sideImage || null,
            cta_text: updatedService.ctaText || "Book Online",
            cta_muted: updatedService.ctaMuted || false,
            benefits: updatedService.benefits || [],
            symptoms: updatedService.symptoms || [],
            treatment_approach: updatedService.treatmentApproach || [],
            custom_sections: updatedService.customSections || [],
            faqs: updatedService.faqs || [],
            hidden_sections: updatedService.hiddenSections || [],
            section_order: updatedService.sectionOrder || defaultServiceSectionOrder,
            related_services: updatedService.relatedServices || [],
            related_conditions: updatedService.relatedConditions || [],
            seo: updatedService.seo || {},
            is_published: true,
            updated_at: new Date().toISOString()
          };

          const { error } = await supabase
            .from("services")
            .upsert(payload, { onConflict: "slug" });

          if (error) {
            console.warn("Supabase upsert warning:", error);
          }
        } catch (supaErr) {
          console.warn("Supabase sync warning:", supaErr);
        }
      }

      // 2. Save to local data files in background via API route
      try {
        await fetch("/api/admin/save-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "services", data: allUpdated })
        });
      } catch {
        // ignore in static export
      }

      // 3. Save to localStorage for instant client hydration
      if (typeof window !== "undefined") {
        localStorage.setItem("adm_services", JSON.stringify(allUpdated));
        window.dispatchEvent(new Event("servicesUpdated"));
      }

      // Update local state
      setServices(allUpdated);

      alert("✓ Service saved successfully! Live website updated.");
      setEditingService(null);
    } catch (err: any) {
      console.error("Failed to save service", err);
      alert("⚠️ Error saving service: " + (err.message || JSON.stringify(err)));
    }
  };

  // Delete Service
  const handleDeleteService = async (slug: string) => {
    if (!isAdmin) {
      alert("In Client Mode, deleting services is disabled to protect SEO. Use Master Admin if needed.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete /services/${slug}?`)) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from("services").delete().eq("slug", slug);
        if (error) throw error;
      }
      const allUpdated = services.filter((s) => s.slug !== slug);
      setServices(allUpdated);
      if (typeof window !== "undefined") {
        localStorage.setItem("adm_services", JSON.stringify(allUpdated));
        window.dispatchEvent(new Event("servicesUpdated"));
      }
      alert("✓ Service deleted!");
    } catch (err: any) {
      console.error("Failed to delete service", err);
      alert("⚠️ Error deleting: " + (err.message || err));
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--adm-text)", margin: "0 0 6px 0" }}>
            Clinical Services Manager
          </h1>
          <p style={{ margin: 0, color: "var(--adm-text-muted)", fontSize: 14 }}>
            Manage treatments, page section ordering, hide/unhide blocks, image layouts, benefits, and FAQs
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
                hiddenSections: [],
                sectionOrder: defaultServiceSectionOrder,
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
            <strong>Client Safe Mode Active:</strong> You can safely edit text descriptions, images, bullet points, and FAQs. Section reordering, hiding, and deletions are protected to preserve SEO rankings.
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
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => setPreviewUrl(`/services/${service.slug}`)}
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        style={{ marginRight: 6 }}
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
                      {isAdmin && (
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
          isAdmin={isAdmin}
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

// Sub-component: Service Editor Modal with Section Reordering & Modular Manager
function ServiceEditorModal({
  service: initialService,
  isAdmin,
  canEditSlugs,
  onClose,
  onSave,
  onPreview
}: {
  service: Service;
  isAdmin: boolean;
  canEditSlugs: boolean;
  onClose: () => void;
  onSave: (service: Service) => void;
  onPreview: (slug: string) => void;
}) {
  const [service, setService] = useState<Service>({
    ...initialService,
    sectionOrder: initialService.sectionOrder && initialService.sectionOrder.length > 0
      ? initialService.sectionOrder
      : defaultServiceSectionOrder
  });

  const [activeTab, setActiveTab] = useState<"layout" | "general" | "sections" | "faqs" | "bullets">("layout");
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);

  // Section Ordering & Visibility helpers
  const currentOrder = service.sectionOrder || defaultServiceSectionOrder;
  const hiddenSections = service.hiddenSections || [];
  const isSectionHidden = (key: string) => hiddenSections.includes(key);

  const moveSection = (index: number, direction: "up" | "down") => {
    if (!isAdmin) {
      alert("Only Master Admin can change section layout order.");
      return;
    }
    const newOrder = [...currentOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    setService((prev) => ({ ...prev, sectionOrder: newOrder }));
  };

  const toggleSectionVisibility = (key: string) => {
    if (!isAdmin) {
      alert("Only Master Admin can hide or delete page sections.");
      return;
    }
    setService((prev) => {
      const curHidden = prev.hiddenSections || [];
      const updatedHidden = curHidden.includes(key)
        ? curHidden.filter((k) => k !== key)
        : [...curHidden, key];
      return { ...prev, hiddenSections: updatedHidden };
    });
  };

  // Benefits & FAQs helpers
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
  const addCustomSection = (pos: "right" | "left" | "top" | "bottom" | "none" = "right") => {
    const newSec: ServiceCustomSection = {
      id: `sec-${Date.now()}`,
      eyebrow: "Personalized Care Protocol",
      eyebrowColor: "#1c9fd8",
      title: "New Featured Care Section",
      subtitle: "Personalized clinical evaluation",
      content: "Explain your comprehensive treatment protocol and therapeutic approach here.",
      bullets: [
        "Direct billing to major health insurance",
        "Targeted joint mobilization & soft tissue release",
        "One-on-one registered therapist care"
      ],
      image: "/images/clinic/reception-three.jpg",
      imagePosition: pos,
      background: "white"
    };
    setService((prev) => ({
      ...prev,
      customSections: [...(prev.customSections || []), newSec]
    }));
    setActiveTab("sections");
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
      <div className="adm-modal wide" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "92vh", width: "95%", maxWidth: 1050 }}>
        
        {/* Modal Header */}
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

        {/* Modal Navigation Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", padding: "0 20px", overflowX: "auto" }}>
          {[
            { id: "layout", label: "🧩 Page Sections & Order" },
            { id: "general", label: "📝 General & Hero" },
            { id: "sections", label: `🎨 Custom Sections (${service.customSections?.length || 0})` },
            { id: "faqs", label: `❓ FAQ Builder (${service.faqs?.length || 0})` },
            { id: "bullets", label: `✨ Benefits & Roadmap (${service.benefits?.length || 0})` }
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
          
          {/* ── TAB 1: MODULAR SECTION ORDERING & VISIBILITY MANAGER ── */}
          {activeTab === "layout" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, background: "#f0f9ff", border: "1px solid #bae6fd", padding: "14px 18px", borderRadius: 10, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: 14, fontWeight: 700, color: "#0369a1" }}>
                    Modular Section Layout &amp; Reordering
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: "#0284c7" }}>
                    {isAdmin
                      ? "Use ⬆️ Up and ⬇️ Down arrows to change section display order, or 🗑️ Hide sections you don't need."
                      : "Client View: Displays page section order and active blocks. Layout reordering is managed by Master Admin."}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowAddSectionModal(true)}
                    className="adm-btn adm-btn-primary adm-btn-sm"
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <span style={{ fontSize: 16 }}>+</span> Add / Insert Section
                  </button>
                )}
              </div>

              {/* Reorderable Sections List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {currentOrder.map((key, idx) => {
                  const secDef = sectionDefinitions[key] || {
                    title: key,
                    desc: "Custom page section block",
                    category: "Block",
                    icon: "🧩"
                  };
                  const hidden = isSectionHidden(key);

                  return (
                    <div
                      key={key}
                      style={{
                        background: hidden ? "#f8fafc" : "#ffffff",
                        border: hidden ? "1px dashed #cbd5e1" : "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "12px 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        opacity: hidden ? 0.6 : 1,
                        transition: "all 0.15s ease"
                      }}
                    >
                      {/* Left side: Position, Icon, Title */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* Order Number Badge */}
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: hidden ? "#e2e8f0" : "#e0f2fe",
                            color: hidden ? "#64748b" : "#0284c7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 12.5
                          }}
                        >
                          {idx + 1}
                        </div>

                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 16 }}>{secDef.icon}</span>
                            <strong style={{ fontSize: 13.5, color: hidden ? "#64748b" : "#1e293b" }}>
                              {secDef.title}
                            </strong>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: 999,
                                background: hidden ? "#fee2e2" : "#dcfce7",
                                color: hidden ? "#991b1b" : "#166534"
                              }}
                            >
                              {hidden ? "🚫 Hidden" : "🟢 Active"}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                            {secDef.desc}
                          </div>
                        </div>
                      </div>

                      {/* Right side: Reordering & Actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {isAdmin && (
                          <div style={{ display: "flex", gap: 4, marginRight: 6 }}>
                            <button
                              type="button"
                              onClick={() => moveSection(idx, "up")}
                              disabled={idx === 0}
                              style={{
                                background: "#f1f5f9",
                                border: "1px solid #cbd5e1",
                                borderRadius: 6,
                                padding: "4px 8px",
                                fontSize: 13,
                                cursor: idx === 0 ? "not-allowed" : "pointer",
                                opacity: idx === 0 ? 0.4 : 1
                              }}
                              title="Move section UP"
                            >
                              ⬆️
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSection(idx, "down")}
                              disabled={idx === currentOrder.length - 1}
                              style={{
                                background: "#f1f5f9",
                                border: "1px solid #cbd5e1",
                                borderRadius: 6,
                                padding: "4px 8px",
                                fontSize: 13,
                                cursor: idx === currentOrder.length - 1 ? "not-allowed" : "pointer",
                                opacity: idx === currentOrder.length - 1 ? 0.4 : 1
                              }}
                              title="Move section DOWN"
                            >
                              ⬇️
                            </button>
                          </div>
                        )}

                        {key === "custom_sections" && (
                          <button
                            type="button"
                            onClick={() => setActiveTab("sections")}
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                          >
                            🎨 Edit
                          </button>
                        )}
                        {key === "faqs" && (
                          <button
                            type="button"
                            onClick={() => setActiveTab("faqs")}
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                          >
                            ❓ Edit
                          </button>
                        )}
                        {key === "benefits" && (
                          <button
                            type="button"
                            onClick={() => setActiveTab("bullets")}
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                          >
                            ✨ Edit
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => toggleSectionVisibility(key)}
                            className={`adm-btn adm-btn-sm ${hidden ? "adm-btn-primary" : "adm-btn-secondary"}`}
                            style={{ minWidth: 90 }}
                          >
                            {hidden ? "👁️ Restore" : "🗑️ Hide"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TAB 2: GENERAL & HERO ── */}
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
                  value={service.shortDescription || ""}
                  onChange={(e) => setService({ ...service, shortDescription: e.target.value })}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Clinical Overview Content (Why treatment works)</label>
                <textarea
                  className="adm-textarea"
                  style={{ minHeight: 120 }}
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
                  <label className="adm-form-label">Primary Call to Action Button Text</label>
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

          {/* ── TAB 3: CUSTOM SECTIONS BUILDER ── */}
          {activeTab === "sections" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Create rich storytelling sections with image left/right/top/bottom placement and custom badge styling.
                </span>
                <button
                  type="button"
                  onClick={() => addCustomSection("right")}
                  className="adm-btn adm-btn-primary adm-btn-sm"
                >
                  + Add Custom Section
                </button>
              </div>

              {service.customSections?.length === 0 ? (
                <div style={{ textAlign: "center", padding: 36, background: "#f8fafc", borderRadius: 12, border: "2px dashed #e2e8f0" }}>
                  <p style={{ color: "#64748b", margin: "0 0 12px 0" }}>No custom sections created yet.</p>
                  <button type="button" onClick={() => addCustomSection("right")} className="adm-btn adm-btn-primary adm-btn-sm">
                    + Add First Section
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {service.customSections?.map((sec, idx) => (
                    <div key={idx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>Section #{idx + 1}</span>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => removeCustomSection(idx)}
                            style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                          >
                            🗑️ Delete Section
                          </button>
                        )}
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
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => removeFaq(idx)}
                        style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 5: BENEFITS & ROADMAP ── */}
          {activeTab === "bullets" && (
            <div>
              <div style={{ background: "#f1f5f9", padding: 16, borderRadius: 12, marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 700 }}>+ Add Key Benefit / Clinical Outcome</h4>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="text"
                    placeholder="E.g., Rapid relief from acute nerve compression"
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
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => removeBenefit(idx)}
                        style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}
                      >
                        ✕
                      </button>
                    )}
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

      {/* ── MODAL: SECTION BLOCK PICKER (+ ADD / INSERT SECTION) ── */}
      {showAddSectionModal && (
        <div
          className="adm-modal-overlay"
          style={{ zIndex: 1100 }}
          onClick={() => setShowAddSectionModal(false)}
        >
          <div
            className="adm-modal"
            style={{ maxWidth: 680 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                  + Add / Insert Physiotherapy Page Section
                </h3>
                <span style={{ fontSize: 12.5, color: "#64748b" }}>
                  Choose a standard clinic section or build a custom storytelling block
                </span>
              </div>
              <button
                onClick={() => setShowAddSectionModal(false)}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}
              >
                ✕
              </button>
            </div>
            
            <div className="adm-modal-body">
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
                    icon: "⏱️",
                    title: "Treatment At-A-Glance Bar",
                    desc: "4 highlight cards for quick patient answers.",
                    action: () => {
                      if (isSectionHidden("at_a_glance")) toggleSectionVisibility("at_a_glance");
                      setShowAddSectionModal(false);
                    }
                  },
                  {
                    icon: "🩺",
                    title: "Symptoms & Conditions Block",
                    desc: "List of treatable symptoms and linked conditions.",
                    action: () => {
                      if (isSectionHidden("symptoms")) toggleSectionVisibility("symptoms");
                      setActiveTab("bullets");
                      setShowAddSectionModal(false);
                    }
                  },
                  {
                    icon: "🛣️",
                    title: "Treatment Steps Roadmap",
                    desc: "4-step clinical recovery journey.",
                    action: () => {
                      if (isSectionHidden("treatment_approach")) toggleSectionVisibility("treatment_approach");
                      setActiveTab("bullets");
                      setShowAddSectionModal(false);
                    }
                  },
                  {
                    icon: "✨",
                    title: "Key Clinical Benefits Grid",
                    desc: "Highlighted checklist of proven benefits.",
                    action: () => {
                      if (isSectionHidden("benefits")) toggleSectionVisibility("benefits");
                      setActiveTab("bullets");
                      setShowAddSectionModal(false);
                    }
                  },
                  {
                    icon: "❓",
                    title: "FAQ Accordion Block",
                    desc: "Patient questions, insurance, and answers.",
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
