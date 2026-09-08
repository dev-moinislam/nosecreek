"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRole } from "@/components/admin/RoleGuard";
import { RedirectRule, NotFoundLogItem, RedirectStatusCode } from "@/types/redirects";
import { RedirectIcon, SearchIcon, ExternalLinkIcon, XIcon } from "@/components/admin/AdminIcons";

export default function AdminRedirectsPage() {
  const { role, isAdmin } = useRole();
  const [rules, setRules] = useState<RedirectRule[]>([]);
  const [notFoundLogs, setNotFoundLogs] = useState<NotFoundLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"redirects" | "notFound" | "tester">("redirects");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "301" | "302" | "active" | "inactive">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RedirectRule | null>(null);
  const [resolvingNotFoundId, setResolvingNotFoundId] = useState<string | null>(null);

  // Form Fields
  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");
  const [statusCode, setStatusCode] = useState<RedirectStatusCode>(301);
  const [enabled, setEnabled] = useState(true);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Redirect Tester State
  const [testInput, setTestInput] = useState("");
  const [testResult, setTestResult] = useState<{
    testedUrl: string;
    matched: boolean;
    rule?: RedirectRule;
    destination?: string;
    statusCode?: number;
  } | null>(null);

  // Copy indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/redirects");
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
        setNotFoundLogs(data.notFoundLogs || []);
      }
    } catch (err) {
      console.error("Failed to load redirects data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMsg({ type, text });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  // Open Modal for Add
  const handleOpenAddModal = (presetFrom = "", presetNotFoundId: string | null = null) => {
    setEditingRule(null);
    setResolvingNotFoundId(presetNotFoundId);
    setFromPath(presetFrom);
    setToPath("");
    setStatusCode(301);
    setEnabled(true);
    setNotes(presetNotFoundId ? "Fixed from 404 broken link log" : "");
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (rule: RedirectRule) => {
    setEditingRule(rule);
    setResolvingNotFoundId(null);
    setFromPath(rule.fromPath);
    setToPath(rule.toPath);
    setStatusCode(rule.statusCode);
    setEnabled(rule.enabled);
    setNotes(rule.notes || "");
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
    setResolvingNotFoundId(null);
  };

  // Save Rule
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromPath.trim() || !toPath.trim()) {
      showFeedback("Please enter both the source path and destination URL.", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rule: {
            id: editingRule?.id,
            fromPath,
            toPath,
            statusCode,
            enabled,
            notes,
            hitCount: editingRule?.hitCount || 0,
            createdAt: editingRule?.createdAt
          },
          notFoundId: resolvingNotFoundId
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRules(data.rules);
        if (resolvingNotFoundId) {
          setNotFoundLogs((prev) => prev.filter((l) => l.id !== resolvingNotFoundId));
        }
        setIsModalOpen(false);
        showFeedback(editingRule ? "Redirect rule updated successfully! ✨" : "New redirect rule created live! 🚀");
      } else {
        showFeedback(data.error || "Failed to save redirect rule", "error");
      }
    } catch (err: any) {
      showFeedback(err.message || "Network error while saving", "error");
    } finally {
      setSaving(false);
    }
  };

  // Toggle Rule Status
  const handleToggleRule = async (rule: RedirectRule) => {
    try {
      const res = await fetch("/api/admin/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", id: rule.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRules(data.rules);
        showFeedback(`Redirect ${rule.fromPath} is now ${!rule.enabled ? "ACTIVE" : "PAUSED"}.`);
      }
    } catch (err) {
      showFeedback("Failed to update status", "error");
    }
  };

  // Delete Rule
  const handleDeleteRule = async (ruleId: string, pathName: string) => {
    if (!confirm(`Are you sure you want to delete the redirect for "${pathName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/redirects?id=${encodeURIComponent(ruleId)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRules(data.rules);
        showFeedback("Redirect rule deleted successfully.");
      }
    } catch (err) {
      showFeedback("Failed to delete rule", "error");
    }
  };

  // Delete / Dismiss 404 Log
  const handleDelete404Log = async (notFoundId: string) => {
    try {
      const res = await fetch(`/api/admin/redirects?notFoundId=${encodeURIComponent(notFoundId)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotFoundLogs(data.notFoundLogs);
        showFeedback("404 log entry dismissed.");
      }
    } catch (err) {
      showFeedback("Failed to dismiss log entry", "error");
    }
  };

  // Clear all 404 logs
  const handleClearAll404s = async () => {
    if (!confirm("Are you sure you want to clear all detected 404 broken link logs?")) return;

    try {
      const res = await fetch("/api/admin/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear404Logs" })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotFoundLogs([]);
        showFeedback("All 404 broken URL logs cleared.");
      }
    } catch (err) {
      showFeedback("Failed to clear logs", "error");
    }
  };

  // Test / Simulate a Path
  const handleSimulateRedirect = (inputPath?: string) => {
    const raw = (inputPath !== undefined ? inputPath : testInput).trim();
    if (!raw) return;

    const normalized = raw.startsWith("/") ? raw.toLowerCase() : `/${raw.toLowerCase()}`;
    const cleanPath = normalized.replace(/\/+$/, "") || "/";

    const match = rules.find((r) => {
      const ruleFrom = r.fromPath.toLowerCase().replace(/\/+$/, "") || "/";
      return r.enabled && (ruleFrom === cleanPath || ruleFrom === normalized);
    });

    if (match) {
      setTestResult({
        testedUrl: normalized,
        matched: true,
        rule: match,
        destination: match.toPath,
        statusCode: match.statusCode
      });
    } else {
      setTestResult({
        testedUrl: normalized,
        matched: false
      });
    }
  };

  const handleCopyLink = (text: string, id: string) => {
    const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${text}` : text;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter Rules
  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.fromPath.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.toPath.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rule.notes && rule.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "301") return rule.statusCode === 301;
    if (statusFilter === "302") return rule.statusCode === 302 || rule.statusCode === 307;
    if (statusFilter === "active") return rule.enabled;
    if (statusFilter === "inactive") return !rule.enabled;

    return true;
  });

  // Calculate Stats
  const totalRules = rules.length;
  const activeCount = rules.filter((r) => r.enabled).length;
  const count301 = rules.filter((r) => r.statusCode === 301).length;
  const count302 = rules.filter((r) => r.statusCode === 302 || r.statusCode === 307).length;
  const totalHits = rules.reduce((acc, curr) => acc + (curr.hitCount || 0), 0);
  const broken404Count = notFoundLogs.length;

  const quickPickDestinations = [
    { label: "Physiotherapy Service", path: "/services/physiotherapy" },
    { label: "All Services Hub", path: "/services" },
    { label: "Conditions Treated", path: "/conditions" },
    { label: "Book Appointment", path: "/contact" },
    { label: "Clinic Team", path: "/team" },
    { label: "Google Reviews", path: "/reviews" },
    { label: "Workshops & Events", path: "/workshops" },
    { label: "New Patients Info", path: "/new-patients" },
    { label: "Blog & Articles", path: "/blog" }
  ];

  return (
    <div className="adm-content-container" style={{ maxWidth: 1280, margin: "0 auto", paddingBottom: 60 }}>
      {/* Toast Feedback Notification */}
      {feedbackMsg && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 20px",
            borderRadius: 12,
            background: feedbackMsg.type === "success" ? "#0f172a" : "#991b1b",
            color: "#ffffff",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            fontSize: 13.5,
            fontWeight: 600,
            animation: "fadeIn 0.2s ease-out"
          }}
        >
          <span>{feedbackMsg.type === "success" ? "✓" : "⚠️"}</span>
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(14, 120, 168, 0.12)",
                  color: "var(--primary, #0e78a8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <RedirectIcon size={20} />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "var(--adm-text, #0f172a)" }}>
                Redirects & 404 Error Manager
              </h1>
            </div>
            <p style={{ margin: 0, color: "var(--adm-text-muted, #64748b)", fontSize: 13.5, maxWidth: 680 }}>
              Create instant 301 permanent redirects, 302 temporary campaign links, custom shortlinks (e.g. <code>/promo</code>), and monitor broken 404 URLs discovered by real visitors and search engines.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                setActiveTab("tester");
                if (!testInput && rules.length > 0) {
                  setTestInput(rules[0].fromPath);
                  handleSimulateRedirect(rules[0].fromPath);
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 15px",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                color: "#334155",
                transition: "all 0.15s"
              }}
            >
              <span>⚡ Redirect Simulator</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenAddModal()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 18px",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                background: "var(--primary, #0e78a8)",
                color: "#ffffff",
                border: "none",
                boxShadow: "0 2px 8px rgba(14, 120, 168, 0.25)",
                transition: "all 0.15s"
              }}
            >
              <span>+ Add New Redirect</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 14,
          marginBottom: 24
        }}
      >
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            Total Rules
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{totalRules}</div>
          <div style={{ fontSize: 11.5, color: "#16a34a", marginTop: 4, fontWeight: 600 }}>{activeCount} active in middleware</div>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            301 Permanent
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#16a34a" }}>{count301}</div>
          <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>SEO URL Migrations</div>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            302 / 307 Temporary
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0284c7" }}>{count302}</div>
          <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>Promos & Custom Shortlinks</div>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            Total Redirect Hits
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#7c3aed" }}>{totalHits}</div>
          <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>Visitor transitions handled</div>
        </div>

        <div
          onClick={() => setActiveTab("notFound")}
          style={{
            background: broken404Count > 0 ? "rgba(239, 68, 68, 0.05)" : "#ffffff",
            border: `1px solid ${broken404Count > 0 ? "#fca5a5" : "#e2e8f0"}`,
            borderRadius: 12,
            padding: "16px 18px",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            transition: "all 0.15s"
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: broken404Count > 0 ? "#dc2626" : "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            404 Broken URLs
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: broken404Count > 0 ? "#dc2626" : "#0f172a" }}>
            {broken404Count}
          </div>
          <div style={{ fontSize: 11.5, color: broken404Count > 0 ? "#b91c1c" : "#64748b", marginTop: 4, fontWeight: 600 }}>
            {broken404Count > 0 ? "⚡ Click to review & 1-click fix" : "Clean — no recent 404 errors"}
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #e2e8f0", marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => setActiveTab("redirects")}
          style={{
            padding: "10px 18px",
            fontSize: 13.5,
            fontWeight: 700,
            border: "none",
            background: "none",
            cursor: "pointer",
            color: activeTab === "redirects" ? "var(--primary, #0e78a8)" : "#64748b",
            borderBottom: activeTab === "redirects" ? "2px solid var(--primary, #0e78a8)" : "2px solid transparent",
            marginBottom: -1,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <span>Active Redirect Rules</span>
          <span
            style={{
              fontSize: 11,
              padding: "1px 7px",
              borderRadius: 999,
              background: activeTab === "redirects" ? "rgba(14, 120, 168, 0.12)" : "#f1f5f9",
              color: activeTab === "redirects" ? "var(--primary, #0e78a8)" : "#64748b"
            }}
          >
            {rules.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notFound")}
          style={{
            padding: "10px 18px",
            fontSize: 13.5,
            fontWeight: 700,
            border: "none",
            background: "none",
            cursor: "pointer",
            color: activeTab === "notFound" ? "#dc2626" : "#64748b",
            borderBottom: activeTab === "notFound" ? "2px solid #dc2626" : "2px solid transparent",
            marginBottom: -1,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <span>404 Broken URL Tracker</span>
          {broken404Count > 0 && (
            <span
              style={{
                fontSize: 11,
                padding: "1px 7px",
                borderRadius: 999,
                background: "#fee2e2",
                color: "#b91c1c",
                fontWeight: 800
              }}
            >
              {broken404Count}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tester")}
          style={{
            padding: "10px 18px",
            fontSize: 13.5,
            fontWeight: 700,
            border: "none",
            background: "none",
            cursor: "pointer",
            color: activeTab === "tester" ? "var(--primary, #0e78a8)" : "#64748b",
            borderBottom: activeTab === "tester" ? "2px solid var(--primary, #0e78a8)" : "2px solid transparent",
            marginBottom: -1,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <span>In-Dashboard Simulator</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REDIRECT RULES TABLE */}
      {/* ========================================================================= */}
      {activeTab === "redirects" && (
        <div>
          {/* Controls Bar: Search & Status Filters */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12
            }}
          >
            {/* Filter Pills */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                { key: "all", label: "All Rules", count: rules.length },
                { key: "301", label: "301 Permanent", count: count301 },
                { key: "302", label: "302/307 Temporary", count: count302 },
                { key: "active", label: "Active", count: activeCount },
                { key: "inactive", label: "Paused", count: totalRules - activeCount }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setStatusFilter(item.key as any)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    background: statusFilter === item.key ? "var(--primary, #0e78a8)" : "#f1f5f9",
                    color: statusFilter === item.key ? "#ffffff" : "#475569",
                    transition: "all 0.15s"
                  }}
                >
                  {item.label} ({item.count})
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ minWidth: 260, position: "relative" }}>
              <input
                type="text"
                placeholder="Search source, destination, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "7px 12px 7px 32px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: 13,
                  outline: "none",
                  background: "#f8fafc"
                }}
              />
              <span style={{ position: "absolute", left: 10, top: 8, color: "#94a3b8", pointerEvents: "none" }}>
                🔍
              </span>
            </div>
          </div>

          {/* Table */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
            }}
          >
            {loading ? (
              <div style={{ padding: 48, textAlign: "center", color: "#64748b" }}>
                <div style={{ display: "inline-block", width: 24, height: 24, border: "3px solid #0e78a8", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 12 }} />
                <div>Loading redirect rules...</div>
              </div>
            ) : filteredRules.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: "#64748b" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🔀</div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>No redirect rules found</p>
                <p style={{ margin: "6px 0 16px 0", fontSize: 13 }}>
                  {searchQuery ? "No rules match your search query." : "You have not configured any custom redirect rules yet."}
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal()}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: "var(--primary, #0e78a8)",
                    color: "#ffffff",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Create First Redirect
                </button>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 700, fontSize: 12 }}>
                      <th style={{ padding: "12px 16px" }}>Source Link / Shortlink</th>
                      <th style={{ padding: "12px 16px", width: 30, textAlign: "center" }}></th>
                      <th style={{ padding: "12px 16px" }}>Destination URL</th>
                      <th style={{ padding: "12px 16px", textAlign: "center" }}>Type</th>
                      <th style={{ padding: "12px 16px", textAlign: "center" }}>Hits</th>
                      <th style={{ padding: "12px 16px", textAlign: "center" }}>Status</th>
                      <th style={{ padding: "12px 16px" }}>Campaign / Notes</th>
                      <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRules.map((rule) => {
                      const is301 = rule.statusCode === 301;
                      return (
                        <tr
                          key={rule.id}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            opacity: rule.enabled ? 1 : 0.6,
                            transition: "background 0.15s"
                          }}
                        >
                          {/* Source Link */}
                          <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  fontWeight: 700,
                                  color: "var(--primary, #0e78a8)",
                                  fontSize: 13,
                                  background: "#f0f9ff",
                                  padding: "2px 7px",
                                  borderRadius: 5,
                                  border: "1px solid #bae6fd"
                                }}
                              >
                                {rule.fromPath}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyLink(rule.fromPath, rule.id)}
                                title="Copy link to clipboard"
                                style={{
                                  border: "none",
                                  background: "none",
                                  cursor: "pointer",
                                  color: copiedId === rule.id ? "#16a34a" : "#94a3b8",
                                  fontSize: 11,
                                  padding: 2
                                }}
                              >
                                {copiedId === rule.id ? "✓ Copied" : "📋"}
                              </button>
                            </div>
                          </td>

                          {/* Arrow */}
                          <td style={{ padding: "12px 0", textAlign: "center", color: "#94a3b8", fontSize: 16 }}>
                            →
                          </td>

                          {/* Destination */}
                          <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                            <a
                              href={rule.toPath}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: "#0f172a",
                                fontWeight: 600,
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                maxWidth: 260,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              <span>{rule.toPath}</span>
                              <ExternalLinkIcon size={11} style={{ opacity: 0.6 }} />
                            </a>
                          </td>

                          {/* Type Badge */}
                          <td style={{ padding: "12px 16px", textAlign: "center", verticalAlign: "middle" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "3px 8px",
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 800,
                                background: is301 ? "#dcfce7" : "#e0f2fe",
                                color: is301 ? "#15803d" : "#0369a1",
                                border: `1px solid ${is301 ? "#bbf7d0" : "#bae6fd"}`
                              }}
                            >
                              {rule.statusCode} {is301 ? "Permanent" : "Temporary"}
                            </span>
                          </td>

                          {/* Hits Count */}
                          <td style={{ padding: "12px 16px", textAlign: "center", verticalAlign: "middle" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "2px 8px",
                                borderRadius: 999,
                                fontSize: 11.5,
                                fontWeight: 700,
                                background: rule.hitCount > 0 ? "#f1f5f9" : "#f8fafc",
                                color: rule.hitCount > 0 ? "#334155" : "#94a3b8"
                              }}
                            >
                              {rule.hitCount || 0}
                            </span>
                          </td>

                          {/* Enabled Toggle */}
                          <td style={{ padding: "12px 16px", textAlign: "center", verticalAlign: "middle" }}>
                            <button
                              type="button"
                              onClick={() => handleToggleRule(rule)}
                              style={{
                                padding: "4px 10px",
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 700,
                                border: "none",
                                cursor: "pointer",
                                background: rule.enabled ? "#ecfdf5" : "#f1f5f9",
                                color: rule.enabled ? "#059669" : "#64748b",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: rule.enabled ? "#10b981" : "#94a3b8"
                                }}
                              />
                              <span>{rule.enabled ? "Active" : "Paused"}</span>
                            </button>
                          </td>

                          {/* Campaign / Notes */}
                          <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 12, verticalAlign: "middle", maxWidth: 180 }}>
                            {rule.notes || <span style={{ color: "#cbd5e1" }}>—</span>}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: "12px 16px", textAlign: "right", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                            <div style={{ display: "inline-flex", gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab("tester");
                                  setTestInput(rule.fromPath);
                                  handleSimulateRedirect(rule.fromPath);
                                }}
                                title="Test this redirect in simulator"
                                style={{
                                  padding: "5px 9px",
                                  borderRadius: 6,
                                  border: "1px solid #e2e8f0",
                                  background: "#ffffff",
                                  color: "#334155",
                                  cursor: "pointer",
                                  fontSize: 12,
                                  fontWeight: 600
                                }}
                              >
                                Test
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(rule)}
                                style={{
                                  padding: "5px 9px",
                                  borderRadius: 6,
                                  border: "1px solid #cbd5e1",
                                  background: "#f8fafc",
                                  color: "#0f172a",
                                  cursor: "pointer",
                                  fontSize: 12,
                                  fontWeight: 600
                                }}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteRule(rule.id, rule.fromPath)}
                                style={{
                                  padding: "5px 9px",
                                  borderRadius: 6,
                                  border: "1px solid #fee2e2",
                                  background: "#fff5f5",
                                  color: "#dc2626",
                                  cursor: "pointer",
                                  fontSize: 12,
                                  fontWeight: 600
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 404 BROKEN URL TRACKER */}
      {/* ========================================================================= */}
      {activeTab === "notFound" && (
        <div>
          {/* Explanation Callout */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(249, 115, 22, 0.05))",
              border: "1px solid #fecaca",
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: "#991b1b", fontSize: 14, marginBottom: 3 }}>
                Automatic 404 Error Detection
              </div>
              <div style={{ color: "#7f1d1d", fontSize: 12.5, maxWidth: 640 }}>
                Whenever a real patient, visitor, or search bot lands on a page that doesn&apos;t exist, it is recorded below. You can convert any broken URL into an active 301 Permanent Redirect with 1-click to protect your SEO ranking!
              </div>
            </div>

            {notFoundLogs.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll404s}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: "1px solid #fca5a5",
                  background: "#ffffff",
                  color: "#dc2626",
                  cursor: "pointer"
                }}
              >
                Clear All 404 Logs
              </button>
            )}
          </div>

          {/* 404 Table */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
            }}
          >
            {notFoundLogs.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: "#64748b" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Zero Broken Links Detected</p>
                <p style={{ margin: "6px 0 0 0", fontSize: 13 }}>
                  No visitors or search bots have encountered 404 errors recently. Your links are healthy!
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 700, fontSize: 12 }}>
                      <th style={{ padding: "12px 16px" }}>Broken URL Path</th>
                      <th style={{ padding: "12px 16px", textAlign: "center" }}>Hit Count</th>
                      <th style={{ padding: "12px 16px" }}>Referrer (Source)</th>
                      <th style={{ padding: "12px 16px" }}>Last Detected</th>
                      <th style={{ padding: "12px 16px", textAlign: "right" }}>Fix & Resolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notFoundLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        {/* Broken Path */}
                        <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontWeight: 700,
                              color: "#dc2626",
                              fontSize: 13,
                              background: "#fef2f2",
                              padding: "3px 8px",
                              borderRadius: 6,
                              border: "1px solid #fecaca"
                            }}
                          >
                            {log.path}
                          </span>
                        </td>

                        {/* Hit count */}
                        <td style={{ padding: "12px 16px", textAlign: "center", verticalAlign: "middle" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: 999,
                              fontSize: 11.5,
                              fontWeight: 800,
                              background: "#fee2e2",
                              color: "#b91c1c"
                            }}
                          >
                            {log.hitCount} hits
                          </span>
                        </td>

                        {/* Referrer */}
                        <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 12, verticalAlign: "middle" }}>
                          {log.referrer ? (
                            <span style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", display: "inline-block" }}>
                              {log.referrer}
                            </span>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>Direct / Search Crawl</span>
                          )}
                        </td>

                        {/* Last Detected */}
                        <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 12, verticalAlign: "middle" }}>
                          {new Date(log.lastHitAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>

                        {/* Fix Action */}
                        <td style={{ padding: "12px 16px", textAlign: "right", verticalAlign: "middle" }}>
                          <div style={{ display: "inline-flex", gap: 8 }}>
                            <button
                              type="button"
                              onClick={() => handleOpenAddModal(log.path, log.id)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 8,
                                background: "#15803d",
                                color: "#ffffff",
                                fontSize: 12,
                                fontWeight: 700,
                                border: "none",
                                cursor: "pointer",
                                boxShadow: "0 2px 6px rgba(21, 128, 61, 0.25)"
                              }}
                            >
                              ⚡ Fix with 301 Redirect
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete404Log(log.id)}
                              style={{
                                padding: "6px 10px",
                                borderRadius: 8,
                                background: "#f1f5f9",
                                color: "#64748b",
                                fontSize: 12,
                                fontWeight: 600,
                                border: "none",
                                cursor: "pointer"
                              }}
                            >
                              Dismiss
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: IN-DASHBOARD REDIRECT SIMULATOR / TESTER */}
      {/* ========================================================================= */}
      {activeTab === "tester" && (
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: "24px 28px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(14, 120, 168, 0.12)",
                  color: "var(--primary, #0e78a8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ⚡
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Redirect Simulator & Route Matcher
              </h2>
            </div>
            <p style={{ margin: "0 0 20px 0", color: "#64748b", fontSize: 13.5 }}>
              Enter any URL path to verify whether it matches an active redirect rule, what status code it returns, and its ultimate destination.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSimulateRedirect();
              }}
            >
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="e.g. /promo, /old-physiotherapy, /services"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    fontSize: 14,
                    outline: "none",
                    fontFamily: "monospace"
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "10px 22px",
                    borderRadius: 10,
                    background: "var(--primary, #0e78a8)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 13.5,
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Simulate
                </button>
              </div>
            </form>

            {/* Simulation Result */}
            {testResult && (
              <div
                style={{
                  padding: "18px 20px",
                  borderRadius: 12,
                  background: testResult.matched ? "#f0fdf4" : "#fef2f2",
                  border: `1px solid ${testResult.matched ? "#bbf7d0" : "#fecaca"}`,
                  marginTop: 16
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{testResult.matched ? "✓" : "ℹ️"}</span>
                    <span style={{ fontWeight: 800, fontSize: 15, color: testResult.matched ? "#166534" : "#991b1b" }}>
                      {testResult.matched ? "Redirect Rule Matched!" : "No Active Redirect Found"}
                    </span>
                  </div>
                  {testResult.matched && (
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 800,
                        background: testResult.statusCode === 301 ? "#dcfce7" : "#e0f2fe",
                        color: testResult.statusCode === 301 ? "#15803d" : "#0369a1"
                      }}
                    >
                      HTTP {testResult.statusCode}
                    </span>
                  )}
                </div>

                {testResult.matched ? (
                  <div style={{ fontSize: 13.5, color: "#166534" }}>
                    <div style={{ marginBottom: 6 }}>
                      Requested: <code style={{ fontWeight: 700 }}>{testResult.testedUrl}</code>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      Redirects to: <code style={{ fontWeight: 700, color: "#0f172a" }}>{testResult.destination}</code>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <a
                        href={testResult.testedUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 14px",
                          borderRadius: 8,
                          background: "#16a34a",
                          color: "#ffffff",
                          textDecoration: "none",
                          fontSize: 12.5,
                          fontWeight: 700
                        }}
                      >
                        <span>Test Live in Browser</span>
                        <ExternalLinkIcon size={12} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: "#991b1b" }}>
                    Requests to <code>{testResult.testedUrl}</code> will follow Next.js standard route resolution (or return 404 if no physical page exists).
                    <div style={{ marginTop: 12 }}>
                      <button
                        type="button"
                        onClick={() => handleOpenAddModal(testResult.testedUrl)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          background: "#dc2626",
                          color: "#ffffff",
                          fontSize: 12,
                          fontWeight: 700,
                          border: "none",
                          cursor: "pointer"
                        }}
                      >
                        + Create Redirect for this Link
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 18,
              width: "100%",
              maxWidth: 580,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              overflow: "hidden",
              animation: "fadeIn 0.15s ease-out"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
                  {editingRule ? "Edit Redirect Rule" : "Create New Redirect / Shortlink"}
                </h3>
                <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
                  Set up 301/302 redirection for any custom link or legacy URL.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{
                  border: "none",
                  background: "#f1f5f9",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b"
                }}
              >
                <XIcon size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveRule} style={{ padding: "20px 24px" }}>
              {/* Source Path */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Source Path (From) <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="text"
                    required
                    placeholder="/promo or /old-physiotherapy"
                    value={fromPath}
                    onChange={(e) => setFromPath(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      fontSize: 13.5,
                      fontFamily: "monospace",
                      outline: "none"
                    }}
                  />
                </div>
                <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>
                  Any incoming link matching this path will be intercepted. Leading slash is automatic.
                </div>
              </div>

              {/* Destination Path */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Destination URL (To) <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="/services/physiotherapy or https://..."
                  value={toPath}
                  onChange={(e) => setToPath(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: 13.5,
                    fontFamily: "monospace",
                    outline: "none",
                    marginBottom: 8
                  }}
                />

                {/* Quick Picker Pills */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Quick pick:</span>
                  {quickPickDestinations.slice(0, 5).map((dest) => (
                    <button
                      key={dest.path}
                      type="button"
                      onClick={() => setToPath(dest.path)}
                      style={{
                        padding: "3px 8px",
                        borderRadius: 6,
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        color: "#334155",
                        fontSize: 11,
                        cursor: "pointer",
                        fontWeight: 600
                      }}
                    >
                      {dest.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Code Choice */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
                  Redirect Type & Status Code
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div
                    onClick={() => setStatusCode(301)}
                    style={{
                      border: `2px solid ${statusCode === 301 ? "#16a34a" : "#e2e8f0"}`,
                      background: statusCode === 301 ? "rgba(22, 163, 74, 0.05)" : "#ffffff",
                      borderRadius: 10,
                      padding: "12px",
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: "#16a34a" }}>301 Permanent</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748b" }}>
                      Recommended for SEO migrations, deleted pages & permanent structural changes.
                    </div>
                  </div>

                  <div
                    onClick={() => setStatusCode(302)}
                    style={{
                      border: `2px solid ${statusCode === 302 ? "#0284c7" : "#e2e8f0"}`,
                      background: statusCode === 302 ? "rgba(2, 132, 199, 0.05)" : "#ffffff",
                      borderRadius: 10,
                      padding: "12px",
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: "#0284c7" }}>302 Temporary / Found</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748b" }}>
                      Best for seasonal promos, custom ad shortlinks & temporary campaign landing pages.
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes / Purpose */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Campaign / Purpose Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Facebook summer promo, print flyer QR code, old service URL"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: 13,
                    outline: "none"
                  }}
                />
              </div>

              {/* Enable Toggle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 20,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0"
                }}
              >
                <input
                  type="checkbox"
                  id="enableRuleCheck"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: "pointer" }}
                />
                <label htmlFor="enableRuleCheck" style={{ fontSize: 13, fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                  Active immediately upon saving
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#475569",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: "var(--primary, #0e78a8)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 8px rgba(14, 120, 168, 0.25)"
                  }}
                >
                  {saving ? "Saving..." : editingRule ? "Update Redirect" : "Save & Activate Redirect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
