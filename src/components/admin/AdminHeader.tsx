"use client";

import React from "react";
import Link from "next/link";
import { useRole } from "./RoleGuard";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  title: string;
}

export default function AdminHeader({ onToggleSidebar, title }: AdminHeaderProps) {
  const { user, role, setRole, isAdmin, logout } = useRole();

  return (
    <header className="adm-header">
      <div className="adm-header-left">
        <button
          onClick={onToggleSidebar}
          style={{
            display: "none",
            background: "none",
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            padding: "6px 10px",
            fontSize: 18,
            cursor: "pointer"
          }}
          className="adm-mobile-toggle"
          aria-label="Toggle Menu"
        >
          ☰
        </button>
        <h1 className="adm-page-title">{title}</h1>
      </div>

      <div className="adm-header-right">
        {/* Role Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "var(--adm-text-muted)", fontWeight: 500 }}>
            Mode:
          </span>
          <div className="adm-role-switch">
            <button
              onClick={() => setRole("admin")}
              className={`adm-role-btn ${role === "admin" ? "active admin" : ""}`}
              title="Full Master Access (Edit all configs, SEO, marketing scripts, and delete content)"
            >
              🛡️ Admin
            </button>
            <button
              onClick={() => setRole("client")}
              className={`adm-role-btn ${role === "client" ? "active client" : ""}`}
              title="Safe Client Mode (Edit text, photos, bios, and reply to leads without risk of breaking site)"
            >
              👤 Client
            </button>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8 }}>
            <span style={{ fontSize: 14 }}>{isAdmin ? "🛡️" : "👤"}</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.2, color: "#1e293b" }}>
                {user.name || user.email}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1 }}>
                {isAdmin ? "Master Admin" : "Client Safe Mode"}
              </div>
            </div>
          </div>
        )}

        {/* View Live Website Button */}
        <Link
          href="/"
          target="_blank"
          className="adm-btn adm-btn-secondary adm-btn-sm"
        >
          <span>Live Site</span>
          <span style={{ fontSize: 12 }}>↗</span>
        </Link>

        {/* Log Out Button */}
        <button
          onClick={logout}
          className="adm-btn adm-btn-secondary adm-btn-sm"
          style={{ color: "#dc2626", borderColor: "#fecaca" }}
          title="Sign out of Admin Dashboard"
        >
          <span>🚪</span>
          <span>Log Out</span>
        </button>
      </div>
    </header>
  );
}
