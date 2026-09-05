"use client";

import React, { useState, useEffect } from "react";
import { SectionBlockConfig } from "@/types/content";
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
    title: config?.title || "",
    eyebrow: config?.eyebrow || "",
    eyebrowColor: config?.eyebrowColor || "#1c9fd8",
    subtitle: config?.subtitle || "",
    content: config?.content || "",
    image: config?.image || "",
    imagePosition: config?.imagePosition || "none",
    background: config?.background || "white",
    align: config?.align || "left",
    ctaText: config?.ctaText || "",
    ctaHref: config?.ctaHref || "",
    bullets: config?.bullets || []
  });

  const [newBullet, setNewBullet] = useState("");
  const [pickerMode, setPickerMode] = useState<"cta" | "content" | null>(null);

  useEffect(() => {
    if (config) {
      setFormData({
        title: config.title || "",
        eyebrow: config.eyebrow || "",
        eyebrowColor: config.eyebrowColor || "#1c9fd8",
        subtitle: config.subtitle || "",
        content: config.content || "",
        image: config.image || "",
        imagePosition: config.imagePosition || (config.image ? "right" : "none"),
        background: config.background || "white",
        align: config.align || "left",
        ctaText: config.ctaText || "",
        ctaHref: config.ctaHref || "",
        bullets: config.bullets ? [...config.bullets] : []
      });
    } else {
      setFormData({
        title: "",
        eyebrow: "",
        eyebrowColor: "#1c9fd8",
        subtitle: "",
        content: "",
        image: "",
        imagePosition: "none",
        background: "white",
        align: "left",
        ctaText: "",
        ctaHref: "",
        bullets: []
      });
    }
  }, [config, sectionKey]);

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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave(formData);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 680,
          maxHeight: "90vh",
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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ padding: 8, background: "#e0f2fe", borderRadius: 8, color: "#0369a1", display: "flex" }}>
              <LayoutIcon size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                Edit Section: {sectionDefaultTitle}
              </h3>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {isMediaRichStory
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
            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 6, display: "flex" }}
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: "auto", padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
          
          {/* 1. Header & Typography */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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

          {/* Subtitle & Background Theme */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
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
          </div>

          {/* 2. Media & Layout Placement (ONLY shown for Storytelling & Clinical Overview) */}
          {isMediaRichStory && (
            <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontWeight: 700, fontSize: 13.5, color: "#1e293b" }}>
                <ImageIcon size={16} />
                <span>Side Photo &amp; Media Placement</span>
              </div>

              <AdminImageUploader
                label="Side Photo & Media"
                value={formData.image || ""}
                onChange={(url) => setFormData({ ...formData, image: url })}
                folder="homepage"
                placeholder="/images/clinic/reception-one.jpg"
                aspectRatioNote="Landscape 16:9 or 4:3 recommended"
                style={{ marginBottom: 14 }}
              />

              <div className="adm-form-group">
                <label className="adm-form-label">Image Layout Position</label>
                <select
                  className="adm-select"
                  value={formData.imagePosition || "none"}
                  onChange={(e) => setFormData({ ...formData, imagePosition: e.target.value as any })}
                >
                  <option value="none">No Image (Full Width Narrative)</option>
                  <option value="right">Right Column (Split 2-Column)</option>
                  <option value="left">Left Column (Split 2-Column)</option>
                  <option value="top">Top Banner (Above Content)</option>
                  <option value="bottom">Bottom Image (Below Content)</option>
                </select>
              </div>
            </div>
          )}

          {/* 3. Main Narrative Body Paragraphs (Shown on Story, Overview, or Bottom CTA) */}
          {(isMediaRichStory || isBottomCTA || isTestimonials) && (
            <div className="adm-form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label className="adm-form-label" style={{ margin: 0 }}>
                  {isBottomCTA ? "Banner Message / Call-to-Action Text" : "Narrative Content (Paragraphs)"}
                </label>
                <button
                  type="button"
                  onClick={() => setPickerMode("content")}
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
                  <span>+ Insert Internal Page Link</span>
                </button>
              </div>
              <textarea
                className="adm-textarea"
                style={{ minHeight: isBottomCTA ? 70 : 100 }}
                placeholder="Enter description for this section. Separate paragraphs with double enter..."
                value={formData.content || ""}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
          )}

          {/* 4. Bullets / List Items (Shown on Benefits, Symptoms, Roadmap, At-A-Glance, Stories) */}
          {(isListSection || isMediaRichStory) && (
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
                      <span style={{ color: "#334155" }}>
                        {isRoadmap ? `Step ${bIdx + 1}: ${b}` : `✓ ${b}`}
                      </span>
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

          {/* 5. Call to Action Button (Shown on Story, Overview, or Bottom CTA) */}
          {(isMediaRichStory || isBottomCTA) && (
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
                    <span>Pick Internal Page</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="E.g., /services/physiotherapy or /contact#booking"
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

        {/* Internal Link Picker Modal */}
        <InternalLinkPickerModal
          isOpen={pickerMode !== null}
          onClose={() => setPickerMode(null)}
          onSelect={(url, title) => {
            if (pickerMode === "cta") {
              setFormData((prev) => ({
                ...prev,
                ctaHref: url,
                ctaText: prev.ctaText || `Learn More About ${title}`
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
          modalTitle={pickerMode === "cta" ? "Select Button Destination Link" : "Insert Internal Link into Content"}
          allowCustomText={true}
        />
      </div>
    </div>
  );
}
