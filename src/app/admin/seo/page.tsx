"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/components/admin/RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { SiteSettings, PageMetaItem } from "@/types/content";
import settingsData from "@/data/settings.json";
import { getAllSiteRoutes, SiteRouteInfo } from "@/lib/seo";
import { GlobeIcon, SearchIcon } from "@/components/admin/AdminIcons";

export default function AdminSeoManagerPage() {
  const { role, isAdmin } = useRole();
  const [routes, setRoutes] = useState<SiteRouteInfo[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(settingsData as SiteSettings);
  const [customPages, setCustomPages] = useState<Record<string, PageMetaItem>>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PageMetaItem>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load all site routes and current SEO settings
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [allRoutes, fetchedSettings] = await Promise.all([
          getAllSiteRoutes(),
          (async () => {
            if (isSupabaseConfigured && supabase) {
              const { data } = await supabase.from("site_settings").select("*").eq("id", "main").single();
              if (data) {
                return {
                  ...(settingsData as SiteSettings),
                  ...data,
                  seo: data.seo || settingsData.seo
                } as SiteSettings;
              }
            }
            if (typeof window !== "undefined") {
              const local = localStorage.getItem("adm_settings");
              if (local) {
                try {
                  const p = JSON.parse(local);
                  return (p.settings || p) as SiteSettings;
                } catch {}
              }
            }
            return settingsData as SiteSettings;
          })()
        ]);

        setRoutes(allRoutes);
        setSettings(fetchedSettings);
        setCustomPages(fetchedSettings.seo?.pages || {});
      } catch (err) {
        console.error("Error loading SEO data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const categories = ["All", "Core Pages", "Clinical Services", "Conditions We Treat", "Blog Posts", "Team & Locations"];

  const filteredRoutes = routes.filter((r) => {
    const matchesCategory =
      activeCategory === "All" ||
      (activeCategory === "Team & Locations" ? r.category === "Team Members" || r.category === "Clinic Locations" : r.category === activeCategory);

    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.defaultTitle.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleOpenEdit = (route: SiteRouteInfo) => {
    const existing = customPages[route.path] || {};
    setEditingPath(route.path);
    setEditForm({
      title: existing.title || route.defaultTitle,
      description: existing.description || route.defaultDescription,
      canonicalUrl: existing.canonicalUrl || "",
      ogTitle: existing.ogTitle || existing.title || route.defaultTitle,
      ogDescription: existing.ogDescription || existing.description || route.defaultDescription,
      ogImage: existing.ogImage || route.defaultOgImage || settings.seo?.ogImage || "/images/og-home.jpg",
      keywords: existing.keywords || "",
      noIndex: existing.noIndex || false
    });
  };

  const handleSavePageMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPath) return;

    setSaving(true);
    setSaveStatus("Saving metadata...");

    const updatedPages = {
      ...customPages,
      [editingPath]: {
        ...editForm,
        title: editForm.title?.trim() || undefined,
        description: editForm.description?.trim() || undefined,
        canonicalUrl: editForm.canonicalUrl?.trim() || undefined,
        ogTitle: editForm.ogTitle?.trim() || undefined,
        ogDescription: editForm.ogDescription?.trim() || undefined,
        ogImage: editForm.ogImage?.trim() || undefined,
        keywords: editForm.keywords?.trim() || undefined
      }
    };

    const updatedSeo = {
      ...(settings.seo || {}),
      pages: updatedPages
    };

    const fullPayload = {
      ...settings,
      seo: updatedSeo
    };

    try {
      // 1. Supabase persistence
      if (isSupabaseConfigured && supabase) {
        await supabase.from("site_settings").upsert({
          id: "main",
          clinic_name: settings.clinicName,
          logo_text: settings.logoText,
          contact: settings.contact,
          opening_hours: settings.openingHours,
          social_links: settings.socialLinks,
          booking_url: settings.bookingUrl,
          primary_cta: settings.primaryCTA,
          footer_content: settings.footerContent,
          seo: updatedSeo
        });
      }

      // 2. Disk persistence via API route
      await fetch("/api/admin/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "settings", data: fullPayload })
      });

      // 3. Local storage & real-time broadcast
      if (typeof window !== "undefined") {
        try {
          const curLocal = localStorage.getItem("adm_settings");
          const parsed = curLocal ? JSON.parse(curLocal) : {};
          localStorage.setItem(
            "adm_settings",
            JSON.stringify({ ...parsed, ...fullPayload, settings: fullPayload })
          );
          window.dispatchEvent(new Event("settingsUpdated"));
        } catch {}
      }

      setSettings(fullPayload);
      setCustomPages(updatedPages);
      setSaveStatus(`✓ Successfully updated Meta Info for ${editingPath}!`);
      setEditingPath(null);
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveStatus(`⚠️ Error saving: ${err.message || "Failed to save"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = (path: string) => {
    const updatedPages = { ...customPages };
    delete updatedPages[path];
    setCustomPages(updatedPages);
    setEditForm({});
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e0f2fe", color: "#0369a1", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
            <span>🌐</span> Complete Website SEO Manager
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#0f172a", fontFamily: "var(--adm-font-display)" }}>
            SEO &amp; Meta Info Manager
          </h2>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0 0" }}>
            Customize the Meta Title, Meta Description, and Social Share previews for every page across the website. Newly created services or articles appear automatically.
          </p>
        </div>
      </div>

      {saveStatus && (
        <div style={{
          background: saveStatus.includes("✓") ? "#dcfce7" : "#fee2e2",
          color: saveStatus.includes("✓") ? "#15803d" : "#b91c1c",
          padding: "12px 18px",
          borderRadius: 10,
          marginBottom: 20,
          fontWeight: 600,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}>
          {saveStatus}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "16px 20px", marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {/* Category Tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {categories.map((cat) => {
              const count = routes.filter((r) =>
                cat === "All" ? true : cat === "Team & Locations" ? r.category === "Team Members" || r.category === "Clinic Locations" : r.category === cat
              ).length;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: "none",
                    background: isActive ? "var(--primary, #0e78a8)" : "#f1f5f9",
                    color: isActive ? "#ffffff" : "#475569",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <span>{cat}</span>
                  <span style={{
                    fontSize: 11,
                    padding: "1px 6px",
                    borderRadius: 999,
                    background: isActive ? "rgba(255,255,255,0.25)" : "#e2e8f0",
                    color: isActive ? "#ffffff" : "#64748b"
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ minWidth: 260, position: "relative" }}>
            <input
              type="text"
              placeholder="Search by page name, URL slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 34px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                fontSize: 13,
                outline: "none",
                background: "#f8fafc"
              }}
            />
            <span style={{ position: "absolute", left: 10, top: 9, color: "#94a3b8", pointerEvents: "none" }}>
              🔍
            </span>
          </div>
        </div>
      </div>

      {/* Pages Table */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#64748b" }}>
            <div style={{ display: "inline-block", width: 24, height: 24, border: "3px solid #0e78a8", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 12 }} />
            <div>Loading all website routes and SEO metadata...</div>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#64748b" }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>No matching pages found</p>
            <p style={{ margin: "4px 0 0 0", fontSize: 13 }}>Try adjusting your search query or category filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 700 }}>
                  <th style={{ padding: "12px 18px", width: "22%" }}>Page &amp; Route</th>
                  <th style={{ padding: "12px 18px", width: "28%" }}>Meta Title (Google Tab)</th>
                  <th style={{ padding: "12px 18px", width: "22%" }}>Meta Description</th>
                  <th style={{ padding: "12px 18px", width: "18%" }}>Canonical URL</th>
                  <th style={{ padding: "12px 18px", width: "8%", textAlign: "right", whiteSpace: "nowrap" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map((route, idx) => {
                  const custom = customPages[route.path];
                  const hasCustom = Boolean(custom?.title || custom?.description || custom?.canonicalUrl);
                  const activeTitle = custom?.title || route.defaultTitle;
                  const activeDesc = custom?.description || route.defaultDescription;
                  const hasCustomCanonical = Boolean(custom?.canonicalUrl);

                  return (
                    <tr
                      key={route.path}
                      style={{
                        borderBottom: idx < filteredRoutes.length - 1 ? "1px solid #f1f5f9" : "none",
                        background: hasCustom ? "#f0fdf4" : "transparent",
                        transition: "background 0.15s ease"
                      }}
                    >
                      {/* Page Info */}
                      <td style={{ padding: "14px 18px", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 13.5 }}>
                          {route.name}
                        </div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                          <code style={{ fontSize: 11.5, background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, color: "#0369a1" }}>
                            {route.path}
                          </code>
                          <a
                            href={route.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#64748b", textDecoration: "none", fontSize: 11 }}
                            title="Open live page in new tab"
                          >
                            ↗
                          </a>
                        </div>
                        <div style={{ marginTop: 6 }}>
                          <span style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: 999,
                            background: hasCustom ? "#dcfce7" : "#e2e8f0",
                            color: hasCustom ? "#15803d" : "#475569"
                          }}>
                            {hasCustom ? "✓ Custom Meta Set" : "Default"}
                          </span>
                        </div>
                      </td>

                      {/* Meta Title */}
                      <td style={{ padding: "14px 18px", verticalAlign: "top" }}>
                        <div style={{ color: "#0f172a", fontWeight: 600, lineHeight: 1.4 }}>
                          {activeTitle}
                        </div>
                        <div style={{ fontSize: 11, color: activeTitle.length > 60 ? "#d97706" : "#64748b", marginTop: 4 }}>
                          Length: {activeTitle.length} chars (Recommended: 50-60)
                        </div>
                      </td>

                      {/* Meta Description */}
                      <td style={{ padding: "14px 18px", verticalAlign: "top" }}>
                        <div style={{ color: "#475569", lineHeight: 1.4, fontSize: 12.5 }}>
                          {activeDesc}
                        </div>
                        <div style={{ fontSize: 11, color: activeDesc.length > 160 ? "#d97706" : "#64748b", marginTop: 4 }}>
                          Length: {activeDesc.length} chars (Recommended: 150-160)
                        </div>
                      </td>

                      {/* Canonical URL */}
                      <td style={{ padding: "14px 18px", verticalAlign: "top" }}>
                        {hasCustomCanonical ? (
                          <div>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                              <span>🎯 Target:</span> {custom.canonicalUrl}
                            </span>
                            <div style={{ fontSize: 10.5, color: "#b45309", marginTop: 4, fontWeight: 600 }}>
                              Points authority to target page
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                              <span>✨ Self-Canonical</span>
                            </span>
                            <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 4 }}>
                              Dynamic: current domain + {route.path}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 18px", verticalAlign: "top", textAlign: "right", whiteSpace: "nowrap" }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(route)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 8,
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            color: "#0f172a",
                            fontWeight: 700,
                            fontSize: 12.5,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5
                          }}
                        >
                          <span>✏️</span>
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Drawer Modal */}
      {editingPath && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            justifyContent: "flex-end",
            animation: "fadeIn 0.2s ease"
          }}
          onClick={() => setEditingPath(null)}
        >
          <div
            style={{
              width: "min(640px, 95vw)",
              height: "100%",
              background: "#ffffff",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              padding: "28px 24px"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 16, borderBottom: "1px solid #e2e8f0", marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Editing Page Metadata
                </span>
                <h3 style={{ margin: "2px 0 0 0", fontSize: 19, fontWeight: 800, color: "#0f172a" }}>
                  {editingPath}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPath(null)}
                style={{
                  border: "none",
                  background: "#f1f5f9",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#64748b"
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePageMeta} style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
              {/* Meta Title */}
              <div className="adm-form-group" style={{ margin: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label className="adm-form-label" style={{ margin: 0, fontWeight: 700 }}>
                    Meta Title (Browser Tab &amp; Google Result Title)
                  </label>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: (editForm.title || "").length > 60 ? "#d97706" : "#64748b" }}>
                    {(editForm.title || "").length} / 60 chars
                  </span>
                </div>
                <input
                  type="text"
                  className="adm-input"
                  value={editForm.title || ""}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="e.g. Expert Physiotherapy in Calgary North | Nose Creek"
                  required
                />
                <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                  Appears as the primary clickable headline in Google Search results.
                </span>
              </div>

              {/* Meta Description */}
              <div className="adm-form-group" style={{ margin: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label className="adm-form-label" style={{ margin: 0, fontWeight: 700 }}>
                    Meta Description
                  </label>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: (editForm.description || "").length > 160 ? "#d97706" : "#64748b" }}>
                    {(editForm.description || "").length} / 160 chars
                  </span>
                </div>
                <textarea
                  className="adm-input"
                  rows={4}
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Provide a compelling, concise 1-2 sentence summary of what patients will discover on this page..."
                  style={{ resize: "vertical" }}
                  required
                />
              </div>

              {/* Canonical URL & Duplicate Content Control */}
              <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label className="adm-form-label" style={{ margin: 0, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>🔗</span> Canonical URL (Self or Point to Another Page)
                  </label>
                  {editForm.canonicalUrl ? (
                    <span style={{ fontSize: 11, background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                      Custom Target Set
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, background: "#f0fdf4", color: "#166534", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                      Self-Canonical (Dynamic)
                    </span>
                  )}
                </div>

                <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px 0", lineHeight: 1.4 }}>
                  By default, this page is <strong>Self-Canonical</strong> (automatically resolves to its own live URL on whatever domain is loaded, including Vercel or your production domain). To make this page point authority to another primary page or external URL, select or type below:
                </p>

                {/* Quick Selector from existing site pages */}
                <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <select
                    className="adm-input"
                    style={{ fontSize: 12.5, flex: 1, minWidth: 200 }}
                    value={routes.some((r) => r.path === editForm.canonicalUrl) ? editForm.canonicalUrl : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditForm({ ...editForm, canonicalUrl: val });
                    }}
                  >
                    <option value="">-- Quick Select Target from Existing Pages --</option>
                    {routes
                      .filter((r) => r.path !== editingPath)
                      .map((r) => (
                        <option key={r.path} value={r.path}>
                          {r.path} — ({r.name})
                        </option>
                      ))}
                  </select>
                  {editForm.canonicalUrl && (
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, canonicalUrl: "" })}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#dc2626",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      ✕ Reset to Self-Canonical
                    </button>
                  )}
                </div>

                {/* Direct Custom Input */}
                <input
                  type="text"
                  className="adm-input"
                  value={editForm.canonicalUrl || ""}
                  onChange={(e) => setEditForm({ ...editForm, canonicalUrl: e.target.value })}
                  placeholder={`Leave empty for default self-canonical (${editingPath})`}
                  style={{ fontSize: 12.5 }}
                />
                <span style={{ fontSize: 11, color: "#64748b", marginTop: 6, display: "block" }}>
                  {editForm.canonicalUrl ? (
                    <span style={{ color: "#d97706", fontWeight: 600 }}>
                      ⚠️ Search engines will treat <strong>{editForm.canonicalUrl}</strong> as the master authoritative source for this page.
                    </span>
                  ) : (
                    <span style={{ color: "#15803d", fontWeight: 600 }}>
                      ✓ Currently Self-Canonical: Search engines will index this exact page URL directly.
                    </span>
                  )}
                </span>
              </div>

              {/* Keywords */}
              <div className="adm-form-group" style={{ margin: 0 }}>
                <label className="adm-form-label" style={{ fontWeight: 700 }}>
                  Target Keywords (Comma-separated)
                </label>
                <input
                  type="text"
                  className="adm-input"
                  value={editForm.keywords || ""}
                  onChange={(e) => setEditForm({ ...editForm, keywords: e.target.value })}
                  placeholder="e.g. physiotherapy calgary, back pain relief, dry needling"
                />
              </div>

              {/* Social / OpenGraph Title & Image */}
              <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 10 }}>
                  📱 Social Media Sharing Preview (Facebook / LinkedIn / X)
                </div>
                <div className="adm-form-group" style={{ margin: "0 0 10px 0" }}>
                  <label className="adm-form-label" style={{ fontSize: 11.5 }}>OG Share Image URL</label>
                  <input
                    type="text"
                    className="adm-input"
                    value={editForm.ogImage || ""}
                    onChange={(e) => setEditForm({ ...editForm, ogImage: e.target.value })}
                    placeholder="/images/og-home.jpg"
                    style={{ fontSize: 12 }}
                  />
                </div>
              </div>

              {/* Live Google Search Preview Box */}
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                  Google Search Snippet Preview
                </div>
                <div style={{ fontFamily: "arial, sans-serif" }}>
                  <div style={{ fontSize: 12, color: "#202124", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#5f6368" }}>
                      {(typeof window !== "undefined" ? window.location.origin : "https://nosecreek.vercel.app")}
                      {editForm.canonicalUrl ? editForm.canonicalUrl : editingPath}
                    </span>
                  </div>
                  <div style={{ fontSize: 18, color: "#1a0dab", textDecoration: "none", cursor: "pointer", marginTop: 3, fontWeight: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {editForm.title || "Page Title — Nose Creek Physiotherapy"}
                  </div>
                  <div style={{ fontSize: 13, color: "#4d5156", marginTop: 4, lineHeight: 1.4 }}>
                    {editForm.description || "Meta description snippet will appear here in search engine rankings..."}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 18, borderTop: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => handleResetToDefault(editingPath)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#dc2626",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline"
                  }}
                >
                  Reset to System Default
                </button>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setEditingPath(null)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#475569",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="adm-btn adm-btn-success"
                    style={{ padding: "10px 22px" }}
                  >
                    {saving ? "Saving..." : "💾 Save Page Meta"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
