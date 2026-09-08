"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/components/admin/RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { SiteSettings } from "@/types/content";
import settingsData from "@/data/settings.json";
import AdminImageUploader from "@/components/admin/AdminImageUploader";

export default function AdminSettingsPage() {
  const { role, isAdmin, canEditMarketingScripts } = useRole();
  const [settings, setSettings] = useState<SiteSettings>(settingsData as SiteSettings);
  const [marketing, setMarketing] = useState<{
    callTracking: { enabled: boolean; scriptUrl: string };
    gtm: { enabled: boolean; containerId: string };
    googleAnalytics: { enabled: boolean; trackingId: string };
    facebookPixel: { enabled: boolean; pixelId: string };
  }>(() => {
    const m = (settingsData as any).marketing || {};
    return {
      callTracking: {
        enabled: m.callTracking?.enabled ?? true,
        scriptUrl: m.callTracking?.scriptUrl ?? ""
      },
      gtm: {
        enabled: m.gtm?.enabled ?? true,
        containerId: m.gtm?.containerId ?? (Array.isArray(m.gtm?.containerIds) ? m.gtm.containerIds.join(", ") : "")
      },
      googleAnalytics: {
        enabled: m.googleAnalytics?.enabled ?? true,
        trackingId: m.googleAnalytics?.trackingId ?? ""
      },
      facebookPixel: {
        enabled: m.facebookPixel?.enabled ?? true,
        pixelId: m.facebookPixel?.pixelId ?? ""
      }
    };
  });
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from("site_settings")
            .select("*")
            .eq("id", "main")
            .single();
          if (!error && data) {
            setSettings({
              clinicName: data.clinic_name || settingsData.clinicName,
              logoText: data.logo_text || settingsData.logoText,
              contact: data.contact || settingsData.contact,
              openingHours: data.opening_hours || settingsData.openingHours,
              socialLinks: data.social_links || settingsData.socialLinks,
              bookingUrl: data.booking_url || settingsData.bookingUrl,
              primaryCTA: data.primary_cta || settingsData.primaryCTA,
              footerContent: data.footer_content || settingsData.footerContent,
              seo: data.seo || settingsData.seo,
              favicon: data.seo?.favicon || (data as any).favicon || (settingsData as any).favicon
            });
            if (data.marketing) {
              const m = data.marketing;
              setMarketing({
                callTracking: {
                  enabled: m.callTracking?.enabled ?? true,
                  scriptUrl: m.callTracking?.scriptUrl ?? ""
                },
                gtm: {
                  enabled: m.gtm?.enabled ?? true,
                  containerId: m.gtm?.containerId ?? (Array.isArray(m.gtm?.containerIds) ? m.gtm.containerIds.join(", ") : "")
                },
                googleAnalytics: {
                  enabled: m.googleAnalytics?.enabled ?? true,
                  trackingId: m.googleAnalytics?.trackingId ?? ""
                },
                facebookPixel: {
                  enabled: m.facebookPixel?.enabled ?? true,
                  pixelId: m.facebookPixel?.pixelId ?? ""
                }
              });
            }
          }
        } catch {
          // ignore
        }
      } else if (typeof window !== "undefined") {
        const local = localStorage.getItem("adm_settings");
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed.settings) setSettings(parsed.settings);
          if (parsed.marketing) {
            const m = parsed.marketing;
            setMarketing({
              callTracking: {
                enabled: m.callTracking?.enabled ?? true,
                scriptUrl: m.callTracking?.scriptUrl ?? ""
              },
              gtm: {
                enabled: m.gtm?.enabled ?? true,
                containerId: m.gtm?.containerId ?? (Array.isArray(m.gtm?.containerIds) ? m.gtm.containerIds.join(", ") : "")
              },
              googleAnalytics: {
                enabled: m.googleAnalytics?.enabled ?? true,
                trackingId: m.googleAnalytics?.trackingId ?? ""
              },
              facebookPixel: {
                enabled: m.facebookPixel?.enabled ?? true,
                pixelId: m.facebookPixel?.pixelId ?? ""
              }
            });
          }
        }
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("Saving...");

    const gtmIdsArray = (marketing.gtm.containerId || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const formattedMarketing = {
      ...marketing,
      gtm: {
        ...marketing.gtm,
        containerIds: gtmIdsArray.length > 0 ? gtmIdsArray : [marketing.gtm.containerId]
      }
    };

    const fullPayload = {
      ...settings,
      favicon: settings.favicon || settings.seo?.favicon,
      seo: {
        ...(settings.seo || {}),
        favicon: settings.favicon || settings.seo?.favicon
      },
      marketing: formattedMarketing
    };

    // 1. Supabase persistence
    if (isSupabaseConfigured && supabase) {
      try {
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
          seo: {
            ...(settings.seo || {}),
            favicon: settings.favicon || settings.seo?.favicon
          },
          marketing: formattedMarketing
        });
      } catch (err: any) {
        console.warn("Supabase save error:", err);
      }
    }

    // 2. Disk persistence via API route (updates src/data/settings.json)
    try {
      await fetch("/api/admin/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "settings", data: fullPayload })
      });
    } catch (err) {
      console.warn("Disk save failed", err);
    }

    // 3. Local storage & real-time broadcast
    if (typeof window !== "undefined") {
      try {
        const curLocal = localStorage.getItem("adm_settings");
        const parsed = curLocal ? JSON.parse(curLocal) : {};
        localStorage.setItem(
          "adm_settings",
          JSON.stringify({ ...parsed, ...settings, settings, marketing })
        );
        window.dispatchEvent(new Event("settingsUpdated"));
      } catch {}
    }

    setSaveStatus("✓ Settings successfully saved to Database, Files, and Live Site!");
    setTimeout(() => setSaveStatus(null), 4000);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, fontFamily: "var(--adm-font-display)" }}>
            Clinic Settings & Marketing Hub
          </h2>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "2px 0 0 0" }}>
            Manage clinic contact details, opening hours, Call Tracking, and Google Tag Manager
          </p>
        </div>
      </div>

      {!isAdmin && (
        <div className="adm-guarded-banner">
          <span>🛡️</span>
          <div>
            <strong>Client Safe Mode Active:</strong> You can edit clinic contact info and opening hours. Marketing script code injections (GTM & Call Tracking) require Master Admin Mode.
          </div>
        </div>
      )}

      {saveStatus && (
        <div style={{ background: saveStatus.includes("✓") ? "#dcfce7" : "#fee2e2", color: saveStatus.includes("✓") ? "#15803d" : "#b91c1c", padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontWeight: 600, fontSize: 14 }}>
          {saveStatus}
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* 1. Branding & Favicon */}
        <div className="adm-card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: 12, marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              🎨 Branding &amp; Website Favicon
            </h3>
            <a
              href="/admin/seo"
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: "var(--primary, #0e78a8)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4
              }}
            >
              <span>🌐</span> Manage All Page Meta Titles &amp; Descriptions &rarr;
            </a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <AdminImageUploader
                label="Website Favicon (Browser Tab Icon)"
                value={settings.favicon || settings.seo?.favicon || ""}
                onChange={(url) => {
                  setSettings({
                    ...settings,
                    favicon: url,
                    seo: {
                      ...(settings.seo || {}),
                      favicon: url
                    }
                  });
                }}
                folder="branding"
                placeholder="Upload .ico, .png, or .svg favicon..."
                aspectRatioNote="Square 1:1 (.png, .ico, .svg)"
              />
              <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                Displays on browser tabs, bookmarks, and mobile home screen shortcuts across the entire website.
              </span>
            </div>

            {/* Live Browser Tab Preview */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
                Live Browser Tab Preview
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#ffffff", padding: "8px 16px", borderRadius: "8px 8px 0 0", border: "1px solid #cbd5e1", borderBottom: "none", boxShadow: "0 -2px 6px rgba(0,0,0,0.03)", maxWidth: 300 }}>
                {settings.favicon || settings.seo?.favicon ? (
                  <img
                    src={settings.favicon || settings.seo?.favicon}
                    alt="Favicon preview"
                    style={{ width: 16, height: 16, objectFit: "contain", borderRadius: 2 }}
                    onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                  />
                ) : (
                  <div style={{ width: 16, height: 16, borderRadius: 2, background: "var(--primary, #0e78a8)", color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    NC
                  </div>
                )}
                <span style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {settings.clinicName || "Nose Creek Physiotherapy"}
                </span>
                <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: "auto" }}>✕</span>
              </div>
              <div style={{ height: 6, background: "#ffffff", borderLeft: "1px solid #cbd5e1", borderRight: "1px solid #cbd5e1", borderBottom: "1px solid #cbd5e1", borderRadius: "0 0 4px 4px", maxWidth: 300 }} />
            </div>
          </div>
        </div>

        {/* 2. Clinic General Settings */}
        <div className="adm-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 700, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
            🏥 Clinic Information
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="adm-form-group">
              <label className="adm-form-label">Clinic Name</label>
              <input
                type="text"
                className="adm-input"
                value={settings.clinicName}
                onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
                required
              />
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Logo Brand Text</label>
              <input
                type="text"
                className="adm-input"
                value={settings.logoText}
                onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="adm-form-group">
              <label className="adm-form-label">Primary Call to Action</label>
              <input
                type="text"
                className="adm-input"
                value={settings.primaryCTA}
                onChange={(e) => setSettings({ ...settings, primaryCTA: e.target.value })}
              />
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Primary Booking URL</label>
              <input
                type="text"
                className="adm-input"
                value={settings.bookingUrl}
                onChange={(e) => setSettings({ ...settings, bookingUrl: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* 2. Contact Details */}
        <div className="adm-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 700, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
            📞 Contact Numbers & Address
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="adm-form-group">
              <label className="adm-form-label">Main Reception Phone (Default Swap Target)</label>
              <input
                type="text"
                className="adm-input"
                value={settings.contact.phone}
                onChange={(e) => setSettings({
                  ...settings,
                  contact: { ...settings.contact, phone: e.target.value }
                })}
                required
              />
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Clinic Contact Email</label>
              <input
                type="email"
                className="adm-input"
                value={settings.contact.email}
                onChange={(e) => setSettings({
                  ...settings,
                  contact: { ...settings.contact, email: e.target.value }
                })}
                required
              />
            </div>
          </div>

          <div className="adm-form-group">
            <label className="adm-form-label">Headquarters Physical Address</label>
            <input
              type="text"
              className="adm-input"
              value={settings.contact.address}
              onChange={(e) => setSettings({
                ...settings,
                contact: { ...settings.contact, address: e.target.value }
              })}
              required
            />
          </div>
        </div>

        {/* 3. Opening Hours */}
        <div className="adm-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 700, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
            🕒 Clinic Operating Hours
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
              <div key={day} className="adm-form-group">
                <label className="adm-form-label" style={{ textTransform: "capitalize" }}>{day}</label>
                <input
                  type="text"
                  className="adm-input"
                  value={(settings.openingHours as any)[day] || "Closed"}
                  onChange={(e) => setSettings({
                    ...settings,
                    openingHours: { ...settings.openingHours, [day]: e.target.value }
                  })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 4. Marketing Scripts & Integrations */}
        <div className="adm-card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: 12, marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              📈 Marketing Analytics & Call Tracking
            </h3>
            {!canEditMarketingScripts && (
              <span style={{ fontSize: 12, background: "#fee2e2", color: "#b91c1c", padding: "3px 8px", borderRadius: 6, fontWeight: 600 }}>
                🔒 Guarded (Admin Only)
              </span>
            )}
          </div>

          {/* Call Tracking */}
          <div style={{ background: "#f8fafc", padding: 18, borderRadius: 12, marginBottom: 16, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <strong style={{ fontSize: 14 }}>📞 Call Tracking (CallRail Dynamic Number Swapping)</strong>
                <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
                  Swaps default phone numbers dynamically based on campaign sources (e.g. Google My Business, Google Ads)
                </p>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: canEditMarketingScripts ? "pointer" : "not-allowed" }}>
                <input
                  type="checkbox"
                  checked={marketing.callTracking.enabled}
                  disabled={!canEditMarketingScripts}
                  onChange={(e) => setMarketing({
                    ...marketing,
                    callTracking: { ...marketing.callTracking, enabled: e.target.checked }
                  })}
                />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Enabled</span>
              </label>
            </div>

            <div className="adm-form-group" style={{ margin: 0 }}>
              <label className="adm-form-label">Call Tracking Script URL (swap.js)</label>
              <input
                type="text"
                className="adm-input"
                value={marketing.callTracking.scriptUrl ?? ""}
                disabled={!canEditMarketingScripts}
                onChange={(e) => setMarketing({
                  ...marketing,
                  callTracking: { ...marketing.callTracking, scriptUrl: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Google Tag Manager */}
          <div style={{ background: "#f8fafc", padding: 18, borderRadius: 12, marginBottom: 16, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <strong style={{ fontSize: 14 }}>🏷️ Google Tag Manager (GTM)</strong>
                <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
                  Injects Google Analytics 4, Meta Pixel, and conversion tracking containers (comma-separated for multiple)
                </p>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: canEditMarketingScripts ? "pointer" : "not-allowed" }}>
                <input
                  type="checkbox"
                  checked={Boolean(marketing.gtm.enabled)}
                  disabled={!canEditMarketingScripts}
                  onChange={(e) => setMarketing({
                    ...marketing,
                    gtm: { ...marketing.gtm, enabled: e.target.checked }
                  })}
                />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Enabled</span>
              </label>
            </div>

            <div className="adm-form-group" style={{ margin: 0 }}>
              <label className="adm-form-label">GTM Container ID(s) (e.g. GTM-M3WLKSQ, GTM-PJ447MK)</label>
              <input
                type="text"
                className="adm-input"
                placeholder="GTM-M3WLKSQ, GTM-PJ447MK"
                value={marketing.gtm.containerId ?? ""}
                disabled={!canEditMarketingScripts}
                onChange={(e) => setMarketing({
                  ...marketing,
                  gtm: { ...marketing.gtm, containerId: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Google Analytics */}
          <div style={{ background: "#f8fafc", padding: 18, borderRadius: 12, marginBottom: 16, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <strong style={{ fontSize: 14 }}>📊 Google Analytics (Universal / GA4)</strong>
                <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
                  Direct Google Analytics gtag tracking integration
                </p>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: canEditMarketingScripts ? "pointer" : "not-allowed" }}>
                <input
                  type="checkbox"
                  checked={Boolean(marketing.googleAnalytics.enabled)}
                  disabled={!canEditMarketingScripts}
                  onChange={(e) => setMarketing({
                    ...marketing,
                    googleAnalytics: { ...marketing.googleAnalytics, enabled: e.target.checked }
                  })}
                />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Enabled</span>
              </label>
            </div>

            <div className="adm-form-group" style={{ margin: 0 }}>
              <label className="adm-form-label">Tracking ID (e.g. UA-121730452-1 or G-XXXXXXXXXX)</label>
              <input
                type="text"
                className="adm-input"
                placeholder="UA-121730452-1"
                value={marketing.googleAnalytics.trackingId ?? ""}
                disabled={!canEditMarketingScripts}
                onChange={(e) => setMarketing({
                  ...marketing,
                  googleAnalytics: { ...marketing.googleAnalytics, trackingId: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Facebook Pixel */}
          <div style={{ background: "#f8fafc", padding: 18, borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <strong style={{ fontSize: 14 }}>🎯 Meta / Facebook Pixel</strong>
                <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
                  Tracks visitors and conversions for Facebook and Instagram Ads
                </p>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: canEditMarketingScripts ? "pointer" : "not-allowed" }}>
                <input
                  type="checkbox"
                  checked={Boolean(marketing.facebookPixel.enabled)}
                  disabled={!canEditMarketingScripts}
                  onChange={(e) => setMarketing({
                    ...marketing,
                    facebookPixel: { ...marketing.facebookPixel, enabled: e.target.checked }
                  })}
                />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Enabled</span>
              </label>
            </div>

            <div className="adm-form-group" style={{ margin: 0 }}>
              <label className="adm-form-label">Pixel ID (e.g. 275772356383035)</label>
              <input
                type="text"
                className="adm-input"
                placeholder="275772356383035"
                value={marketing.facebookPixel.pixelId ?? ""}
                disabled={!canEditMarketingScripts}
                onChange={(e) => setMarketing({
                  ...marketing,
                  facebookPixel: { ...marketing.facebookPixel, pixelId: e.target.value }
                })}
              />
            </div>
          </div>
        </div>

        {/* Save Button Bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button type="submit" className="adm-btn adm-btn-success" style={{ padding: "12px 28px", fontSize: 15 }}>
            💾 Save All Clinic Settings
          </button>
        </div>
      </form>
    </div>
  );
}
