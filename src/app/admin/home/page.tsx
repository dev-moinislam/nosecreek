"use client";

import React, { useState, useEffect } from "react";
import { HomePageData, ServiceCustomSection, SectionBlockConfig } from "@/types/content";
import defaultHomeData from "@/data/home.json";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { useRole } from "@/components/admin/RoleGuard";
import LivePreviewPane from "@/components/admin/LivePreviewPane";
import AdminToast from "@/components/admin/AdminToast";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";
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
  SparklesIcon,
  CheckIcon,
  ExternalLinkIcon,
  GlobeIcon,
  StarIcon,
  UsersIcon,
  TargetIcon,
  XIcon,
  MapPinIcon,
  LayersIcon,
  ColumnsIcon,
  CheckCircleIcon,
  MessageSquareIcon,
  BookOpenIcon,
  PhoneIcon,
  FileTextIcon,
  GripVerticalIcon
} from "@/components/admin/AdminIcons";

// Sections that are dynamic feeds / direct-adds from DB and don't need content text customizer
const nonConfigurableSections = [
  "team_carousel",
  "conditions",
  "services_grid",
  "blog_section",
  "location_map"
];

const homepageSectionDefs: Record<string, { title: string; category: string; desc: string }> = {
  hero: { title: "Hero Banner & Header", category: "Core", desc: "Main headline, booking button, phone number, and hero image" },
  quick_facts: { title: "At-a-Glance Quick Facts", category: "Core", desc: "4 quick pill cards: Assessment, Direct Billing, No Referral, Location" },
  stats: { title: "Trust Statistics Bar", category: "Social Proof", desc: "Dark bar highlighting 2001 founding, 24+ years, 545 reviews" },
  services_grid: { title: "Clinical Services Grid", category: "Clinical", desc: "Displays all active clinical services with dynamic cards" },
  conditions: { title: "Conditions We Treat Grid", category: "Clinical", desc: "Where does it hurt? Grid of condition cards" },
  about_clinic: { title: "About Clinic (20+ Years Trust)", category: "Story", desc: "Clinic history, 3 clinic photos, and story narrative" },
  director: { title: "Founder Spotlight (Blair Schachterle)", category: "Story", desc: "Circular founder headshot, credentials, and message" },
  team_carousel: { title: "Practitioners Team Carousel", category: "Team", desc: "Horizontal interactive scrolling carousel of registered physiotherapists" },
  free_reports: { title: "Free Advice Reports Grid", category: "Educational", desc: "4 downloadable PDF guide cards written by Blair" },
  credentials: { title: "Credentials & Associations Logos", category: "Trust", desc: "Official logos: CPA, CRMTA, PainHero, Ortho Division, Sport Physio" },
  reviews: { title: "Google Patient Reviews Carousel", category: "Social Proof", desc: "Interactive carousel of verified 5-star patient reviews" },
  decide_ctas: { title: "Free Discovery & Phone CTAs", category: "Conversion", desc: "Two low-friction cards for discovery sessions and telephone consults" },
  workshops: { title: "Free Education & Posture Workshops", category: "Conversion", desc: "Green callout banner for free community workshops" },
  seo_copy: { title: "Calgary Local SEO Content Block", category: "SEO", desc: "Keyword-rich local neighborhood copy (NW, NE, Beddington)" },
  blog_section: { title: "Latest Blog Articles (Top 3)", category: "Content", desc: "Displays the 3 most recently published educational articles" },
  faqs: { title: "Interactive FAQ Accordions", category: "Content", desc: "Expandable patient questions, insurance coverage, and answers" },
  location_map: { title: "Clinic Location & Map (Visit Us)", category: "Location", desc: "Beddington location directions, hours list, and Google Map embed" },
  final_cta: { title: "Final Booking Callout Banner", category: "Conversion", desc: "Blue gradient closing banner with online booking and call buttons" }
};

export default function AdminHomePage() {
  const { isAdmin } = useRole();
  const [homeData, setHomeData] = useState<HomePageData>(defaultHomeData as unknown as HomePageData);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Active section editing popup modal key
  const [editingModalKey, setEditingModalKey] = useState<string | null>(null);
  // Temporary edit state inside modal so Cancel button discards changes cleanly
  const [tempData, setTempData] = useState<HomePageData>(defaultHomeData as unknown as HomePageData);

  // Helper inputs inside modals
  const [modalNewBadge, setModalNewBadge] = useState("");
  const [modalNewFaqQ, setModalNewFaqQ] = useState("");
  const [modalNewFaqA, setModalNewFaqA] = useState("");
  const [modalNewAreaTag, setModalNewAreaTag] = useState("");
  const [modalNewAreaHref, setModalNewAreaHref] = useState("");

  // Modals for add/delete
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [deleteSectionKey, setDeleteSectionKey] = useState<string | null>(null);
  const [customizingBlockKey, setCustomizingBlockKey] = useState<string | null>(null);

  // Initial Load from Supabase / localStorage / default
  useEffect(() => {
    async function loadData() {
      let loaded: HomePageData = defaultHomeData as unknown as HomePageData;
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("adm_home");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === "object") {
              loaded = { ...loaded, ...parsed };
            }
          } catch {}
        }
      }

      if (isSupabaseConfigured && supabase) {
        try {
          // Check site_settings table for home_page_content
          const { data: mainData } = await supabase
            .from("site_settings")
            .select("home_page_content")
            .eq("id", "main")
            .single();
          if (mainData && (mainData as any).home_page_content && Object.keys((mainData as any).home_page_content).length > 0) {
            loaded = { ...loaded, ...(mainData as any).home_page_content };
          }
        } catch {}

        try {
          const { data, error } = await supabase
            .from("site_settings")
            .select("value")
            .eq("key", "home_page_content")
            .single();
          if (!error && data && data.value) {
            loaded = { ...loaded, ...data.value };
          }
        } catch {}
      }

      setHomeData(loaded);
      setTempData(loaded);
    }
    loadData();
  }, []);

  // Save handler: Multi-layer persistence to Database, Disk, and Local
  const handleSave = async (dataToSave = homeData) => {
    try {
      setIsSaving(true);

      // 1. Local state & localStorage
      setHomeData(dataToSave);
      setTempData(dataToSave);
      if (typeof window !== "undefined") {
        localStorage.setItem("adm_home", JSON.stringify(dataToSave));
        window.dispatchEvent(new Event("homeUpdated"));
      }

      // 2. Disk persistence via API route (updates src/data/home.json)
      try {
        await fetch("/api/admin/save-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "home", data: dataToSave })
        });
      } catch (err) {
        console.warn("Disk save failed", err);
      }

      // 3. Supabase persistence
      if (isSupabaseConfigured && supabase) {
        try {
          // Update site_settings row 'main'
          await supabase
            .from("site_settings")
            .update({ home_page_content: dataToSave })
            .eq("id", "main");
        } catch {}

        try {
          // Also upsert key-value pair
          await supabase.from("site_settings").upsert(
            {
              key: "home_page_content",
              value: dataToSave,
              updated_at: new Date().toISOString()
            },
            { onConflict: "key" }
          );
        } catch (err) {
          console.warn("Supabase upsert failed", err);
        }
      }

      setToastMessage("✓ Section saved to database and live website updated!");
    } catch (err: any) {
      alert("Error saving homepage: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  // Open dedicated popup modal for a section
  const openEditModal = (sectionKey: string) => {
    if (sectionKey.startsWith("custom-")) {
      setCustomizingBlockKey(sectionKey);
      return;
    }
    // Clone current homeData into tempData so Cancel button can discard changes
    setTempData(JSON.parse(JSON.stringify(homeData)));
    setEditingModalKey(sectionKey);
  };

  // Save from inside a popup modal
  const saveModalChanges = async () => {
    await handleSave(tempData);
    setEditingModalKey(null);
  };

  // Section Order helpers
  const currentOrder = homeData.sectionOrder || defaultHomeData.sectionOrder;
  const hiddenSections = homeData.hiddenSections || [];

  // Drag and Drop state for section reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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
    const updated = { ...homeData, sectionOrder: newOrder };
    handleSave(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;
    const newOrder = [...currentOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    const updated = { ...homeData, sectionOrder: newOrder };
    handleSave(updated);
  };

  const toggleSectionVisibility = (key: string) => {
    const updatedHidden = hiddenSections.includes(key)
      ? hiddenSections.filter((k) => k !== key)
      : [...hiddenSections, key];
    const updated = { ...homeData, hiddenSections: updatedHidden };
    handleSave(updated);
  };

  // Confirm delete section permanently
  const handleConfirmDeleteSection = async () => {
    if (!deleteSectionKey) return;
    const key = deleteSectionKey;

    if (key.startsWith("custom-")) {
      const idx = parseInt(key.replace("custom-", ""), 10);
      const curCustom = [...(homeData.customSections || [])];
      curCustom.splice(idx, 1);
      const newOrder = currentOrder.filter((k) => k !== key);
      const updated = { ...homeData, customSections: curCustom, sectionOrder: newOrder };
      await handleSave(updated);
    } else {
      const newOrder = currentOrder.filter((k) => k !== key);
      const updatedHidden = hiddenSections.includes(key)
        ? hiddenSections
        : [...hiddenSections, key];
      const updated = { ...homeData, sectionOrder: newOrder, hiddenSections: updatedHidden };
      await handleSave(updated);
    }

    setDeleteSectionKey(null);
    setToastMessage(`✓ Section removed permanently from Homepage!`);
  };

  // Add section template handler
  const handleAddSection = (sectionKey: string, presetData?: any) => {
    if (sectionKey === "custom_story") {
      const curCustom = [...(homeData.customSections || [])];
      curCustom.push(
        presetData || {
          title: "Custom Therapy Highlight",
          subtitle: "Dedicated rehabilitation protocol",
          eyebrow: "Specialized Care",
          eyebrowColor: "#1c9fd8",
          content: "Describe your specialized clinical methodology and patient care approach here.",
          bullets: ["Personalized 1-on-1 care", "Experienced clinical team", "Direct insurance billing"],
          image: "/images/clinic/reception-three.jpg",
          imagePosition: "right",
          background: "white"
        }
      );
      const newKey = `custom-${curCustom.length - 1}`;
      const newOrder = [...currentOrder, newKey];
      const updated = { ...homeData, customSections: curCustom, sectionOrder: newOrder };
      handleSave(updated);
    } else {
      if (!currentOrder.includes(sectionKey)) {
        const newOrder = [...currentOrder, sectionKey];
        const updatedHidden = hiddenSections.filter((k) => k !== sectionKey);
        const updated = { ...homeData, sectionOrder: newOrder, hiddenSections: updatedHidden };
        handleSave(updated);
      } else if (hiddenSections.includes(sectionKey)) {
        const updatedHidden = hiddenSections.filter((k) => k !== sectionKey);
        const updated = { ...homeData, hiddenSections: updatedHidden };
        handleSave(updated);
      }
    }
    setShowAddSectionModal(false);
  };

  // Block Customizer Save Handler for custom sections
  const handleSaveBlockConfig = (updatedCfg: SectionBlockConfig) => {
    if (!customizingBlockKey) return;
    if (customizingBlockKey.startsWith("custom-")) {
      const idx = parseInt(customizingBlockKey.replace("custom-", ""), 10);
      const updatedCustom = [...(homeData.customSections || [])];
      updatedCustom[idx] = { ...updatedCustom[idx], ...updatedCfg } as any;
      const updated = { ...homeData, customSections: updatedCustom };
      handleSave(updated);
    } else {
      const updatedSectionsData = {
        ...(homeData.sectionsData || {}),
        [customizingBlockKey]: updatedCfg
      };
      const updated = { ...homeData, sectionsData: updatedSectionsData };
      handleSave(updated);
    }
    setCustomizingBlockKey(null);
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      <AdminToast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteSectionKey)}
        title="Remove Section from Homepage?"
        itemName={
          deleteSectionKey?.startsWith("custom-")
            ? homeData.customSections?.[parseInt(deleteSectionKey.replace("custom-", ""), 10)]?.title || "Custom Story Section"
            : homepageSectionDefs[deleteSectionKey || ""]?.title || deleteSectionKey || "Section"
        }
        itemType="Homepage Section"
        onConfirm={handleConfirmDeleteSection}
        onClose={() => setDeleteSectionKey(null)}
      />

      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: "rgba(28,159,216,0.12)", color: "#1c9fd8" }}>
              <GlobeIcon size={20} />
            </span>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#0f172a", fontFamily: "var(--adm-font-display)" }}>
              Homepage Content &amp; Layout Manager
            </h1>
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0 46px" }}>
            Click &quot;Edit Details&quot; on any section to customize in a popup modal. All changes save directly to the database.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="adm-btn adm-btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <ExternalLinkIcon size={14} />
            <span>Live Preview</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="adm-btn adm-btn-primary"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <CheckIcon size={16} />
            <span>{isSaving ? "Saving to DB..." : "Save & Publish"}</span>
          </button>
        </div>
      </div>

      {/* Main Sections Architecture Card */}
      <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1e293b" }}>
              Homepage Section Architecture &amp; Content Customizer
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>
              Click &quot;Edit Details&quot; on any section to open its dedicated edit popup. Reorder or delete sections anytime.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddSectionModal(true)}
            className="adm-btn adm-btn-primary"
            style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, #1c9fd8 0%, #0e78a8 100%)" }}
          >
            <PlusIcon size={15} />
            <span>Add / Insert Section</span>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {currentOrder.map((sectionKey, index) => {
            const isHidden = hiddenSections.includes(sectionKey);
            const isCustom = sectionKey.startsWith("custom-");
            const customIdx = isCustom ? parseInt(sectionKey.replace("custom-", ""), 10) : -1;
            const customSec = isCustom ? homeData.customSections?.[customIdx] : null;
            const isCustomizable = !nonConfigurableSections.includes(sectionKey);

            const def = isCustom
              ? {
                  title: customSec?.title || `Custom Story Section #${customIdx + 1}`,
                  category: "Custom Story",
                  desc: customSec?.subtitle || customSec?.content?.substring(0, 80) || "Rich storytelling card with image & highlights"
                }
              : homepageSectionDefs[sectionKey] || {
                  title: sectionKey,
                  category: "General",
                  desc: "Section component"
                };

            const isBeingDragged = draggedIndex === index;
            const isDraggedOver = dragOverIndex === index;

            return (
              <div
                key={sectionKey}
                draggable={isAdmin}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  borderRadius: 12,
                  background: isHidden ? "#f8fafc" : "#ffffff",
                  border: isDraggedOver ? "2px solid #1c9fd8" : isHidden ? "1px dashed #cbd5e1" : "1px solid #e2e8f0",
                  opacity: isBeingDragged ? 0.35 : isHidden ? 0.65 : 1,
                  transform: isDraggedOver ? "scale(1.01)" : "scale(1)",
                  transition: "all 0.15s ease",
                  cursor: isAdmin ? "grab" : "default",
                  boxShadow: isDraggedOver ? "0 8px 20px rgba(28,159,216,0.18)" : isHidden ? "none" : "0 2px 6px rgba(0,0,0,0.02)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Drag Handle Icon */}
                  {isAdmin && (
                    <div
                      style={{
                        cursor: "grab",
                        color: isDraggedOver ? "#1c9fd8" : "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        padding: 2
                      }}
                      title="Click and drag to rearrange section"
                    >
                      <GripVerticalIcon size={18} />
                    </div>
                  )}

                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#64748b" }}>
                    {index + 1}
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: isHidden ? "#64748b" : "#0f172a" }}>
                        {def.title}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, background: isCustom ? "#fef3c7" : "#e0f2fe", color: isCustom ? "#b45309" : "#0284c7", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>
                        {def.category}
                      </span>
                      {isHidden && (
                        <span style={{ fontSize: 11, fontWeight: 700, background: "#fee2e2", color: "#b91c1c", padding: "2px 8px", borderRadius: 4 }}>
                          Hidden
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>
                      {def.desc}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* Reorder Buttons */}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveSection(index, "up")}
                    className="adm-btn adm-btn-secondary adm-btn-sm"
                    style={{ opacity: index === 0 ? 0.3 : 1, padding: "6px 8px" }}
                    title="Move Up"
                  >
                    <ArrowUpIcon size={14} />
                  </button>

                  <button
                    type="button"
                    disabled={index === currentOrder.length - 1}
                    onClick={() => moveSection(index, "down")}
                    className="adm-btn adm-btn-secondary adm-btn-sm"
                    style={{ opacity: index === currentOrder.length - 1 ? 0.3 : 1, padding: "6px 8px" }}
                    title="Move Down"
                  >
                    <ArrowDownIcon size={14} />
                  </button>

                  {/* Hide / Show Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleSectionVisibility(sectionKey)}
                    className="adm-btn adm-btn-secondary adm-btn-sm"
                    style={{ color: isHidden ? "#0e78a8" : "#64748b", padding: "6px 10px", display: "flex", alignItems: "center", gap: 4 }}
                    title={isHidden ? "Restore Section" : "Hide Section"}
                  >
                    {isHidden ? <EyeIcon size={14} /> : <EyeOffIcon size={14} />}
                    <span>{isHidden ? "Show" : "Hide"}</span>
                  </button>

                  {/* Edit Details Button — Opens dedicated popup modal */}
                  {isCustomizable && (
                    <button
                      type="button"
                      onClick={() => openEditModal(sectionKey)}
                      className="adm-btn adm-btn-secondary adm-btn-sm"
                      style={{ display: "flex", alignItems: "center", gap: 5, background: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0", fontWeight: 700 }}
                      title="Edit this section in a popup"
                    >
                      <EditIcon size={13} />
                      <span>Edit Details</span>
                    </button>
                  )}

                  {/* Permanent Delete Section */}
                  <button
                    type="button"
                    onClick={() => setDeleteSectionKey(sectionKey)}
                    className="adm-btn adm-btn-secondary adm-btn-sm"
                    style={{ color: "#dc2626", padding: "6px 8px" }}
                    title="Delete Section Permanently"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          POPUP MODALS FOR EACH HOMEPAGE SECTION
      ══════════════════════════════════════════════════════════════ */}

      {/* ── 1. POPUP: HERO BANNER & HEADER ── */}
      {editingModalKey === "hero" && (
        <div className="adm-modal-overlay" onClick={() => setEditingModalKey(null)}>
          <div className="adm-modal wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 850, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  Edit Hero Banner &amp; Header
                </h3>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Customize main headlines, call-to-action buttons, phone, image, and trust badges.
                </span>
              </div>
              <button onClick={() => setEditingModalKey(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <XIcon size={20} />
              </button>
            </div>

            <div className="adm-modal-body" style={{ overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="adm-label">Eyebrow Pill Badge</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.hero?.eyebrow || ""}
                    onChange={(e) => setTempData({ ...tempData, hero: { ...tempData.hero, eyebrow: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="adm-label">Clinic Phone Number</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.hero?.phone || ""}
                    onChange={(e) =>
                      setTempData({
                        ...tempData,
                        hero: {
                          ...tempData.hero,
                          phone: e.target.value,
                          phoneHref: `tel:${e.target.value.replace(/[^0-9+]/g, "")}`
                        }
                      })
                    }
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="adm-label">Headline Line 1 (Dark)</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.hero?.titleLine1 || ""}
                    onChange={(e) => setTempData({ ...tempData, hero: { ...tempData.hero, titleLine1: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="adm-label">Headline Line 2 (Teal Highlight)</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.hero?.titleLine2 || ""}
                    onChange={(e) => setTempData({ ...tempData, hero: { ...tempData.hero, titleLine2: e.target.value } })}
                  />
                </div>
              </div>

              <div>
                <label className="adm-label">Hero Summary Description</label>
                <textarea
                  className="adm-input"
                  rows={3}
                  value={tempData.hero?.description || ""}
                  onChange={(e) => setTempData({ ...tempData, hero: { ...tempData.hero, description: e.target.value } })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="adm-label">Primary Button Label</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.hero?.primaryCtaText || ""}
                    onChange={(e) => setTempData({ ...tempData, hero: { ...tempData.hero, primaryCtaText: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="adm-label">Primary Button Booking URL</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.hero?.primaryCtaUrl || ""}
                    onChange={(e) => setTempData({ ...tempData, hero: { ...tempData.hero, primaryCtaUrl: e.target.value } })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="adm-label">Hero Photo URL</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.hero?.image || ""}
                    onChange={(e) => setTempData({ ...tempData, hero: { ...tempData.hero, image: e.target.value } })}
                  />
                  {tempData.hero?.image && (
                    <div style={{ marginTop: 8 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tempData.hero.image} alt="Hero preview" style={{ height: 60, borderRadius: 8, objectFit: "cover" }} />
                    </div>
                  )}
                </div>
                <div>
                  <label className="adm-label">Google Review Count Badge</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.hero?.reviewCount || ""}
                    onChange={(e) => setTempData({ ...tempData, hero: { ...tempData.hero, reviewCount: e.target.value } })}
                  />
                </div>
              </div>

              {/* Trust Micro-Badges */}
              <div style={{ paddingTop: 14, borderTop: "1px solid #e2e8f0" }}>
                <label className="adm-label">Trust Micro-Badges ({tempData.hero?.badges?.length || 0})</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {tempData.hero?.badges?.map((b, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f1f5f9", padding: "6px 12px", borderRadius: 8, fontSize: 13, color: "#334155" }}>
                      <span>{b}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = tempData.hero.badges.filter((_, i) => i !== idx);
                          setTempData({ ...tempData, hero: { ...tempData.hero, badges: updated } });
                        }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 0 }}
                      >
                        <XIcon size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="e.g., ✓ Extended-health direct billing"
                    value={modalNewBadge}
                    onChange={(e) => setModalNewBadge(e.target.value)}
                  />
                  <button
                    type="button"
                    className="adm-btn adm-btn-secondary"
                    onClick={() => {
                      if (modalNewBadge.trim()) {
                        const updated = [...(tempData.hero.badges || []), modalNewBadge.trim()];
                        setTempData({ ...tempData, hero: { ...tempData.hero, badges: updated } });
                        setModalNewBadge("");
                      }
                    }}
                  >
                    + Add Badge
                  </button>
                </div>
              </div>
            </div>

            <div className="adm-modal-footer">
              <button type="button" onClick={() => setEditingModalKey(null)} className="adm-btn adm-btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={saveModalChanges} disabled={isSaving} className="adm-btn adm-btn-success" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckIcon size={16} />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. POPUP: AT-A-GLANCE QUICK FACTS ── */}
      {editingModalKey === "quick_facts" && (
        <div className="adm-modal-overlay" onClick={() => setEditingModalKey(null)}>
          <div className="adm-modal wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 750, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  Edit At-a-Glance Quick Facts
                </h3>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Modify the 4 quick pill cards displayed below the hero header.
                </span>
              </div>
              <button onClick={() => setEditingModalKey(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <XIcon size={20} />
              </button>
            </div>

            <div className="adm-modal-body" style={{ overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {tempData.quickFacts?.map((qf, idx) => (
                <div key={idx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr auto", gap: 12, alignItems: "center" }}>
                    <div>
                      <label className="adm-label">Icon</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={qf.icon}
                        onChange={(e) => {
                          const updated = [...(tempData.quickFacts || [])];
                          updated[idx] = { ...updated[idx], icon: e.target.value };
                          setTempData({ ...tempData, quickFacts: updated });
                        }}
                      />
                    </div>
                    <div>
                      <label className="adm-label">Label</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={qf.label}
                        onChange={(e) => {
                          const updated = [...(tempData.quickFacts || [])];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          setTempData({ ...tempData, quickFacts: updated });
                        }}
                      />
                    </div>
                    <div>
                      <label className="adm-label">Value Text</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={qf.val}
                        onChange={(e) => {
                          const updated = [...(tempData.quickFacts || [])];
                          updated[idx] = { ...updated[idx], val: e.target.value };
                          setTempData({ ...tempData, quickFacts: updated });
                        }}
                      />
                    </div>
                    <div style={{ paddingTop: 18 }}>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = tempData.quickFacts!.filter((_, i) => i !== idx);
                          setTempData({ ...tempData, quickFacts: updated });
                        }}
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        style={{ color: "#dc2626", padding: "8px" }}
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="adm-btn adm-btn-secondary"
                style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6 }}
                onClick={() => {
                  const updated = [...(tempData.quickFacts || []), { icon: "✓", label: "New Fact", val: "Details here" }];
                  setTempData({ ...tempData, quickFacts: updated });
                }}
              >
                <PlusIcon size={14} />
                <span>Add Quick Fact Card</span>
              </button>
            </div>

            <div className="adm-modal-footer">
              <button type="button" onClick={() => setEditingModalKey(null)} className="adm-btn adm-btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={saveModalChanges} disabled={isSaving} className="adm-btn adm-btn-success" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckIcon size={16} />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. POPUP: ABOUT CLINIC ── */}
      {editingModalKey === "about_clinic" && (
        <div className="adm-modal-overlay" onClick={() => setEditingModalKey(null)}>
          <div className="adm-modal wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 800, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  Edit About Clinic (20+ Years Trust)
                </h3>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Clinic history, storytelling narrative, photos, and link.
                </span>
              </div>
              <button onClick={() => setEditingModalKey(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <XIcon size={20} />
              </button>
            </div>

            <div className="adm-modal-body" style={{ overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="adm-label">Eyebrow</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.aboutClinic?.eyebrow || ""}
                    onChange={(e) => setTempData({ ...tempData, aboutClinic: { ...tempData.aboutClinic!, eyebrow: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="adm-label">Section Headline</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.aboutClinic?.title || ""}
                    onChange={(e) => setTempData({ ...tempData, aboutClinic: { ...tempData.aboutClinic!, title: e.target.value } })}
                  />
                </div>
              </div>

              <div>
                <label className="adm-label">Story Narrative Content</label>
                <textarea
                  className="adm-input"
                  rows={4}
                  value={tempData.aboutClinic?.content || ""}
                  onChange={(e) => setTempData({ ...tempData, aboutClinic: { ...tempData.aboutClinic!, content: e.target.value } })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="adm-label">Link Button Label</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.aboutClinic?.linkText || ""}
                    onChange={(e) => setTempData({ ...tempData, aboutClinic: { ...tempData.aboutClinic!, linkText: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="adm-label">Link Button URL</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.aboutClinic?.linkUrl || ""}
                    onChange={(e) => setTempData({ ...tempData, aboutClinic: { ...tempData.aboutClinic!, linkUrl: e.target.value } })}
                  />
                </div>
              </div>

              <div>
                <label className="adm-label">Primary Clinic Photo URL</label>
                <input
                  type="text"
                  className="adm-input"
                  value={tempData.aboutClinic?.images?.[0] || ""}
                  onChange={(e) => {
                    const imgs = [...(tempData.aboutClinic?.images || [])];
                    imgs[0] = e.target.value;
                    setTempData({ ...tempData, aboutClinic: { ...tempData.aboutClinic!, images: imgs } });
                  }}
                />
              </div>
            </div>

            <div className="adm-modal-footer">
              <button type="button" onClick={() => setEditingModalKey(null)} className="adm-btn adm-btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={saveModalChanges} disabled={isSaving} className="adm-btn adm-btn-success" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckIcon size={16} />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. POPUP: FOUNDER & DIRECTOR SPOTLIGHT ── */}
      {editingModalKey === "director" && (
        <div className="adm-modal-overlay" onClick={() => setEditingModalKey(null)}>
          <div className="adm-modal wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 800, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  Edit Founder Spotlight (Blair Schachterle)
                </h3>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Founder name, qualifications, clinical biography message, circular photo, and button.
                </span>
              </div>
              <button onClick={() => setEditingModalKey(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <XIcon size={20} />
              </button>
            </div>

            <div className="adm-modal-body" style={{ overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="adm-label">Director Full Name</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.director?.title || ""}
                    onChange={(e) => setTempData({ ...tempData, director: { ...tempData.director!, title: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="adm-label">Role &amp; Degree Credentials</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.director?.role || ""}
                    onChange={(e) => setTempData({ ...tempData, director: { ...tempData.director!, role: e.target.value } })}
                  />
                </div>
              </div>

              <div>
                <label className="adm-label">Biography &amp; Clinical Message</label>
                <textarea
                  className="adm-input"
                  rows={4}
                  value={tempData.director?.bio || ""}
                  onChange={(e) => setTempData({ ...tempData, director: { ...tempData.director!, bio: e.target.value } })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="adm-label">Director Circular Photo URL</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.director?.image || ""}
                    onChange={(e) => setTempData({ ...tempData, director: { ...tempData.director!, image: e.target.value } })}
                  />
                  {tempData.director?.image && (
                    <div style={{ marginTop: 8 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tempData.director.image} alt="Director preview" style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover" }} />
                    </div>
                  )}
                </div>
                <div>
                  <label className="adm-label">Button Destination URL</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.director?.ctaUrl || ""}
                    onChange={(e) => setTempData({ ...tempData, director: { ...tempData.director!, ctaUrl: e.target.value } })}
                  />
                </div>
              </div>
            </div>

            <div className="adm-modal-footer">
              <button type="button" onClick={() => setEditingModalKey(null)} className="adm-btn adm-btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={saveModalChanges} disabled={isSaving} className="adm-btn adm-btn-success" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckIcon size={16} />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. POPUP: FREE DISCOVERY & PHONE CTAS ── */}
      {editingModalKey === "decide_ctas" && (
        <div className="adm-modal-overlay" onClick={() => setEditingModalKey(null)}>
          <div className="adm-modal wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 850, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  Edit Free Discovery &amp; Phone Consultation CTAs
                </h3>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Customize the two low-friction consultation cards (Discovery Session and Telephone Consult).
                </span>
              </div>
              <button onClick={() => setEditingModalKey(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <XIcon size={20} />
              </button>
            </div>

            <div className="adm-modal-body" style={{ overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="adm-label">Section Title</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.decideCtas?.title || "Want help deciding if physio is right for you?"}
                    onChange={(e) => setTempData({ ...tempData, decideCtas: { ...tempData.decideCtas, title: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="adm-label">Section Description</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.decideCtas?.description || "Not quite ready to book? We offer two free, no-pressure ways to get your questions answered first."}
                    onChange={(e) => setTempData({ ...tempData, decideCtas: { ...tempData.decideCtas, description: e.target.value } })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Discovery Card */}
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 16 }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#15803d", fontSize: 15 }}>Card 1: Discovery Session (Green)</h4>
                  <div style={{ marginBottom: 10 }}>
                    <label className="adm-label">Card Title</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={tempData.decideCtas?.discoveryTitle || "Free Discovery Session"}
                      onChange={(e) => setTempData({ ...tempData, decideCtas: { ...tempData.decideCtas, discoveryTitle: e.target.value } })}
                    />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label className="adm-label">Card Description</label>
                    <textarea
                      className="adm-input"
                      rows={3}
                      value={tempData.decideCtas?.discoveryDesc || "Unsure if physio will work for you, or had a bad experience in the past? Come in, see the clinic and find out for yourself how we can help — no treatment, no pressure."}
                      onChange={(e) => setTempData({ ...tempData, decideCtas: { ...tempData.decideCtas, discoveryDesc: e.target.value } })}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label className="adm-label">Button Label</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={tempData.decideCtas?.discoveryBtnText || "Apply for a Free Discovery Session →"}
                        onChange={(e) => setTempData({ ...tempData, decideCtas: { ...tempData.decideCtas, discoveryBtnText: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="adm-label">Button URL</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={tempData.decideCtas?.discoveryBtnUrl || "https://www.nosecreekphysiotherapy.com/free-discovery-session/"}
                        onChange={(e) => setTempData({ ...tempData, decideCtas: { ...tempData.decideCtas, discoveryBtnUrl: e.target.value } })}
                      />
                    </div>
                  </div>
                </div>

                {/* Phone Card */}
                <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: 16 }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#0369a1", fontSize: 15 }}>Card 2: Phone Consult (Blue)</h4>
                  <div style={{ marginBottom: 10 }}>
                    <label className="adm-label">Card Title</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={tempData.decideCtas?.phoneTitle || "Talk to a Physio First"}
                      onChange={(e) => setTempData({ ...tempData, decideCtas: { ...tempData.decideCtas, phoneTitle: e.target.value } })}
                    />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label className="adm-label">Card Description</label>
                    <textarea
                      className="adm-input"
                      rows={3}
                      value={tempData.decideCtas?.phoneDesc || "Have questions and want to be 100% sure we can help before booking? Schedule a free call and one of our physios will answer everything over the phone."}
                      onChange={(e) => setTempData({ ...tempData, decideCtas: { ...tempData.decideCtas, phoneDesc: e.target.value } })}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label className="adm-label">Button Label</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={tempData.decideCtas?.phoneBtnText || "Arrange a free phone consult →"}
                        onChange={(e) => setTempData({ ...tempData, decideCtas: { ...tempData.decideCtas, phoneBtnText: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="adm-label">Button URL</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={tempData.decideCtas?.phoneBtnUrl || "https://www.nosecreekphysiotherapy.com/telephone-consultation/"}
                        onChange={(e) => setTempData({ ...tempData, decideCtas: { ...tempData.decideCtas, phoneBtnUrl: e.target.value } })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="adm-modal-footer">
              <button type="button" onClick={() => setEditingModalKey(null)} className="adm-btn adm-btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={saveModalChanges} disabled={isSaving} className="adm-btn adm-btn-success" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckIcon size={16} />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. POPUP: FREE WORKSHOPS ── */}
      {editingModalKey === "workshops" && (
        <div className="adm-modal-overlay" onClick={() => setEditingModalKey(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  Edit Free Health &amp; Posture Workshops Banner
                </h3>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Modify community workshop banner headline, copy, and link.
                </span>
              </div>
              <button onClick={() => setEditingModalKey(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <XIcon size={20} />
              </button>
            </div>

            <div className="adm-modal-body" style={{ overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="adm-label">Banner Headline</label>
                <input
                  type="text"
                  className="adm-input"
                  value={tempData.workshops?.title || "Join a free health education or posture workshop"}
                  onChange={(e) => setTempData({ ...tempData, workshops: { ...tempData.workshops, title: e.target.value } })}
                />
              </div>

              <div>
                <label className="adm-label">Description Text</label>
                <textarea
                  className="adm-input"
                  rows={3}
                  value={tempData.workshops?.description || "Our workshops are 100% free. Request the dates and times of our next event and get practical tips you can start using right away."}
                  onChange={(e) => setTempData({ ...tempData, workshops: { ...tempData.workshops, description: e.target.value } })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="adm-label">Button Label</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.workshops?.ctaText || "Request Dates & Times →"}
                    onChange={(e) => setTempData({ ...tempData, workshops: { ...tempData.workshops, ctaText: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="adm-label">Button Link URL</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.workshops?.ctaUrl || "https://www.nosecreekphysiotherapy.com/workshops/"}
                    onChange={(e) => setTempData({ ...tempData, workshops: { ...tempData.workshops, ctaUrl: e.target.value } })}
                  />
                </div>
              </div>
            </div>

            <div className="adm-modal-footer">
              <button type="button" onClick={() => setEditingModalKey(null)} className="adm-btn adm-btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={saveModalChanges} disabled={isSaving} className="adm-btn adm-btn-success" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckIcon size={16} />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. POPUP: FINAL BOOKING CTA ── */}
      {editingModalKey === "final_cta" && (
        <div className="adm-modal-overlay" onClick={() => setEditingModalKey(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  Edit Final Booking Callout Banner
                </h3>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Closing conversion banner with online booking and call buttons.
                </span>
              </div>
              <button onClick={() => setEditingModalKey(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <XIcon size={20} />
              </button>
            </div>

            <div className="adm-modal-body" style={{ overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="adm-label">Banner Headline</label>
                <input
                  type="text"
                  className="adm-input"
                  value={tempData.finalCta?.title || "Ready to move faster and feel better?"}
                  onChange={(e) => setTempData({ ...tempData, finalCta: { ...tempData.finalCta, title: e.target.value } })}
                />
              </div>

              <div>
                <label className="adm-label">Description Text</label>
                <textarea
                  className="adm-input"
                  rows={2}
                  value={tempData.finalCta?.description || "Book your appointment online in under two minutes, or give us a call — we'd love to help you get back to the life you deserve."}
                  onChange={(e) => setTempData({ ...tempData, finalCta: { ...tempData.finalCta, description: e.target.value } })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="adm-label">Online Booking Button Label</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.finalCta?.ctaText || "Book Your Treatment Online"}
                    onChange={(e) => setTempData({ ...tempData, finalCta: { ...tempData.finalCta, ctaText: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="adm-label">Online Booking Destination URL</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.finalCta?.ctaUrl || "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington"}
                    onChange={(e) => setTempData({ ...tempData, finalCta: { ...tempData.finalCta, ctaUrl: e.target.value } })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="adm-label">Phone Label Display</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.finalCta?.phone || "403.295.8590"}
                    onChange={(e) =>
                      setTempData({
                        ...tempData,
                        finalCta: {
                          ...tempData.finalCta,
                          phone: e.target.value,
                          phoneHref: `tel:${e.target.value.replace(/[^0-9+]/g, "")}`
                        }
                      })
                    }
                  />
                </div>
                <div>
                  <label className="adm-label">Phone Link Href</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={tempData.finalCta?.phoneHref || "tel:+14032958590"}
                    onChange={(e) => setTempData({ ...tempData, finalCta: { ...tempData.finalCta, phoneHref: e.target.value } })}
                  />
                </div>
              </div>
            </div>

            <div className="adm-modal-footer">
              <button type="button" onClick={() => setEditingModalKey(null)} className="adm-btn adm-btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={saveModalChanges} disabled={isSaving} className="adm-btn adm-btn-success" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckIcon size={16} />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. POPUP: FAQS BUILDER ── */}
      {editingModalKey === "faqs" && (
        <div className="adm-modal-overlay" onClick={() => setEditingModalKey(null)}>
          <div className="adm-modal wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 800, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  Edit Frequently Asked Questions ({tempData.faqs?.length || 0})
                </h3>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Add, edit, or delete patient FAQs and insurance coverage questions.
                </span>
              </div>
              <button onClick={() => setEditingModalKey(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <XIcon size={20} />
              </button>
            </div>

            <div className="adm-modal-body" style={{ overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {tempData.faqs?.map((faq, idx) => (
                <div key={idx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0e78a8" }}>Question #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = tempData.faqs!.filter((_, i) => i !== idx);
                        setTempData({ ...tempData, faqs: updated });
                      }}
                      className="adm-btn adm-btn-secondary adm-btn-sm"
                      style={{ color: "#dc2626", padding: "4px 8px" }}
                    >
                      <TrashIcon size={13} />
                    </button>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <input
                      type="text"
                      className="adm-input"
                      value={(faq as any).q || (faq as any).question || ""}
                      onChange={(e) => {
                        const updated = [...(tempData.faqs || [])];
                        updated[idx] = { ...updated[idx], q: e.target.value, question: e.target.value };
                        setTempData({ ...tempData, faqs: updated });
                      }}
                      placeholder="Question..."
                    />
                  </div>
                  <div>
                    <textarea
                      className="adm-input"
                      rows={2}
                      value={(faq as any).a || (faq as any).answer || ""}
                      onChange={(e) => {
                        const updated = [...(tempData.faqs || [])];
                        updated[idx] = { ...updated[idx], a: e.target.value, answer: e.target.value };
                        setTempData({ ...tempData, faqs: updated });
                      }}
                      placeholder="Answer..."
                    />
                  </div>
                </div>
              ))}

              <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: 14 }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#0369a1", fontSize: 14 }}>+ Add New Question</h4>
                <input
                  type="text"
                  className="adm-input"
                  style={{ marginBottom: 8 }}
                  placeholder="Enter new question..."
                  value={modalNewFaqQ}
                  onChange={(e) => setModalNewFaqQ(e.target.value)}
                />
                <textarea
                  className="adm-input"
                  rows={2}
                  style={{ marginBottom: 10 }}
                  placeholder="Enter detailed answer..."
                  value={modalNewFaqA}
                  onChange={(e) => setModalNewFaqA(e.target.value)}
                />
                <button
                  type="button"
                  className="adm-btn adm-btn-primary adm-btn-sm"
                  onClick={() => {
                    if (modalNewFaqQ.trim() && modalNewFaqA.trim()) {
                      const updated = [...(tempData.faqs || []), { q: modalNewFaqQ.trim(), a: modalNewFaqA.trim(), question: modalNewFaqQ.trim(), answer: modalNewFaqA.trim() }];
                      setTempData({ ...tempData, faqs: updated });
                      setModalNewFaqQ("");
                      setModalNewFaqA("");
                    }
                  }}
                >
                  + Add Question
                </button>
              </div>
            </div>

            <div className="adm-modal-footer">
              <button type="button" onClick={() => setEditingModalKey(null)} className="adm-btn adm-btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={saveModalChanges} disabled={isSaving} className="adm-btn adm-btn-success" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckIcon size={16} />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 9. POPUP: TRUST STATS BAR ── */}
      {editingModalKey === "stats" && (
        <div className="adm-modal-overlay" onClick={() => setEditingModalKey(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  Edit Trust Statistics Bar
                </h3>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Customize the 4 key clinic proof numbers and descriptions.
                </span>
              </div>
              <button onClick={() => setEditingModalKey(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <XIcon size={20} />
              </button>
            </div>

            <div className="adm-modal-body" style={{ overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              {tempData.stats?.map((st, idx) => (
                <div key={idx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12 }}>
                    <div>
                      <label className="adm-label">Number</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={st.num}
                        onChange={(e) => {
                          const updated = [...(tempData.stats || [])];
                          updated[idx] = { ...updated[idx], num: e.target.value };
                          setTempData({ ...tempData, stats: updated });
                        }}
                      />
                    </div>
                    <div>
                      <label className="adm-label">Label Description</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={st.label}
                        onChange={(e) => {
                          const updated = [...(tempData.stats || [])];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          setTempData({ ...tempData, stats: updated });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="adm-modal-footer">
              <button type="button" onClick={() => setEditingModalKey(null)} className="adm-btn adm-btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={saveModalChanges} disabled={isSaving} className="adm-btn adm-btn-success" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckIcon size={16} />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 10. POPUP: FREE ADVICE REPORTS ── */}
      {editingModalKey === "free_reports" && (
        <div className="adm-modal-overlay" onClick={() => setEditingModalKey(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  Edit Free Advice Reports Section
                </h3>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Headline and description for the 4 downloadable educational guide cards.
                </span>
              </div>
              <button onClick={() => setEditingModalKey(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <XIcon size={20} />
              </button>
            </div>

            <div className="adm-modal-body" style={{ overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="adm-label">Eyebrow</label>
                <input
                  type="text"
                  className="adm-input"
                  value={tempData.freeReports?.eyebrow || "Free advice reports"}
                  onChange={(e) => setTempData({ ...tempData, freeReports: { ...tempData.freeReports, eyebrow: e.target.value } })}
                />
              </div>

              <div>
                <label className="adm-label">Headline</label>
                <input
                  type="text"
                  className="adm-input"
                  value={tempData.freeReports?.title || "Written by Blair Schachterle"}
                  onChange={(e) => setTempData({ ...tempData, freeReports: { ...tempData.freeReports, title: e.target.value } })}
                />
              </div>

              <div>
                <label className="adm-label">Description Text</label>
                <textarea
                  className="adm-input"
                  rows={3}
                  value={tempData.freeReports?.description || "Download a free guide for your area of concern — practical advice you can start using right away."}
                  onChange={(e) => setTempData({ ...tempData, freeReports: { ...tempData.freeReports, description: e.target.value } })}
                />
              </div>
            </div>

            <div className="adm-modal-footer">
              <button type="button" onClick={() => setEditingModalKey(null)} className="adm-btn adm-btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={saveModalChanges} disabled={isSaving} className="adm-btn adm-btn-success" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckIcon size={16} />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 11. POPUP: CALGARY LOCAL SEO COPY ── */}
      {editingModalKey === "seo_copy" && (
        <div className="adm-modal-overlay" onClick={() => setEditingModalKey(null)}>
          <div className="adm-modal wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 800, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  Edit Calgary Local SEO Copy &amp; Area Tags
                </h3>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Keyword-rich local copy and neighborhood pill tags.
                </span>
              </div>
              <button onClick={() => setEditingModalKey(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <XIcon size={20} />
              </button>
            </div>

            <div className="adm-modal-body" style={{ overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="adm-label">SEO Headline</label>
                <input
                  type="text"
                  className="adm-input"
                  value={tempData.seoCopy?.title || "Looking for a physiotherapist near you in Calgary?"}
                  onChange={(e) => setTempData({ ...tempData, seoCopy: { ...tempData.seoCopy, title: e.target.value } })}
                />
              </div>

              <div>
                <label className="adm-label">Paragraph 1 (Keyword Hook)</label>
                <textarea
                  className="adm-input"
                  rows={3}
                  value={tempData.seoCopy?.paragraph1 || "Searching for 'physiotherapy near me' in Calgary, AB can feel overwhelming — you've reached the right place. However big or small your issue feels, our experienced physiotherapists are eager to get started, and we take pride in every service we offer."}
                  onChange={(e) => setTempData({ ...tempData, seoCopy: { ...tempData.seoCopy, paragraph1: e.target.value } })}
                />
              </div>

              <div>
                <label className="adm-label">Paragraph 2 (Patient Experience &amp; Billing)</label>
                <textarea
                  className="adm-input"
                  rows={3}
                  value={tempData.seoCopy?.paragraph2 || "Nose Creek Physiotherapy strives to provide unequalled patient care throughout every stage of your therapy — from your first evaluation to your final billing. Every client is valuable to us, and we treat you that way from the moment you step through our doors."}
                  onChange={(e) => setTempData({ ...tempData, seoCopy: { ...tempData.seoCopy, paragraph2: e.target.value } })}
                />
              </div>

              {/* Area Tags */}
              <div style={{ paddingTop: 14, borderTop: "1px solid #e2e8f0" }}>
                <label className="adm-label">Service Area Pill Tags ({tempData.seoCopy?.areaLinks?.length || 4})</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {(tempData.seoCopy?.areaLinks || [
                    { label: "Calgary NW", href: "https://www.nosecreekphysiotherapy.com/service-areas/" },
                    { label: "Calgary NE", href: "https://www.nosecreekphysiotherapy.com/service-areas/" },
                    { label: "Beddington", href: "https://www.nosecreekphysiotherapy.com/beddington/" },
                    { label: "Thorncliffe & more", href: "https://www.nosecreekphysiotherapy.com/service-areas/" }
                  ]).map((tag, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f1f5f9", padding: "6px 12px", borderRadius: 999, fontSize: 13, color: "#334155" }}>
                      <span>{tag.label}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const cur = tempData.seoCopy?.areaLinks || [
                            { label: "Calgary NW", href: "https://www.nosecreekphysiotherapy.com/service-areas/" },
                            { label: "Calgary NE", href: "https://www.nosecreekphysiotherapy.com/service-areas/" },
                            { label: "Beddington", href: "https://www.nosecreekphysiotherapy.com/beddington/" },
                            { label: "Thorncliffe & more", href: "https://www.nosecreekphysiotherapy.com/service-areas/" }
                          ];
                          const updated = cur.filter((_, i) => i !== idx);
                          setTempData({ ...tempData, seoCopy: { ...tempData.seoCopy, areaLinks: updated } });
                        }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 0 }}
                      >
                        <XIcon size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px", gap: 8 }}>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="Area Name (e.g. Coventry Hills)"
                    value={modalNewAreaTag}
                    onChange={(e) => setModalNewAreaTag(e.target.value)}
                  />
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="Link URL"
                    value={modalNewAreaHref}
                    onChange={(e) => setModalNewAreaHref(e.target.value)}
                  />
                  <button
                    type="button"
                    className="adm-btn adm-btn-secondary"
                    onClick={() => {
                      if (modalNewAreaTag.trim()) {
                        const cur = tempData.seoCopy?.areaLinks || [
                          { label: "Calgary NW", href: "https://www.nosecreekphysiotherapy.com/service-areas/" },
                          { label: "Calgary NE", href: "https://www.nosecreekphysiotherapy.com/service-areas/" },
                          { label: "Beddington", href: "https://www.nosecreekphysiotherapy.com/beddington/" },
                          { label: "Thorncliffe & more", href: "https://www.nosecreekphysiotherapy.com/service-areas/" }
                        ];
                        const updated = [...cur, { label: modalNewAreaTag.trim(), href: modalNewAreaHref.trim() || "#" }];
                        setTempData({ ...tempData, seoCopy: { ...tempData.seoCopy, areaLinks: updated } });
                        setModalNewAreaTag("");
                        setModalNewAreaHref("");
                      }
                    }}
                  >
                    + Add Area
                  </button>
                </div>
              </div>
            </div>

            <div className="adm-modal-footer">
              <button type="button" onClick={() => setEditingModalKey(null)} className="adm-btn adm-btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={saveModalChanges} disabled={isSaving} className="adm-btn adm-btn-success" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckIcon size={16} />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 12. POPUP: CREDENTIALS ── */}
      {editingModalKey === "credentials" && (
        <div className="adm-modal-overlay" onClick={() => setEditingModalKey(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 650, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  Edit Credentials &amp; Associations Logos
                </h3>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Headline and eyebrow text for official health logos bar.
                </span>
              </div>
              <button onClick={() => setEditingModalKey(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <XIcon size={20} />
              </button>
            </div>

            <div className="adm-modal-body" style={{ overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="adm-label">Eyebrow</label>
                <input
                  type="text"
                  className="adm-input"
                  value={tempData.sectionsData?.credentials?.eyebrow || "Associations & credentials"}
                  onChange={(e) =>
                    setTempData({
                      ...tempData,
                      sectionsData: {
                        ...(tempData.sectionsData || {}),
                        credentials: {
                          ...(tempData.sectionsData?.credentials || {}),
                          eyebrow: e.target.value
                        }
                      }
                    })
                  }
                />
              </div>

              <div>
                <label className="adm-label">Title</label>
                <input
                  type="text"
                  className="adm-input"
                  value={tempData.sectionsData?.credentials?.title || "Recognized by Canada's Leading Health & Athletic Associations"}
                  onChange={(e) =>
                    setTempData({
                      ...tempData,
                      sectionsData: {
                        ...(tempData.sectionsData || {}),
                        credentials: {
                          ...(tempData.sectionsData?.credentials || {}),
                          title: e.target.value
                        }
                      }
                    })
                  }
                />
              </div>
            </div>

            <div className="adm-modal-footer">
              <button type="button" onClick={() => setEditingModalKey(null)} className="adm-btn adm-btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={saveModalChanges} disabled={isSaving} className="adm-btn adm-btn-success" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckIcon size={16} />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 13. POPUP: REVIEWS CAROUSEL ── */}
      {editingModalKey === "reviews" && (
        <div className="adm-modal-overlay" onClick={() => setEditingModalKey(null)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 650, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="adm-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  Edit Google Patient Reviews Section
                </h3>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Patient testimonials carousel headline and eyebrow badge.
                </span>
              </div>
              <button onClick={() => setEditingModalKey(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <XIcon size={20} />
              </button>
            </div>

            <div className="adm-modal-body" style={{ overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="adm-label">Eyebrow</label>
                <input
                  type="text"
                  className="adm-input"
                  value={tempData.sectionsData?.reviews?.eyebrow || "Patient Experiences"}
                  onChange={(e) =>
                    setTempData({
                      ...tempData,
                      sectionsData: {
                        ...(tempData.sectionsData || {}),
                        reviews: {
                          ...(tempData.sectionsData?.reviews || {}),
                          eyebrow: e.target.value
                        }
                      }
                    })
                  }
                />
              </div>

              <div>
                <label className="adm-label">Section Title</label>
                <input
                  type="text"
                  className="adm-input"
                  value={tempData.sectionsData?.reviews?.title || "Real Patient Stories & Google Reviews"}
                  onChange={(e) =>
                    setTempData({
                      ...tempData,
                      sectionsData: {
                        ...(tempData.sectionsData || {}),
                        reviews: {
                          ...(tempData.sectionsData?.reviews || {}),
                          title: e.target.value
                        }
                      }
                    })
                  }
                />
              </div>
            </div>

            <div className="adm-modal-footer">
              <button type="button" onClick={() => setEditingModalKey(null)} className="adm-btn adm-btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={saveModalChanges} disabled={isSaving} className="adm-btn adm-btn-success" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckIcon size={16} />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: UNIVERSAL SECTION BLOCK CUSTOMIZER (For Custom Story Sections) ── */}
      {customizingBlockKey && (
        <SectionBlockCustomizerModal
          isOpen={Boolean(customizingBlockKey)}
          onClose={() => setCustomizingBlockKey(null)}
          sectionKey={customizingBlockKey}
          sectionDefaultTitle={
            customizingBlockKey.startsWith("custom-")
              ? homeData.customSections?.[parseInt(customizingBlockKey.replace("custom-", ""), 10)]?.title || "Custom Story Section"
              : homepageSectionDefs[customizingBlockKey]?.title || customizingBlockKey
          }
          config={
            customizingBlockKey.startsWith("custom-")
              ? homeData.customSections?.[parseInt(customizingBlockKey.replace("custom-", ""), 10)]
              : homeData.sectionsData?.[customizingBlockKey] || {
                  title: homepageSectionDefs[customizingBlockKey]?.title || customizingBlockKey,
                  background: "white"
                }
          }
          onSave={handleSaveBlockConfig}
        />
      )}

      {/* ── MODAL: CHOOSE SECTION TO ADD ── */}
      {showAddSectionModal && (
        <div
          className="adm-modal-overlay"
          style={{ zIndex: 9990 }}
          onClick={() => setShowAddSectionModal(false)}
        >
          <div
            className="adm-modal"
            style={{ maxWidth: 740, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                  Add / Insert Section to Homepage
                </h3>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  Choose a section template to insert onto the live homepage.
                </span>
              </div>
              <button
                onClick={() => setShowAddSectionModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 4 }}
              >
                <XIcon size={20} />
              </button>
            </div>

            <div style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Preset Storytelling Templates */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0e78a8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
                  Storytelling &amp; Visual Banners
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    {
                      title: "Custom Story (Right Photo)",
                      desc: "Headline, paragraphs & checklist on the left, high-res photo on the right.",
                      icon: <ColumnsIcon size={18} />,
                      preset: {
                        eyebrow: "Evidence-Based Therapy",
                        eyebrowColor: "#1c9fd8",
                        title: "State-of-the-Art Recovery Modalities",
                        subtitle: "Designed for your active recovery",
                        content: "Our Calgary clinics feature private treatment rooms and an active rehabilitation gym to provide the highest standard of one-on-one physiotherapy care.",
                        bullets: ["Private consultation rooms", "Advanced modalities: Shockwave & IMS", "Active exercise gym"],
                        image: "/images/clinic/reception-one.jpg",
                        imagePosition: "right",
                        background: "white"
                      }
                    },
                    {
                      title: "Custom Story (Left Photo)",
                      desc: "Photo on the left, clinical narrative and treatment checklist on the right.",
                      icon: <LayersIcon size={18} />,
                      preset: {
                        eyebrow: "Personalized Protocol",
                        eyebrowColor: "#10b981",
                        title: "Custom Rehabilitation Tailored to Your Goals",
                        subtitle: "Evidence-based therapy for lasting mobility",
                        content: "We create tailored rehabilitation milestones for your daily routine, whether returning to sports or daily work.",
                        bullets: ["Custom milestone tracking", "Ergonomic and postural guidance", "Direct insurance billing"],
                        image: "/images/clinic/reception-two.jpg",
                        imagePosition: "left",
                        background: "light"
                      }
                    },
                    {
                      title: "Dark Clinic Teal Banner",
                      desc: "High-contrast dark teal banner with bright lime bullets & white text.",
                      icon: <SparklesIcon size={18} />,
                      preset: {
                        eyebrow: "Why Nose Creek Physiotherapy",
                        eyebrowColor: "#8cc63f",
                        title: "Over 20+ Years Serving North & Northwest Calgary",
                        subtitle: "Trusted by thousands of Calgary families, athletes, and physicians",
                        content: "Since 2001, Nose Creek Physiotherapy has helped over 15,000 Calgarians overcome acute injuries and chronic limitations.",
                        bullets: ["545+ Five-Star Google Reviews across Calgary", "FCAMPT-certified orthopedic physiotherapists", "Open 7 days a week"],
                        imagePosition: "none",
                        background: "teal"
                      }
                    },
                    {
                      title: "Blank Custom Section",
                      desc: "Start fresh: configure your own text, photos, bullet highlights and theme.",
                      icon: <PlusIcon size={18} />,
                      preset: {
                        eyebrow: "Specialized Therapy",
                        eyebrowColor: "#1c9fd8",
                        title: "New Therapy Highlight",
                        subtitle: "Personalized clinical protocol",
                        content: "Add your clinical description and details here...",
                        bullets: ["Key feature highlight 1", "Key feature highlight 2"],
                        image: "/images/clinic/reception-three.jpg",
                        imagePosition: "right",
                        background: "white"
                      }
                    }
                  ].map((tpl, i) => (
                    <div
                      key={i}
                      onClick={() => handleAddSection("custom_story", tpl.preset)}
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
                        e.currentTarget.style.borderColor = "#1c9fd8";
                        e.currentTarget.style.boxShadow = "0 4px 14px rgba(28,159,216,0.12)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "none";
                      }}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {tpl.icon}
                      </div>
                      <div>
                        <strong style={{ fontSize: 13.5, color: "#1e293b", display: "block" }}>{tpl.title}</strong>
                        <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>{tpl.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Standard Built-in Sections */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
                  Standard Sections
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {Object.entries(homepageSectionDefs).map(([key, item]) => {
                    const isAlreadyPresent = currentOrder.includes(key);
                    const isHidden = hiddenSections.includes(key);

                    return (
                      <div
                        key={key}
                        onClick={() => handleAddSection(key)}
                        style={{
                          background: isAlreadyPresent && !isHidden ? "#f1f5f9" : "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 10,
                          padding: "12px 14px",
                          cursor: isAlreadyPresent && !isHidden ? "default" : "pointer",
                          opacity: isAlreadyPresent && !isHidden ? 0.6 : 1
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong style={{ fontSize: 13, color: "#1e293b" }}>{item.title}</strong>
                          {isAlreadyPresent && !isHidden ? (
                            <span style={{ fontSize: 11, color: "#64748b" }}>Added</span>
                          ) : (
                            <span style={{ fontSize: 11, color: "#0e78a8", fontWeight: 700 }}>+ Add</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
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

      {/* Live Preview Pane */}
      <LivePreviewPane
        url="/"
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Live Homepage Preview"
      />
    </div>
  );
}
