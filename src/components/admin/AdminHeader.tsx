"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRole } from "./RoleGuard";
import ThemeCustomizerModal from "./ThemeCustomizerModal";
import { ShieldIcon, UserIcon, PaletteIcon, ExternalLinkIcon, LogoutIcon } from "./AdminIcons";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  title: string;
}

export default function AdminHeader({ onToggleSidebar, title }: AdminHeaderProps) {
  const { user, isAdmin, logout } = useRole();
  const [themeModalOpen, setThemeModalOpen] = useState(false);

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

      <div className="adm-header-right" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* User Role Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 14px",
            background: isAdmin ? "#f0f9ff" : "#f0fdf4",
            border: isAdmin ? "1px solid #bae6fd" : "1px solid #bbf7d0",
            borderRadius: 10
          }}
        >
          <div style={{ color: isAdmin ? "#0284c7" : "#16a34a", display: "flex", alignItems: "center" }}>
            {isAdmin ? <ShieldIcon size={18} /> : <UserIcon size={18} />}
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.2, color: isAdmin ? "#0369a1" : "#15803d" }}>
              {user?.name || (isAdmin ? "Master Administrator" : "Clinic Client")}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1 }}>
              {isAdmin ? "Full Master Control" : "Safe Content Mode"}
            </div>
          </div>
        </div>

        {/* Master Admin: Color Theme Customizer Button */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setThemeModalOpen(true)}
            className="adm-btn adm-btn-secondary adm-btn-sm"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
            title="Customize Website Brand Colors & Themes"
          >
            <PaletteIcon size={15} />
            <span>Theme Colors</span>
          </button>
        )}

        {/* View Live Website Button */}
        <Link
          href="/"
          target="_blank"
          className="adm-btn adm-btn-secondary adm-btn-sm"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <span>Live Site</span>
          <ExternalLinkIcon size={13} />
        </Link>

        {/* Log Out Button */}
        <button
          onClick={logout}
          className="adm-btn adm-btn-secondary adm-btn-sm"
          style={{ color: "#dc2626", borderColor: "#fecaca", display: "flex", alignItems: "center", gap: 6 }}
          title="Sign out of Dashboard"
        >
          <LogoutIcon size={15} />
          <span>Log Out</span>
        </button>
      </div>

      {/* Theme Customizer Modal */}
      {isAdmin && (
        <ThemeCustomizerModal
          isOpen={themeModalOpen}
          onClose={() => setThemeModalOpen(false)}
        />
      )}
    </header>
  );
}
