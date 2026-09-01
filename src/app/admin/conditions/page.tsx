"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/components/admin/RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Condition, ServiceCustomSection, FAQItem, SectionBlockConfig } from "@/types/content";
import { getConditions } from "@/lib/api";
import LivePreviewPane from "@/components/admin/LivePreviewPane";
import SectionBlockCustomizerModal from "@/components/admin/SectionBlockCustomizerModal";
import {
  SlidersIcon,
  LayoutIcon,
  ImageIcon,
  HelpCircleIcon,
  ListIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  CheckIcon,
  ShieldIcon,
  SearchIcon,
  XIcon
} from "@/components/admin/AdminIcons";

const defaultConditionSectionOrder = [
  "hero",
  "at_a_glance",
  "clinical_overview",
  "custom_sections",
  "symptoms",
  "treatment_approach",
  "related_therapies",
  "team_carousel",
  "faqs",
  "location_map",
  "decision_ctas",
  "other_links",
  "bottom_cta"
];

const conditionSectionDefs: Record<string, { title: string; desc: string; category: string }> = {
  hero: {
    title: "Hero Header & Assessment Banner",
    desc: "Top banner with title, badges, ratings, and assessment booking button.",
    category: "Header"
  },
  at_a_glance: {
    title: "Treatment At-A-Glance Bar",
    desc: "4 highlight cards: Duration, Direct Billing, Referral info, Care Plan.",
    category: "Summary"
  },
  clinical_overview: {
    title: "Clinical Overview & Root Cause",
    desc: "Understanding this condition and how we fix mechanical dysfunction with side image.",
    category: "Overview"
  },
  custom_sections: {
    title: "Custom Visual Storytelling Sections",
    desc: "Rich storytelling sections with left/right/top/bottom image placement.",
    category: "Custom Content"
  },
  symptoms: {
    title: "Recognizable Symptoms Grid",
    desc: "Recognize the warning signs and symptom patterns patients experience.",
    category: "Symptoms"
  },
  treatment_approach: {
    title: "4-Step Clinical Treatment Roadmap",
    desc: "Structured rehabilitation protocol from assessment to prevention.",
    category: "Roadmap"
  },
  related_therapies: {
    title: "Recommended Treatments & Therapies",
    desc: "Cards linking to physiotherapy, massage, acupuncture, etc.",
    category: "Services"
  },
  team_carousel: {
    title: "Meet Our Registered Team Carousel",
    desc: "Scrolling carousel of registered physiotherapists & staff.",
    category: "Team"
  },
  faqs: {
    title: "Frequently Asked Questions (Accordion)",
    desc: "Interactive accordion answering patient questions & insurance.",
    category: "FAQ"
  },
  location_map: {
    title: "Clinic Location & Interactive Google Map",
    desc: "Beddington location details, hours of operation, phone, and Google map.",
    category: "Location"
  },
  decision_ctas: {
    title: "Decision CTAs (Free Discovery & Phone Consult)",
    desc: "Two cards offering Free Discovery Session or Telephone Consult.",
    category: "Conversion"
  },
  other_links: {
    title: "Explore Other 17 Conditions",
    desc: "Pill buttons linking to other physical conditions.",
    category: "Navigation"
  },
  bottom_cta: {
    title: "Bottom Booking Call-to-Action Banner",
    desc: "Full-width high-contrast booking banner at the bottom of the page.",
    category: "Conversion"
  }
};

export default function AdminConditionsPage() {
  const { role, isAdmin, canDelete, canEditSlugs } = useRole();
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCondition, setEditingCondition] = useState<Condition | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchConditions = async () => {
    setLoading(true);
    try {
      let data = await getConditions();
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("adm_conditions");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              data = parsed;
            }
          } catch {}
        }
      }
      setConditions(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
  }, []);

  const handleSave = async (cond: Condition) => {
    try {
      const allUpdated = conditions.map((c) => (c.slug === cond.slug ? cond : c));
      if (!allUpdated.find((c) => c.slug === cond.slug)) {
        allUpdated.push(cond);
      }

      // 1. Save to Supabase (Database-first)
      if (isSupabaseConfigured && supabase) {
        const fullPayload = {
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
          sections_data: cond.sectionsData || {},
          faqs: cond.faqs || [],
          hidden_sections: cond.hiddenSections || [],
          section_order: cond.sectionOrder || defaultConditionSectionOrder,
          related_services: cond.relatedServices || [],
          category: cond.category || "general",
          seo: cond.seo || {},
          is_published: true,
          updated_at: new Date().toISOString()
        };

        const { error: fullErr } = await supabase
          .from("conditions")
          .upsert(fullPayload, { onConflict: "slug" });

        if (fullErr) {
          console.warn("Retrying with core columns fallback:", fullErr);
          const corePayload = {
            id: cond.id || `cond-${cond.slug}`,
            slug: cond.slug,
            name: cond.name,
            short_description: cond.shortDescription || null,
            description: cond.description,
            hero_image: cond.heroImage || null,
            symptoms: cond.symptoms || [],
            treatment_approach: cond.treatmentApproach || [],
            hidden_sections: cond.hiddenSections || [],
            section_order: cond.sectionOrder || defaultConditionSectionOrder,
            related_services: cond.relatedServices || [],
            category: cond.category || "general",
            seo: cond.seo || {},
            is_published: true,
            updated_at: new Date().toISOString()
          };
          const { error: coreErr } = await supabase
            .from("conditions")
            .upsert(corePayload, { onConflict: "slug" });
          if (coreErr) {
            console.error("Supabase condition save error:", coreErr);
          }
        }
      }

      // 2. Save to local data files via API route
      try {
        await fetch("/api/admin/save-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "conditions", data: allUpdated })
        });
      } catch {
        // ignore in static export
      }

      // 3. Save to localStorage for instant client hydration
      if (typeof window !== "undefined") {
        localStorage.setItem("adm_conditions", JSON.stringify(allUpdated));
        window.dispatchEvent(new Event("conditionsUpdated"));
      }

      setConditions(allUpdated);
      alert("✓ Condition saved successfully! Live website updated.");
      setEditingCondition(null);
    } catch (err: any) {
      console.error("Save condition failed:", err);
      alert("⚠️ Error saving: " + (err.message || err));
    }
  };

  const handleDelete = async (slug: string) => {
    if (!isAdmin) {
      alert("In Client Safe Mode, deleting core conditions is disabled to preserve SEO rankings. Switch to Master Admin mode if needed.");
      return;
    }
    if (!confirm(`Are you sure you want to delete the condition "${slug}"?`)) return;

    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from("conditions").delete().eq("slug", slug);
      }
      const updated = conditions.filter((c) => c.slug !== slug);
      if (typeof window !== "undefined") {
        localStorage.setItem("adm_conditions", JSON.stringify(updated));
        window.dispatchEvent(new Event("conditionsUpdated"));
      }
      setConditions(updated);
      alert("✓ Condition deleted!");
    } catch (err: any) {
      console.error("Delete condition failed:", err);
      alert("⚠️ Error deleting: " + (err.message || err));
    }
  };

  const filtered = conditions.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      (c.shortDescription && c.shortDescription.toLowerCase().includes(search.toLowerCase()))
  );

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
            Conditions &amp; Diagnoses Manager
          </h1>
          <p style={{ margin: 0, color: "var(--adm-text-muted)", fontSize: 14 }}>
            Manage pain conditions, page section order, side images, symptoms, and clinical roadmap
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() =>
              setEditingCondition({
                id: `condition-${Date.now()}`,
                slug: "new-condition",
                name: "New Condition",
                shortDescription: "",
                description: "",
                symptoms: [],
                treatmentApproach: [],
                benefits: [],
                customSections: [],
                sectionsData: {},
                faqs: [],
                hiddenSections: [],
                sectionOrder: defaultConditionSectionOrder,
                relatedServices: [],
                category: "general"
              })
            }
            className="adm-btn adm-btn-primary"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <PlusIcon size={16} />
            <span>Add New Condition</span>
          </button>
        )}
      </div>

      {/* Guarded Banner for Client Safe Mode */}
      {!isAdmin && (
        <div className="adm-guarded-banner" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ShieldIcon size={20} style={{ color: "#0284c7" }} />
          <div>
            <strong>Client Safe Mode Active:</strong> You can safely edit clinical text, side images, symptoms, and FAQs. Structural reordering and deletions are protected to preserve Google SEO rankings.
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="adm-card" style={{ padding: 14, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SearchIcon size={16} style={{ color: "#64748b" }} />
          <input
            type="text"
            placeholder="Search conditions by name, category, or description..."
            className="adm-input"
            style={{ border: "none", padding: "6px 0", boxShadow: "none" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Conditions Table */}
      <div className="adm-card">
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Condition Name</th>
                <th>Category</th>
                <th>URL Slug</th>
                <th>Sections &amp; FAQs</th>
                <th>Key Symptoms</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 36, color: "#64748b" }}>
                    Loading conditions data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 36, color: "#64748b" }}>
                    No conditions found.
                  </td>
                </tr>
              ) : (
                filtered.map((cond) => (
                  <tr key={cond.slug}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{cond.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b", maxWidth: 260, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {cond.shortDescription || cond.description?.slice(0, 70)}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: "capitalize", background: "#f1f5f9", padding: "3px 8px", borderRadius: 6 }}>
                        {cond.category || "General"}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: 12, background: "#f1f5f9", padding: "3px 7px", borderRadius: 6, color: "#0f172a" }}>
                        /conditions/{cond.slug}
                      </code>
                    </td>
                    <td>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: "#0369a1", background: "#e0f2fe", padding: "3px 8px", borderRadius: 6, marginRight: 6 }}>
                        {cond.customSections?.length || 0} Sections
                      </span>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: "#15803d", background: "#dcfce7", padding: "3px 8px", borderRadius: 6 }}>
                        {cond.faqs?.length || 0} FAQs
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, color: "#475569" }}>
                        {cond.symptoms?.length || 0} symptom points
                      </span>
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => setPreviewUrl(`/conditions/${cond.slug}`)}
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        style={{ marginRight: 6, display: "inline-flex", alignItems: "center", gap: 5 }}
                      >
                        <EyeIcon size={14} />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => setEditingCondition(JSON.parse(JSON.stringify(cond)))}
                        className="adm-btn adm-btn-primary adm-btn-sm"
                        style={{ marginRight: 6, display: "inline-flex", alignItems: "center", gap: 5 }}
                      >
                        <EditIcon size={14} />
                        <span>Edit</span>
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(cond.slug)}
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                          style={{ color: "#dc2626", display: "inline-flex", alignItems: "center", padding: "6px 8px" }}
                          title="Delete Condition"
                        >
                          <TrashIcon size={14} />
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

      {/* Condition Editor Modal */}
      {editingCondition && (
        <ConditionEditorModal
          condition={editingCondition}
          isAdmin={isAdmin}
          canEditSlugs={canEditSlugs}
          onClose={() => setEditingCondition(null)}
          onSave={handleSave}
          onPreview={(slug) => setPreviewUrl(`/conditions/${slug}`)}
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

// Sub-component: Condition Editor Modal with Universal Block Customizer
function ConditionEditorModal({
  condition: initialCondition,
  isAdmin,
  canEditSlugs,
  onClose,
  onSave,
  onPreview
}: {
  condition: Condition;
  isAdmin: boolean;
  canEditSlugs: boolean;
  onClose: () => void;
  onSave: (condition: Condition) => void;
  onPreview: (slug: string) => void;
}) {
  const [cond, setCond] = useState<Condition>({
    ...initialCondition,
    sectionOrder: initialCondition.sectionOrder && initialCondition.sectionOrder.length > 0
      ? initialCondition.sectionOrder
      : defaultConditionSectionOrder,
    sectionsData: initialCondition.sectionsData || {}
  });

  const [activeTab, setActiveTab] = useState<"layout" | "general" | "sections" | "symptoms" | "steps" | "faqs">("layout");
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [customizingBlockKey, setCustomizingBlockKey] = useState<string | null>(null);

  // Section Ordering & Visibility helpers
  const currentOrder = cond.sectionOrder || defaultConditionSectionOrder;
  const hiddenSections = cond.hiddenSections || [];
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

    setCond((prev) => ({ ...prev, sectionOrder: newOrder }));
  };

  const toggleSectionVisibility = (key: string) => {
    if (!isAdmin) {
      alert("Only Master Admin can hide or delete page sections.");
      return;
    }
    setCond((prev) => {
      const curHidden = prev.hiddenSections || [];
      const updatedHidden = curHidden.includes(key)
        ? curHidden.filter((k) => k !== key)
        : [...curHidden, key];
      return { ...prev, hiddenSections: updatedHidden };
    });
  };

  // Block Customizer Save Handler
  const handleSaveBlockConfig = (updatedCfg: SectionBlockConfig) => {
    if (!customizingBlockKey) return;
    setCond((prev) => ({
      ...prev,
      sectionsData: {
        ...(prev.sectionsData || {}),
        [customizingBlockKey]: updatedCfg
      }
    }));
  };

  // Symptoms helpers
  const [newSymptom, setNewSymptom] = useState("");
  const addSymptom = () => {
    if (!newSymptom.trim()) return;
    setCond((prev) => ({ ...prev, symptoms: [...(prev.symptoms || []), newSymptom.trim()] }));
    setNewSymptom("");
  };
  const removeSymptom = (idx: number) => {
    setCond((prev) => ({ ...prev, symptoms: prev.symptoms?.filter((_, i) => i !== idx) }));
  };

  // Treatment steps helpers
  const [newStep, setNewStep] = useState("");
  const addStep = () => {
    if (!newStep.trim()) return;
    setCond((prev) => ({ ...prev, treatmentApproach: [...(prev.treatmentApproach || []), newStep.trim()] }));
    setNewStep("");
  };
  const removeStep = (idx: number) => {
    setCond((prev) => ({ ...prev, treatmentApproach: prev.treatmentApproach?.filter((_, i) => i !== idx) }));
  };

  // FAQs helpers
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");
  const addFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    setCond((prev) => ({ ...prev, faqs: [...(prev.faqs || []), { question: newFaqQ.trim(), answer: newFaqA.trim() }] }));
    setNewFaqQ("");
    setNewFaqA("");
  };
  const removeFaq = (idx: number) => {
    setCond((prev) => ({ ...prev, faqs: prev.faqs?.filter((_, i) => i !== idx) }));
  };

  // Custom Sections Helper
  const addCustomSection = (pos: "right" | "left" | "top" | "bottom" | "none" = "right") => {
    const newSec: ServiceCustomSection = {
      id: `sec-${Date.now()}`,
      eyebrow: "Targeted Clinical Care",
      eyebrowColor: "#1c9fd8",
      title: "Evidence-Based Treatment Protocol",
      subtitle: "Personalized recovery plan",
      content: "Explain your diagnostic methodology and clinical rehabilitation approach for this condition.",
      bullets: [
        "In-depth mechanical root cause analysis",
        "Targeted mobilization & soft tissue release",
        "Home exercise & flare-up prevention program"
      ],
      image: "/images/clinic/reception-three.jpg",
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

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal wide" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "92vh", width: "95%", maxWidth: 1050 }}>
        
        {/* Modal Header */}
        <div className="adm-modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
              Edit Condition: {cond.name}
            </h3>
            <span style={{ fontSize: 13, color: "var(--adm-text-muted)" }}>
              /conditions/{cond.slug}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              type="button"
              onClick={() => onPreview(cond.slug)}
              className="adm-btn adm-btn-secondary adm-btn-sm"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <EyeIcon size={14} />
              <span>Preview Live</span>
            </button>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 4 }}
            >
              <XIcon size={20} />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", padding: "0 20px", overflowX: "auto" }}>
          {[
            { id: "layout", label: "Page Sections & Layout", icon: <SlidersIcon size={15} /> },
            { id: "general", label: "General & Hero", icon: <LayoutIcon size={15} /> },
            { id: "sections", label: `Custom Sections (${cond.customSections?.length || 0})`, icon: <ImageIcon size={15} /> },
            { id: "symptoms", label: `Symptoms (${cond.symptoms?.length || 0})`, icon: <ListIcon size={15} /> },
            { id: "steps", label: `4-Step Roadmap (${cond.treatmentApproach?.length || 0})`, icon: <ListIcon size={15} /> },
            { id: "faqs", label: `FAQ Builder (${cond.faqs?.length || 0})`, icon: <HelpCircleIcon size={15} /> }
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
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: activeTab === tab.id ? "var(--adm-primary)" : "#64748b",
                borderBottom: activeTab === tab.id ? "2px solid var(--adm-primary)" : "2px solid transparent"
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
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
                    Modular Condition Page Layout &amp; Reordering
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: "#0284c7" }}>
                    {isAdmin
                      ? "Customize images, placement (left/right/banner), background styling, or reorder/hide any section."
                      : "Client View: Displays condition page layout. Structural reordering is managed by Master Admin."}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowAddSectionModal(true)}
                    className="adm-btn adm-btn-primary adm-btn-sm"
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <PlusIcon size={14} />
                    <span>Add / Insert Section</span>
                  </button>
                )}
              </div>

              {/* Reorderable Sections List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {currentOrder.map((key, idx) => {
                  const secDef = conditionSectionDefs[key] || {
                    title: key,
                    desc: "Custom page section block",
                    category: "Block"
                  };
                  const hidden = isSectionHidden(key);
                  const hasCustomConfig = Boolean(cond.sectionsData?.[key]);

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
                      {/* Left side: Position, Title, Badges */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                            <strong style={{ fontSize: 13.5, color: hidden ? "#64748b" : "#1e293b" }}>
                              {secDef.title}
                            </strong>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: 999,
                                background: hidden ? "#fee2e2" : "#dcfce7",
                                color: hidden ? "#991b1b" : "#166534"
                              }}
                            >
                              {hidden ? "Hidden" : "Active"}
                            </span>
                            {hasCustomConfig && (
                              <span
                                style={{
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  background: "#f3e8ff",
                                  color: "#7e22ce"
                                }}
                              >
                                Customized
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                            {secDef.desc}
                          </div>
                        </div>
                      </div>

                      {/* Right side: Customize, Reorder, Visibility */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        
                        {/* Universal Section Block Customizer Button */}
                        <button
                          type="button"
                          onClick={() => setCustomizingBlockKey(key)}
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                          style={{ display: "flex", alignItems: "center", gap: 5 }}
                          title="Customize image, position, background, title, and highlights"
                        >
                          <SlidersIcon size={13} />
                          <span>Customize Block</span>
                        </button>

                        {/* Master Admin: Move Up & Move Down */}
                        {isAdmin && (
                          <div style={{ display: "flex", gap: 4, marginRight: 4 }}>
                            <button
                              type="button"
                              onClick={() => moveSection(idx, "up")}
                              disabled={idx === 0}
                              style={{
                                background: "#f1f5f9",
                                border: "1px solid #cbd5e1",
                                borderRadius: 6,
                                padding: "5px 8px",
                                cursor: idx === 0 ? "not-allowed" : "pointer",
                                opacity: idx === 0 ? 0.4 : 1,
                                display: "flex",
                                alignItems: "center"
                              }}
                              title="Move section UP"
                            >
                              <ArrowUpIcon size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSection(idx, "down")}
                              disabled={idx === currentOrder.length - 1}
                              style={{
                                background: "#f1f5f9",
                                border: "1px solid #cbd5e1",
                                borderRadius: 6,
                                padding: "5px 8px",
                                cursor: idx === currentOrder.length - 1 ? "not-allowed" : "pointer",
                                opacity: idx === currentOrder.length - 1 ? 0.4 : 1,
                                display: "flex",
                                alignItems: "center"
                              }}
                              title="Move section DOWN"
                            >
                              <ArrowDownIcon size={13} />
                            </button>
                          </div>
                        )}

                        {/* Master Admin: Hide / Restore Toggle */}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => toggleSectionVisibility(key)}
                            className={`adm-btn adm-btn-sm ${hidden ? "adm-btn-primary" : "adm-btn-secondary"}`}
                            style={{ minWidth: 84, display: "flex", alignItems: "center", gap: 5 }}
                          >
                            {hidden ? <EyeIcon size={13} /> : <EyeOffIcon size={13} />}
                            <span>{hidden ? "Restore" : "Hide"}</span>
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
                <label className="adm-form-label">Condition Name</label>
                <input
                  type="text"
                  className="adm-input"
                  value={cond.name}
                  onChange={(e) => setCond({ ...cond, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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
                  <label className="adm-form-label">Category</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={cond.category || ""}
                    onChange={(e) => setCond({ ...cond, category: e.target.value })}
                    placeholder="E.g., Spine, Shoulder, Sports"
                  />
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Short Summary (Featured on cards)</label>
                <textarea
                  className="adm-textarea"
                  style={{ minHeight: 70 }}
                  value={cond.shortDescription || ""}
                  onChange={(e) => setCond({ ...cond, shortDescription: e.target.value })}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Clinical Description &amp; Root Cause Explanation</label>
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
                  <label className="adm-form-label">Call to Action Button Text</label>
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
                  Create rich storytelling sections with image left/right/top/bottom placement and custom badge styling.
                </span>
                <button
                  type="button"
                  onClick={() => addCustomSection("right")}
                  className="adm-btn adm-btn-primary adm-btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <PlusIcon size={14} />
                  <span>Add Custom Section</span>
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
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => removeCustomSection(idx)}
                            style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
                          >
                            <TrashIcon size={13} />
                            <span>Delete Section</span>
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

          {/* ── TAB 4: SYMPTOMS ── */}
          {activeTab === "symptoms" && (
            <div>
              <div style={{ background: "#f1f5f9", padding: 16, borderRadius: 12, marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 700 }}>Add Common Symptom or Warning Sign</h4>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="text"
                    placeholder="E.g., Sharp shooting pain down the back of the leg"
                    className="adm-input"
                    value={newSymptom}
                    onChange={(e) => setNewSymptom(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSymptom(); } }}
                  />
                  <button
                    type="button"
                    onClick={addSymptom}
                    className="adm-btn adm-btn-primary adm-btn-sm"
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <PlusIcon size={14} />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {cond.symptoms?.map((s, idx) => (
                  <div key={idx} style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13.5, color: "#334155" }}>• {s}</span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => removeSymptom(idx)}
                        style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}
                      >
                        <TrashIcon size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 5: 4-STEP ROADMAP ── */}
          {activeTab === "steps" && (
            <div>
              <div style={{ background: "#f1f5f9", padding: 16, borderRadius: 12, marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 700 }}>Add Clinical Journey Step</h4>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="text"
                    placeholder="E.g., Comprehensive orthopedic assessment and postural scan"
                    className="adm-input"
                    value={newStep}
                    onChange={(e) => setNewStep(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addStep(); } }}
                  />
                  <button
                    type="button"
                    onClick={addStep}
                    className="adm-btn adm-btn-primary adm-btn-sm"
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <PlusIcon size={14} />
                    <span>Add Step</span>
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {cond.treatmentApproach?.map((step, idx) => (
                  <div key={idx} style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "12px 16px", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#e0f2fe", color: "#0369a1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: 13.5, color: "#334155" }}>{step}</span>
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => removeStep(idx)}
                        style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}
                      >
                        <TrashIcon size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 6: FAQ BUILDER ── */}
          {activeTab === "faqs" && (
            <div>
              <div style={{ background: "#f1f5f9", padding: 16, borderRadius: 12, marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 700 }}>Add FAQ Item</h4>
                <div className="adm-form-group">
                  <input
                    type="text"
                    placeholder="E.g., How many physiotherapy sessions will I need for this condition?"
                    className="adm-input"
                    value={newFaqQ}
                    onChange={(e) => setNewFaqQ(e.target.value)}
                  />
                </div>
                <div className="adm-form-group">
                  <textarea
                    placeholder="Enter thorough answer..."
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
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <PlusIcon size={14} />
                  <span>Add FAQ</span>
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
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => removeFaq(idx)}
                        style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}
                      >
                        <TrashIcon size={14} />
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
            onClick={() => onSave(cond)}
            className="adm-btn adm-btn-success"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <CheckIcon size={16} />
            <span>Save Condition Changes</span>
          </button>
        </div>

      </div>

      {/* ── MODAL: SECTION BLOCK PICKER ── */}
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
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a" }}>
                  Add / Insert Condition Page Section
                </h3>
                <span style={{ fontSize: 12.5, color: "#64748b" }}>
                  Choose a standard clinic section or build a custom storytelling block
                </span>
              </div>
              <button
                onClick={() => setShowAddSectionModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 4 }}
              >
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="adm-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  {
                    title: "Custom Storytelling Section",
                    desc: "Add left/right image, badge, text, and checklist bullets.",
                    action: () => {
                      addCustomSection("right");
                      setShowAddSectionModal(false);
                    }
                  },
                  {
                    title: "Clinical Overview Block",
                    desc: "Explain the mechanical root cause and pathology.",
                    action: () => {
                      if (isSectionHidden("clinical_overview")) toggleSectionVisibility("clinical_overview");
                      setActiveTab("general");
                      setShowAddSectionModal(false);
                    }
                  },
                  {
                    title: "Treatment At-A-Glance Bar",
                    desc: "4 highlight cards for quick patient answers.",
                    action: () => {
                      if (isSectionHidden("at_a_glance")) toggleSectionVisibility("at_a_glance");
                      setShowAddSectionModal(false);
                    }
                  },
                  {
                    title: "Symptoms Grid Block",
                    desc: "Warning signs and common clinical complaints.",
                    action: () => {
                      if (isSectionHidden("symptoms")) toggleSectionVisibility("symptoms");
                      setActiveTab("symptoms");
                      setShowAddSectionModal(false);
                    }
                  },
                  {
                    title: "4-Step Treatment Roadmap",
                    desc: "Step-by-step patient recovery journey.",
                    action: () => {
                      if (isSectionHidden("treatment_approach")) toggleSectionVisibility("treatment_approach");
                      setActiveTab("steps");
                      setShowAddSectionModal(false);
                    }
                  },
                  {
                    title: "Recommended Therapies Grid",
                    desc: "Linked clinical therapies & services.",
                    action: () => {
                      if (isSectionHidden("related_therapies")) toggleSectionVisibility("related_therapies");
                      setShowAddSectionModal(false);
                    }
                  },
                  {
                    title: "FAQ Accordion Block",
                    desc: "Patient questions, insurance, and answers.",
                    action: () => {
                      if (isSectionHidden("faqs")) toggleSectionVisibility("faqs");
                      setActiveTab("faqs");
                      setShowAddSectionModal(false);
                    }
                  },
                  {
                    title: "Meet The Team Carousel",
                    desc: "Showcase clinic therapists and staff.",
                    action: () => {
                      if (isSectionHidden("team_carousel")) toggleSectionVisibility("team_carousel");
                      setShowAddSectionModal(false);
                    }
                  },
                  {
                    title: "Location Map & Hours Card",
                    desc: "Beddington location map, directions, and hours.",
                    action: () => {
                      if (isSectionHidden("location_map")) toggleSectionVisibility("location_map");
                      setShowAddSectionModal(false);
                    }
                  },
                  {
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
                    <strong style={{ fontSize: 13.5, color: "#1e293b" }}>{item.title}</strong>
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

      {/* ── MODAL: UNIVERSAL SECTION BLOCK CUSTOMIZER ── */}
      {customizingBlockKey && (
        <SectionBlockCustomizerModal
          isOpen={Boolean(customizingBlockKey)}
          onClose={() => setCustomizingBlockKey(null)}
          sectionKey={customizingBlockKey}
          sectionDefaultTitle={conditionSectionDefs[customizingBlockKey]?.title || customizingBlockKey}
          config={cond.sectionsData?.[customizingBlockKey]}
          onSave={handleSaveBlockConfig}
        />
      )}

    </div>
  );
}
