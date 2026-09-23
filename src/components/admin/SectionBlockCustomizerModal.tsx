"use client";

import React, { useState, useEffect } from "react";
import { SectionBlockConfig, parseStepItem } from "@/types/content";
import {
  ImageIcon,
  LayoutIcon,
  SlidersIcon,
  CheckIcon,
  XIcon,
  PlusIcon,
  TrashIcon,
  SparklesIcon,
  LinkIcon
} from "./AdminIcons";
import AdminImageUploader from "./AdminImageUploader";
import InternalLinkPickerModal from "./InternalLinkPickerModal";
import RichTextEditor from "./RichTextEditor";

interface SectionBlockCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionKey: string;
  sectionDefaultTitle: string;
  config?: SectionBlockConfig;
  onSave: (updatedConfig: SectionBlockConfig) => void;
}

export default function SectionBlockCustomizerModal({
  isOpen,
  onClose,
  sectionKey,
  sectionDefaultTitle,
  config,
  onSave
}: SectionBlockCustomizerModalProps) {
  const [formData, setFormData] = useState<SectionBlockConfig>({
    title: config?.title || sectionDefaultTitle || "",
    eyebrow: config?.eyebrow || "",
    eyebrowColor: config?.eyebrowColor || "#1c9fd8",
    subtitle: config?.subtitle || "",
    content: config?.content || "",
    contentCol2: config?.contentCol2 || "",
    contentLayout: config?.contentLayout || (config?.contentCol2 ? "2-column" : "1-column"),
    image: config?.image || "",
    imagePosition: config?.imagePosition || "none",
    background: config?.background || "white",
    align: config?.align || "left",
    reverseMobileOrder: Boolean(config?.reverseMobileOrder || (config as any)?.reverse_mobile_order),
    ctaText: config?.ctaText || "",
    ctaHref: config?.ctaHref || "",
    bullets: config?.bullets || []
  });

  const [newBullet, setNewBullet] = useState("");
  const [newStepTitle, setNewStepTitle] = useState("");
  const [newStepDesc, setNewStepDesc] = useState("");
  const [editingStepIdx, setEditingStepIdx] = useState<number | null>(null);
  const [pickerMode, setPickerMode] = useState<"cta" | "content" | null>(null);

  useEffect(() => {
    if (config) {
      setFormData({
        title: config.title || sectionDefaultTitle || "",
        eyebrow: config.eyebrow || "",
        eyebrowColor: config.eyebrowColor || "#1c9fd8",
        subtitle: config.subtitle || "",
        content: config.content || "",
        contentCol2: config.contentCol2 || "",
        contentLayout: config.contentLayout || (config.contentCol2 ? "2-column" : "1-column"),
        image: config.image || "",
        imagePosition: config.imagePosition || (config.image ? "right" : "none"),
        background: config.background || "white",
        align: config.align || "left",
        reverseMobileOrder: Boolean(config.reverseMobileOrder || (config as any)?.reverse_mobile_order),
        ctaText: config.ctaText || "",
        ctaHref: config.ctaHref || "",
        bullets: config.bullets ? [...config.bullets] : []
      });
    } else {
      setFormData({
        title: sectionDefaultTitle || "",
        eyebrow: "",
        eyebrowColor: "#1c9fd8",
        subtitle: "",
        content: "",
        contentCol2: "",
        contentLayout: "1-column",
        image: "",
        imagePosition: "none",
        background: "white",
        align: "left",
        reverseMobileOrder: false,
        ctaText: "",
        ctaHref: "",
        bullets: []
      });
    }
  }, [config, sectionKey, sectionDefaultTitle]);

  if (!isOpen) return null;

  // Determine section capability profile
  const isCustomStory = sectionKey.startsWith("custom-") || sectionKey === "custom_sections";
  const isClinicalOverview = sectionKey === "clinical_overview";
  const isMediaRichStory = isCustomStory || isClinicalOverview;

  const isBenefits = sectionKey === "benefits";
  const isSymptoms = sectionKey === "symptoms";
  const isRoadmap = sectionKey === "treatment_approach";
  const isAtAGlance = sectionKey === "at_a_glance";
  const isListSection = isBenefits || isSymptoms || isRoadmap || isAtAGlance;

  const isTestimonials = sectionKey === "testimonials";
  const isBottomCTA = sectionKey === "bottom_cta";
  const isDecisionCTAs = sectionKey === "decision_ctas";
  const isHero = sectionKey === "hero";

  // Dynamic Bullet section header & placeholder
  const listLabel = isBenefits
    ? "Proven Clinical Benefits List"
    : isSymptoms
    ? "Targeted Symptoms & Conditions List"
    : isRoadmap
    ? "4-Step Recovery Journey Protocol Steps"
    : isAtAGlance
    ? "At-A-Glance Highlight Feature Cards"
    : "Key Highlights & Checkmark Bullet Points";

  const listPlaceholder = isBenefits
    ? "Add benefit (e.g., Joint mobility restoration & pain relief)..."
    : isSymptoms
    ? "Add symptom (e.g., Sciatica nerve radiating pain down the leg)..."
    : isRoadmap
    ? "Add step (e.g., Step 1: Comprehensive physical mobility evaluation)..."
    : isAtAGlance
    ? "Add highlight (e.g., Direct Insurance Billing)..."
    : "Add key highlight point...";

  const handleAddBullet = () => {
    if (!newBullet.trim()) return;
    setFormData({
      ...formData,
      bullets: [...(formData.bullets || []), newBullet.trim()]
    });
    setNewBullet("");
  };

  const handleRemoveBullet = (idx: number) => {
    const updated = (formData.bullets || []).filter((_, i) => i !== idx);
    setFormData({ ...formData, bullets: updated });
    if (editingStepIdx === idx) {
      setEditingStepIdx(null);
      setNewStepTitle("");
      setNewStepDesc("");
    }
  };

  const handleSaveStep = () => {
    if (!newStepTitle.trim() && !newStepDesc.trim()) return;
    const formatted = newStepTitle.trim()
      ? (newStepDesc.trim() ? `${newStepTitle.trim()}: ${newStepDesc.trim()}` : newStepTitle.trim())
      : newStepDesc.trim();

    if (editingStepIdx !== null && editingStepIdx >= 0) {
      const updated = [...(formData.bullets || [])];
      updated[editingStepIdx] = formatted;
      setFormData({ ...formData, bullets: updated });
      setEditingStepIdx(null);
    } else {
      setFormData({
        ...formData,
        bullets: [...(formData.bullets || []), formatted]
      });
    }
    setNewStepTitle("");
    setNewStepDesc("");
  };

  const handleStartEditStep = (idx: number) => {
    const raw = (formData.bullets || [])[idx];
    const parsed = parseStepItem(raw, idx);
    setNewStepTitle(parsed.title);
    setNewStepDesc(parsed.description);
    setEditingStepIdx(idx);
  };

  const handleCancelEditStep = () => {
    setNewStepTitle("");
    setNewStepDesc("");
    setEditingStepIdx(null);
  };

  const handleLoadDefaultSteps = () => {
    const defaultSteps = [
      "Initial Comprehensive Assessment: A thorough evaluation of your symptoms, posture, joint mechanics, and functional mobility.",
      "Targeted Pain Relief & Manual Therapy: Hands-on joint mobilization, myofascial release, and modalities to alleviate discomfort quickly.",
      "Active Rehabilitation & Strengthening: Personalized therapeutic exercises to rebuild core strength, stability, and biomechanical resilience.",
      "Long-Term Prevention & Performance: Ergonomic guidance, home exercise regimens, and maintenance plans to ensure lasting recovery."
    ];
    setFormData({ ...formData, bullets: defaultSteps });
  };

  const renderBulletText = (b: string, bIdx: number) => {
    const prefix = `✓ `;
    const match = b.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (!match) {
      return (
        <span style={{ color: "#334155" }}>
          {prefix}{b}
        </span>
      );
    }
    const isInternal =
      match[2].startsWith("/") ||
      match[2].startsWith("#") ||
      match[2].includes("nosecreekphysiotherapy.com");
    const before = b.substring(0, match.index);
    const after = b.substring(match.index! + match[0].length);

    return (
      <span style={{ color: "#334155", display: "inline-flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
        <span>{prefix}{before}</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "1px 6px",
            borderRadius: 6,
            background: isInternal ? "#e0f2fe" : "#dcfce7",
            border: `1px solid ${isInternal ? "#bae6fd" : "#bbf7d0"}`,
            color: isInternal ? "#0369a1" : "#15803d",
            fontWeight: 700,
            fontSize: "0.92em"
          }}
        >
          <span>{isInternal ? "🌐" : "🔗"}</span>
          <span>[{match[1]}]</span>
          <code style={{ fontSize: "0.85em", opacity: 0.85 }}>({match[2]})</code>
        </span>
        <span>{after}</span>
      </span>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave(formData);
    onClose();
  };

  return (
    <div
      className="adm-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="adm-modal wide"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 720,
          maxHeight: "92vh",
          backgroundColor: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "'Inter', sans-serif"
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#f8fafc"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, marginRight: 16 }}>
            <div style={{ padding: 8, background: "#e0f2fe", borderRadius: 8, color: "#0369a1", display: "flex", flexShrink: 0 }}>
              <LayoutIcon size={18} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", rowGap: 4 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>
                  Edit Section: {sectionDefaultTitle}
                </h3>
                <span
                  style={{
                    background: "#ecfdf5",
                    color: "#059669",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 12,
                    border: "1px solid #a7f3d0",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center"
                  }}
                >
                  ✓ Live Frontend Synced
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                {isTestimonials
                  ? "Manage title, subtitle hook, and container background style."
                  : isMediaRichStory
                  ? "Customize text, side photo, placement, and bullet points."
                  : isListSection
                  ? "Manage section title, theme background, and item points."
                  : isBottomCTA || isDecisionCTAs
                  ? "Customize booking action headlines, copy, and buttons."
                  : "Customize titles, eyebrow badge, and background theme."}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 6, display: "flex", flexShrink: 0 }}
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: "auto", padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
          
          {/* Friendly Note for Testimonials & Google Reviews */}
          {isTestimonials && (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 10,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 13,
                color: "#166534",
                lineHeight: 1.5
              }}
            >
              <span style={{ fontSize: 20 }}>⭐</span>
              <div>
                <strong>Dynamic Reviews Feed:</strong> Patient testimonials and Google 5-star ratings are automatically loaded from your reviews database. You can customize the Section Title, Subtitle, and Background theme below.
              </div>
            </div>
          )}

          {/* 1. Header & Typography */}
          <div style={{ display: "grid", gridTemplateColumns: isTestimonials ? "1fr" : "1fr 1fr", gap: 14 }}>
            {!isTestimonials && (
              <div className="adm-form-group">
                <label className="adm-form-label">Eyebrow Badge (Optional)</label>
                <input
                  type="text"
                  placeholder="E.g., Proven Clinical Protocol"
                  className="adm-input"
                  value={formData.eyebrow || ""}
                  onChange={(e) => setFormData({ ...formData, eyebrow: e.target.value })}
                />
              </div>
            )}

            <div className="adm-form-group">
              <label className="adm-form-label">Custom Section Title</label>
              <input
                type="text"
                placeholder={sectionDefaultTitle}
                className="adm-input"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
          </div>

          {/* Subtitle, Background Theme & Content Alignment */}
          <div style={{ display: "grid", gridTemplateColumns: isTestimonials ? "1fr 1fr" : "1.2fr 1fr 1fr", gap: 14 }}>
            <div className="adm-form-group">
              <label className="adm-form-label">Subtitle / Hook Line (Optional)</label>
              <input
                type="text"
                placeholder="E.g., Personalized care to restore lasting mobility"
                className="adm-input"
                value={formData.subtitle || ""}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Background Style</label>
              <select
                className="adm-select"
                value={formData.background || "white"}
                onChange={(e) => setFormData({ ...formData, background: e.target.value as any })}
              >
                <option value="white">Clean White (#ffffff)</option>
                <option value="light">Soft Light Slate (#f8fafc)</option>
                <option value="teal">Dark Clinic Teal (#12303d)</option>
              </select>
            </div>

            {!isTestimonials && (
              <div className="adm-form-group">
                <label className="adm-form-label">Content Alignment</label>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, align: "left" })}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      borderRadius: 6,
                      border: "1px solid",
                      borderColor: (formData.align || "left") === "left" ? "#0284c7" : "#cbd5e1",
                      background: (formData.align || "left") === "left" ? "#f0f9ff" : "#ffffff",
                      color: (formData.align || "left") === "left" ? "#0284c7" : "#64748b",
                      fontWeight: 700,
                      fontSize: 12.5,
                      cursor: "pointer"
                    }}
                    title="Left align content"
                  >
                    ⬅️ Left
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, align: "center" })}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      borderRadius: 6,
                      border: "1px solid",
                      borderColor: formData.align === "center" ? "#0284c7" : "#cbd5e1",
                      background: formData.align === "center" ? "#f0f9ff" : "#ffffff",
                      color: formData.align === "center" ? "#0284c7" : "#64748b",
                      fontWeight: 700,
                      fontSize: 12.5,
                      cursor: "pointer"
                    }}
                    title="Center align all content"
                  >
                    ↔️ Center
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Media & Layout Placement (ONLY shown for Storytelling & Clinical Overview) */}
          {isMediaRichStory && (
            <div style={{ background: "#f8fafc", padding: 18, borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13.5, color: "#1e293b" }}>
                  <ImageIcon size={16} />
                  <span>Section Columns &amp; Media Layout</span>
                </div>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Choose 1-column, 2-column text, or text + photo
                </span>
              </div>

              {/* 4 Quick Layout Mode Presets */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 14 }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, contentLayout: "1-column", imagePosition: "none" })}
                  style={{
                    padding: "9px 10px",
                    borderRadius: 8,
                    border: "1px solid",
                    borderColor: formData.contentLayout !== "2-column" && (formData.imagePosition === "none" || !formData.imagePosition) ? "#0284c7" : "#cbd5e1",
                    background: formData.contentLayout !== "2-column" && (formData.imagePosition === "none" || !formData.imagePosition) ? "#f0f9ff" : "#ffffff",
                    color: formData.contentLayout !== "2-column" && (formData.imagePosition === "none" || !formData.imagePosition) ? "#0284c7" : "#334155",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "center"
                  }}
                >
                  <div>📄 1-Col Text Only</div>
                  <div style={{ fontSize: 10.5, fontWeight: 500, color: "#64748b", marginTop: 2 }}>No Photo</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, contentLayout: "2-column", imagePosition: "none" })}
                  style={{
                    padding: "9px 10px",
                    borderRadius: 8,
                    border: "1px solid",
                    borderColor: formData.contentLayout === "2-column" && formData.imagePosition === "none" ? "#0284c7" : "#cbd5e1",
                    background: formData.contentLayout === "2-column" && formData.imagePosition === "none" ? "#f0f9ff" : "#ffffff",
                    color: formData.contentLayout === "2-column" && formData.imagePosition === "none" ? "#0284c7" : "#334155",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "center"
                  }}
                >
                  <div>📰 2-Col Text + Text</div>
                  <div style={{ fontSize: 10.5, fontWeight: 500, color: "#64748b", marginTop: 2 }}>Side-by-Side (No Photo)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, contentLayout: "1-column", imagePosition: "right" })}
                  style={{
                    padding: "9px 10px",
                    borderRadius: 8,
                    border: "1px solid",
                    borderColor: formData.imagePosition === "right" ? "#0284c7" : "#cbd5e1",
                    background: formData.imagePosition === "right" ? "#f0f9ff" : "#ffffff",
                    color: formData.imagePosition === "right" ? "#0284c7" : "#334155",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "center"
                  }}
                >
                  <div>🖼️ Text + Right Photo</div>
                  <div style={{ fontSize: 10.5, fontWeight: 500, color: "#64748b", marginTop: 2 }}>2-Col Split</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, contentLayout: "1-column", imagePosition: "left" })}
                  style={{
                    padding: "9px 10px",
                    borderRadius: 8,
                    border: "1px solid",
                    borderColor: formData.imagePosition === "left" ? "#0284c7" : "#cbd5e1",
                    background: formData.imagePosition === "left" ? "#f0f9ff" : "#ffffff",
                    color: formData.imagePosition === "left" ? "#0284c7" : "#334155",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "center"
                  }}
                >
                  <div>🖼️ Left Photo + Text</div>
                  <div style={{ fontSize: 10.5, fontWeight: 500, color: "#64748b", marginTop: 2 }}>2-Col Split</div>
                </button>
              </div>

              {/* Photo Upload area (when image position is not none) */}
              {formData.imagePosition && formData.imagePosition !== "none" ? (
                <div>
                  <AdminImageUploader
                    label="Side Photo & Media"
                    value={formData.image || ""}
                    altValue={formData.imageAlt || ""}
                    onAltChange={(alt) => setFormData({ ...formData, imageAlt: alt })}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                    folder="homepage"
                    placeholder="/images/clinic/reception-one.jpg"
                    aspectRatioNote="Landscape 16:9 or 4:3 recommended"
                    style={{ marginBottom: 14 }}
                  />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "center" }}>
                    <div className="adm-form-group">
                      <label className="adm-form-label">Image Placement Position</label>
                      <select
                        className="adm-select"
                        value={formData.imagePosition || "none"}
                        onChange={(e) => setFormData({ ...formData, imagePosition: e.target.value as any })}
                      >
                        <option value="right">Right Column (Split 2-Column)</option>
                        <option value="left">Left Column (Split 2-Column)</option>
                        <option value="top">Top Banner (Above Content)</option>
                        <option value="bottom">Bottom Image (Below Content)</option>
                        <option value="none">No Image (Text Only)</option>
                      </select>
                    </div>

                    {/* Mobile Reverse Stacking Control */}
                    {(formData.imagePosition === "left" || formData.imagePosition === "right") && (
                      <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", marginTop: 6 }}>
                        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={Boolean(formData.reverseMobileOrder)}
                            onChange={(e) => setFormData({ ...formData, reverseMobileOrder: e.target.checked })}
                            style={{ marginTop: 3, width: 16, height: 16 }}
                          />
                          <div>
                            <strong style={{ fontSize: 12.5, color: "#1e293b", display: "block" }}>
                              🔄 Reverse Stack on Mobile
                            </strong>
                            <span style={{ fontSize: 11.5, color: "#64748b", lineHeight: 1.3, display: "block" }}>
                              {formData.imagePosition === "left"
                                ? "Shows Text first & Image below on phones (prevents 2 images in a row)."
                                : "Shows Image first & Text below on phones."}
                            </span>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              ) : formData.contentLayout === "2-column" ? (
                <div style={{ padding: "12px 14px", background: "#e0f2fe", borderRadius: 8, border: "1px solid #bae6fd", fontSize: 12.5, color: "#0369a1", lineHeight: 1.5 }}>
                  📰 <strong>2-Column Text Mode Active:</strong> Content displays in two side-by-side narrative text columns without needing an image. Both Column 1 and Column 2 editors are available below.
                </div>
              ) : (
                <div style={{ padding: "12px 14px", background: "#f1f5f9", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12.5, color: "#64748b", lineHeight: 1.5 }}>
                  📄 <strong>1-Column Full Width Narrative Mode:</strong> Text content spans the reading container. You can add bullets and CTA buttons below.
                </div>
              )}
            </div>
          )}

          {/* 3. Main Narrative Body Paragraphs & Multi-Column Rich Text Editor */}
          {(isMediaRichStory || isBottomCTA || isDecisionCTAs || isHero) && (
            <div className="adm-form-group" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              
              {/* Layout Switcher (Only for Storytelling & Overview) */}
              {isMediaRichStory && (
                <div
                  style={{
                    background: "#f1f5f9",
                    padding: "10px 14px",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid #e2e8f0"
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 13, color: "#1e293b", display: "block" }}>
                      Narrative Columns Layout
                    </strong>
                    <span style={{ fontSize: 11.5, color: "#64748b" }}>
                      Choose between standard 1-column or side-by-side 2-column rich text
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, contentLayout: "1-column" })}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid",
                        borderColor: formData.contentLayout !== "2-column" ? "#0284c7" : "#cbd5e1",
                        background: formData.contentLayout !== "2-column" ? "#ffffff" : "transparent",
                        color: formData.contentLayout !== "2-column" ? "#0284c7" : "#64748b",
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: "pointer"
                      }}
                    >
                      1 Column (Standard)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, contentLayout: "2-column" })}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid",
                        borderColor: formData.contentLayout === "2-column" ? "#0284c7" : "#cbd5e1",
                        background: formData.contentLayout === "2-column" ? "#ffffff" : "transparent",
                        color: formData.contentLayout === "2-column" ? "#0284c7" : "#64748b",
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: "pointer"
                      }}
                    >
                      2 Columns (Side-by-Side)
                    </button>
                  </div>
                </div>
              )}

              {/* Column 1 Editor */}
              <div>
                <label className="adm-form-label" style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>
                    {isHero
                      ? "Hero Intro Subheading / Description"
                      : isDecisionCTAs
                      ? "Call-to-Action Subtitle / Description"
                      : isBottomCTA
                      ? "Banner Message / Call-to-Action Text"
                      : formData.contentLayout === "2-column"
                      ? "Column 1: Main Narrative Content (Rich Text)"
                      : "Narrative Content (Rich Text Paragraphs)"}
                  </span>
                  <span style={{ fontSize: 11, color: "#0284c7", fontWeight: 700 }}>
                    [H2–H6, Bullets, Center/Left, Bold, Links]
                  </span>
                </label>
                <RichTextEditor
                  value={formData.content || ""}
                  onChange={(val) => setFormData({ ...formData, content: val })}
                  minHeight={isBottomCTA ? 90 : 150}
                  placeholder="Enter narrative text. Use toolbar for headings, bullet points, text alignment, bold, or links..."
                />
              </div>

              {/* Column 2 Editor (Shown only if 2-Column layout selected) */}
              {isMediaRichStory && formData.contentLayout === "2-column" && (
                <div style={{ marginTop: 6 }}>
                  <label className="adm-form-label" style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>Column 2: Secondary Narrative Content (Rich Text)</span>
                    <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>
                      [Independent H2–H6, Bullets, Center/Left, Bold, Links]
                    </span>
                  </label>
                  <RichTextEditor
                    value={formData.contentCol2 || ""}
                    onChange={(val) => setFormData({ ...formData, contentCol2: val })}
                    minHeight={150}
                    placeholder="Enter secondary column narrative. Use toolbar for headings, bullet points, text alignment, bold, or links..."
                  />
                </div>
              )}

            </div>
          )}

          {/* 4a. Special Step-by-Step Protocol Editor (When isRoadmap) */}
          {isRoadmap && (
            <div style={{ background: "#f8fafc", padding: 18, borderRadius: 12, border: "1px solid #cbd5e1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <label className="adm-form-label" style={{ marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 16 }}>🔢</span>
                    <span>Patient Care Journey Protocol (Step Title = &lt;h3&gt; Heading)</span>
                  </label>
                  <p style={{ margin: 0, fontSize: 12.5, color: "#64748b" }}>
                    Each recovery step has its own title and description. <strong>The Step Title acts as the semantic &lt;h3&gt; heading</strong> on your live website for optimal SEO and patient readability.
                  </p>
                </div>
                {(!formData.bullets || formData.bullets.length === 0) && (
                  <button
                    type="button"
                    onClick={handleLoadDefaultSteps}
                    className="adm-btn adm-btn-secondary adm-btn-xs"
                    style={{ whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <SparklesIcon size={13} />
                    <span>Load 4-Step Template</span>
                  </button>
                )}
              </div>

              {/* Add / Edit Step Inputs */}
              <div style={{ background: "#ffffff", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: editingStepIdx !== null ? "#d97706" : "#0e78a8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {editingStepIdx !== null ? `Editing Step ${editingStepIdx + 1}` : "Add New Recovery Step"}
                  </span>
                  {editingStepIdx !== null && (
                    <button
                      type="button"
                      onClick={handleCancelEditStep}
                      style={{ fontSize: 11.5, color: "#64748b", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                    Step Title <span style={{ color: "#0284c7", fontWeight: 700 }}>(Renders as &lt;h3&gt; Heading tag)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., Comprehensive Orthopaedic Assessment"
                    className="adm-input"
                    style={{ fontSize: 13.5, fontWeight: 600 }}
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSaveStep(); } }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                    Step Description <span style={{ color: "#64748b" }}>(Paragraph text below heading)</span>
                  </label>
                  <textarea
                    placeholder="E.g., Detailed clinical examination of joint mobility, pain triggers, posture, and nerve sensitivity to determine the root cause..."
                    className="adm-textarea"
                    rows={2}
                    style={{ fontSize: 13, resize: "vertical" }}
                    value={newStepDesc}
                    onChange={(e) => setNewStepDesc(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={handleSaveStep}
                    className="adm-btn adm-btn-primary adm-btn-sm"
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    {editingStepIdx !== null ? <CheckIcon size={14} /> : <PlusIcon size={14} />}
                    <span>{editingStepIdx !== null ? "Update Step" : "Add Step to Protocol"}</span>
                  </button>
                </div>
              </div>

              {/* Current Steps List */}
              {formData.bullets && formData.bullets.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {formData.bullets.map((b, bIdx) => {
                    const parsed = parseStepItem(b, bIdx);
                    return (
                      <div
                        key={bIdx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 12,
                          padding: "12px 14px",
                          background: editingStepIdx === bIdx ? "#fffbeb" : "#fff",
                          borderRadius: 8,
                          border: editingStepIdx === bIdx ? "2px solid #f59e0b" : "1px solid #e2e8f0",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1 }}>
                          <span
                            style={{
                              background: "#6faf1c",
                              color: "#fff",
                              fontWeight: 800,
                              fontSize: 12,
                              padding: "3px 8px",
                              borderRadius: 6,
                              whiteSpace: "nowrap",
                              marginTop: 2
                            }}
                          >
                            Step {parsed.stepNum}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#0369a1", background: "#e0f2fe", padding: "1px 5px", borderRadius: 4 }}>
                                &lt;h3&gt;
                              </span>
                              <strong style={{ fontSize: 14, color: "#1e293b", fontFamily: "'Poppins', sans-serif" }}>
                                {parsed.title}
                              </strong>
                            </div>
                            {parsed.description && (
                              <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                                {parsed.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => handleStartEditStep(bIdx)}
                            className="adm-btn adm-btn-secondary adm-btn-xs"
                            style={{ padding: "4px 8px", fontSize: 11.5 }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveBullet(bIdx)}
                            style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}
                            title="Delete step"
                          >
                            <TrashIcon size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 4b. Bullets / List Items (Shown on Benefits, Symptoms, At-A-Glance, Stories - when NOT isRoadmap) */}
          {(isListSection || isMediaRichStory) && !isRoadmap && (
            <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <label className="adm-form-label" style={{ marginBottom: 8, display: "block" }}>
                {listLabel}
              </label>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                  type="text"
                  placeholder={listPlaceholder}
                  className="adm-input"
                  value={newBullet}
                  onChange={(e) => setNewBullet(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddBullet(); } }}
                />
                <button
                  type="button"
                  onClick={handleAddBullet}
                  className="adm-btn adm-btn-primary adm-btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
                >
                  <PlusIcon size={14} />
                  <span>Add Item</span>
                </button>
              </div>

              {formData.bullets && formData.bullets.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {formData.bullets.map((b, bIdx) => (
                    <div
                      key={bIdx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 12px",
                        background: "#fff",
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                        fontSize: 13.5
                      }}
                    >
                      {renderBulletText(b, bIdx)}
                      <button
                        type="button"
                        onClick={() => handleRemoveBullet(bIdx)}
                        style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. Call to Action Button (Shown on Story, Overview, Hero, Decision CTAs, or Bottom CTA) */}
          {(isMediaRichStory || isBottomCTA || isDecisionCTAs || isHero) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="adm-form-group">
                <label className="adm-form-label">Button Text (Optional)</label>
                <input
                  type="text"
                  placeholder="E.g., Book Assessment Online"
                  className="adm-input"
                  value={formData.ctaText || ""}
                  onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                />
              </div>
              <div className="adm-form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label className="adm-form-label" style={{ margin: 0 }}>Button URL / Link</label>
                  <button
                    type="button"
                    onClick={() => setPickerMode("cta")}
                    style={{
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: 6,
                      padding: "3px 8px",
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "#0369a1",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    <LinkIcon size={12} />
                    <span>🔗 Pick Link (Internal / External)</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="E.g., /services/physiotherapy or https://example.com"
                  className="adm-input"
                  value={formData.ctaHref || ""}
                  onChange={(e) => setFormData({ ...formData, ctaHref: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              paddingTop: 16,
              borderTop: "1px solid #e2e8f0"
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="adm-btn adm-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="adm-btn adm-btn-primary"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <CheckIcon size={16} />
              <span>Save Block Settings</span>
            </button>
          </div>
        </form>

        {/* Universal Link Picker Modal (Internal & External) */}
        <InternalLinkPickerModal
          isOpen={pickerMode !== null}
          onClose={() => setPickerMode(null)}
          onSelect={(url, title, _item, options) => {
            if (pickerMode === "cta") {
              setFormData((prev) => ({
                ...prev,
                ctaHref: url,
                ctaText: prev.ctaText || (options?.isExternal ? title : `Learn More About ${title}`)
              }));
            } else if (pickerMode === "content") {
              setFormData((prev) => ({
                ...prev,
                content: prev.content
                  ? `${prev.content} [${title}](${url})`
                  : `[${title}](${url})`
              }));
            }
            setPickerMode(null);
          }}
          initialUrl={formData.ctaHref || ""}
          modalTitle={pickerMode === "cta" ? "Select Button Destination Link" : "Insert Link into Content"}
          allowCustomText={true}
        />
      </div>
    </div>
  );
}
