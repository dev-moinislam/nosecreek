"use client";

import React, { useState, useEffect } from "react";
import { Service, ServiceCustomSection, SectionBlockConfig } from "@/types/content";
import { getServices } from "@/lib/api";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { useRole } from "@/components/admin/RoleGuard";
import LivePreviewPane from "@/components/admin/LivePreviewPane";
import SectionBlockCustomizerModal from "@/components/admin/SectionBlockCustomizerModal";
import ServiceIcon from "@/components/ui/ServiceIcon";
import AdminToast from "@/components/admin/AdminToast";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";
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
  SparklesIcon,
  CheckIcon,
  ExternalLinkIcon,
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
  LinkIcon
} from "@/components/admin/AdminIcons";

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

const sectionDefinitions: Record<string, { title: string; desc: string; category: string }> = {
  hero: {
    title: "Hero Header & Booking Banner",
    desc: "Top banner with title, badges, ratings, and primary booking button.",
    category: "Header"
  },
  at_a_glance: {
    title: "Treatment At-A-Glance Bar",
    desc: "4 highlight cards: Duration, Direct Billing, Referral info, Care Plan.",
    category: "Summary"
  },
  clinical_overview: {
    title: "Clinical Overview & Root Cause",
    desc: "Detailed medical explanation of why this treatment works with side image option.",
    category: "Overview"
  },
  custom_sections: {
    title: "Custom Visual Storytelling Sections",
    desc: "Rich storytelling sections with left/right/top/bottom image placement.",
    category: "Custom Content"
  },
  benefits: {
    title: "Key Treatment Benefits Grid",
    desc: "Checkmark grid highlighting proven benefits of this service.",
    category: "Benefits"
  },
  symptoms: {
    title: "Targeted Symptoms & Conditions",
    desc: "List of conditions and complaints this treatment specifically addresses.",
    category: "Symptoms"
  },
  treatment_approach: {
    title: "Treatment Approach Roadmap (4 Steps)",
    desc: "Step-by-step patient journey from assessment to prevention.",
    category: "Roadmap"
  },
  team_carousel: {
    title: "Meet Our Registered Team Carousel",
    desc: "Interactive scrolling carousel of registered physiotherapists & staff.",
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
  bottom_cta: {
    title: "Bottom Booking Call-to-Action Banner",
    desc: "Full-width high-contrast booking banner at the bottom of the page.",
    category: "Conversion"
  }
};

export default function AdminServicesPage() {
  const { role, isAdmin, canDelete, canEditSlugs } = useRole();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ slug: string; title: string } | null>(null);

  // Load services with local storage cache and live event sync
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        let list: Service[] = [];
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem("adm_services");
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                list = parsed;
              }
            } catch {}
          }
        }
        if (list.length === 0) {
          list = await getServices();
        }
        setServices(list);
      } catch (err) {
        console.error("Failed to load services", err);
      } finally {
        setLoading(false);
      }
    }
    load();

    const handleSync = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("adm_services");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) setServices(parsed);
          } catch {}
        }
      }
    };
    window.addEventListener("servicesUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("servicesUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
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

      // 1. Save to Supabase
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
            seo: { ...(updatedService.seo || {}), cardImage: updatedService.cardImage || null, sectionsData: updatedService.sectionsData || {} },
            is_published: true,
            updated_at: new Date().toISOString()
          };

          const { error } = await supabase
            .from("services")
            .upsert(payload, { onConflict: "slug" });

          if (error) {
            console.error("Supabase upsert error:", error);
          } else {
            console.log("✓ Supabase service upsert succeeded:", updatedService.slug);
          }
        } catch (supaErr) {
          console.warn("Supabase sync note:", supaErr);
        }
      }

      // 2. Save to local storage for instant client hydration
      if (typeof window !== "undefined") {
        localStorage.setItem("adm_services", JSON.stringify(allUpdated));
        window.dispatchEvent(new Event("servicesUpdated"));
      }

      // 3. Save to local data files via API
      try {
        await fetch("/api/admin/save-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "services", data: allUpdated })
        });
      } catch {
        // ignore
      }

      // Update local state
      setServices(allUpdated);
      setEditingService(null);
      setToastMessage(`✓ Service "${updatedService.title}" saved successfully!`);
    } catch (err: any) {
      console.error("Failed to save service", err);
      alert("⚠️ Error saving service: " + (err.message || JSON.stringify(err)));
    }
  };

  // Handle Confirm Delete (from Database, Files, and State)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { slug, title } = deleteTarget;
    try {
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from("services").delete().eq("slug", slug);
          await supabase.from("services").delete().eq("id", slug);
        } catch (e) {
          console.warn("Supabase delete error:", e);
        }
      }
      const remaining = services.filter((s) => s.slug !== slug);
      setServices(remaining);
      if (typeof window !== "undefined") {
        localStorage.setItem("adm_services", JSON.stringify(remaining));
        window.dispatchEvent(new Event("servicesUpdated"));
      }
      try {
        await fetch("/api/admin/save-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "services", data: remaining })
        });
      } catch {}

      setEditingService(null);
      setToastMessage(`✓ Service "${title}" permanently deleted from database and website!`);
    } catch (err: any) {
      console.error("Failed to delete service", err);
      alert("⚠️ Error deleting: " + (err.message || err));
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <AdminToast message={toastMessage} onClose={() => setToastMessage(null)} />
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        itemName={deleteTarget?.title || ""}
        itemType="Clinical Service"
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
            Clinical Services Manager
          </h1>
          <p style={{ margin: 0, color: "var(--adm-text-muted)", fontSize: 14 }}>
            Manage treatments, page section layout order, image alignment, custom badges, and FAQs
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
                sectionsData: {},
                faqs: [],
                hiddenSections: [],
                sectionOrder: defaultServiceSectionOrder,
                relatedServices: [],
                relatedConditions: []
              })
            }
            className="adm-btn adm-btn-primary"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <PlusIcon size={16} />
            <span>Add New Service</span>
          </button>
        )}
      </div>

      {/* Role Banner if in Client Mode */}
      {!isAdmin && (
        <div className="adm-guarded-banner" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ShieldIcon size={20} style={{ color: "#0284c7" }} />
          <div>
            <strong>Client Safe Mode Active:</strong> You can safely edit text descriptions, images, bullet points, and FAQs. Section reordering, hiding, and deletions are protected to preserve SEO rankings.
          </div>
        </div>
      )}

      {/* Search Filter */}
      <div className="adm-card" style={{ padding: 14, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SearchIcon size={16} style={{ color: "#64748b" }} />
          <input
            type="text"
            placeholder="Search services by title or description..."
            className="adm-input"
            style={{ border: "none", padding: "6px 0", boxShadow: "none" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Services List Table */}
      <div className="adm-card">
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>URL Slug</th>
                <th>Sections &amp; FAQs</th>
                <th>Key Benefits</th>
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
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{service.title}</div>
                      <div style={{ fontSize: 12, color: "#64748b", maxWidth: 280, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {service.shortDescription || "Clinical treatment"}
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: 12, background: "#f1f5f9", padding: "3px 7px", borderRadius: 6, color: "#0f172a" }}>
                        /services/{service.slug}
                      </code>
                    </td>
                    <td>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: "#0369a1", background: "#e0f2fe", padding: "3px 8px", borderRadius: 6, marginRight: 6 }}>
                        {service.customSections?.length || 0} Sections
                      </span>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: "#15803d", background: "#dcfce7", padding: "3px 8px", borderRadius: 6 }}>
                        {service.faqs?.length || 0} FAQs
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, color: "#475569" }}>
                        {service.benefits?.length || 0} highlights
                      </span>
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => setPreviewUrl(`/services/${service.slug}`)}
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        style={{ marginRight: 6, display: "inline-flex", alignItems: "center", gap: 5 }}
                      >
                        <EyeIcon size={14} />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => setEditingService(JSON.parse(JSON.stringify(service)))}
                        className="adm-btn adm-btn-primary adm-btn-sm"
                        style={{ marginRight: 6, display: "inline-flex", alignItems: "center", gap: 5 }}
                      >
                        <EditIcon size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ slug: service.slug, title: service.title })}
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        style={{ color: "#dc2626", display: "inline-flex", alignItems: "center", padding: "6px 8px" }}
                        title="Delete Service"
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

      {/* Service Visual Editor Modal */}
      {editingService && (
        <ServiceEditorModal
          service={editingService}
          isAdmin={isAdmin}
          canEditSlugs={canEditSlugs}
          onClose={() => setEditingService(null)}
          onSave={handleSaveService}
          onDelete={(slug) => {
            const s = services.find((x) => x.slug === slug);
            setDeleteTarget({ slug, title: s?.title || slug });
          }}
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

// Sub-component: Service Editor Modal with Section Reordering & Universal Block Customizer
function ServiceEditorModal({
  service: initialService,
  isAdmin,
  canEditSlugs,
  onClose,
  onSave,
  onDelete,
  onPreview
}: {
  service: Service;
  isAdmin: boolean;
  canEditSlugs: boolean;
  onClose: () => void;
  onSave: (service: Service) => void;
  onDelete: (slug: string) => void;
  onPreview: (slug: string) => void;
}) {
  const [service, setService] = useState<Service>({
    ...initialService,
    sectionOrder: initialService.sectionOrder && initialService.sectionOrder.length > 0
      ? initialService.sectionOrder
      : defaultServiceSectionOrder,
    sectionsData: initialService.sectionsData || {}
  });

  // Default active tab is now "general" (General & Hero), then "layout" (Sections & Layout)
  const [activeTab, setActiveTab] = useState<"general" | "layout" | "faqs" | "bullets">("general");
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [customizingBlockKey, setCustomizingBlockKey] = useState<string | null>(null);

  // Drag & Drop reordering state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Section Ordering & Visibility helpers (Hero banner is configured in Tab 1)
  const rawOrder = service.sectionOrder && service.sectionOrder.length > 0
    ? service.sectionOrder
    : defaultServiceSectionOrder;
  const currentOrder = rawOrder.filter((k) => k !== "hero");

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

    setService((prev) => ({ ...prev, sectionOrder: ["hero", ...newOrder] }));
  };

  const [deleteSectionKey, setDeleteSectionKey] = useState<string | null>(null);

  const deleteSection = (key: string) => {
    setDeleteSectionKey(key);
  };

  const toggleSectionVisibility = (key: string) => {
    setService((prev) => {
      const curHidden = prev.hiddenSections || [];
      const updatedHidden = curHidden.includes(key)
        ? curHidden.filter((k) => k !== key)
        : [...curHidden, key];
      return { ...prev, hiddenSections: updatedHidden };
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isAdmin) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!isAdmin) return;
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newOrder = [...currentOrder];
    const [movedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, movedItem);
    setService((prev) => ({ ...prev, sectionOrder: ["hero", ...newOrder] }));
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Block Customizer Save Handler
  const handleSaveBlockConfig = (updatedCfg: SectionBlockConfig) => {
    if (!customizingBlockKey) return;
    setService((prev) => ({
      ...prev,
      sectionsData: {
        ...(prev.sectionsData || {}),
        [customizingBlockKey]: updatedCfg
      }
    }));
  };

  // Hero Section Trust Badges helpers
  const [newHeroBullet, setNewHeroBullet] = useState("");
  const heroBullets = service.sectionsData?.hero?.bullets && service.sectionsData.hero.bullets.length > 0
    ? service.sectionsData.hero.bullets
    : ["Direct Billing Available", "No Referral Needed", "Free Dedicated Parking"];

  const addHeroBullet = () => {
    if (!newHeroBullet.trim()) return;
    const updated = [...heroBullets, newHeroBullet.trim()];
    setService((prev) => ({
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
    setService((prev) => ({
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
    setService((prev) => ({
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
  const addCustomSectionWithPreset = (preset?: Partial<ServiceCustomSection>) => {
    const newSec: ServiceCustomSection = {
      id: `sec-${Date.now()}`,
      eyebrow: preset?.eyebrow || "Personalized Care Protocol",
      eyebrowColor: preset?.eyebrowColor || "#1c9fd8",
      title: preset?.title || "New Featured Care Section",
      subtitle: preset?.subtitle || "Personalized clinical evaluation",
      content: preset?.content || "Explain your comprehensive treatment protocol and therapeutic approach here.",
      bullets: preset?.bullets || [
        "Direct billing to major health insurance",
        "Targeted joint mobilization & soft tissue release",
        "One-on-one registered therapist care"
      ],
      image: preset?.image || "/images/clinic/reception-three.jpg",
      imagePosition: preset?.imagePosition || "right",
      background: preset?.background || "white"
    };

    setService((prev) => {
      const order = prev.sectionOrder || defaultServiceSectionOrder;
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

  // Apply Section Template Helper
  const applySectionTemplate = (template: any) => {
    setShowAddSectionModal(false);

    if (template.isCustom) {
      const newIndex = service.customSections?.length || 0;
      addCustomSectionWithPreset(template.preset);
      // Immediately open info update box for this newly created custom section
      setCustomizingBlockKey(`custom-${newIndex}`);
      return;
    }

    const key = template.id;
    setService((prev) => {
      const curHidden = prev.hiddenSections || [];
      const order = prev.sectionOrder || defaultServiceSectionOrder;
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
        itemName={sectionDefinitions[deleteSectionKey || ""]?.title || deleteSectionKey || ""}
        itemType="Page Section"
        onConfirm={() => {
          if (deleteSectionKey) {
            setService((prev) => {
              const curOrder = prev.sectionOrder && prev.sectionOrder.length > 0 ? prev.sectionOrder : defaultServiceSectionOrder;
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
              Edit Service: {service.title}
            </h3>
            <span style={{ fontSize: 13, color: "var(--adm-text-muted)" }}>
              /services/{service.slug}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              type="button"
              onClick={() => onPreview(service.slug)}
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
            { id: "faqs", label: `FAQ Builder (${service.faqs?.length || 0})`, icon: <HelpCircleIcon size={15} /> },
            { id: "bullets", label: `Benefits & Highlights (${service.benefits?.length || 0})`, icon: <ListIcon size={15} /> }
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
          
          {/* ── TAB 1: GENERAL & HERO ── */}
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
                    <label className="adm-form-label">Service Title</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={service.title}
                      onChange={(e) => setService({ ...service, title: e.target.value })}
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
                      value={service.slug}
                      disabled={!canEditSlugs}
                      onChange={(e) => setService({ ...service, slug: e.target.value })}
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
                      value={service.sectionsData?.hero?.eyebrow || "Evidence-Based Clinical Care · Calgary North"}
                      onChange={(e) =>
                        setService({
                          ...service,
                          sectionsData: {
                            ...(service.sectionsData || {}),
                            hero: {
                              ...(service.sectionsData?.hero || {}),
                              eyebrow: e.target.value
                            }
                          }
                        })
                      }
                      placeholder="e.g., Evidence-Based Clinical Care · Calgary North"
                    />
                  </div>
                  <div className="adm-form-group" style={{ margin: 0 }}>
                    <label className="adm-form-label">Hero Main H1 Headline</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={service.sectionsData?.hero?.title || `${service.title} in Calgary North`}
                      onChange={(e) =>
                        setService({
                          ...service,
                          sectionsData: {
                            ...(service.sectionsData || {}),
                            hero: {
                              ...(service.sectionsData?.hero || {}),
                              title: e.target.value
                            }
                          }
                        })
                      }
                      placeholder="e.g., Physiotherapy in Calgary North"
                    />
                  </div>
                </div>

                <div className="adm-form-group" style={{ margin: 0 }}>
                  <label className="adm-form-label">Hero Short Summary (Hook featured on top banner &amp; search cards)</label>
                  <textarea
                    className="adm-textarea"
                    style={{ minHeight: 80 }}
                    value={service.shortDescription || ""}
                    onChange={(e) =>
                      setService({
                        ...service,
                        shortDescription: e.target.value,
                        sectionsData: {
                          ...(service.sectionsData || {}),
                          hero: {
                            ...(service.sectionsData?.hero || {}),
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div className="adm-form-group" style={{ margin: 0 }}>
                    <label className="adm-form-label">Hero Image URL</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={service.heroImage || ""}
                      onChange={(e) =>
                        setService({
                          ...service,
                          heroImage: e.target.value,
                          sectionsData: {
                            ...(service.sectionsData || {}),
                            hero: {
                              ...(service.sectionsData?.hero || {}),
                              image: e.target.value
                            }
                          }
                        })
                      }
                      placeholder="/images/clinic/reception-three.jpg"
                    />
                  </div>
                  <div className="adm-form-group" style={{ margin: 0 }}>
                    <label className="adm-form-label">Primary Call to Action Button Text</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={service.ctaText || "Book Your Assessment"}
                      onChange={(e) =>
                        setService({
                          ...service,
                          ctaText: e.target.value,
                          sectionsData: {
                            ...(service.sectionsData || {}),
                            hero: {
                              ...(service.sectionsData?.hero || {}),
                              ctaText: e.target.value
                            }
                          }
                        })
                      }
                    />
                  </div>
                </div>

                {service.heroImage && (
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12, background: "#f8fafc", border: "1px solid #e2e8f0", padding: 10, borderRadius: 8 }}>
                    <img
                      src={service.heroImage}
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
                    placeholder="e.g., Direct Billing Available, No Referral Needed..."
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

              {/* Card 5: Homepage & Directory Card Summary (Cards on Home & /services) */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ marginBottom: 14 }}>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: 15, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                    <LayoutIcon size={16} style={{ color: "#6faf1c" }} />
                    <span>Homepage &amp; Directory Card Summary</span>
                  </h4>
                  <span style={{ fontSize: 12.5, color: "#64748b" }}>
                    Customize the summary description, icon, and button text that appear inside the card tiles on the Homepage and `/services` directory.
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
                        value={service.shortDescription || ""}
                        onChange={(e) => setService({ ...service, shortDescription: e.target.value })}
                        placeholder="e.g. Expert, hands-on care to restore mobility, strength and balance — while minimizing your dependence on medication."
                        required
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="adm-form-group" style={{ margin: 0 }}>
                        <label className="adm-form-label">Card Icon Style</label>
                        <select
                          className="adm-input"
                          value={service.iconType || "heart-pulse"}
                          onChange={(e) => setService({ ...service, iconType: e.target.value })}
                        >
                          <option value="heart-pulse">Heart Pulse (General Physio)</option>
                          <option value="activity">Activity (Rehab / Movement)</option>
                          <option value="zap">Zap / Lightning (Shockwave / IMS)</option>
                          <option value="sparkles">Sparkles (Acupuncture / Wellness)</option>
                          <option value="user-check">User Check (Massage / 1-on-1)</option>
                          <option value="shield-check">Shield Check (Bracing / Orthotics)</option>
                          <option value="clipboard-check">Clipboard (Pelvic / Assessment)</option>
                          <option value="award">Award (Specialized)</option>
                          <option value="stethoscope">Stethoscope (Clinical)</option>
                        </select>
                      </div>

                      <div className="adm-form-group" style={{ margin: 0 }}>
                        <label className="adm-form-label">Card CTA Button Text</label>
                        <input
                          type="text"
                          className="adm-input"
                          value={service.ctaText || "more about " + service.title.toLowerCase()}
                          onChange={(e) => setService({ ...service, ctaText: e.target.value })}
                          placeholder="e.g. Learn more →"
                        />
                      </div>
                    </div>

                    <div className="adm-form-group" style={{ margin: 0 }}>
                      <label className="adm-form-label">
                        Card Thumbnail Image (Optional)
                      </label>
                      <input
                        type="text"
                        className="adm-input"
                        value={service.cardImage || ""}
                        onChange={(e) => setService({ ...service, cardImage: e.target.value })}
                        placeholder="Leave empty for Icon only, or enter image URL (e.g. /images/clinic/reception-three.jpg)"
                      />
                      <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 3, display: "block" }}>
                        Leave blank to show the clean Icon style, or provide an image URL to show an image thumbnail banner on the card.
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div className="adm-form-group" style={{ margin: 0 }}>
                        <label className="adm-form-label">Icon Background Color</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input
                            type="color"
                            value={service.iconBg || "#e9f5fb"}
                            onChange={(e) => setService({ ...service, iconBg: e.target.value })}
                            style={{ width: 36, height: 36, border: "none", borderRadius: 6, cursor: "pointer" }}
                          />
                          <input
                            type="text"
                            className="adm-input"
                            value={service.iconBg || "#e9f5fb"}
                            onChange={(e) => setService({ ...service, iconBg: e.target.value })}
                            style={{ fontSize: 12 }}
                          />
                        </div>
                      </div>

                      <div className="adm-form-group" style={{ margin: 0 }}>
                        <label className="adm-form-label">Icon Color</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input
                            type="color"
                            value={service.iconColor || "#1c9fd8"}
                            onChange={(e) => setService({ ...service, iconColor: e.target.value })}
                            style={{ width: 36, height: 36, border: "none", borderRadius: 6, cursor: "pointer" }}
                          />
                          <input
                            type="text"
                            className="adm-input"
                            value={service.iconColor || "#1c9fd8"}
                            onChange={(e) => setService({ ...service, iconColor: e.target.value })}
                            style={{ fontSize: 12 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Card Preview Box */}
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: 18 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
                      Live Preview on Homepage &amp; /services
                    </div>
                    {Boolean(service.cardImage && service.cardImage.trim() !== "") ? (
                      <div style={{ background: "#fff", border: "1px solid #e7edf1", borderRadius: 16, overflow: "hidden", boxShadow: "0 6px 20px rgba(18,60,80,0.06)", display: "flex", flexDirection: "column" }}>
                        <div style={{ height: 120, overflow: "hidden", position: "relative", backgroundColor: "#f2f8fb" }}>
                          <img
                            src={service.cardImage!}
                            alt={service.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <div style={{ position: "absolute", top: 8, right: 8, width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ServiceIcon type={service.iconType} color={service.iconColor || "#1c9fd8"} size={18} />
                          </div>
                        </div>
                        <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column" }}>
                          <h4 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px 0", color: "#1d2b34" }}>
                            {service.title || "Service Title"}
                          </h4>
                          <p style={{ fontSize: 13, lineHeight: 1.5, color: "#5a6570", margin: "0 0 12px 0", minHeight: 40 }}>
                            {service.shortDescription || "Please add a card summary paragraph so this card looks full and balanced with other services."}
                          </p>
                          <div style={{ borderTop: "1px solid #f0f4f7", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ color: "#0e78a8", fontWeight: 700, fontSize: 13 }}>
                              {service.ctaText || "Learn more →"}
                            </span>
                            <span style={{ color: "#6faf1c", fontSize: 11.5, fontWeight: 700, background: "#eef6e4", padding: "2px 8px", borderRadius: 999 }}>
                              Covered
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: "#fff", border: "1px solid #e7edf1", borderRadius: 16, padding: 22, boxShadow: "0 6px 20px rgba(18,60,80,0.06)", display: "flex", flexDirection: "column" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: service.iconBg || "#e9f5fb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                          <ServiceIcon type={service.iconType} color={service.iconColor || "#1c9fd8"} size={24} />
                        </div>
                        <h4 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px 0", color: "#1d2b34" }}>
                          {service.title || "Service Title"}
                        </h4>
                        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#5a6570", margin: "0 0 14px 0", minHeight: 48 }}>
                          {service.shortDescription || "Please add a card summary paragraph so this card looks full and balanced with other services."}
                        </p>
                        <div style={{ borderTop: "1px solid #f0f4f7", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#0e78a8", fontWeight: 700, fontSize: 13.5 }}>
                            {service.ctaText || "Learn more →"}
                          </span>
                          <span style={{ color: "#6faf1c", fontSize: 12, fontWeight: 700, background: "#eef6e4", padding: "3px 8px", borderRadius: 999 }}>
                            Covered
                          </span>
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
                    Page Sections Layout &amp; Reordering
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: "#0284c7" }}>
                    {isAdmin
                      ? "Drag handles (⠿) or use arrows to reorder. Click Customize Block to edit image, position, background & content."
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
                    <PlusIcon size={14} />
                    <span>Add / Insert Section (Templates)</span>
                  </button>
                )}
              </div>

              {/* Reorderable Sections List with Drag & Drop */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {currentOrder.map((key, idx) => {
                  const secDef = sectionDefinitions[key] || {
                    title: key,
                    desc: "Custom page section block",
                    category: "Block"
                  };
                  const hidden = isSectionHidden(key);
                  const hasCustomConfig = Boolean(service.sectionsData?.[key]);
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
                                {service.customSections?.length || 0} Custom Stories
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

                      {/* Right side: Customize, Reorder, Visibility */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        
                        {/* Universal Section Block Customizer Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomizingBlockKey(key);
                          }}
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
                          title="Delete this section from page layout"
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
                      <span>Custom Storytelling Visual Sections ({service.customSections?.length || 0})</span>
                    </h4>
                    <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                      Rich storytelling blocks with image left/right/top/bottom placement and bullet highlights.
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

                {service.customSections && service.customSections.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {service.customSections.map((sec, idx) => (
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
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => removeCustomSection(idx)}
                                style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", display: "flex", padding: 6 }}
                                title="Delete Custom Section"
                              >
                                <TrashIcon size={14} />
                              </button>
                            )}
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

          {/* ── TAB 3: FAQ BUILDER ── */}
          {activeTab === "faqs" && (
            <div>
              <div style={{ background: "#f1f5f9", padding: 16, borderRadius: 12, marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 700 }}>Add New Question &amp; Answer</h4>
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
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <PlusIcon size={14} />
                  <span>Add FAQ</span>
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

          {/* ── TAB 4: BENEFITS & HIGHLIGHTS ── */}
          {activeTab === "bullets" && (
            <div>
              <div style={{ background: "#f1f5f9", padding: 16, borderRadius: 12, marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 700 }}>Add Key Benefit / Clinical Outcome</h4>
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
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <PlusIcon size={14} />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {service.benefits?.map((b, idx) => (
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
            {onDelete && service.slug !== "new-service" && (
              <button
                type="button"
                onClick={() => onDelete(service.slug)}
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
                <span>Delete Service</span>
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
              onClick={() => onSave(service)}
              className="adm-btn adm-btn-success"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <CheckIcon size={16} />
              <span>Save Service Changes</span>
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
              
              {/* Category 1: Clinical Core Sections */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <StethoscopeIcon size={15} />
                  <span>Clinical Core Sections (Instant Info Update)</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    {
                      id: "clinical_overview",
                      title: "Clinical Overview & Root Cause",
                      desc: "Medical explanation of diagnosis & why treatment works with side photo.",
                      iconComponent: <StethoscopeIcon size={18} />,
                      iconBg: "#e0f2fe",
                      iconColor: "#0284c7",
                      preset: {
                        eyebrow: "Evidence-Based Physiotherapy",
                        title: "Comprehensive Clinical Assessment & Treatment",
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
                        title: "Treatment At-A-Glance",
                        background: "light"
                      }
                    },
                    {
                      id: "benefits",
                      title: "Key Treatment Benefits Grid",
                      desc: "Highlighted checklist of proven clinical outcomes.",
                      iconComponent: <CheckCircleIcon size={18} />,
                      iconBg: "#dcfce7",
                      iconColor: "#16a34a",
                      preset: {
                        eyebrow: "Proven Clinical Outcomes",
                        title: "Why Patients Choose Our Clinical Care",
                        background: "light"
                      }
                    },
                    {
                      id: "symptoms",
                      title: "Targeted Symptoms & Conditions",
                      desc: "Common symptoms, complaints & physical limitations treated.",
                      iconComponent: <FileTextIcon size={18} />,
                      iconBg: "#fee2e2",
                      iconColor: "#dc2626",
                      preset: {
                        eyebrow: "Treatable Symptoms",
                        title: "Common Complaints We Address",
                        imagePosition: "left",
                        background: "white"
                      }
                    },
                    {
                      id: "treatment_approach",
                      title: "4-Step Clinical Treatment Roadmap",
                      desc: "Structured rehabilitation protocol from assessment to prevention.",
                      iconComponent: <CompassIcon size={18} />,
                      iconBg: "#e0e7ff",
                      iconColor: "#4f46e5",
                      preset: {
                        eyebrow: "Care Pathway",
                        title: "Your 4-Step Recovery Journey",
                        background: "teal"
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
                      desc: "Right photo with headline, narrative paragraphs & checkmarks on the left.",
                      iconComponent: <ColumnsIcon size={18} />,
                      iconBg: "#e0f2fe",
                      iconColor: "#0284c7",
                      preset: {
                        eyebrow: "Advanced Clinical Care",
                        eyebrowColor: "#1c9fd8",
                        title: "State-of-the-Art Rehabilitation Modalities",
                        subtitle: "Designed for your comfort and active recovery",
                        content: "Our Calgary clinics feature fully equipped private suites and active exercise gym spaces to provide the highest standard of one-on-one physiotherapy care.",
                        bullets: [
                          "Private consultation and treatment rooms",
                          "Advanced modalities: Shockwave, IMS/Dry Needling & Laser",
                          "Active exercise rehabilitation gym"
                        ],
                        image: "/images/clinic/reception-one.jpg",
                        imagePosition: "right",
                        background: "white"
                      }
                    },
                    {
                      isCustom: true,
                      title: "Custom Story (Left Photo)",
                      desc: "Left photo with clinical explanation and treatment methodology.",
                      iconComponent: <LayersIcon size={18} />,
                      iconBg: "#dcfce7",
                      iconColor: "#16a34a",
                      preset: {
                        eyebrow: "Personalized Protocol",
                        eyebrowColor: "#10b981",
                        title: "Custom Rehabilitation Tailored to Your Goals",
                        subtitle: "Evidence-based therapy for lasting mobility",
                        content: "We create tailored rehabilitation milestones for your daily routine, whether returning to sports or daily work.",
                        bullets: [
                          "Custom milestone tracking and progress measurements",
                          "Direct communication with your family physician if requested",
                          "Ergonomic and workplace postural guidance"
                        ],
                        image: "/images/clinic/reception-two.jpg",
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
                        eyebrow: "Why Nose Creek Physiotherapy",
                        eyebrowColor: "#f6c945",
                        title: "Over 20+ Years Serving North & Northwest Calgary",
                        subtitle: "Trusted by thousands of Calgary families, athletes, and doctors",
                        content: "Since 2001, Nose Creek Physiotherapy has helped over 15,000 Calgarians overcome acute injuries and chronic limitations through dedicated care.",
                        bullets: [
                          "545+ Five-Star Google Reviews across Calgary",
                          "Registered Physiotherapists with advanced orthopedic certifications",
                          "Direct insurance billing with zero hassle"
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
                        eyebrow: "Specialized Therapy",
                        eyebrowColor: "#1c9fd8",
                        title: "Custom Therapy Feature",
                        subtitle: "Personalized care protocol",
                        content: "Add your clinical description and details here...",
                        bullets: [
                          "Key highlight bullet 1",
                          "Key highlight bullet 2"
                        ],
                        image: "/images/clinic/reception-three.jpg",
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
                        title: "545+ Five-Star Reviews in Calgary",
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
                        title: `Frequently Asked Questions About ${service.title}`,
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
                      id: "bottom_cta",
                      title: "Bottom Booking Call-to-Action",
                      desc: "Full-width high-contrast booking banner.",
                      iconComponent: <RocketIcon size={18} />,
                      iconBg: "#fee2e2",
                      iconColor: "#dc2626",
                      preset: {
                        title: `Ready to Start Your ${service.title} Care?`,
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
              ? service.customSections?.[parseInt(customizingBlockKey.replace("custom-", ""), 10)]?.title || "Custom Story Section"
              : sectionDefinitions[customizingBlockKey]?.title || customizingBlockKey
          }
          config={
            customizingBlockKey.startsWith("custom-")
              ? service.customSections?.[parseInt(customizingBlockKey.replace("custom-", ""), 10)]
              : service.sectionsData?.[customizingBlockKey]
          }
          onSave={(cfg) => {
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
