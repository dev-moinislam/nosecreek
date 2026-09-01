"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "./RoleGuard";
import Link from "next/link";

export default function AdminLoginGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useRole();
  const router = useRouter();

  // If user is logged in, render the dashboard
  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
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
          maxWidth: 480,
          background: "#ffffff",
          borderRadius: 24,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          padding: "40px 32px",
          textAlign: "center"
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            background: "linear-gradient(135deg, #1c9fd8 0%, #0e78a8 100%)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 800,
            margin: "0 auto 18px"
          }}
        >
          🏥
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", margin: "0 0 8px" }}>
          Nose Creek Management
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 28px", lineHeight: 1.5 }}>
          Please select your portal login to access the dashboard.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Master Admin Portal Choice */}
          <Link
            href="/admin-login"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderRadius: 12,
              border: "2px solid #bae6fd",
              background: "#f0f9ff",
              textDecoration: "none",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
              <span style={{ fontSize: 28 }}>🛡️</span>
              <div>
                <strong style={{ fontSize: 15, color: "#0369a1", display: "block" }}>
                  Master Admin Login
                </strong>
                <span style={{ fontSize: 12.5, color: "#0284c7" }}>
                  Full control: Sections, SEO, color themes &amp; marketing
                </span>
              </div>
            </div>
            <span style={{ color: "#0284c7", fontWeight: 800, fontSize: 18 }}>&rarr;</span>
          </Link>

          {/* Client Portal Choice */}
          <Link
            href="/client-login"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderRadius: 12,
              border: "2px solid #bbf7d0",
              background: "#f0fdf4",
              textDecoration: "none",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
              <span style={{ fontSize: 28 }}>👤</span>
              <div>
                <strong style={{ fontSize: 15, color: "#15803d", display: "block" }}>
                  Client Content Editor
                </strong>
                <span style={{ fontSize: 12.5, color: "#16a34a" }}>
                  Safe mode: Edit text, images, FAQs &amp; review leads
                </span>
              </div>
            </div>
            <span style={{ color: "#16a34a", fontWeight: 800, fontSize: 18 }}>&rarr;</span>
          </Link>
        </div>

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #f1f5f9" }}>
          <Link
            href="/"
            style={{ fontSize: 13, color: "#64748b", textDecoration: "none" }}
          >
            &larr; Back to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
