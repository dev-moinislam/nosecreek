"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRole } from "./RoleGuard";
import ThemeCustomizerModal from "./ThemeCustomizerModal";
import { ShieldIcon, UserIcon, PaletteIcon, ExternalLinkIcon, LogoutIcon, MenuIcon } from "./AdminIcons";

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
          type="button"
          onClick={onToggleSidebar}
          className="adm-mobile-toggle"
          aria-label="Toggle Menu Drawer"
        >
          <MenuIcon size={20} />
        </button>
        <h1 className="adm-page-title" title={title}>{title}</h1>
      </div>

      <div className="adm-header-right" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* User Role Badge */}
        <div
          className="adm-role-badge"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            background: isAdmin ? "#f0f9ff" : "#f0fdf4",
            border: isAdmin ? "1px solid #bae6fd" : "1px solid #bbf7d0",
            borderRadius: 10,
            flexShrink: 0
          }}
          title={isAdmin ? "Master Administrator" : "Clinic Client Safe Mode"}
        >
          <div style={{ color: isAdmin ? "#0284c7" : "#16a34a", display: "flex", alignItems: "center" }}>
            {isAdmin ? <ShieldIcon size={16} /> : <UserIcon size={16} />}
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2, color: isAdmin ? "#0369a1" : "#15803d" }}>
              {isAdmin ? "Admin" : "Client"}
            </div>
            <div className="adm-role-subtext" style={{ fontSize: 10.5, color: "#64748b", lineHeight: 1, marginTop: 1 }}>
              {user?.name || (isAdmin ? "Master Control" : "Safe Editor")}
            </div>
          </div>
        </div>

        {/* Master Admin: Color Theme Customizer Button */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setThemeModalOpen(true)}
            className="adm-btn adm-btn-secondary adm-btn-sm"
            style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}
            title="Customize Website Brand Colors & Themes"
          >
            <PaletteIcon size={15} />
            <span className="adm-header-btn-text">Colors</span>
          </button>
        )}

        {/* View Live Website Button */}
        <Link
          href="/"
          target="_blank"
          className="adm-btn adm-btn-secondary adm-btn-sm"
          style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}
          title="Open live public website in new tab"
        >
          <ExternalLinkIcon size={14} />
          <span className="adm-header-btn-text">Live</span>
        </Link>

        {/* Log Out Button */}
        <button
          type="button"
          onClick={logout}
          className="adm-btn adm-btn-secondary adm-btn-sm"
          style={{ color: "#dc2626", borderColor: "#fecaca", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}
          title="Sign out of Dashboard"
        >
          <LogoutIcon size={15} />
          <span className="adm-header-btn-text">Exit</span>
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
