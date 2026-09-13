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
  const [showPassword, setShowPassword] = useState(false);

  const [notifications, setNotifications] = useState<EmailNotificationSettings>(() => {
    const n = (settingsData as any).notifications || {};
    return {
      enabled: n.enabled ?? true,
      receiverEmail: n.receiverEmail || "info@nosecreekphysiotherapy.com",
      subjectPrefix: n.subjectPrefix || "[New Website Lead]",
      provider: n.provider || "smtp",
      resendApiKey: n.resendApiKey || "",
      senderName: n.senderName || "Nose Creek Website Forms",
      senderEmail: n.senderEmail || "",
      smtpHost: n.smtpHost || "smtp.gmail.com",
      smtpPort: n.smtpPort || 465,
      smtpUser: n.smtpUser || "",
      smtpPass: n.smtpPass || "",
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
              setNotifications((prev) => ({
                ...prev,
                enabled: n.enabled ?? true,
                receiverEmail: n.receiverEmail || prev.receiverEmail,
                subjectPrefix: n.subjectPrefix || prev.subjectPrefix,
                provider: n.provider || prev.provider,
                resendApiKey: n.resendApiKey || "",
                senderName: n.senderName || prev.senderName,
                senderEmail: n.senderEmail || "",
                smtpHost: n.smtpHost || prev.smtpHost,
                smtpPort: n.smtpPort || prev.smtpPort,
                smtpUser: n.smtpUser || "",
                smtpPass: n.smtpPass || "",
                webhookUrl: n.webhookUrl || ""
              }));
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
              setNotifications((prev) => ({
                ...prev,
                ...n
              }));
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

    if (notifications.provider === "smtp" && (!notifications.smtpHost || !notifications.smtpUser || !notifications.smtpPass)) {
      alert("Please enter your SMTP Host, Username, and Password / App Password before sending a test email.");
      return;
    }

    if (notifications.provider === "resend" && !notifications.resendApiKey) {
      alert("Please enter your Resend API Key before sending a test email.");
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
          tempSettings: notifications,
          form_type: "test_verification",
          name: "Dr. Test Patient",
          email: "test@patient.com",
          phone: "403-295-8590",
          preferredLocation: "Beddington Clinic (Calgary North)",
          message: "This is an instant verification email sent from your website admin dashboard. If you are reading this in your inbox, your email notification system is completely operational!"
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailStatus({
          loading: false,
          message: `✓ Test email delivered successfully to ${notifications.receiverEmail}! (Provider: ${data.status?.provider || notifications.provider}). Check your inbox or spam folder.`,
          success: true
        });
      } else {
        setTestEmailStatus({
          loading: false,
          message: `❌ Delivery Error: ${data.error || data.message || "Failed to send email. Check credentials."}`,
          success: false
        });
      }
    } catch (err: any) {
      setTestEmailStatus({
        loading: false,
        message: `❌ Connection Error: ${err.message || "Could not reach server endpoint."}`,
        success: false
      });
    }
  };

  const handleApplyGmailPreset = () => {
    setNotifications((prev) => ({
      ...prev,
      provider: "smtp",
      smtpHost: "smtp.gmail.com",
      smtpPort: 465,
      senderName: prev.senderName || "Nose Creek Website Forms"
    }));
  };

  const handleApplyWebmailPreset = () => {
    setNotifications((prev) => ({
      ...prev,
      provider: "smtp",
      smtpHost: "mail.nosecreekphysiotherapy.com",
      smtpPort: 465,
      senderName: prev.senderName || "Nose Creek Physiotherapy",
      senderEmail: "info@nosecreekphysiotherapy.com"
    }));
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
              Configure where patient inquiries are delivered, and set up your mail server credentials.
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
              1. Client Receiver Email &amp; Forwarding
            </h3>
            <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
              Set which inbox receives patient inquiries from website forms
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
              placeholder="e.g. info@nosecreekphysiotherapy.com, clinic@gmail.com"
              value={notifications.receiverEmail || ""}
              onChange={(e) => setNotifications({ ...notifications, receiverEmail: e.target.value })}
              required={notifications.enabled}
              style={{ fontSize: 14 }}
            />
            <span style={{ fontSize: 12, color: "#64748b", marginTop: 6, display: "block" }}>
              All patient form inquiries will be dispatched directly to this email. You can add multiple emails separated by commas.
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
              Example in inbox: <strong>{notifications.subjectPrefix || "[New Website Lead]"} [Appointment Booking Request] Patient Name</strong>
            </span>
          </div>
        </div>

        {/* Delivery Provider Options */}
        <div style={{ background: "#f8fafc", padding: 22, borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                2. Email Delivery Method (How emails are sent)
              </div>
              <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
                To send emails across the internet to any receiver inbox, choose your delivery provider:
              </p>
            </div>

            {notifications.provider === "smtp" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={handleApplyGmailPreset}
                  className="adm-btn adm-btn-secondary"
                  style={{ fontSize: 12, padding: "4px 10px" }}
                >
                  Gmail Preset
                </button>
                <button
                  type="button"
                  onClick={handleApplyWebmailPreset}
                  className="adm-btn adm-btn-secondary"
                  style={{ fontSize: 12, padding: "4px 10px" }}
                >
                  Clinic Webmail Preset
                </button>
              </div>
            )}
          </div>

          {/* Provider Radio Selection */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
            <label
              style={{
                border: notifications.provider === "smtp" ? "2px solid #0284c7" : "1px solid #cbd5e1",
                background: notifications.provider === "smtp" ? "#f0f9ff" : "#ffffff",
                padding: "12px 14px",
                borderRadius: 8,
                cursor: "pointer",
                display: "block"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <input
                  type="radio"
                  name="provider"
                  checked={notifications.provider === "smtp"}
                  onChange={() => setNotifications({ ...notifications, provider: "smtp" })}
                />
                <strong style={{ fontSize: 13, color: "#0f172a" }}>SMTP (Recommended)</strong>
              </div>
              <span style={{ fontSize: 11.5, color: "#64748b", display: "block", paddingLeft: 24 }}>
                Works with Gmail, cPanel, Webmail, Outlook, or any standard mail server.
              </span>
            </label>

            <label
              style={{
                border: notifications.provider === "resend" ? "2px solid #0284c7" : "1px solid #cbd5e1",
                background: notifications.provider === "resend" ? "#f0f9ff" : "#ffffff",
                padding: "12px 14px",
                borderRadius: 8,
                cursor: "pointer",
                display: "block"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <input
                  type="radio"
                  name="provider"
                  checked={notifications.provider === "resend"}
                  onChange={() => setNotifications({ ...notifications, provider: "resend" })}
                />
                <strong style={{ fontSize: 13, color: "#0f172a" }}>Resend API</strong>
              </div>
              <span style={{ fontSize: 11.5, color: "#64748b", display: "block", paddingLeft: 24 }}>
                Cloud API service with verified domain or resend account.
              </span>
            </label>

            <label
              style={{
                border: notifications.provider === "webhook" ? "2px solid #0284c7" : "1px solid #cbd5e1",
                background: notifications.provider === "webhook" ? "#f0f9ff" : "#ffffff",
                padding: "12px 14px",
                borderRadius: 8,
                cursor: "pointer",
                display: "block"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <input
                  type="radio"
                  name="provider"
                  checked={notifications.provider === "webhook"}
                  onChange={() => setNotifications({ ...notifications, provider: "webhook" })}
                />
                <strong style={{ fontSize: 13, color: "#0f172a" }}>Webhook Relay</strong>
              </div>
              <span style={{ fontSize: 11.5, color: "#64748b", display: "block", paddingLeft: 24 }}>
                Send JSON payload to Zapier, Make, Slack, or a custom webhook.
              </span>
            </label>
          </div>

          {/* 2A. SMTP Fields */}
          {notifications.provider === "smtp" && (
            <div style={{ background: "#ffffff", padding: 18, borderRadius: 10, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 14 }}>
                <div className="adm-form-group" style={{ margin: 0 }}>
                  <label className="adm-form-label">
                    SMTP Host <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="smtp.gmail.com or mail.nosecreekphysiotherapy.com"
                    value={notifications.smtpHost || ""}
                    onChange={(e) => setNotifications({ ...notifications, smtpHost: e.target.value })}
                  />
                </div>

                <div className="adm-form-group" style={{ margin: 0 }}>
                  <label className="adm-form-label">
                    SMTP Port <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    className="adm-input"
                    placeholder="465 (SSL) or 587 (TLS)"
                    value={notifications.smtpPort || 465}
                    onChange={(e) => setNotifications({ ...notifications, smtpPort: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                <div className="adm-form-group" style={{ margin: 0 }}>
                  <label className="adm-form-label">
                    SMTP Username / Email <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="e.g. info@nosecreekphysiotherapy.com or yourclinic@gmail.com"
                    value={notifications.smtpUser || ""}
                    onChange={(e) => setNotifications({ ...notifications, smtpUser: e.target.value })}
                  />
                </div>

                <div className="adm-form-group" style={{ margin: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label className="adm-form-label" style={{ margin: 0 }}>
                      SMTP Password / App Password <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: "none", border: "none", color: "#0284c7", fontSize: 11, cursor: "pointer", padding: 0 }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="adm-input"
                    placeholder="Email password or Google App Password"
                    value={notifications.smtpPass || ""}
                    onChange={(e) => setNotifications({ ...notifications, smtpPass: e.target.value })}
                    style={{ marginTop: 4 }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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

                <div className="adm-form-group" style={{ margin: 0 }}>
                  <label className="adm-form-label">Sender From Email (Optional)</label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="Leave empty to use SMTP Username"
                    value={notifications.senderEmail || ""}
                    onChange={(e) => setNotifications({ ...notifications, senderEmail: e.target.value })}
                  />
                </div>
              </div>

              {/* Helpful instructions for Gmail */}
              <div style={{ marginTop: 14, padding: "10px 14px", background: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1", fontSize: 12, color: "#475569" }}>
                💡 <strong>Using Gmail?</strong> Use Host: <code style={{ color: "#0284c7" }}>smtp.gmail.com</code>, Port: <code style={{ color: "#0284c7" }}>465</code>, Username: <code style={{ color: "#0284c7" }}>yourgmail@gmail.com</code>, and generate a 16-letter App Password at <strong>myaccount.google.com/apppasswords</strong> (with 2-Step Verification turned on).
              </div>
            </div>
          )}

          {/* 2B. Resend Fields */}
          {notifications.provider === "resend" && (
            <div style={{ background: "#ffffff", padding: 18, borderRadius: 10, border: "1px solid #e2e8f0" }}>
              <div className="adm-form-group" style={{ marginBottom: 14 }}>
                <label className="adm-form-label">
                  Resend API Key <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="password"
                  className="adm-input"
                  placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={notifications.resendApiKey || ""}
                  onChange={(e) => setNotifications({ ...notifications, resendApiKey: e.target.value })}
                />
                <span style={{ fontSize: 12, color: "#64748b", marginTop: 4, display: "block" }}>
                  Get your free API key at <strong>resend.com/api-keys</strong>.
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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

                <div className="adm-form-group" style={{ margin: 0 }}>
                  <label className="adm-form-label">Sender Email (From address)</label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="e.g. info@nosecreekphysiotherapy.com (requires verified domain)"
                    value={notifications.senderEmail || ""}
                    onChange={(e) => setNotifications({ ...notifications, senderEmail: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginTop: 14, padding: "10px 14px", background: "#fef3c7", borderRadius: 8, border: "1px solid #fde68a", fontSize: 12, color: "#92400e" }}>
                ⚠️ <strong>Important Resend Rule:</strong> If you use the free test address (<code>onboarding@resend.dev</code>), Resend only permits sending to the email address registered on your Resend account. To send to any client email, verify your clinic domain at <strong>resend.com/domains</strong> or switch to <strong>SMTP</strong> above.
              </div>
            </div>
          )}

          {/* 2C. Webhook Fields */}
          {notifications.provider === "webhook" && (
            <div style={{ background: "#ffffff", padding: 18, borderRadius: 10, border: "1px solid #e2e8f0" }}>
              <div className="adm-form-group" style={{ margin: 0 }}>
                <label className="adm-form-label">
                  Webhook URL <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="url"
                  className="adm-input"
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  value={notifications.webhookUrl || ""}
                  onChange={(e) => setNotifications({ ...notifications, webhookUrl: e.target.value })}
                />
                <span style={{ fontSize: 12, color: "#64748b", marginTop: 4, display: "block" }}>
                  Every form submission will be posted as JSON to this webhook endpoint.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Live Test Email Section */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
              3. Send Verification Test Email
            </div>
            <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
              Dispatches an instant live email right now using your settings to confirm delivery.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSendTestEmail}
            disabled={testEmailStatus.loading || !notifications.receiverEmail}
            className="adm-btn adm-btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, padding: "8px 18px", fontWeight: 700 }}
          >
            {testEmailStatus.loading ? (
              <>
                <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span>
                <span>Sending Test Email...</span>
              </>
            ) : (
              <>
                <span>✉️</span>
                <span>Send Test Email Now</span>
              </>
            )}
          </button>
        </div>

        {testEmailStatus.message && (
          <div
            style={{
              marginTop: 16,
              fontSize: 13,
              padding: "12px 16px",
              borderRadius: 8,
              background: testEmailStatus.success ? "#dcfce7" : "#fee2e2",
              color: testEmailStatus.success ? "#15803d" : "#b91c1c",
              border: testEmailStatus.success ? "1px solid #86efac" : "1px solid #fca5a5",
              fontWeight: 600,
              lineHeight: 1.5
            }}
          >
            {testEmailStatus.message}
          </div>
        )}
      </div>

      {/* Visual Form Identification Guide */}
      <div className="adm-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
          🔍 How the Client Identifies Which Form Was Submitted
        </h3>
        <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "#64748b" }}>
          Whenever an email arrives in the client&apos;s inbox, the email subject line and header card immediately identify the exact form:
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13.5, color: "#0369a1" }}>
              <span>📅</span>
              <span>Appointment Booking Request</span>
            </div>
            <div style={{ fontSize: 12, color: "#0284c7", marginTop: 4 }}>
              <strong>Subject:</strong> {notifications.subjectPrefix || "[New Website Lead]"} [Appointment Booking Request] John Doe
            </div>
            <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
              Triggered when a patient books an appointment online.
            </div>
          </div>

          <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 8, padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13.5, color: "#047857" }}>
              <span>✉️</span>
              <span>Contact Page Inquiry</span>
            </div>
            <div style={{ fontSize: 12, color: "#059669", marginTop: 4 }}>
              <strong>Subject:</strong> {notifications.subjectPrefix || "[New Website Lead]"} [Contact Page Inquiry] Sarah Smith
            </div>
            <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
              Triggered from the general Contact Us page inquiry form.
            </div>
          </div>

          <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13.5, color: "#6b21a8" }}>
              <span>🎓</span>
              <span>Workshop Registration</span>
            </div>
            <div style={{ fontSize: 12, color: "#7c3aed", marginTop: 4 }}>
              <strong>Subject:</strong> {notifications.subjectPrefix || "[New Website Lead]"} [Workshop Registration] Mike Taylor
            </div>
            <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
              Triggered when someone signs up for an educational workshop.
            </div>
          </div>

          <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: 8, padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13.5, color: "#b45309" }}>
              <span>▶️</span>
              <span>Workshop Replay Request</span>
            </div>
            <div style={{ fontSize: 12, color: "#d97706", marginTop: 4 }}>
              <strong>Subject:</strong> {notifications.subjectPrefix || "[New Website Lead]"} [Workshop Replay Request] Emily Davis
            </div>
            <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
              Triggered when someone requests access to a recorded replay.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
