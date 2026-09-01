"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "./RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { role, isAdmin } = useRole();
  const [newLeadsCount, setNewLeadsCount] = useState(0);

  useEffect(() => {
    async function fetchNewLeadsCount() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { count, error } = await supabase
            .from("form_submissions")
            .select("*", { count: "exact", head: true })
            .eq("status", "new");
          if (!error && typeof count === "number") {
            setNewLeadsCount(count);
          }
        } catch {
          // ignore
        }
      } else if (typeof window !== "undefined") {
        const local = JSON.parse(localStorage.getItem("demo_leads") || "[]");
        const count = local.filter((l: any) => l.status === "new").length;
        setNewLeadsCount(count);
      }
    }

    fetchNewLeadsCount();
    const interval = setInterval(fetchNewLeadsCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const allNavItems = [
    { label: "Overview", href: "/admin", icon: "📊", adminOnly: false },
    { label: "Leads & Inbox", href: "/admin/leads", icon: "📥", badge: newLeadsCount, adminOnly: false },
    { label: "Services", href: "/admin/services", icon: "🩺", adminOnly: false },
    { label: "Conditions", href: "/admin/conditions", icon: "🩹", adminOnly: false },
    { label: "Team Members", href: "/admin/team", icon: "👥", adminOnly: false },
    { label: "Locations", href: "/admin/locations", icon: "📍", adminOnly: false },
    { label: "Settings & Marketing", href: "/admin/settings", icon: "⚙️", adminOnly: true },
  ];

  const visibleNavItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className={`adm-sidebar ${isOpen ? "open" : ""}`}>
      {/* Brand Header */}
      <div className="adm-sidebar-brand">
        <div className="adm-brand-icon">NC</div>
        <div className="adm-brand-info">
          <h2>Nose Creek</h2>
          <span>{isAdmin ? "Admin Master" : "Client Safe Editor"}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="adm-sidebar-nav">
        <div className="adm-nav-group-title">Main Menu</div>
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`adm-nav-item ${isActive ? "active" : ""}`}
            >
              <div className="adm-nav-left">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className="adm-badge-count">{item.badge}</span>
              ) : null}
            </Link>
          );
        })}

        <div className="adm-nav-group-title" style={{ marginTop: 16 }}>Quick Links</div>
        <Link
          href="/"
          target="_blank"
          className="adm-nav-item"
          style={{ opacity: 0.8 }}
        >
          <div className="adm-nav-left">
            <span>🌐</span>
            <span>View Live Website</span>
          </div>
          <span style={{ fontSize: 12 }}>↗</span>
        </Link>
      </nav>

      {/* Role Footer Card */}
      <div className="adm-sidebar-footer">
        <div
          style={{
            padding: "10px 14px",
            background: isAdmin ? "rgba(28, 159, 216, 0.12)" : "rgba(111, 175, 28, 0.12)",
            border: `1px solid ${isAdmin ? "rgba(28, 159, 216, 0.25)" : "rgba(111, 175, 28, 0.25)"}`,
            borderRadius: 10,
            fontSize: 12,
            color: "var(--adm-text)"
          }}
        >
          <div style={{ fontWeight: 700, color: isAdmin ? "#0284c7" : "#16a34a", marginBottom: 2 }}>
            {isAdmin ? "🛡️ Master Admin" : "👤 Client Portal"}
          </div>
          <div style={{ color: "var(--adm-text-muted)", fontSize: 11 }}>
            {isAdmin
              ? "All features & settings unlocked."
              : "Safe content mode active."}
          </div>
        </div>
      </div>
    </aside>
  );
}
