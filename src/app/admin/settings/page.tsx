"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/components/admin/RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { SiteSettings } from "@/types/content";
import settingsData from "@/data/settings.json";

export default function AdminSettingsPage() {
  const { role, isAdmin, canEditMarketingScripts } = useRole();
  const [settings, setSettings] = useState<SiteSettings>(settingsData as SiteSettings);
  const [marketing, setMarketing] = useState<{
    callTracking: { enabled: boolean; scriptUrl: string };
    gtm: { enabled: boolean; containerId: string };
  }>((settingsData as any).marketing || {
    callTracking: { enabled: true, scriptUrl: "" },
    gtm: { enabled: false, containerId: "" }
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
              seo: data.seo || settingsData.seo
            });
            if (data.marketing) {
              setMarketing(data.marketing);
            }
          }
        } catch {
          // ignore
        }
      } else if (typeof window !== "undefined") {
        const local = localStorage.getItem("adm_settings");
        if (local) {
          const parsed = JSON.parse(local);
          setSettings(parsed.settings);
          if (parsed.marketing) setMarketing(parsed.marketing);
        }
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("Saving...");

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
          seo: settings.seo,
          marketing: marketing
        });
        setSaveStatus("✓ Settings successfully saved to Supabase!");
      } catch (err: any) {
        setSaveStatus(`❌ Error: ${err.message}`);
      }
    } else if (typeof window !== "undefined") {
      localStorage.setItem(
        "adm_settings",
        JSON.stringify({ settings, marketing })
      );
      setSaveStatus("✓ Settings saved locally (Demo mode)!");
    }

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
        {/* 1. Clinic General Settings */}
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
                value={marketing.callTracking.scriptUrl}
                disabled={!canEditMarketingScripts}
                onChange={(e) => setMarketing({
                  ...marketing,
                  callTracking: { ...marketing.callTracking, scriptUrl: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Google Tag Manager */}
          <div style={{ background: "#f8fafc", padding: 18, borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <strong style={{ fontSize: 14 }}>🏷️ Google Tag Manager (GTM)</strong>
                <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
                  Injects Google Analytics 4, Meta Pixel, and conversion tracking containers
                </p>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: canEditMarketingScripts ? "pointer" : "not-allowed" }}>
                <input
                  type="checkbox"
                  checked={marketing.gtm.enabled}
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
              <label className="adm-form-label">GTM Container ID (e.g. GTM-XXXXXXX)</label>
              <input
                type="text"
                className="adm-input"
                placeholder="GTM-XXXXXXX"
                value={marketing.gtm.containerId}
                disabled={!canEditMarketingScripts}
                onChange={(e) => setMarketing({
                  ...marketing,
                  gtm: { ...marketing.gtm, containerId: e.target.value }
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
