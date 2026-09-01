"use client";

import React, { useState, useEffect } from "react";
import { ThemeColors, defaultTheme, themePresets } from "@/components/theme/ThemeApplier";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { PaletteIcon, CheckIcon, XIcon } from "./AdminIcons";

export default function ThemeCustomizerModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [colors, setColors] = useState<ThemeColors>(defaultTheme);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("site_theme_colors");
      if (saved) {
        try {
          setColors(JSON.parse(saved));
        } catch {
          // ignore
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (presetColors: ThemeColors) => {
    setColors(presetColors);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("site_theme_colors", JSON.stringify(colors));
        window.dispatchEvent(new Event("themeChanged"));
      }

      if (isSupabaseConfigured && supabase) {
        await supabase
          .from("site_settings")
          .update({ theme_colors: colors })
          .eq("id", "main");
      }

      alert("✓ Brand color theme saved and applied to entire website!");
      onClose();
    } catch (err) {
      console.error("Failed to save theme colors", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="adm-modal"
        style={{ maxWidth: 580 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adm-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ padding: 8, background: "#fdf4ff", borderRadius: 8, color: "#9333ea", display: "flex" }}>
              <PaletteIcon size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a" }}>
                Brand Color Theme Customizer
              </h3>
              <span style={{ fontSize: 12.5, color: "#64748b" }}>
                (Master Admin Only) Customize brand colors across all pages
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 4 }}
          >
            <XIcon size={20} />
          </button>
        </div>

        <div className="adm-modal-body">
          {/* Preset Palettes */}
          <div style={{ marginBottom: 20 }}>
            <label className="adm-form-label" style={{ marginBottom: 8, display: "block" }}>
              Quick Preset Color Palettes:
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {themePresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset.colors)}
                  style={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b" }}>{preset.name}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: preset.colors.primary }} />
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: preset.colors.secondary }} />
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: preset.colors.dark }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Pickers */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="adm-form-group">
              <label className="adm-form-label">Primary Brand Color</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="color"
                  value={colors.primary}
                  onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                  style={{ width: 42, height: 38, border: "none", borderRadius: 6, cursor: "pointer", padding: 0 }}
                />
                <input
                  type="text"
                  className="adm-input"
                  value={colors.primary}
                  onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                />
              </div>
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Secondary / Leaf Color</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="color"
                  value={colors.secondary}
                  onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                  style={{ width: 42, height: 38, border: "none", borderRadius: 6, cursor: "pointer", padding: 0 }}
                />
                <input
                  type="text"
                  className="adm-input"
                  value={colors.secondary}
                  onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                />
              </div>
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Dark / Header Theme Color</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="color"
                  value={colors.dark}
                  onChange={(e) => setColors({ ...colors, dark: e.target.value })}
                  style={{ width: 42, height: 38, border: "none", borderRadius: 6, cursor: "pointer", padding: 0 }}
                />
                <input
                  type="text"
                  className="adm-input"
                  value={colors.dark}
                  onChange={(e) => setColors({ ...colors, dark: e.target.value })}
                />
              </div>
            </div>

            <div className="adm-form-group">
              <label className="adm-form-label">Accent / Highlight Color</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="color"
                  value={colors.accent}
                  onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                  style={{ width: 42, height: 38, border: "none", borderRadius: 6, cursor: "pointer", padding: 0 }}
                />
                <input
                  type="text"
                  className="adm-input"
                  value={colors.accent}
                  onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Live Preview Sample */}
          <div style={{ marginTop: 14, background: colors.bgLight, border: "1px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Live Color Sample:</span>
            <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "center" }}>
              <div style={{ background: colors.primary, color: "#fff", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>
                Primary Button
              </div>
              <div style={{ background: colors.secondary, color: "#fff", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>
                Secondary Accent
              </div>
              <div style={{ background: colors.dark, color: "#fff", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>
                Dark Header
              </div>
            </div>
          </div>
        </div>

        <div className="adm-modal-footer">
          <button type="button" onClick={onClose} className="adm-btn adm-btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="adm-btn adm-btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CheckIcon size={16} />
            <span>{saving ? "Saving..." : "Save & Apply Color Theme"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
