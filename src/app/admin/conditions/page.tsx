"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/components/admin/RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Condition, ServiceCustomSection, FAQItem, SectionBlockConfig } from "@/types/content";
import { getConditions } from "@/lib/api";
import LivePreviewPane from "@/components/admin/LivePreviewPane";
import SectionBlockCustomizerModal from "@/components/admin/SectionBlockCustomizerModal";
import AdminToast from "@/components/admin/AdminToast";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";
import AdminImageUploader from "@/components/admin/AdminImageUploader";
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
  XIcon,
  GripVerticalIcon,
  CopyIcon,
  StethoscopeIcon,
  ActivityIcon,
  CheckCircleIcon,
  FileTextIcon,
  CompassIcon,
  StarIcon,
  MapPinIcon,
  UsersIcon,
  TargetIcon,
  RocketIcon,
  ColumnsIcon,
  LayersIcon,
  LinkIcon,
  SparklesIcon
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
  testimonials: {
    title: "Patient Testimonials & Reviews Grid",
    desc: "Real patient 5-star quotes, ratings, and recovery success stories.",
    category: "Social Proof"
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ slug: string; title: string } | null>(null);

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

    const handleSync = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("adm_conditions");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) setConditions(parsed);
          } catch {}
        }
      }
    };

    window.addEventListener("conditionsUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("conditionsUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
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
          category: cond.category,
          short_description: cond.shortDescription || null,
          description: cond.description || "",
          overview: cond.description || null,
          symptoms: cond.symptoms || [],
          treatment_approach: cond.treatmentApproach || [],
          custom_sections: cond.customSections || [],
          faqs: cond.faqs || [],
          hidden_sections: cond.hiddenSections || [],
          section_order: cond.sectionOrder || defaultConditionSectionOrder,
          related_services: cond.relatedServices || [],
          hero_image: cond.heroImage || null,
          side_image: cond.sideImage || null,
          seo: { ...(cond.seo || {}), sectionsData: cond.sectionsData || {} },
          is_published: true,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from("conditions")
          .upsert(fullPayload, { onConflict: "slug" });

        if (error) {
          console.error("Supabase condition upsert error:", error);
        }
      }

      // 2. Save to localStorage for instant client hydration
      if (typeof window !== "undefined") {
        localStorage.setItem("adm_conditions", JSON.stringify(allUpdated));
        window.dispatchEvent(new Event("conditionsUpdated"));
      }

      // 3. Save to local data files via API route
      try {
        await fetch("/api/admin/save-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "conditions", data: allUpdated })
        });
      } catch {
        // ignore in static export
      }

      setConditions(allUpdated);
      setEditingCondition(null);
      setToastMessage(`✓ Condition "${cond.name}" saved successfully!`);
    } catch (err: any) {
      console.error("Save condition failed:", err);
      alert("⚠️ Error saving: " + (err.message || err));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { slug, title } = deleteTarget;

    try {
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from("conditions").delete().eq("slug", slug);
        } catch (e) {
          console.warn("Supabase delete condition error:", e);
        }
      }
      const updated = conditions.filter((c) => c.slug !== slug);
      if (typeof window !== "undefined") {
        localStorage.setItem("adm_conditions", JSON.stringify(updated));
        window.dispatchEvent(new Event("conditionsUpdated"));
      }
      try {
        await fetch("/api/admin/save-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "conditions", data: updated })
        });
      } catch {}

      setConditions(updated);
      setEditingCondition(null);
      setToastMessage(`✓ Condition "${title}" permanently deleted!`);
    } catch (err: any) {
      console.error("Delete condition failed:", err);
      alert("⚠️ Error deleting: " + (err.message || err));
    } finally {
      setDeleteTarget(null);
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
      <AdminToast message={toastMessage} onClose={() => setToastMessage(null)} />
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        itemName={deleteTarget?.title || ""}
        itemType="Condition"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
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
                      <button
                        onClick={() => setDeleteTarget({ slug: cond.slug, title: cond.name })}
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        style={{ color: "#dc2626", display: "inline-flex", alignItems: "center", padding: "6px 8px" }}
                        title="Delete Condition"
                      >
                        <TrashIcon size={14} />
                      </button>
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
          onDelete={(slug) => {
            const c = conditions.find((x) => x.slug === slug);
            setDeleteTarget({ slug, title: c?.name || slug });
          }}
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

// Sub-component: Condition Editor Modal with Reordering & Universal Block Customizer
function ConditionEditorModal({
  condition: initialCondition,
  isAdmin,
  canEditSlugs,
  onClose,
  onSave,
  onDelete,
  onPreview
}: {
  condition: Condition;
  isAdmin: boolean;
  canEditSlugs: boolean;
  onClose: () => void;
  onSave: (condition: Condition) => void;
  onDelete: (slug: string) => void;
  onPreview: (slug: string) => void;
}) {
  const [cond, setCond] = useState<Condition>({
    ...initialCondition,
    sectionOrder: initialCondition.sectionOrder && initialCondition.sectionOrder.length > 0
      ? initialCondition.sectionOrder
      : defaultConditionSectionOrder,
    sectionsData: initialCondition.sectionsData || {}
  });

  // Default active tab is now "general" (General & Hero), then "layout" (Sections & Layout)
  const [activeTab, setActiveTab] = useState<"general" | "layout" | "symptoms" | "steps" | "faqs" | "benefits">("general");
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [customizingBlockKey, setCustomizingBlockKey] = useState<string | null>(null);

  // Drag & Drop reordering state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Section Ordering & Visibility helpers (Hero banner is configured in Tab 1)
  const rawOrder = cond.sectionOrder && cond.sectionOrder.length > 0
    ? cond.sectionOrder
    : defaultConditionSectionOrder;
  const currentOrder = rawOrder.filter((k) => k !== "hero");

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

    setCond((prev) => ({ ...prev, sectionOrder: ["hero", ...newOrder] }));
  };

  const [deleteSectionKey, setDeleteSectionKey] = useState<string | null>(null);

  const deleteSection = (key: string) => {
    setDeleteSectionKey(key);
  };

  const toggleSectionVisibility = (key: string) => {
    setCond((prev) => {
      const curHidden = prev.hiddenSections || [];
      const updatedHidden = curHidden.includes(key)
        ? curHidden.filter((k) => k !== key)
        : [...curHidden, key];
      return { ...prev, hiddenSections: updatedHidden };
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newOrder = [...currentOrder];
    const [movedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, movedItem);
    setCond((prev) => ({ ...prev, sectionOrder: ["hero", ...newOrder] }));
    setDraggedIndex(null);
    setDragOverIndex(null);
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

  // Hero Section Trust Badges helpers
  const [newHeroBullet, setNewHeroBullet] = useState("");
  const heroBullets = cond.sectionsData?.hero?.bullets && cond.sectionsData.hero.bullets.length > 0
    ? cond.sectionsData.hero.bullets
    : ["Direct Billing to Insurance", "No Physician Referral Needed", "Free On-Site Parking"];

  const addHeroBullet = () => {
    if (!newHeroBullet.trim()) return;
    const updated = [...heroBullets, newHeroBullet.trim()];
    setCond((prev) => ({
      ...prev,
      sectionsData: {
        ...(prev.sectionsData || {}),
        hero: {
          ...(prev.sectionsData?.hero || {}),
          bullets: updated
        }
      }
    }));
    setNewHeroBullet("");
  };

  const removeHeroBullet = (idx: number) => {
    const updated = heroBullets.filter((_, i) => i !== idx);
    setCond((prev) => ({
      ...prev,
      sectionsData: {
        ...(prev.sectionsData || {}),
        hero: {
          ...(prev.sectionsData?.hero || {}),
          bullets: updated
        }
      }
    }));
  };

  const updateHeroBullet = (idx: number, val: string) => {
    const updated = [...heroBullets];
    updated[idx] = val;
    setCond((prev) => ({
      ...prev,
      sectionsData: {
        ...(prev.sectionsData || {}),
        hero: {
          ...(prev.sectionsData?.hero || {}),
          bullets: updated
        }
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

  // Benefits helpers
  const [newBenefit, setNewBenefit] = useState("");
  const addBenefit = () => {
    if (!newBenefit.trim()) return;
    setCond((prev) => ({ ...prev, benefits: [...(prev.benefits || []), newBenefit.trim()] }));
    setNewBenefit("");
  };
  const removeBenefit = (idx: number) => {
    setCond((prev) => ({ ...prev, benefits: prev.benefits?.filter((_, i) => i !== idx) }));
  };

  // Custom Sections Helper
  const addCustomSectionWithPreset = (preset?: Partial<ServiceCustomSection>) => {
    const newSec: ServiceCustomSection = {
      id: `sec-${Date.now()}`,
      eyebrow: preset?.eyebrow || "Targeted Clinical Care",
      eyebrowColor: preset?.eyebrowColor || "#1c9fd8",
      title: preset?.title || "Evidence-Based Treatment Protocol",
      subtitle: preset?.subtitle || "Personalized recovery plan",
      content: preset?.content || "Explain your diagnostic methodology and clinical rehabilitation approach for this condition.",
      bullets: preset?.bullets || [
        "In-depth mechanical root cause analysis",
        "Targeted mobilization & soft tissue release",
        "Home exercise & flare-up prevention program"
      ],
      image: preset?.image || "/images/clinic/reception-three.jpg",
      imagePosition: preset?.imagePosition || "right",
      background: preset?.background || "white"
    };

    setCond((prev) => {
      const order = prev.sectionOrder || defaultConditionSectionOrder;
      const newOrder = order.includes("custom_sections") ? order : [...order, "custom_sections"];
      const curHidden = prev.hiddenSections || [];
      return {
        ...prev,
        customSections: [...(prev.customSections || []), newSec],
        sectionOrder: newOrder,
        hiddenSections: curHidden.filter((k) => k !== "custom_sections")
      };
    });
    setActiveTab("layout");
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

  // Apply Section Template Helper
  const applySectionTemplate = (template: any) => {
    setShowAddSectionModal(false);

    if (template.isCustom) {
      const newIndex = cond.customSections?.length || 0;
      addCustomSectionWithPreset(template.preset);
      // Immediately open info update box for this newly created custom section
      setCustomizingBlockKey(`custom-${newIndex}`);
      return;
    }

    const key = template.id;
    setCond((prev) => {
      const curHidden = prev.hiddenSections || [];
      const order = prev.sectionOrder || defaultConditionSectionOrder;
      const newOrder = order.includes(key) ? order : [...order, key];
      const curSectionsData = prev.sectionsData || {};

      return {
        ...prev,
        hiddenSections: curHidden.filter((k) => k !== key),
        sectionOrder: newOrder,
        sectionsData: {
          ...curSectionsData,
          [key]: {
            ...(curSectionsData[key] || {}),
            ...(template.preset || {})
          }
        }
      };
    });

    // If this section has editable content fields, open its info update box immediately!
    if (!template.noConfig) {
      setCustomizingBlockKey(key);
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <ConfirmDeleteModal
        isOpen={Boolean(deleteSectionKey)}
        itemName={conditionSectionDefs[deleteSectionKey || ""]?.title || deleteSectionKey || ""}
        itemType="Condition Section"
        onConfirm={() => {
          if (deleteSectionKey) {
            setCond((prev) => {
              const curOrder = prev.sectionOrder && prev.sectionOrder.length > 0 ? prev.sectionOrder : defaultConditionSectionOrder;
              return {
                ...prev,
                sectionOrder: curOrder.filter((k) => k !== deleteSectionKey)
              };
            });
            setDeleteSectionKey(null);
          }
        }}
        onClose={() => setDeleteSectionKey(null)}
      />
      <div className="adm-modal wide" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "92vh", width: "95%", maxWidth: 1050, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
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

        {/* Modal Navigation Tabs — General & Hero first, then Sections & Layout */}
        <div style={{ flexShrink: 0, borderBottom: "1px solid #e2e8f0", background: "#f8fafc", padding: "0 20px", overflowX: "auto", overflowY: "visible", display: "flex", scrollbarWidth: "thin" }}>
          {[
            { id: "general", label: "General & Hero", icon: <LayoutIcon size={15} /> },
            { id: "layout", label: `Sections & Layout (${currentOrder.length})`, icon: <SlidersIcon size={15} /> },
            { id: "symptoms", label: `Symptoms (${cond.symptoms?.length || 0})`, icon: <ListIcon size={15} /> },
            { id: "steps", label: `4-Step Roadmap (${cond.treatmentApproach?.length || 0})`, icon: <ListIcon size={15} /> },
            { id: "faqs", label: `FAQ Builder (${cond.faqs?.length || 0})`, icon: <HelpCircleIcon size={15} /> },
            { id: "benefits", label: `Benefits (${cond.benefits?.length || 0})`, icon: <CheckIcon size={15} /> }
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

        {/* Modal Body — only this section scrolls */}
        <div className="adm-modal-body" style={{ overflowY: "auto", overflowX: "hidden", flex: 1, padding: 24 }}>
          
          {/* ── TAB 1: GENERAL & HERO (FIRST) ── */}
          {activeTab === "general" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Card 1: Page Identity & URL */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <h4 style={{ margin: "0 0 14px 0", fontSize: 14, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                  <LayoutIcon size={16} style={{ color: "var(--adm-primary)" }} />
                  <span>Page Identity &amp; Routing</span>
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="adm-form-group" style={{ margin: 0 }}>
                    <label className="adm-form-label">Condition Name</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={cond.name}
                      onChange={(e) => setCond({ ...cond, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="adm-form-group" style={{ margin: 0 }}>
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
                </div>
              </div>

              {/* Card 2: Hero Banner Content & Headlines */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <h4 style={{ margin: "0 0 14px 0", fontSize: 14, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                  <SparklesIcon size={16} style={{ color: "#0284c7" }} />
                  <span>Hero Section Banner Headlines &amp; Messaging</span>
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div className="adm-form-group" style={{ margin: 0 }}>
                    <label className="adm-form-label">Hero Eyebrow Pill Badge</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={cond.sectionsData?.hero?.eyebrow || "Specialized Clinical Assessment · Calgary North"}
                      onChange={(e) =>
                        setCond({
                          ...cond,
                          sectionsData: {
                            ...(cond.sectionsData || {}),
                            hero: {
                              ...(cond.sectionsData?.hero || {}),
                              eyebrow: e.target.value
                            }
                          }
                        })
                      }
                      placeholder="e.g., Specialized Clinical Assessment · Calgary North"
                    />
                  </div>
                  <div className="adm-form-group" style={{ margin: 0 }}>
                    <label className="adm-form-label">Hero Main H1 Headline</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={cond.sectionsData?.hero?.title || `${cond.name} Treatment in Calgary North`}
                      onChange={(e) =>
                        setCond({
                          ...cond,
                          sectionsData: {
                            ...(cond.sectionsData || {}),
                            hero: {
                              ...(cond.sectionsData?.hero || {}),
                              title: e.target.value
                            }
                          }
                        })
                      }
                      placeholder="e.g., Back Pain & Sciatica Relief in Calgary"
                    />
                  </div>
                </div>

                <div className="adm-form-group" style={{ margin: 0 }}>
                  <label className="adm-form-label">Hero Short Summary (Hook featured on top hero banner &amp; preview cards)</label>
                  <textarea
                    className="adm-textarea"
                    style={{ minHeight: 80 }}
                    value={cond.shortDescription || ""}
                    onChange={(e) =>
                      setCond({
                        ...cond,
                        shortDescription: e.target.value,
                        sectionsData: {
                          ...(cond.sectionsData || {}),
                          hero: {
                            ...(cond.sectionsData?.hero || {}),
                            content: e.target.value
                          }
                        }
                      })
                    }
                    placeholder="Enter a compelling clinical summary for the top hero banner..."
                  />
                </div>
              </div>

              {/* Card 3: Hero Media & Conversion CTA */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <h4 style={{ margin: "0 0 14px 0", fontSize: 14, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                  <ImageIcon size={16} style={{ color: "#16a34a" }} />
                  <span>Hero Media &amp; Primary Booking Call-to-Action</span>
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>
                  <AdminImageUploader
                    label="Hero Banner Image"
                    value={cond.heroImage || ""}
                    onChange={(url) =>
                      setCond({
                        ...cond,
                        heroImage: url,
                        sectionsData: {
                          ...(cond.sectionsData || {}),
                          hero: {
                            ...(cond.sectionsData?.hero || {}),
                            image: url
                          }
                        }
                      })
                    }
                    folder="conditions"
                    placeholder="/images/clinic/reception-three.jpg"
                    aspectRatioNote="Landscape 16:9 recommended"
                  />
                  <div className="adm-form-group" style={{ margin: 0 }}>
                    <label className="adm-form-label">Primary Call to Action Button Text</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={cond.ctaText || "Book Assessment"}
                      onChange={(e) =>
                        setCond({
                          ...cond,
                          ctaText: e.target.value,
                          sectionsData: {
                            ...(cond.sectionsData || {}),
                            hero: {
                              ...(cond.sectionsData?.hero || {}),
                              ctaText: e.target.value
                            }
                          }
                        })
                      }
                    />
                  </div>
                </div>

                {cond.heroImage && (
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12, background: "#f8fafc", border: "1px solid #e2e8f0", padding: 10, borderRadius: 8 }}>
                    <img
                      src={cond.heroImage}
                      alt="Hero preview"
                      style={{ width: 60, height: 45, objectFit: "cover", borderRadius: 6 }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <span style={{ fontSize: 12, color: "#64748b" }}>Live Hero Banner Image Preview</span>
                  </div>
                )}
              </div>

              {/* Card 4: Hero Trust Micro-Badges (Under Booking Buttons) */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <h4 style={{ margin: "0 0 2px 0", fontSize: 14, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                      <CheckCircleIcon size={16} style={{ color: "#16a34a" }} />
                      <span>Hero Trust Micro-Badges ({heroBullets.length})</span>
                    </h4>
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      Key trust bullets displayed with green checkmarks (✓) right under the booking CTA button in the hero banner.
                    </span>
                  </div>
                </div>

                {/* Add new trust badge input */}
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <input
                    type="text"
                    className="adm-input"
                    value={newHeroBullet}
                    onChange={(e) => setNewHeroBullet(e.target.value)}
                    placeholder="e.g., Direct Billing to Insurance, No Referral Needed..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addHeroBullet();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addHeroBullet}
                    className="adm-btn adm-btn-primary adm-btn-sm"
                    style={{ whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <PlusIcon size={14} />
                    <span>Add Badge</span>
                  </button>
                </div>

                {/* List of active trust badges */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {heroBullets.map((badge, bIdx) => (
                    <div
                      key={bIdx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        padding: "8px 12px",
                        borderRadius: 8
                      }}
                    >
                      <span style={{ color: "#16a34a", fontWeight: 800, fontSize: 14 }}>✓</span>
                      <input
                        type="text"
                        value={badge}
                        onChange={(e) => updateHeroBullet(bIdx, e.target.value)}
                        style={{
                          flex: 1,
                          border: "none",
                          background: "transparent",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1e293b",
                          outline: "none"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeHeroBullet(bIdx)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#ef4444",
                          display: "flex",
                          padding: 4
                        }}
                        title="Remove badge"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 5: Homepage & Directory Card Summary (Cards on Home & /conditions) */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ marginBottom: 14 }}>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: 15, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                    <LayoutIcon size={16} style={{ color: "#0e78a8" }} />
                    <span>Homepage &amp; Directory Card Summary</span>
                  </h4>
                  <span style={{ fontSize: 12.5, color: "#64748b" }}>
                    Customize the summary paragraph, condition category badge, and card thumbnail that appear inside the card tiles on the Homepage and `/conditions` directory.
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, alignItems: "start" }}>
                  {/* Form fields */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div className="adm-form-group" style={{ margin: 0 }}>
                      <label className="adm-form-label">
                        Card Summary Paragraph <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <textarea
                        className="adm-textarea"
                        style={{ minHeight: 90 }}
                        value={cond.shortDescription || ""}
                        onChange={(e) => setCond({ ...cond, shortDescription: e.target.value })}
                        placeholder="e.g. Targeted clinical treatment for persistent pain, sciatica, and joint stiffness in Calgary."
                        required
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="adm-form-group" style={{ margin: 0 }}>
                        <label className="adm-form-label">Condition Category</label>
                        <select
                          className="adm-input"
                          value={cond.category || "Spine & Back"}
                          onChange={(e) => setCond({ ...cond, category: e.target.value })}
                        >
                          <option value="Spine & Back">Spine &amp; Back</option>
                          <option value="Joint & Extremity">Joint &amp; Extremity</option>
                          <option value="Sports Injury">Sports Injury</option>
                          <option value="Head & Neck">Head &amp; Neck</option>
                          <option value="Workplace & MVA">Workplace &amp; MVA</option>
                          <option value="General Recovery">General Recovery</option>
                        </select>
                      </div>

                      <div className="adm-form-group" style={{ margin: 0 }}>
                        <label className="adm-form-label">Card Thumbnail Image</label>
                        <input
                          type="text"
                          className="adm-input"
                          value={cond.heroImage || ""}
                          onChange={(e) => setCond({ ...cond, heroImage: e.target.value })}
                          placeholder="/images/clinic/reception-three.jpg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Card Preview Box */}
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: 18 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
                      Live Preview on /conditions Directory
                    </div>
                    {Boolean(cond.heroImage && cond.heroImage.trim() !== "") ? (
                      <div style={{ background: "#fff", border: "1px solid #e7edf1", borderRadius: 16, overflow: "hidden", boxShadow: "0 6px 20px rgba(18,60,80,0.06)", display: "flex", flexDirection: "column" }}>
                        <div style={{ height: 110, overflow: "hidden", position: "relative", backgroundColor: "#f2f8fb" }}>
                          <img
                            src={cond.heroImage!}
                            alt={cond.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                          <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: "#0e78a8" }}>
                            {cond.category || "Evidence-Based"}
                          </div>
                        </div>
                        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column" }}>
                          <h4 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px 0", color: "#1d2b34" }}>
                            {cond.name || "Condition Name"}
                          </h4>
                          <p style={{ fontSize: 13, lineHeight: 1.5, color: "#5a6570", margin: "0 0 12px 0", minHeight: 40 }}>
                            {cond.shortDescription || "Please add a card summary paragraph so this card looks balanced and descriptive with other condition cards."}
                          </p>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f2f8fb", padding: "6px 10px", borderRadius: 6, fontSize: 12.5, fontWeight: 700, color: "#0e78a8" }}>
                            <span>Explore treatment path</span>
                            <span>&rarr;</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: "#fff", border: "1px solid #e7edf1", borderRadius: 16, padding: 20, boxShadow: "0 6px 20px rgba(18,60,80,0.06)", display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "inline-block", background: "#f2f8fb", color: "#0e78a8", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", padding: "3px 8px", borderRadius: 6, marginBottom: 10, width: "fit-content" }}>
                          {cond.category || "General Recovery"}
                        </div>
                        <h4 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px 0", color: "#1d2b34" }}>
                          {cond.name || "Condition Name"}
                        </h4>
                        <p style={{ fontSize: 13, lineHeight: 1.5, color: "#5a6570", margin: "0 0 14px 0", minHeight: 40 }}>
                          {cond.shortDescription || "Please add a card summary paragraph so this card looks balanced and descriptive."}
                        </p>
                        <div style={{ borderTop: "1px solid #f0f4f7", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", color: "#0e78a8", fontWeight: 700, fontSize: 13 }}>
                          <span>Explore treatment path</span>
                          <span>&rarr;</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: SECTIONS & LAYOUT (WITH DRAG & DROP + INTEGRATED CUSTOM SECTIONS) ── */}
          {activeTab === "layout" && (
            <div>
              {/* Header Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, background: "#f0f9ff", border: "1px solid #bae6fd", padding: "14px 18px", borderRadius: 10, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: 14, fontWeight: 700, color: "#0369a1" }}>
                    Condition Page Sections Layout &amp; Reordering
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: "#0284c7" }}>
                    {isAdmin
                      ? "Drag handles (⠿) or use arrows to reorder. Click Customize Block to edit image, position, background & content."
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
                    <span>Add / Insert Section (Templates)</span>
                  </button>
                )}
              </div>

              {/* Reorderable Sections List with Drag & Drop */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {currentOrder.map((key, idx) => {
                  const secDef = conditionSectionDefs[key] || {
                    title: key,
                    desc: "Custom page section block",
                    category: "Block"
                  };
                  const hidden = isSectionHidden(key);
                  const hasCustomConfig = Boolean(cond.sectionsData?.[key]);
                  const isBeingDragged = draggedIndex === idx;
                  const isDraggedOver = dragOverIndex === idx;

                  return (
                    <div
                      key={key}
                      draggable={isAdmin}
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={() => {
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      style={{
                        background: hidden ? "#f8fafc" : "#ffffff",
                        border: isDraggedOver ? "2px solid var(--adm-primary)" : hidden ? "1px dashed #cbd5e1" : "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "12px 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        opacity: isBeingDragged ? 0.35 : hidden ? 0.6 : 1,
                        transform: isDraggedOver ? "scale(1.01)" : "scale(1)",
                        transition: "all 0.15s ease",
                        cursor: isAdmin ? "grab" : "default"
                      }}
                    >
                      {/* Left side: Drag Handle, Position, Title, Badges */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        
                        {/* Drag Handle Icon */}
                        {isAdmin && (
                          <div
                            style={{
                              cursor: "grab",
                              color: "#94a3b8",
                              display: "flex",
                              alignItems: "center",
                              padding: 2
                            }}
                            title="Click and drag to reorder section"
                          >
                            <GripVerticalIcon size={18} />
                          </div>
                        )}

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
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
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
                            {key === "custom_sections" && (
                              <span
                                style={{
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  background: "#e0f2fe",
                                  color: "#0369a1"
                                }}
                              >
                                {cond.customSections?.length || 0} Custom Stories
                              </span>
                            )}
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

                      {/* Right side: Customize, Visibility */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomizingBlockKey(key);
                          }}
                          className="adm-btn adm-btn-secondary adm-btn-sm"
                          style={{ display: "flex", alignItems: "center", gap: 5 }}
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

                        {/* Hide / Restore Toggle */}
                        <button
                          type="button"
                          onClick={() => toggleSectionVisibility(key)}
                          className={`adm-btn adm-btn-sm ${hidden ? "adm-btn-primary" : "adm-btn-secondary"}`}
                          style={{ minWidth: 84, display: "flex", alignItems: "center", gap: 5 }}
                          title={hidden ? "Restore this section to live view" : "Hide this section from live view"}
                        >
                          {hidden ? <EyeIcon size={13} /> : <EyeOffIcon size={13} />}
                          <span>{hidden ? "Restore" : "Hide"}</span>
                        </button>

                        {/* Delete Section */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSection(key);
                          }}
                          style={{
                            background: "#fee2e2",
                            border: "1px solid #fca5a5",
                            color: "#dc2626",
                            borderRadius: 6,
                            padding: "6px 8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center"
                          }}
                          title="Delete this section from condition page layout"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── INTEGRATED CUSTOM STORYTELLING SECTIONS MANAGER ── */}
              <div style={{ marginTop: 32, borderTop: "2px dashed #e2e8f0", paddingTop: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: 15, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                      <ImageIcon size={16} style={{ color: "#0284c7" }} />
                      <span>Custom Storytelling Visual Sections ({cond.customSections?.length || 0})</span>
                    </h4>
                    <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                      Rich storytelling blocks with image left/right/top/bottom placement and clinical bullet highlights.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addCustomSectionWithPreset()}
                    className="adm-btn adm-btn-primary adm-btn-sm"
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <PlusIcon size={14} />
                    <span>Add Custom Section</span>
                  </button>
                </div>

                {cond.customSections && cond.customSections.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {cond.customSections.map((sec, idx) => (
                      <div
                        key={sec.id || idx}
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 12,
                          padding: 16
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <strong style={{ fontSize: 14, color: "#0f172a" }}>
                                #{idx + 1}: {sec.title || "Untitled Custom Section"}
                              </strong>
                              {sec.eyebrow && (
                                <span style={{ fontSize: 11, background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>
                                  {sec.eyebrow}
                                </span>
                              )}
                              <span style={{ fontSize: 11, background: "#f1f5f9", color: "#475569", padding: "2px 6px", borderRadius: 4, textTransform: "capitalize" }}>
                                {sec.imagePosition || "right"} photo
                              </span>
                              <span style={{ fontSize: 11, background: sec.background === "teal" ? "#12303d" : "#fff", color: sec.background === "teal" ? "#fff" : "#475569", padding: "2px 6px", borderRadius: 4, border: "1px solid #cbd5e1" }}>
                                {sec.background || "white"} theme
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: 12.5, color: "#64748b", maxWidth: 580 }}>
                              {sec.content?.slice(0, 110)}...
                            </p>
                          </div>

                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              type="button"
                              onClick={() => {
                                setCustomizingBlockKey(`custom-${idx}`);
                              }}
                              className="adm-btn adm-btn-secondary adm-btn-sm"
                              style={{ display: "flex", alignItems: "center", gap: 4 }}
                            >
                              <EditIcon size={13} />
                              <span>Edit Details</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeCustomSection(idx)}
                              style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", display: "flex", padding: 6 }}
                              title="Delete Custom Section"
                            >
                              <TrashIcon size={14} />
                            </button>
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
                          <div>
                            <label className="adm-form-label" style={{ fontSize: 11.5, marginBottom: 4 }}>Title</label>
                            <input
                              type="text"
                              className="adm-input"
                              style={{ padding: "6px 10px", fontSize: 13 }}
                              value={sec.title}
                              onChange={(e) => updateCustomSection(idx, { title: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="adm-form-label" style={{ fontSize: 11.5, marginBottom: 4 }}>Image Position</label>
                            <select
                              className="adm-select"
                              style={{ padding: "6px 10px", fontSize: 13 }}
                              value={sec.imagePosition || "right"}
                              onChange={(e) => updateCustomSection(idx, { imagePosition: e.target.value as any })}
                            >
                              <option value="right">Right Side Photo</option>
                              <option value="left">Left Side Photo</option>
                              <option value="top">Top Banner Image</option>
                              <option value="bottom">Bottom Image</option>
                              <option value="none">No Image (Text Only)</option>
                            </select>
                          </div>
                          <div>
                            <label className="adm-form-label" style={{ fontSize: 11.5, marginBottom: 4 }}>Background</label>
                            <select
                              className="adm-select"
                              style={{ padding: "6px 10px", fontSize: 13 }}
                              value={sec.background || "white"}
                              onChange={(e) => updateCustomSection(idx, { background: e.target.value as any })}
                            >
                              <option value="white">Clean White (#fff)</option>
                              <option value="light">Soft Light Blue (#f8fafc)</option>
                              <option value="teal">Dark Clinic Teal (#12303d)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: 28, background: "#f8fafc", borderRadius: 12, border: "1px dashed #cbd5e1" }}>
                    <p style={{ margin: "0 0 10px 0", color: "#64748b", fontSize: 13 }}>
                      No custom storytelling sections added yet. Click below to add ready storytelling layouts.
                    </p>
                    <button
                      type="button"
                      onClick={() => addCustomSectionWithPreset()}
                      className="adm-btn adm-btn-primary adm-btn-sm"
                    >
                      + Create First Story Section
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB 3: SYMPTOMS ── */}
          {activeTab === "symptoms" && (
            <div>
              <div style={{ background: "#f1f5f9", padding: 16, borderRadius: 12, marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 700 }}>Add Common Symptom / Complaint</h4>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="text"
                    placeholder="E.g., Sharp shooting pain down the back of the thigh"
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
                {cond.symptoms?.map((sym, idx) => (
                  <div key={idx} style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13.5, color: "#334155" }}>• {sym}</span>
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

          {/* ── TAB 4: 4-STEP ROADMAP ── */}
          {activeTab === "steps" && (
            <div>
              <div style={{ background: "#f1f5f9", padding: 16, borderRadius: 12, marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 700 }}>Add Recovery Step</h4>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="text"
                    placeholder="E.g., Step 1: Comprehensive Orthopedic & Nerve Assessment"
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
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {cond.treatmentApproach?.map((step, idx) => (
                  <div key={idx} style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13.5, color: "#334155" }}>{idx + 1}. {step}</span>
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

          {/* ── TAB 5: FAQ BUILDER ── */}
          {activeTab === "faqs" && (
            <div>
              <div style={{ background: "#f1f5f9", padding: 16, borderRadius: 12, marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 700 }}>Add New Question &amp; Answer</h4>
                <div className="adm-form-group">
                  <input
                    type="text"
                    placeholder="E.g., How many sessions are usually needed for recovery?"
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

          {/* ── TAB 6: BENEFITS ── */}
          {activeTab === "benefits" && (
            <div>
              <div style={{ background: "#f1f5f9", padding: 16, borderRadius: 12, marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 700 }}>Add Key Benefit / Clinical Outcome</h4>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="text"
                    placeholder="E.g., Evidence-based recovery with measurable outcomes"
                    className="adm-input"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBenefit(); } }}
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="adm-btn adm-btn-primary adm-btn-sm"
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <PlusIcon size={14} />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {cond.benefits?.map((b, idx) => (
                  <div key={idx} style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13.5, color: "#334155" }}>✓ {b}</span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => removeBenefit(idx)}
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
        <div className="adm-modal-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            {onDelete && cond.slug !== "new-condition" && (
              <button
                type="button"
                onClick={() => onDelete(cond.slug)}
                style={{
                  background: "#fee2e2",
                  color: "#dc2626",
                  border: "1px solid #fca5a5",
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <TrashIcon size={14} />
                <span>Delete Condition</span>
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
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

      </div>

      {/* ── MODAL: CHOOSE SECTION TO ADD ── */}
      {showAddSectionModal && (
        <div
          className="adm-modal-overlay"
          style={{ zIndex: 9990 }}
          onClick={(e) => {
            e.stopPropagation();
            setShowAddSectionModal(false);
          }}
        >
          <div
            className="adm-modal"
            style={{ maxWidth: 780, maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a" }}>
                  Choose Section to Add
                </h3>
                <span style={{ fontSize: 12.5, color: "#64748b" }}>
                  Select any section to add it to this page. Configurable blocks will immediately open an info update box.
                </span>
              </div>
              <button
                onClick={() => setShowAddSectionModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 4 }}
              >
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="adm-modal-body" style={{ overflowY: "auto", padding: "18px 24px" }}>
              
              {/* Category 1: Condition Core Templates */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <StethoscopeIcon size={15} />
                  <span>Clinical Core Condition Sections (Instant Info Update)</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    {
                      id: "clinical_overview",
                      title: "Clinical Overview & Root Cause",
                      desc: "Detailed mechanical explanation of dysfunction with side photo.",
                      iconComponent: <StethoscopeIcon size={18} />,
                      iconBg: "#e0f2fe",
                      iconColor: "#0284c7",
                      preset: {
                        eyebrow: "Targeted Condition Care",
                        title: "Understanding Root Causes & Pathology",
                        imagePosition: "right",
                        background: "white"
                      }
                    },
                    {
                      id: "at_a_glance",
                      title: "Treatment At-A-Glance Bar",
                      desc: "4 highlight cards: Duration, direct billing, no-referral, parking.",
                      iconComponent: <ActivityIcon size={18} />,
                      iconBg: "#fef3c7",
                      iconColor: "#d97706",
                      preset: {
                        title: "Condition Care At-A-Glance",
                        background: "light"
                      }
                    },
                    {
                      id: "symptoms",
                      title: "Symptoms & Warning Signs Grid",
                      desc: "Comprehensive checklist of physical complaints & pain markers.",
                      iconComponent: <FileTextIcon size={18} />,
                      iconBg: "#fee2e2",
                      iconColor: "#dc2626",
                      preset: {
                        eyebrow: "Recognize The Symptoms",
                        title: "Common Signs You Shouldn't Ignore",
                        imagePosition: "left",
                        background: "white"
                      }
                    },
                    {
                      id: "treatment_approach",
                      title: "4-Step Clinical Treatment Roadmap",
                      desc: "Structured recovery roadmap from diagnosis to pain-free function.",
                      iconComponent: <CompassIcon size={18} />,
                      iconBg: "#e0e7ff",
                      iconColor: "#4f46e5",
                      preset: {
                        eyebrow: "Proven Recovery Protocol",
                        title: "Your 4-Step Road to Recovery",
                        background: "teal"
                      }
                    },
                    {
                      id: "related_therapies",
                      title: "Recommended Therapies & Modalities",
                      desc: "Grid of active therapies (Physiotherapy, Massage, IMS, Shockwave).",
                      iconComponent: <CheckCircleIcon size={18} />,
                      iconBg: "#dcfce7",
                      iconColor: "#16a34a",
                      preset: {
                        eyebrow: "Multi-Disciplinary Care",
                        title: "Recommended Evidence-Based Therapies",
                        background: "light"
                      }
                    }
                  ].map((item, i) => (
                    <div
                      key={i}
                      onClick={() => applySectionTemplate(item)}
                      style={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "14px 16px",
                        cursor: "pointer",
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--adm-primary)";
                        e.currentTarget.style.boxShadow = "0 4px 14px rgba(28,159,216,0.12)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "none";
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: item.iconBg,
                          color: item.iconColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}
                      >
                        {item.iconComponent}
                      </div>
                      <div>
                        <strong style={{ fontSize: 13.5, color: "#1e293b", display: "block" }}>{item.title}</strong>
                        <p style={{ margin: "3px 0 0 0", fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 2: Storytelling & Visual Media */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <ImageIcon size={15} />
                  <span>Custom Storytelling &amp; Visual Media</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    {
                      isCustom: true,
                      title: "Custom Story (Right Photo)",
                      desc: "Right photo with headline, narrative explanation & bullet highlights.",
                      iconComponent: <ColumnsIcon size={18} />,
                      iconBg: "#e0f2fe",
                      iconColor: "#0284c7",
                      preset: {
                        eyebrow: "Comprehensive Treatment",
                        eyebrowColor: "#1c9fd8",
                        title: "Targeted Modalities for Long-Term Relief",
                        subtitle: "Addressing both symptoms and biomechanics",
                        content: "We combine joint mobilization, myofascial release, and customized exercise prescriptions to restore healthy movement without recurring flare-ups.",
                        bullets: [
                          "Detailed physical assessment & joint screening",
                          "Hands-on manual therapy & soft tissue techniques",
                          "Progressive strength & mobility conditioning"
                        ],
                        image: "/images/clinic/reception-two.jpg",
                        imagePosition: "right",
                        background: "white"
                      }
                    },
                    {
                      isCustom: true,
                      title: "Custom Story (Left Photo)",
                      desc: "Left photo with clinical explanation and treatment milestones.",
                      iconComponent: <LayersIcon size={18} />,
                      iconBg: "#dcfce7",
                      iconColor: "#16a34a",
                      preset: {
                        eyebrow: "Preventive Care",
                        eyebrowColor: "#10b981",
                        title: "Preventing Chronic Re-Injury & Flare-Ups",
                        subtitle: "Sustainable habits for an active lifestyle",
                        content: "Our registered physiotherapists educate you on posture, movement mechanics, and ergonomic setup to ensure lifelong spinal and joint health.",
                        bullets: [
                          "Personalized posture & desk ergonomic guidance",
                          "Home stretching & strengthening routines",
                          "Ongoing check-in milestones"
                        ],
                        image: "/images/clinic/reception-three.jpg",
                        imagePosition: "left",
                        background: "light"
                      }
                    },
                    {
                      isCustom: true,
                      title: "Dark Clinic Teal Banner",
                      desc: "High-contrast dark teal banner with bright green bullets & white text.",
                      iconComponent: <SparklesIcon size={18} />,
                      iconBg: "#12303d",
                      iconColor: "#f6c945",
                      preset: {
                        eyebrow: "Dedicated Physiotherapists",
                        eyebrowColor: "#f6c945",
                        title: "Trusted North Calgary Care Since 2001",
                        subtitle: "Experienced registered clinicians dedicated to your pain relief",
                        content: "Nose Creek Physiotherapy has helped thousands of Beddington and Calgary residents overcome painful conditions through dedicated one-on-one care.",
                        bullets: [
                          "Direct insurance billing with zero paperwork headache",
                          "Over 545+ Five-Star Google Reviews",
                          "No doctor referral required to start treatment"
                        ],
                        imagePosition: "none",
                        background: "teal"
                      }
                    },
                    {
                      isCustom: true,
                      title: "Blank Custom Story Section",
                      desc: "Start with clean fields: customize text, image, bullets and theme from scratch.",
                      iconComponent: <PlusIcon size={18} />,
                      iconBg: "#f1f5f9",
                      iconColor: "#475569",
                      preset: {
                        eyebrow: "Specialized Care",
                        eyebrowColor: "#1c9fd8",
                        title: "Custom Condition Feature",
                        subtitle: "Personalized care protocol",
                        content: "Add your clinical description and condition details here...",
                        bullets: [
                          "Key highlight bullet 1",
                          "Key highlight bullet 2"
                        ],
                        image: "/images/clinic/reception-one.jpg",
                        imagePosition: "right",
                        background: "white"
                      }
                    }
                  ].map((item, i) => (
                    <div
                      key={i}
                      onClick={() => applySectionTemplate(item)}
                      style={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "14px 16px",
                        cursor: "pointer",
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--adm-primary)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(28,159,216,0.12)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "none";
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: item.iconBg,
                          color: item.iconColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}
                      >
                        {item.iconComponent}
                      </div>
                      <div>
                        <strong style={{ fontSize: 13.5, color: "#1e293b", display: "block" }}>{item.title}</strong>
                        <p style={{ margin: "3px 0 0 0", fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 3: Social Proof & Conversion */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#7e22ce", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <StarIcon size={15} />
                  <span>Social Proof &amp; Conversion Sections</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    {
                      id: "testimonials",
                      title: "Patient Testimonials & Reviews Grid",
                      desc: "5-star Google review quotes and patient recovery stories.",
                      iconComponent: <StarIcon size={18} />,
                      iconBg: "#fef3c7",
                      iconColor: "#d97706",
                      preset: {
                        eyebrow: "Real Patient Stories",
                        title: `Calgary Patients Relieved from ${cond.name}`,
                        background: "light"
                      }
                    },
                    {
                      id: "team_carousel",
                      title: "Meet Our Team Carousel",
                      desc: "Interactive scrolling carousel of registered physiotherapists (Direct Add).",
                      iconComponent: <UsersIcon size={18} />,
                      iconBg: "#e0e7ff",
                      iconColor: "#4f46e5",
                      noConfig: true
                    },
                    {
                      id: "location_map",
                      title: "Clinic Location & Interactive Google Map",
                      desc: "Beddington location directions, hours & map embed (Direct Add).",
                      iconComponent: <MapPinIcon size={18} />,
                      iconBg: "#fee2e2",
                      iconColor: "#dc2626",
                      noConfig: true
                    },
                    {
                      id: "faqs",
                      title: "Interactive FAQ Accordion",
                      desc: "Patient questions, insurance coverage & answers.",
                      iconComponent: <HelpCircleIcon size={18} />,
                      iconBg: "#e0f2fe",
                      iconColor: "#0284c7",
                      preset: {
                        eyebrow: "Common Questions",
                        title: `Frequently Asked Questions About ${cond.name}`,
                        background: "light"
                      }
                    },
                    {
                      id: "decision_ctas",
                      title: "Free Discovery & Phone CTAs",
                      desc: "Two low-friction cards for discovery sessions and telephone consults.",
                      iconComponent: <TargetIcon size={18} />,
                      iconBg: "#dcfce7",
                      iconColor: "#16a34a",
                      preset: {
                        eyebrow: "Risk-Free Consult",
                        title: "Take The Next Step Toward Relief",
                        background: "light"
                      }
                    },
                    {
                      id: "other_links",
                      title: "Explore Other Conditions (Pills)",
                      desc: "Pill navigation connecting all 18 clinical conditions (Direct Add).",
                      iconComponent: <LinkIcon size={18} />,
                      iconBg: "#f1f5f9",
                      iconColor: "#475569",
                      noConfig: true
                    },
                    {
                      id: "bottom_cta",
                      title: "Bottom Booking Call-to-Action",
                      desc: "Full-width high-contrast booking banner.",
                      iconComponent: <RocketIcon size={18} />,
                      iconBg: "#fee2e2",
                      iconColor: "#dc2626",
                      preset: {
                        title: `Ready to Relieve Your ${cond.name}?`,
                        content: "Take the first step toward lasting mobility, pain relief, and peak physical function today."
                      }
                    }
                  ].map((item, i) => (
                    <div
                      key={i}
                      onClick={() => applySectionTemplate(item)}
                      style={{
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "14px 16px",
                        cursor: "pointer",
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--adm-primary)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(28,159,216,0.12)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "none";
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: item.iconBg,
                          color: item.iconColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}
                      >
                        {item.iconComponent}
                      </div>
                      <div>
                        <strong style={{ fontSize: 13.5, color: "#1e293b", display: "block" }}>{item.title}</strong>
                        <p style={{ margin: "3px 0 0 0", fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
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
          sectionDefaultTitle={
            customizingBlockKey.startsWith("custom-")
              ? cond.customSections?.[parseInt(customizingBlockKey.replace("custom-", ""), 10)]?.title || "Custom Story Section"
              : conditionSectionDefs[customizingBlockKey]?.title || customizingBlockKey
          }
          config={
            customizingBlockKey.startsWith("custom-")
              ? cond.customSections?.[parseInt(customizingBlockKey.replace("custom-", ""), 10)]
              : cond.sectionsData?.[customizingBlockKey]
          }
          onSave={(cfg: SectionBlockConfig) => {
            if (customizingBlockKey.startsWith("custom-")) {
              const idx = parseInt(customizingBlockKey.replace("custom-", ""), 10);
              updateCustomSection(idx, cfg as any);
            } else {
              handleSaveBlockConfig(cfg);
            }
          }}
        />
      )}

    </div>
  );
}
