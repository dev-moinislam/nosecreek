"use client";

import React from "react";
import Link from "next/link";
import { useRole } from "./RoleGuard";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  title: string;
}

export default function AdminHeader({ onToggleSidebar, title }: AdminHeaderProps) {
  const { role, setRole, isAdmin } = useRole();

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

        {/* View Live Website Button */}
        <Link
          href="/"
          target="_blank"
          className="adm-btn adm-btn-secondary adm-btn-sm"
        >
          <span>Live Site</span>
          <span style={{ fontSize: 12 }}>↗</span>
        </Link>
      </div>
    </header>
  );
}
