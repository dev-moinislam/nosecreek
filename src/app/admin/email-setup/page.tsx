"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/components/admin/RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { EmailNotificationSettings } from "@/types/content";
import settingsData from "@/data/settings.json";

export default function AdminEmailSetupPage() {
  const { role, isAdmin } = useRole();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

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

  const [testEmailStatus, setTestEmailStatus] = useState<{
    loading: boolean;
    message: string | null;
    success: boolean | null;
  }>({ loading: false, message: null, success: null });

  useEffect(() => {
    async function loadSettings() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase
            .from("site_settings")
            .select("*")
            .single();

          if (data) {
            const m = data.marketing || {};
            const n = m.notifications || data.notifications;
            if (n) {
              setNotifications({
                enabled: n.enabled ?? true,
                receiverEmail: n.receiverEmail || "info@nosecreekphysiotherapy.com",
                subjectPrefix: n.subjectPrefix || "[New Website Lead]",
                provider: n.provider || "resend",
                resendApiKey: n.resendApiKey || "",
                senderName: n.senderName || "Nose Creek Website Forms",
                webhookUrl: n.webhookUrl || ""
              });
            }
          }
        } catch {
          // ignore
        }
      } else if (typeof window !== "undefined") {
        const local = localStorage.getItem("adm_settings");
        if (local) {
          try {
            const parsed = JSON.parse(local);
            const n = parsed.notifications || (parsed.marketing && parsed.marketing.notifications);
            if (n) {
              setNotifications({
                enabled: n.enabled ?? true,
                receiverEmail: n.receiverEmail || "info@nosecreekphysiotherapy.com",
                subjectPrefix: n.subjectPrefix || "[New Website Lead]",
                provider: n.provider || "resend",
                resendApiKey: n.resendApiKey || "",
                senderName: n.senderName || "Nose Creek Website Forms",
                webhookUrl: n.webhookUrl || ""
              });
            }
          } catch {
            // ignore
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
          formType: "Test Notification Email",
          name: "Test Verification",
          email: "test@example.com",
          phone: "403-295-8590",
          preferredLocation: "Beddington Clinic",
          message: "This is a test notification dispatched from the admin dashboard to verify that your email forwarding is working properly.",
          submittedAt: new Date().toISOString()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailStatus({
          loading: false,
          message: data.forwarded
            ? `Test email sent successfully to ${data.recipient || notifications.receiverEmail}!`
            : data.reason || "Dispatch processed.",
          success: true
        });
      } else {
        setTestEmailStatus({
          loading: false,
          message: data.error || data.message || "Failed to send test email. Check API key or logs.",
          success: false
        });
      }
    } catch (err: any) {
      setTestEmailStatus({
        loading: false,
        message: err.message || "Error connecting to notification service.",
        success: false
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      // 1. Save to localStorage for instant local preview
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("adm_settings");
        let parsed = local ? JSON.parse(local) : {};
        parsed.notifications = notifications;
        if (!parsed.marketing) parsed.marketing = {};
        parsed.marketing.notifications = notifications;
        localStorage.setItem("adm_settings", JSON.stringify(parsed));
      }

      // 2. Persist to Disk via API
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
      baseData.notifications = notifications;
      if (!baseData.marketing) baseData.marketing = {};
      baseData.marketing.notifications = notifications;

      await fetch("/api/admin/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "settings",
          data: baseData
        })
      });

      // 3. Persist to Supabase if configured
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: cur } = await supabase.from("site_settings").select("marketing").eq("id", "main").single();
          const updatedMarketing = {
            ...(cur?.marketing || {}),
            notifications
          };
          await supabase
            .from("site_settings")
            .update({ marketing: updatedMarketing })
            .match({ id: "main" });
        } catch (sErr) {
          console.warn("Supabase update error:", sErr);
        }
      }

      setSaveStatus("✓ Email notification settings saved successfully!");
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      setSaveStatus(`⚠️ Saved locally (Database notice: ${err.message})`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <p style={{ color: "#64748b" }}>Loading email notification settings...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b", marginBottom: 6 }}>
          <span>Admin</span>
          <span>/</span>
          <span style={{ color: "#0f172a", fontWeight: 600 }}>Email Notifications</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#0f172a" }}>
              📬 Form Submissions &amp; Client Email Setup
            </h1>
            <p style={{ margin: "6px 0 0 0", fontSize: 14, color: "#64748b" }}>
              Configure where patient inquiries, booking requests, and workshop sign-ups are forwarded.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="adm-btn adm-btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", fontSize: 14, fontWeight: 700 }}
          >
            {isSaving ? "Saving..." : "Save Email Settings"}
          </button>
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

      {/* Main Settings Card */}
      <div className="adm-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: 14, marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              Receiver &amp; Forwarding Controls
            </h3>
            <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
              Toggle instant forwarding on or off and set the recipient inbox(es)
            </p>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={Boolean(notifications.enabled)}
              onChange={(e) => setNotifications({ ...notifications, enabled: e.target.checked })}
              style={{ width: 18, height: 18, cursor: "pointer" }}
            />
            <span style={{ fontSize: 14, fontWeight: 700, color: notifications.enabled ? "#16a34a" : "#64748b" }}>
              {notifications.enabled ? "Forwarding Active" : "Forwarding Disabled"}
            </span>
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div className="adm-form-group" style={{ margin: 0 }}>
            <label className="adm-form-label" style={{ fontWeight: 700 }}>
              Client Receiver Email(s) <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              className="adm-input"
              placeholder="e.g. info@nosecreekphysiotherapy.com, clinic@nosecreek.com"
              value={notifications.receiverEmail || ""}
              onChange={(e) => setNotifications({ ...notifications, receiverEmail: e.target.value })}
              required={notifications.enabled}
              style={{ fontSize: 14 }}
            />
            <span style={{ fontSize: 12, color: "#64748b", marginTop: 6, display: "block" }}>
              All patient form inquiries (Contact, Appointment, Workshop, and any new forms) will be dispatched here. Separate multiple emails with a comma.
            </span>
          </div>

          <div className="adm-form-group" style={{ margin: 0 }}>
            <label className="adm-form-label" style={{ fontWeight: 700 }}>
              Email Subject Prefix
            </label>
            <input
              type="text"
              className="adm-input"
              placeholder="[New Website Lead]"
              value={notifications.subjectPrefix || ""}
              onChange={(e) => setNotifications({ ...notifications, subjectPrefix: e.target.value })}
              style={{ fontSize: 14 }}
            />
            <span style={{ fontSize: 12, color: "#64748b", marginTop: 6, display: "block" }}>
              Prefix added to the subject line so clinic staff can filter and identify inquiries immediately in their email inbox.
            </span>
          </div>
        </div>

        {/* Delivery Provider Options */}
        <div style={{ background: "#f8fafc", padding: 20, borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
            ⚙️ Delivery Provider Configuration
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="adm-form-group" style={{ margin: 0 }}>
              <label className="adm-form-label">Delivery Provider</label>
              <select
                className="adm-input"
                value={notifications.provider || "resend"}
                onChange={(e) => setNotifications({ ...notifications, provider: e.target.value as any })}
                style={{ fontSize: 13.5 }}
              >
                <option value="resend">Resend API (Standard &amp; Direct to Inbox)</option>
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
                style={{ fontSize: 13.5 }}
              />
            </div>
          </div>

          {notifications.provider === "resend" && (
            <div className="adm-form-group" style={{ marginTop: 16, marginBottom: 0 }}>
              <label className="adm-form-label">
                Resend API Key <span style={{ color: "#64748b", fontWeight: 400 }}>(Optional if configured in environment variables)</span>
              </label>
              <input
                type="password"
                className="adm-input"
                placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={notifications.resendApiKey || ""}
                onChange={(e) => setNotifications({ ...notifications, resendApiKey: e.target.value })}
                style={{ fontSize: 13.5 }}
              />
              <span style={{ fontSize: 12, color: "#64748b", marginTop: 4, display: "block" }}>
                Provide an API key if you want to override the server-side environment key.
              </span>
            </div>
          )}

          {notifications.provider === "webhook" && (
            <div className="adm-form-group" style={{ marginTop: 16, marginBottom: 0 }}>
              <label className="adm-form-label">Webhook URL</label>
              <input
                type="url"
                className="adm-input"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={notifications.webhookUrl || ""}
                onChange={(e) => setNotifications({ ...notifications, webhookUrl: e.target.value })}
                style={{ fontSize: 13.5 }}
              />
              <span style={{ fontSize: 12, color: "#64748b", marginTop: 4, display: "block" }}>
                Every form submission payload will be sent as a JSON POST request to this URL.
              </span>
            </div>
          )}
        </div>

        {/* Live Test Email Section */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
              🧪 Send Verification Test Email
            </div>
            <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
              Send a sample form submission right now to confirm delivery to {notifications.receiverEmail || "your inbox"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSendTestEmail}
            disabled={testEmailStatus.loading || !notifications.receiverEmail}
            className="adm-btn adm-btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, padding: "8px 18px", fontWeight: 600 }}
          >
            {testEmailStatus.loading ? (
              <>
                <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span>
                <span>Sending Test Email...</span>
              </>
            ) : (
              <>
                <span>✉️</span>
                <span>Send Test Email</span>
              </>
            )}
          </button>
        </div>

        {testEmailStatus.message && (
          <div
            style={{
              marginTop: 16,
              fontSize: 13,
              padding: "10px 14px",
              borderRadius: 8,
              background: testEmailStatus.success ? "#dcfce7" : "#fee2e2",
              color: testEmailStatus.success ? "#15803d" : "#b91c1c",
              border: testEmailStatus.success ? "1px solid #86efac" : "1px solid #fca5a5",
              fontWeight: 600
            }}
          >
            {testEmailStatus.message}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: 20 }}>
        <h4 style={{ margin: "0 0 6px 0", fontSize: 14, fontWeight: 700, color: "#0369a1" }}>
          💡 How Automated Form Forwarding Works:
        </h4>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#0c4a6e", lineHeight: 1.6 }}>
          <li>Whenever a visitor fills out an <strong>Appointment Booking</strong>, <strong>Contact Inquiry</strong>, <strong>Workshop Registration</strong>, or any future form on the site, the backend immediately packages the entry into an email.</li>
          <li>The email includes full patient details: Name, Email, Phone, Preferred Location, and Message/Inquiry.</li>
          <li>The email is styled with responsive HTML so clinic staff can read and reply straight from their mobile phone or desktop email client.</li>
        </ul>
      </div>
    </div>
  );
}
