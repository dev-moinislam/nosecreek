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
  SparklesIcon
} from "./AdminIcons";

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
    onSave(formData);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: 16
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
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
                Customize Block: {sectionDefaultTitle}
              </h3>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Adjust layout, side/banner image, background styling, and custom content.
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
        <form onSubmit={handleSubmit} style={{ overflowY: "auto", padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Section 1: Visual Layout & Image Placement */}
          <div style={{ background: "#f8fafc", padding: 18, borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontWeight: 700, fontSize: 13.5, color: "#1e293b" }}>
              <ImageIcon size={16} />
              <span>Media & Layout Position</span>
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Section Image URL</label>
              <input
                type="text"
                placeholder="E.g., /images/clinic/physiotherapy-hero.webp"
                className="adm-input"
                value={formData.image || ""}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>

            {formData.image && (
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14, padding: 10, background: "#fff", borderRadius: 8, border: "1px solid #cbd5e1" }}>
                <img
                  src={formData.image}
                  alt="Thumbnail"
                  style={{ width: 64, height: 48, objectFit: "cover", borderRadius: 6 }}
                  onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                />
                <div style={{ fontSize: 12, color: "#475569" }}>
                  <strong>Live Image Attached</strong> — Select position below.
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="adm-form-group">
                <label className="adm-form-label">Image Placement</label>
                <select
                  className="adm-select"
                  value={formData.imagePosition || "none"}
                  onChange={(e) => setFormData({ ...formData, imagePosition: e.target.value as any })}
                >
                  <option value="none">No Image (Full Width Content)</option>
                  <option value="left">Left Column (Split Layout)</option>
                  <option value="right">Right Column (Split Layout)</option>
                  <option value="top">Top Banner (Above Content)</option>
                  <option value="bottom">Bottom Image (Below Content)</option>
                </select>
              </div>

              <div className="adm-form-group">
                <label className="adm-form-label">Background Theme</label>
                <select
                  className="adm-select"
                  value={formData.background || "white"}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value as any })}
                >
                  <option value="white">Clean White (#ffffff)</option>
                  <option value="light">Soft Blue Slate (#f8fafc)</option>
                  <option value="teal">Dark Clinic Teal (#12303d)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Header Typography */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="adm-form-group">
              <label className="adm-form-label">Eyebrow Badge (Optional)</label>
              <input
                type="text"
                placeholder="E.g., Evidence-Based Clinical Care"
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

          <div className="adm-form-group">
            <label className="adm-form-label">Subtitle / Hook Line (Optional)</label>
            <input
              type="text"
              placeholder="E.g., Targeted rehabilitation protocols for long-term mobility"
              className="adm-input"
              value={formData.subtitle || ""}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            />
          </div>

          {/* Section 3: Content Body */}
          <div className="adm-form-group">
            <label className="adm-form-label">Main Content (Paragraphs)</label>
            <textarea
              className="adm-textarea"
              style={{ minHeight: 110 }}
              placeholder="Enter descriptive content for this section. Separate paragraphs with double enter..."
              value={formData.content || ""}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          {/* Section 4: Custom Bullets / Highlights */}
          <div style={{ background: "#f8fafc", padding: 18, borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <label className="adm-form-label" style={{ marginBottom: 8, display: "block" }}>
              Key Highlights &amp; Bullet Points
            </label>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Add a key highlight or checkmark bullet..."
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
                <span>Add</span>
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
                    <span style={{ color: "#334155" }}>✓ {b}</span>
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

          {/* Section 5: Call to Action Button */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="adm-form-group">
              <label className="adm-form-label">CTA Button Text (Optional)</label>
              <input
                type="text"
                placeholder="E.g., Book Assessment Online"
                className="adm-input"
                value={formData.ctaText || ""}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
              />
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">CTA Button URL / Link</label>
              <input
                type="text"
                placeholder="E.g., /contact or https://..."
                className="adm-input"
                value={formData.ctaHref || ""}
                onChange={(e) => setFormData({ ...formData, ctaHref: e.target.value })}
              />
            </div>
          </div>

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
              <span>Apply Block Settings</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
