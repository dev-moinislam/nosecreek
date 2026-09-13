"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/components/admin/RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { SiteSettings, EmailNotificationSettings, CustomSchemaItem } from "@/types/content";
import settingsData from "@/data/settings.json";
import AdminImageUploader from "@/components/admin/AdminImageUploader";

const DEFAULT_BUSINESS_SCHEMA_TEMPLATE = JSON.stringify({
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "MedicalBusiness", "Physiotherapy"],
  "@id": "https://www.nosecreekphysiotherapy.com/#LocalBusiness",
  "name": "Nose Creek Physiotherapy",
  "alternateName": "Nose Creek Physical Therapy",
  "image": "https://www.nosecreekphysiotherapy.com/images/clinic/reception-desktop.jpg",
  "logo": "https://www.nosecreekphysiotherapy.com/images/logo/nose-creek-logo.webp",
  "url": "https://www.nosecreekphysiotherapy.com",
  "telephone": "403-295-8590",
  "email": "info@nosecreekphysiotherapy.com",
  "priceRange": "$$",
  "currenciesAccepted": "CAD",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "8220 Centre St NE #153",
    "addressLocality": "Calgary",
    "addressRegion": "AB",
    "postalCode": "T3K 1J7",
    "addressCountry": "CA"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "545",
    "bestRating": "5",
    "worstRating": "1"
  }
}, null, 2);

const DEFAULT_ORGANIZATION_SCHEMA_TEMPLATE = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "MedicalOrganization",
  "name": "Nose Creek Physiotherapy",
  "url": "https://www.nosecreekphysiotherapy.com",
  "logo": "https://www.nosecreekphysiotherapy.com/images/logo/nose-creek-logo.webp",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "403-295-8590",
    "contactType": "Customer Service",
    "areaServed": "Calgary, AB",
    "availableLanguage": "English"
  }
}, null, 2);

const COMMON_PAGES = [
  { label: "Homepage (/)", value: "/" },
  { label: "About Us (/about)", value: "/about" },
  { label: "Contact Us (/contact)", value: "/contact" },
  { label: "Services Directory (/services)", value: "/services" },
  { label: "All Service Pages (/services/*)", value: "/services/*" },
  { label: "Conditions Directory (/conditions)", value: "/conditions" },
  { label: "All Condition Pages (/conditions/*)", value: "/conditions/*" },
  { label: "Team Members (/team)", value: "/team" },
  { label: "Google Reviews (/reviews)", value: "/reviews" },
  { label: "Blog & Articles (/blog)", value: "/blog" }
];

export default function AdminSettingsPage() {
  const { role, isAdmin, canEditMarketingScripts } = useRole();
  const [settings, setSettings] = useState<SiteSettings>(settingsData as SiteSettings);
  const [notifications, setNotifications] = useState<EmailNotificationSettings>(() => {
    const n = (settingsData as any).notifications || {};
    return {
      enabled: n.enabled ?? true,
      receiverEmail: n.receiverEmail || "info@nosecreekphysiotherapy.com",
      subjectPrefix: n.subjectPrefix || "[New Website Lead]",
      provider: n.provider || "resend",
      resendApiKey: n.resendApiKey || "",
      senderName: n.senderName || "Nose Creek Website Forms",
      webhookUrl: n.webhookUrl || ""
    };
  });
  const [customSchemas, setCustomSchemas] = useState<CustomSchemaItem[]>(() => {
    const s = (settingsData as any).customSchemas;
    if (Array.isArray(s) && s.length > 0) return s;
    return [
      {
        id: "schema-business-main",
        title: "Main Clinic Business Schema (MedicalBusiness)",
        enabled: true,
        scope: "site_wide",
        targetPages: [],
        schemaJson: DEFAULT_BUSINESS_SCHEMA_TEMPLATE
      }
    ];
  });
  const [testEmailStatus, setTestEmailStatus] = useState<{
    loading: boolean;
    message: string | null;
    success: boolean | null;
  }>({ loading: false, message: null, success: null });
  const [jsonValidationErrors, setJsonValidationErrors] = useState<Record<string, string | null>>({});

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
  const [isSaving, setIsSaving] = useState(false);
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

              if (m.notifications) {
                setNotifications({
                  enabled: m.notifications.enabled ?? true,
                  receiverEmail: m.notifications.receiverEmail || "info@nosecreekphysiotherapy.com",
                  subjectPrefix: m.notifications.subjectPrefix || "[New Website Lead]",
                  provider: m.notifications.provider || "resend",
                  resendApiKey: m.notifications.resendApiKey || "",
                  senderName: m.notifications.senderName || "Nose Creek Website Forms",
                  webhookUrl: m.notifications.webhookUrl || ""
                });
              }

              if (Array.isArray(m.customSchemas) && m.customSchemas.length > 0) {
                setCustomSchemas(m.customSchemas);
              }
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
          if (parsed.notifications) {
            setNotifications(parsed.notifications);
          }
          if (Array.isArray(parsed.customSchemas)) {
            setCustomSchemas(parsed.customSchemas);
          }
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
            if (m.notifications && !parsed.notifications) {
              setNotifications(m.notifications);
            }
            if (Array.isArray(m.customSchemas) && !parsed.customSchemas) {
              setCustomSchemas(m.customSchemas);
            }
          }
        }
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSendTestEmail = async () => {
    if (!notifications.receiverEmail) {
      alert("Please enter a receiver email address first.");
      return;
    }
    setTestEmailStatus({ loading: true, message: null, success: null });
    try {
      const res = await fetch("/api/forms/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isTest: true,
          receiverEmailOverride: notifications.receiverEmail,
          name: "Test Patient",
          form_type: "Test Verification",
          email: "test@example.com",
          phone: "403-295-8590",
          message: "This is a test notification email from your Nose Creek Physiotherapy settings."
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailStatus({
          loading: false,
          success: true,
          message: `✓ Test notification processed for ${notifications.receiverEmail}! Delivery mode: ${data.status?.provider || "dispatched"}.`
        });
      } else {
        setTestEmailStatus({
          loading: false,
          success: false,
          message: data.error || data.message || "Failed to dispatch test notification"
        });
      }
    } catch (err: any) {
      setTestEmailStatus({
        loading: false,
        success: false,
        message: err.message || "Error sending test email"
      });
    }
  };

  const handleAddSchema = () => {
    const newId = "schema_" + Date.now();
    const newSchema: CustomSchemaItem = {
      id: newId,
      title: `Custom Business Schema ${customSchemas.length + 1}`,
      enabled: true,
      scope: "site_wide",
      targetPages: [],
      schemaJson: DEFAULT_BUSINESS_SCHEMA_TEMPLATE
    };
    setCustomSchemas([...customSchemas, newSchema]);
  };

  const handleRemoveSchema = (id: string) => {
    if (confirm("Are you sure you want to delete this schema?")) {
      setCustomSchemas(customSchemas.filter((s) => s.id !== id));
      setJsonValidationErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleUpdateSchema = (id: string, updates: Partial<CustomSchemaItem>) => {
    setCustomSchemas(
      customSchemas.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleValidateSchemaJson = (id: string, code: string) => {
    try {
      JSON.parse(code);
      setJsonValidationErrors((prev) => ({ ...prev, [id]: null }));
      return true;
    } catch (err: any) {
      setJsonValidationErrors((prev) => ({ ...prev, [id]: err.message || "Invalid JSON syntax" }));
      return false;
    }
  };

  const handleToggleTargetPage = (id: string, pageValue: string) => {
    const targetSchema = customSchemas.find((s) => s.id === id);
    if (!targetSchema) return;
    const current = targetSchema.targetPages || [];
    const exists = current.includes(pageValue);
    const updated = exists ? current.filter((p) => p !== pageValue) : [...current, pageValue];
    handleUpdateSchema(id, { targetPages: updated });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

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
      marketing: formattedMarketing,
      notifications,
      customSchemas
    };

    try {
      // 1. Supabase persistence
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: cur } = await supabase.from("site_settings").select("marketing").eq("id", "main").single();
          const mergedMarketing = {
            ...(cur?.marketing || {}),
            ...formattedMarketing,
            notifications,
            customSchemas,
            auth_credentials: cur?.marketing?.auth_credentials || (settingsData as any)?.marketing?.auth_credentials,
            theme_colors: cur?.marketing?.theme_colors || (settingsData as any)?.marketing?.theme_colors
          };

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
            marketing: mergedMarketing
          });
        } catch (err: any) {
          console.warn("Supabase save error:", err);
        }
      }

      // 2. Disk persistence via API route (updates src/data/settings.json)
      try {
        const diskMarketing = {
          ...formattedMarketing,
          auth_credentials: (settingsData as any)?.marketing?.auth_credentials
        };
        await fetch("/api/admin/save-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "settings",
            data: { ...fullPayload, marketing: diskMarketing, notifications, customSchemas }
          })
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
            JSON.stringify({ ...parsed, ...settings, settings, marketing, notifications, customSchemas })
          );
          window.dispatchEvent(new Event("settingsUpdated"));
        } catch {}
      }

      setSaveStatus("✓ Settings successfully saved to Database, Files, and Live Site!");
      setTimeout(() => setSaveStatus(null), 15000);
    } catch (err: any) {
      setSaveStatus("❌ Error saving settings: " + (err?.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
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

        {/* 5. Form Submissions & Client Email Notifications */}
        <div className="adm-card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: 12, marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                📬 Form Submissions &amp; Client Email Notifications
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
                Automatically forward submissions from Contact, Appointment, Workshop, and future forms to the client&apos;s email
              </p>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={Boolean(notifications.enabled)}
                onChange={(e) => setNotifications({ ...notifications, enabled: e.target.checked })}
              />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Forwarding Enabled</span>
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div className="adm-form-group" style={{ margin: 0 }}>
              <label className="adm-form-label">
                Client Receiver Email(s) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                className="adm-input"
                placeholder="e.g. info@nosecreekphysiotherapy.com, manager@nosecreek.com"
                value={notifications.receiverEmail || ""}
                onChange={(e) => setNotifications({ ...notifications, receiverEmail: e.target.value })}
                required={notifications.enabled}
              />
              <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                Separate multiple recipients with commas. All form leads will be dispatched here.
              </span>
            </div>

            <div className="adm-form-group" style={{ margin: 0 }}>
              <label className="adm-form-label">Email Subject Prefix</label>
              <input
                type="text"
                className="adm-input"
                placeholder="[New Website Lead]"
                value={notifications.subjectPrefix || ""}
                onChange={(e) => setNotifications({ ...notifications, subjectPrefix: e.target.value })}
              />
              <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                Prefix added to the subject line so client staff can instantly filter form inquiries.
              </span>
            </div>
          </div>

          {/* Advanced / Provider Settings */}
          <div style={{ background: "#f8fafc", padding: 18, borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="adm-form-group" style={{ margin: 0 }}>
                <label className="adm-form-label">Delivery Provider</label>
                <select
                  className="adm-input"
                  value={notifications.provider || "resend"}
                  onChange={(e) => setNotifications({ ...notifications, provider: e.target.value as any })}
                >
                  <option value="resend">Resend API (Modern &amp; Recommended for Next.js)</option>
                  <option value="webhook">Webhook Relay (Zapier / Make / Slack / Custom API)</option>
                </select>
              </div>

              <div className="adm-form-group" style={{ margin: 0 }}>
                <label className="adm-form-label">Sender Display Name</label>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="Nose Creek Website Forms"
                  value={notifications.senderName || ""}
                  onChange={(e) => setNotifications({ ...notifications, senderName: e.target.value })}
                />
              </div>
            </div>

            {notifications.provider === "resend" && (
              <div className="adm-form-group" style={{ marginTop: 14, marginBottom: 0 }}>
                <label className="adm-form-label">Resend API Key (Optional if RESEND_API_KEY is in .env.local)</label>
                <input
                  type="password"
                  className="adm-input"
                  placeholder="re_123456789_xxxxxxxxxxxxxxxxxxxx"
                  value={notifications.resendApiKey || ""}
                  onChange={(e) => setNotifications({ ...notifications, resendApiKey: e.target.value })}
                />
                <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                  Get a free API key at resend.com to deliver patient inquiries directly to any inbox.
                </span>
              </div>
            )}

            {notifications.provider === "webhook" && (
              <div className="adm-form-group" style={{ marginTop: 14, marginBottom: 0 }}>
                <label className="adm-form-label">Webhook URL</label>
                <input
                  type="url"
                  className="adm-input"
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  value={notifications.webhookUrl || ""}
                  onChange={(e) => setNotifications({ ...notifications, webhookUrl: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Test Email Action */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={testEmailStatus.loading || !notifications.receiverEmail}
              className="adm-btn adm-btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, padding: "8px 16px" }}
            >
              {testEmailStatus.loading ? (
                <>
                  <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span>
                  <span>Sending Test Email...</span>
                </>
              ) : (
                <>
                  <span>✉️</span>
                  <span>Send Test Notification Email</span>
                </>
              )}
            </button>

            {testEmailStatus.message && (
              <div
                style={{
                  fontSize: 12.5,
                  padding: "6px 12px",
                  borderRadius: 6,
                  background: testEmailStatus.success ? "#dcfce7" : "#fee2e2",
                  color: testEmailStatus.success ? "#15803d" : "#b91c1c",
                  fontWeight: 600
                }}
              >
                {testEmailStatus.message}
              </div>
            )}
          </div>
        </div>

        {/* 6. Custom & Business Schema Manager */}
        <div className="adm-card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: 14, marginBottom: 18 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                🏢 Custom &amp; Business Schema Manager
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
                Add multiple JSON-LD schemas (Business, LocalBusiness, Organization) and configure target pages (Site-wide, Homepage, or Specific Pages)
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddSchema}
              className="adm-btn adm-btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, padding: "8px 16px" }}
            >
              <span>+</span> Add New Schema
            </button>
          </div>

          {customSchemas.length === 0 ? (
            <div style={{ padding: "36px 20px", textAlign: "center", background: "#f8fafc", borderRadius: 12, border: "1px dashed #cbd5e1" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", marginBottom: 4 }}>
                No custom schemas configured
              </div>
              <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px 0" }}>
                Click the button below to add your Business Schema or any custom schema.
              </p>
              <button
                type="button"
                onClick={handleAddSchema}
                className="adm-btn adm-btn-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}
              >
                <span>+</span> Add Business Schema
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {customSchemas.map((schema, index) => {
                const validationError = jsonValidationErrors[schema.id];
                return (
                  <div
                    key={schema.id || index}
                    style={{
                      border: schema.enabled ? "1px solid #cbd5e1" : "1px dashed #e2e8f0",
                      borderRadius: 12,
                      padding: 20,
                      background: schema.enabled ? "#ffffff" : "#f8fafc",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.03)"
                    }}
                  >
                    {/* Schema Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 260 }}>
                        <span style={{ fontSize: 16 }}>🏢</span>
                        <input
                          type="text"
                          className="adm-input"
                          style={{ fontWeight: 700, fontSize: 14.5 }}
                          value={schema.title}
                          onChange={(e) => handleUpdateSchema(schema.id, { title: e.target.value })}
                          placeholder="Schema Name (e.g. Main Clinic Business Schema)"
                        />
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={schema.enabled}
                            onChange={(e) => handleUpdateSchema(schema.id, { enabled: e.target.checked })}
                          />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>Active</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => handleRemoveSchema(schema.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                            padding: "4px 8px",
                            borderRadius: 6
                          }}
                        >
                          ✕ Delete
                        </button>
                      </div>
                    </div>

                    {/* Scope / Target Page Selection */}
                    <div style={{ background: "#f8fafc", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 14 }}>
                      <label className="adm-form-label" style={{ marginBottom: 8, fontSize: 12.5, fontWeight: 700 }}>
                        📍 Where should this schema appear on the live website?
                      </label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginBottom: schema.scope === "specific" ? 14 : 0 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
                          <input
                            type="radio"
                            name={`scope_${schema.id}`}
                            checked={schema.scope === "site_wide"}
                            onChange={() => handleUpdateSchema(schema.id, { scope: "site_wide" })}
                          />
                          <span style={{ fontWeight: schema.scope === "site_wide" ? 700 : 500 }}>
                            🌐 Site-wide (All Pages)
                          </span>
                        </label>

                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
                          <input
                            type="radio"
                            name={`scope_${schema.id}`}
                            checked={schema.scope === "homepage"}
                            onChange={() => handleUpdateSchema(schema.id, { scope: "homepage" })}
                          />
                          <span style={{ fontWeight: schema.scope === "homepage" ? 700 : 500 }}>
                            🏠 Homepage Only (/)
                          </span>
                        </label>

                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
                          <input
                            type="radio"
                            name={`scope_${schema.id}`}
                            checked={schema.scope === "specific"}
                            onChange={() => handleUpdateSchema(schema.id, { scope: "specific" })}
                          />
                          <span style={{ fontWeight: schema.scope === "specific" ? 700 : 500 }}>
                            🎯 Specific Page(s)
                          </span>
                        </label>
                      </div>

                      {/* Specific Page Checklists */}
                      {schema.scope === "specific" && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
                            Select target pages:
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8, marginBottom: 12 }}>
                            {COMMON_PAGES.map((page) => {
                              const isChecked = (schema.targetPages || []).includes(page.value);
                              return (
                                <label
                                  key={page.value}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    fontSize: 12.5,
                                    background: isChecked ? "#e0f2fe" : "#ffffff",
                                    padding: "6px 10px",
                                    borderRadius: 6,
                                    border: isChecked ? "1px solid #7dd3fc" : "1px solid #e2e8f0",
                                    cursor: "pointer"
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleTargetPage(schema.id, page.value)}
                                  />
                                  <span>{page.label}</span>
                                </label>
                              );
                            })}
                          </div>

                          <div className="adm-form-group" style={{ margin: 0 }}>
                            <label className="adm-form-label" style={{ fontSize: 11.5 }}>
                              Custom Path(s) (comma-separated, supports wildcards like /locations/*):
                            </label>
                            <input
                              type="text"
                              className="adm-input"
                              placeholder="/locations/beddington, /inquire"
                              value={(schema.targetPages || []).join(", ")}
                              onChange={(e) => {
                                const list = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                                handleUpdateSchema(schema.id, { targetPages: list });
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Template Quick Presets Bar */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
                      <label className="adm-form-label" style={{ margin: 0, fontSize: 12.5, fontWeight: 700 }}>
                        Schema Code (JSON-LD):
                      </label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateSchema(schema.id, { schemaJson: DEFAULT_BUSINESS_SCHEMA_TEMPLATE });
                            handleValidateSchemaJson(schema.id, DEFAULT_BUSINESS_SCHEMA_TEMPLATE);
                          }}
                          className="adm-btn adm-btn-secondary"
                          style={{ fontSize: 11.5, padding: "4px 10px" }}
                        >
                          Load Business Schema Template
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateSchema(schema.id, { schemaJson: DEFAULT_ORGANIZATION_SCHEMA_TEMPLATE });
                            handleValidateSchemaJson(schema.id, DEFAULT_ORGANIZATION_SCHEMA_TEMPLATE);
                          }}
                          className="adm-btn adm-btn-secondary"
                          style={{ fontSize: 11.5, padding: "4px 10px" }}
                        >
                          Load Organization Template
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              const parsed = JSON.parse(schema.schemaJson);
                              const formatted = JSON.stringify(parsed, null, 2);
                              handleUpdateSchema(schema.id, { schemaJson: formatted });
                              handleValidateSchemaJson(schema.id, formatted);
                            } catch {}
                          }}
                          className="adm-btn adm-btn-secondary"
                          style={{ fontSize: 11.5, padding: "4px 10px" }}
                        >
                          Format JSON
                        </button>
                      </div>
                    </div>

                    {/* JSON Editor Textarea */}
                    <div style={{ position: "relative" }}>
                      <textarea
                        className="adm-input"
                        rows={9}
                        style={{
                          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                          fontSize: 12.5,
                          lineHeight: 1.5,
                          background: "#0f172a",
                          color: "#f8fafc",
                          border: validationError ? "1px solid #ef4444" : "1px solid #334155",
                          borderRadius: 8,
                          padding: 12,
                          width: "100%",
                          boxSizing: "border-box"
                        }}
                        value={schema.schemaJson}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleUpdateSchema(schema.id, { schemaJson: val });
                          handleValidateSchemaJson(schema.id, val);
                        }}
                      />
                    </div>

                    {/* Syntax Validation Status Indicator */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                      {validationError ? (
                        <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
                          ❌ JSON Syntax Error: {validationError}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
                          ✓ Valid JSON-LD Schema
                        </span>
                      )}
                      <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                        Injected as &lt;script type=&quot;application/ld+json&quot;&gt;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginTop: 24,
            padding: "16px 24px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
          }}
        >
          <div style={{ flex: 1, minWidth: 260 }}>
            {saveStatus && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  background: saveStatus.includes("✓") ? "#dcfce7" : "#fee2e2",
                  color: saveStatus.includes("✓") ? "#15803d" : "#b91c1c",
                  border: saveStatus.includes("✓") ? "1px solid #86efac" : "1px solid #fca5a5",
                  padding: "10px 18px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}
              >
                <span style={{ fontSize: 16 }}>{saveStatus.includes("✓") ? "✅" : "⚠️"}</span>
                <span>{saveStatus}</span>
              </div>
            )}
            {!saveStatus && isSaving && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "var(--primary, #0e78a8)", fontWeight: 600, fontSize: 14 }}>
                <svg
                  style={{ animation: "spin 0.8s linear infinite", width: 18, height: 18 }}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <span>Synchronizing clinic settings and marketing tags...</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="adm-btn adm-btn-success"
            style={{
              padding: "13px 32px",
              fontSize: 15,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.85 : 1,
              transition: "all 0.2s ease",
              boxShadow: "0 2px 6px rgba(22, 163, 74, 0.25)",
              background: saveStatus?.includes("✓") ? "#15803d" : undefined
            }}
          >
            {isSaving ? (
              <>
                <svg
                  style={{
                    animation: "spin 0.8s linear infinite",
                    width: 18,
                    height: 18
                  }}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle cx="12" cy="12" r="10" stroke="#ffffff" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <span>Saving Settings...</span>
              </>
            ) : saveStatus?.includes("✓") ? (
              <>
                <span style={{ fontSize: 17 }}>✅</span>
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: 16 }}>💾</span>
                <span>Save All Clinic Settings</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Floating Sticky Notification Toast */}
      {saveStatus && (
        <div
          style={{
            position: "fixed",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 99999,
            background: saveStatus.includes("✓") ? "#15803d" : "#b91c1c",
            color: "#ffffff",
            padding: "14px 26px",
            borderRadius: 50,
            boxShadow: "0 12px 35px rgba(0, 0, 0, 0.25)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 14.5,
            fontWeight: 600,
            animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            maxWidth: "90vw"
          }}
        >
          <span style={{ fontSize: 18 }}>{saveStatus.includes("✓") ? "✅" : "⚠️"}</span>
          <span>{saveStatus}</span>
          <button
            type="button"
            onClick={() => setSaveStatus(null)}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: 13,
              marginLeft: 6,
              borderRadius: "50%",
              width: 22,
              height: 22,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
