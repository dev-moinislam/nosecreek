"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/components/admin/RoleGuard";

import { UserIcon } from "@/components/admin/AdminIcons";

export default function ClientLoginPage() {
  const router = useRouter();
  const { login } = useRole();
  const [email, setEmail] = useState("client@nosecreek.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password, "client");
    setLoading(false);

    if (res.success) {
      router.push("/admin");
    } else {
      setError(res.error || "Invalid client passcode or credentials.");
    }
  };

  const handleQuickClient = async () => {
    setLoading(true);
    setError(null);
    const res = await login("client", "client123", "client");
    setLoading(false);
    if (res.success) {
      router.push("/admin");
    } else {
      setError("Failed to log in as Client.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0e3020 0%, #164e33 100%)",
        padding: 24,
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#ffffff",
          borderRadius: 20,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
          padding: "36px 32px",
          textAlign: "center"
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "linear-gradient(135deg, #6faf1c 0%, #5c9515 100%)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px"
          }}
        >
          <UserIcon size={28} />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: "0 0 6px" }}>
          Client Content Portal
        </h1>
        <p style={{ fontSize: 13.5, color: "#64748b", margin: "0 0 24px" }}>
          Safe editing mode for clinic staff to update service texts, photos, bios, and reply to leads.
        </p>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fecaca",
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 18,
              textAlign: "left"
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
              Client Email or Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@nosecreek.com"
              style={{
                width: "100%",
                padding: "11px 14px",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                fontSize: 14,
                boxSizing: "border-box"
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
              Client Passcode
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "11px 14px",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                fontSize: 14,
                boxSizing: "border-box"
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, #6faf1c 0%, #5c9515 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 20px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(111,175,28,0.35)",
              marginTop: 6
            }}
          >
            {loading ? "Logging in..." : "Enter Client Dashboard →"}
          </button>
        </form>

        {/* 1-Click Quick Client Login */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 10 }}>
            Quick Client Access:
          </span>
          <button
            type="button"
            onClick={handleQuickClient}
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 6,
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 600,
              color: "#166534",
              cursor: "pointer",
              width: "100%"
            }}
          >
            🌿 1-Click Instant Client Login
          </button>
        </div>

        {/* Master Admin Link */}
        <div style={{ marginTop: 20 }}>
          <a
            href="/admin-login"
            style={{ fontSize: 12.5, color: "#0284c7", fontWeight: 600, textDecoration: "none" }}
          >
            Master Admin Login &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
