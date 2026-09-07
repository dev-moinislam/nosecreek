"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/components/admin/RoleGuard";

import { UserIcon } from "@/components/admin/AdminIcons";

export default function ClientLoginPage() {
  const router = useRouter();
  const { login } = useRole();
  const [email, setEmail] = useState("");
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
      setError(res.error || "Invalid username/email or password.");
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
          Sign in with your client credentials to manage clinic content, team bios, and patient inquiries.
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
              Username or Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. nosecreek or client@nosecreek.com"
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
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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
            {loading ? "Logging in..." : "Sign In to Client Portal →"}
          </button>
        </form>
      </div>
    </div>
  );
}
