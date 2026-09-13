"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/components/admin/RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { CustomSchemaItem } from "@/types/content";
import settingsData from "@/data/settings.json";

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

const DEFAULT_FAQ_SCHEMA_TEMPLATE = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Do I need a doctor's referral for physiotherapy in Alberta?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No referral is needed. In Alberta, you can visit a licensed physiotherapist directly. Some private extended health insurance policies may require one for claim reimbursement."
      }
    },
    {
      "@type": "Question",
      "name": "Does Nose Creek Physiotherapy offer direct insurance billing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we direct bill most extended health benefit providers including Alberta Blue Cross, Sun Life, Canada Life, and Manulife."
      }
    }
  ]
}, null, 2);

const DEFAULT_SERVICE_SCHEMA_TEMPLATE = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "MedicalProcedure",
  "name": "Physiotherapy Rehabilitation Treatment",
  "procedureType": "NoninvasiveProcedure",
  "description": "Comprehensive physical therapy assessment, hands-on joint manipulation, dry needling, and therapeutic exercise prescription.",
  "howPerformed": "Administered by licensed FCAMPT physiotherapists in private treatment rooms and active gym facility.",
  "provider": {
    "@type": "MedicalBusiness",
    "name": "Nose Creek Physiotherapy",
    "url": "https://www.nosecreekphysiotherapy.com"
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

export default function AdminSchemasPage() {
  const { role, isAdmin } = useRole();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

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

  const [jsonValidationErrors, setJsonValidationErrors] = useState<Record<string, string | null>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadSchemas() {
      let loaded = false;

      // 1. Fetch from canonical settings endpoint
      try {
        const res = await fetch("/api/content?type=settings");
        if (res.ok) {
          const data = await res.json();
          const schemas = data.customSchemas || data.marketing?.customSchemas;
          if (Array.isArray(schemas) && schemas.length > 0) {
            setCustomSchemas(schemas);
            loaded = true;
          }
        }
      } catch (err) {
        console.warn("Could not fetch schemas from /api/content:", err);
      }

      // 2. If not loaded, try Supabase directly
      if (!loaded && isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase
            .from("site_settings")
            .select("*")
            .eq("id", "main")
            .maybeSingle();

          if (data) {
            const m = data.marketing || {};
            const schemas = m.customSchemas || data.customSchemas;
            if (Array.isArray(schemas) && schemas.length > 0) {
              setCustomSchemas(schemas);
              loaded = true;
            }
          }
        } catch (sErr) {
          console.warn("Supabase load error:", sErr);
        }
      }

      // 3. If still not loaded, check localStorage
      if (!loaded && typeof window !== "undefined") {
        const local = localStorage.getItem("adm_settings");
        if (local) {
          try {
            const parsed = JSON.parse(local);
            const schemas = parsed.customSchemas || (parsed.marketing && parsed.marketing.customSchemas);
            if (Array.isArray(schemas) && schemas.length > 0) {
              setCustomSchemas(schemas);
              loaded = true;
            }
          } catch {}
        }
      }

      setLoading(false);
    }
    loadSchemas();
  }, []);

  const handleAddSchema = () => {
    const newId = `schema-${Date.now()}`;
    const newSchema: CustomSchemaItem = {
      id: newId,
      title: "New Custom Schema",
      enabled: true,
      scope: "site_wide",
      targetPages: [],
      schemaJson: DEFAULT_BUSINESS_SCHEMA_TEMPLATE
    };
    setCustomSchemas((prev) => [...prev, newSchema]);
  };

  const handleUpdateSchema = (id: string, updates: Partial<CustomSchemaItem>) => {
    setCustomSchemas((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveSchema = (id: string) => {
    if (confirm("Are you sure you want to delete this schema?")) {
      setCustomSchemas((prev) => prev.filter((item) => item.id !== id));
      setJsonValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleValidateSchemaJson = (id: string, jsonStr: string) => {
    try {
      JSON.parse(jsonStr);
      setJsonValidationErrors((prev) => ({ ...prev, [id]: null }));
    } catch (e: any) {
      setJsonValidationErrors((prev) => ({ ...prev, [id]: e.message }));
    }
  };

  const handleToggleTargetPage = (schemaId: string, pagePath: string) => {
    setCustomSchemas((prev) =>
      prev.map((item) => {
        if (item.id !== schemaId) return item;
        const currentPages = item.targetPages || [];
        const exists = currentPages.includes(pagePath);
        const updated = exists
          ? currentPages.filter((p) => p !== pagePath)
          : [...currentPages, pagePath];
        return { ...item, targetPages: updated };
      })
    );
  };

  const handleSave = async () => {
    // Check validation
    for (const s of customSchemas) {
      try {
        JSON.parse(s.schemaJson);
      } catch (err: any) {
        alert(`Schema "${s.title}" has invalid JSON: ${err.message}. Please fix it before saving.`);
        return;
      }
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      // 1. Save to localStorage for instant preview
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("adm_settings");
        let parsed = local ? JSON.parse(local) : {};
        parsed.customSchemas = customSchemas;
        if (!parsed.marketing) parsed.marketing = {};
        parsed.marketing.customSchemas = customSchemas;
        localStorage.setItem("adm_settings", JSON.stringify(parsed));
      }

      // 2. Persist to Disk via API & sync to Supabase server-side
      const baseData = { ...(settingsData as any) };
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("adm_settings");
        if (local) {
          try {
            const parsed = JSON.parse(local);
            Object.assign(baseData, parsed.settings || {}, parsed);
          } catch {}
        }
      }
      baseData.customSchemas = customSchemas;
      if (!baseData.marketing) baseData.marketing = {};
      baseData.marketing.customSchemas = customSchemas;

      const saveRes = await fetch("/api/admin/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "settings",
          data: baseData
        })
      });

      if (!saveRes.ok) {
        const errJson = await saveRes.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to persist schemas to server");
      }

      // 3. Also update Supabase client-side if permitted
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: cur } = await supabase.from("site_settings").select("marketing").eq("id", "main").maybeSingle();
          const updatedMarketing = {
            ...(cur?.marketing || {}),
            customSchemas
          };
          await supabase
            .from("site_settings")
            .update({ marketing: updatedMarketing })
            .eq("id", "main");
        } catch (sErr) {
          console.warn("Client Supabase sync warning (handled by backend API):", sErr);
        }
      }

      // 4. Real-time broadcast event to update live schemas instantly
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("settingsUpdated"));
      }

      setSaveStatus("✓ Schema configurations saved and activated on live site!");
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      setSaveStatus(`⚠️ Save notice: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <p style={{ color: "#64748b" }}>Loading schema configurations...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b", marginBottom: 6 }}>
          <span>Admin</span>
          <span>/</span>
          <span style={{ color: "#0f172a", fontWeight: 600 }}>Schema Manager</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#0f172a" }}>
              🏢 Custom &amp; Business Schema Manager
            </h1>
            <p style={{ margin: "6px 0 0 0", fontSize: 14, color: "#64748b" }}>
              Manage multiple structured data schemas (LocalBusiness, MedicalBusiness, MedicalOrganization) with precise page targeting.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
              <a
                href="https://search.google.com/test/rich-results?url=https%3A%2F%2Fwww.nosecreekphysiotherapy.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12.5, fontWeight: 600, color: "#0284c7", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                🔍 Test with Google Rich Results ↗
              </a>
              <span style={{ color: "#cbd5e1" }}>•</span>
              <a
                href="https://validator.schema.org/#url=https%3A%2F%2Fwww.nosecreekphysiotherapy.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12.5, fontWeight: 600, color: "#0284c7", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                🧪 Schema.org Validator ↗
              </a>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              type="button"
              onClick={handleAddSchema}
              className="adm-btn adm-btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", fontSize: 14, fontWeight: 600 }}
            >
              <span>+</span> Add New Schema
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="adm-btn adm-btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", fontSize: 14, fontWeight: 700 }}
            >
              {isSaving ? "Saving..." : "Save Schemas"}
            </button>
          </div>
        </div>
      </div>

      {saveStatus && (
        <div
          style={{
            marginBottom: 20,
            padding: "12px 18px",
            borderRadius: 10,
            background: saveStatus.includes("✓") ? "#dcfce7" : "#fee2e2",
            color: saveStatus.includes("✓") ? "#15803d" : "#b91c1c",
            border: saveStatus.includes("✓") ? "1px solid #86efac" : "1px solid #fca5a5",
            fontWeight: 600,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <span>{saveStatus.includes("✓") ? "✅" : "⚠️"}</span>
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Main Schemas List */}
      {customSchemas.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", background: "#ffffff", borderRadius: 16, border: "1px dashed #cbd5e1" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
          <h3 style={{ fontWeight: 700, fontSize: 16, color: "#1e293b", margin: "0 0 6px 0" }}>
            No custom schemas added yet
          </h3>
          <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px 0" }}>
            Click the button below to add your Business Schema or any custom JSON-LD schema.
          </p>
          <button
            type="button"
            onClick={handleAddSchema}
            className="adm-btn adm-btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, padding: "10px 20px" }}
          >
            <span>+</span> Add Business Schema
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {customSchemas.map((schema, index) => {
            const validationError = jsonValidationErrors[schema.id];
            return (
              <div
                key={schema.id || index}
                className="adm-card"
                style={{
                  border: schema.enabled ? "1px solid #cbd5e1" : "1px dashed #e2e8f0",
                  padding: 24,
                  background: schema.enabled ? "#ffffff" : "#f8fafc"
                }}
              >
                {/* Schema Card Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 18, borderBottom: "1px solid #f1f5f9", paddingBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 280 }}>
                    <span style={{ fontSize: 18 }}>🏢</span>
                    <input
                      type="text"
                      className="adm-input"
                      style={{ fontWeight: 700, fontSize: 15 }}
                      value={schema.title}
                      onChange={(e) => handleUpdateSchema(schema.id, { title: e.target.value })}
                      placeholder="Schema Name (e.g. Main Clinic Business Schema)"
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={schema.enabled}
                        onChange={(e) => handleUpdateSchema(schema.id, { enabled: e.target.checked })}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: schema.enabled ? "#16a34a" : "#64748b" }}>
                        {schema.enabled ? "Active" : "Disabled"}
                      </span>
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
                        padding: "6px 10px",
                        borderRadius: 6
                      }}
                    >
                      ✕ Delete
                    </button>
                  </div>
                </div>

                {/* Scope Selection */}
                <div style={{ background: "#f8fafc", padding: 16, borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 16 }}>
                  <label className="adm-form-label" style={{ marginBottom: 10, fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
                    📍 Where should this schema appear on the live website?
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: schema.scope === "specific" ? 14 : 0 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13.5 }}>
                      <input
                        type="radio"
                        name={`scope_${schema.id}`}
                        checked={schema.scope === "site_wide"}
                        onChange={() => handleUpdateSchema(schema.id, { scope: "site_wide" })}
                      />
                      <span style={{ fontWeight: schema.scope === "site_wide" ? 700 : 500, color: schema.scope === "site_wide" ? "#0284c7" : "#334155" }}>
                        🌐 Site-wide (All Pages)
                      </span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13.5 }}>
                      <input
                        type="radio"
                        name={`scope_${schema.id}`}
                        checked={schema.scope === "homepage"}
                        onChange={() => handleUpdateSchema(schema.id, { scope: "homepage" })}
                      />
                      <span style={{ fontWeight: schema.scope === "homepage" ? 700 : 500, color: schema.scope === "homepage" ? "#0284c7" : "#334155" }}>
                        🏠 Homepage Only (/)
                      </span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13.5 }}>
                      <input
                        type="radio"
                        name={`scope_${schema.id}`}
                        checked={schema.scope === "specific"}
                        onChange={() => handleUpdateSchema(schema.id, { scope: "specific" })}
                      />
                      <span style={{ fontWeight: schema.scope === "specific" ? 700 : 500, color: schema.scope === "specific" ? "#0284c7" : "#334155" }}>
                        🎯 Specific Page(s)
                      </span>
                    </label>
                  </div>

                  {/* Target Page Checklists */}
                  {schema.scope === "specific" && (
                    <div style={{ marginTop: 12, paddingTop: 14, borderTop: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
                        Check target pages to include:
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
                        <label className="adm-form-label" style={{ fontSize: 12 }}>
                          Custom Path(s) (comma-separated, wildcards supported like /locations/*):
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

                {/* Templates & Quick Action Bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
                  <label className="adm-form-label" style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>
                    JSON-LD Code:
                  </label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateSchema(schema.id, { schemaJson: DEFAULT_BUSINESS_SCHEMA_TEMPLATE });
                        handleValidateSchemaJson(schema.id, DEFAULT_BUSINESS_SCHEMA_TEMPLATE);
                      }}
                      className="adm-btn adm-btn-secondary"
                      style={{ fontSize: 12, padding: "4px 10px" }}
                    >
                      Business Template
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateSchema(schema.id, { schemaJson: DEFAULT_ORGANIZATION_SCHEMA_TEMPLATE });
                        handleValidateSchemaJson(schema.id, DEFAULT_ORGANIZATION_SCHEMA_TEMPLATE);
                      }}
                      className="adm-btn adm-btn-secondary"
                      style={{ fontSize: 12, padding: "4px 10px" }}
                    >
                      Organization Template
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateSchema(schema.id, { schemaJson: DEFAULT_FAQ_SCHEMA_TEMPLATE });
                        handleValidateSchemaJson(schema.id, DEFAULT_FAQ_SCHEMA_TEMPLATE);
                      }}
                      className="adm-btn adm-btn-secondary"
                      style={{ fontSize: 12, padding: "4px 10px" }}
                    >
                      FAQ Template
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleUpdateSchema(schema.id, { schemaJson: DEFAULT_SERVICE_SCHEMA_TEMPLATE });
                        handleValidateSchemaJson(schema.id, DEFAULT_SERVICE_SCHEMA_TEMPLATE);
                      }}
                      className="adm-btn adm-btn-secondary"
                      style={{ fontSize: 12, padding: "4px 10px" }}
                    >
                      Service Template
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
                      style={{ fontSize: 12, padding: "4px 10px" }}
                    >
                      Format JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.clipboard) {
                          navigator.clipboard.writeText(schema.schemaJson);
                          setCopiedId(schema.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }
                      }}
                      className="adm-btn adm-btn-secondary"
                      style={{ fontSize: 12, padding: "4px 10px", color: copiedId === schema.id ? "#16a34a" : undefined }}
                    >
                      {copiedId === schema.id ? "✓ Copied!" : "📋 Copy JSON"}
                    </button>
                  </div>
                </div>

                {/* JSON Code Textarea */}
                <div style={{ position: "relative" }}>
                  <textarea
                    className="adm-input"
                    rows={10}
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

                {/* Validation Indicator */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  {validationError ? (
                    <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
                      ❌ JSON Syntax Error: {validationError}
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
                      ✓ Valid JSON-LD Schema
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    Injected as &lt;script type=&quot;application/ld+json&quot;&gt;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
