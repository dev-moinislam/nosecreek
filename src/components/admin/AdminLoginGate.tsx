"use client";

import React, { useState } from "react";
import { useRole } from "./RoleGuard";
import { UserRole } from "@/lib/supabase/types";

export default function AdminLoginGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login } = useRole();
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If user is logged in, show the full admin dashboard
  if (isAuthenticated) {
    return <>{children}</>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await login(email, password, selectedRole);
    if (!res.success) {
      setErrorMsg(res.error || "Authentication failed. Please check your credentials.");
    }
    setLoading(false);
  };

  const handleQuickFill = (role: UserRole) => {
    setSelectedRole(role);
    if (role === "admin") {
      setEmail("admin@nosecreek.com");
      setPassword("admin123");
    } else {
      setEmail("client@nosecreek.com");
      setPassword("client123");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        padding: 20,
        fontFamily: "var(--adm-font-sans, 'Inter', sans-serif)"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#ffffff",
          borderRadius: 20,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}
      >
        {/* Card Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
            padding: "32px 28px 24px",
            color: "#ffffff",
            textAlign: "center"
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              margin: "0 auto 12px",
              backdropFilter: "blur(8px)"
            }}
          >
            🏥
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Clinic Management Portal
          </h2>
          <p style={{ margin: "6px 0 0 0", fontSize: 13, color: "rgba(255, 255, 255, 0.85)" }}>
            Sign in to access Leads Inbox, Services & Content Control
          </p>
        </div>

        {/* Card Body */}
        <div style={{ padding: "28px 28px 32px" }}>
          {/* Role Selector Tabs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              background: "#f1f5f9",
              padding: 4,
              borderRadius: 10,
              marginBottom: 20
            }}
          >
            <button
              type="button"
              onClick={() => {
                setSelectedRole("admin");
                setErrorMsg(null);
              }}
              style={{
                padding: "8px 12px",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                background: selectedRole === "admin" ? "#ffffff" : "transparent",
                color: selectedRole === "admin" ? "#0f172a" : "#64748b",
                boxShadow: selectedRole === "admin" ? "0 2px 4px rgba(0,0,0,0.06)" : "none"
              }}
            >
              🛡️ Master Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole("client");
                setErrorMsg(null);
              }}
              style={{
                padding: "8px 12px",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                background: selectedRole === "client" ? "#ffffff" : "transparent",
                color: selectedRole === "client" ? "#0f172a" : "#64748b",
                boxShadow: selectedRole === "client" ? "0 2px 4px rgba(0,0,0,0.06)" : "none"
              }}
            >
              👤 Client Safe Mode
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div
              style={{
                background: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 12.5,
                marginBottom: 16,
                lineHeight: 1.4
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: 6
                }}
              >
                {selectedRole === "admin" ? "Administrator Email or Username" : "Client Email"}
              </label>
              <input
                type="text"
                placeholder={selectedRole === "admin" ? "admin@nosecreek.com" : "client@nosecreek.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  fontSize: 14,
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: 6
                }}
              >
                Password or Access PIN
              </label>
              <input
                type="password"
                placeholder="Enter password (or PIN: 8590 / 1234)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  fontSize: 14,
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                background: selectedRole === "admin" ? "#0284c7" : "#10b981",
                color: "#ffffff",
                border: "none",
                borderRadius: 10,
                fontSize: 14.5,
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.2s",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
            >
              {loading ? "Authenticating..." : `Sign In as ${selectedRole === "admin" ? "Admin" : "Client"}`}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid #f1f5f9",
              textAlign: "center"
            }}
          >
            <span style={{ fontSize: 11.5, color: "#94a3b8", display: "block", marginBottom: 8 }}>
              ⚡ 1-Click Fast Login:
            </span>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => handleQuickFill("admin")}
                style={{
                  fontSize: 11.5,
                  padding: "4px 10px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  cursor: "pointer",
                  color: "#0369a1"
                }}
              >
                Auto-fill Admin (8590)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("client")}
                style={{
                  fontSize: 11.5,
                  padding: "4px 10px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  cursor: "pointer",
                  color: "#047857"
                }}
              >
                Auto-fill Client (1234)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
