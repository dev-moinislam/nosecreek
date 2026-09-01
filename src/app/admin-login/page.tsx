"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/components/admin/RoleGuard";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useRole();
  const [email, setEmail] = useState("admin@nosecreek.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password, "admin");
    setLoading(false);

    if (res.success) {
      router.push("/admin");
    } else {
      setError(res.error || "Invalid administrator credentials or PIN.");
    }
  };

  const handleQuickPin = async (pin: string) => {
    setLoading(true);
    setError(null);
    const res = await login("admin@nosecreek.com", pin, "admin");
    setLoading(false);
    if (res.success) {
      router.push("/admin");
    } else {
      setError("Incorrect Master PIN.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0b1d28 0%, #12303d 100%)",
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
            background: "linear-gradient(135deg, #1c9fd8 0%, #0e78a8 100%)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            fontWeight: 800,
            margin: "0 auto 16px"
          }}
        >
          🛡️
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: "0 0 6px" }}>
          Master Admin Portal
        </h1>
        <p style={{ fontSize: 13.5, color: "#64748b", margin: "0 0 24px" }}>
          Full administrative access for SEO, layout, marketing tracking, and content controls.
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
              Admin Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nosecreek.com"
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
              Password or Master PIN
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
              background: "linear-gradient(135deg, #1c9fd8 0%, #0e78a8 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 20px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(28,159,216,0.35)",
              marginTop: 6
            }}
          >
            {loading ? "Authenticating..." : "Sign In to Master Admin →"}
          </button>
        </form>

        {/* 1-Click Quick PIN Login */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 10 }}>
            Quick Admin Access:
          </span>
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            <button
              type="button"
              onClick={() => handleQuickPin("8590")}
              style={{
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                padding: "6px 14px",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#1e293b",
                cursor: "pointer"
              }}
            >
              🔑 1-Click PIN (8590)
            </button>
            <button
              type="button"
              onClick={() => handleQuickPin("admin123")}
              style={{
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                padding: "6px 14px",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#1e293b",
                cursor: "pointer"
              }}
            >
              ⚡ Quick Admin Demo
            </button>
          </div>
        </div>

        {/* Client Portal Link */}
        <div style={{ marginTop: 20 }}>
          <a
            href="/client-login"
            style={{ fontSize: 12.5, color: "#6faf1c", fontWeight: 600, textDecoration: "none" }}
          >
            Switch to Client Portal Login &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
