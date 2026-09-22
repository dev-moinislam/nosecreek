"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRole } from "@/components/admin/RoleGuard";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

import {
  ServiceIconSvg,
  ConditionIconSvg,
  TeamIcon,
  SettingsIcon,
  StarIcon
} from "@/components/admin/AdminIcons";

export default function AdminOverviewPage() {
  const { role } = useRole();
  const [counts, setCounts] = useState({ services: 9, conditions: 17, team: 14 });

  useEffect(() => {
    async function loadStats() {
      if (isSupabaseConfigured && supabase) {
        try {
          const [sRes, cRes, tRes] = await Promise.all([
            supabase.from("services").select("id", { count: "exact", head: true }),
            supabase.from("conditions").select("id", { count: "exact", head: true }),
            supabase.from("team_members").select("id", { count: "exact", head: true })
          ]);
          setCounts({
            services: sRes.count ?? 9,
            conditions: cRes.count ?? 17,
            team: tRes.count ?? 14
          });
        } catch {}
      }
    }
    loadStats();
  }, []);

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", borderRadius: 16, padding: "24px 28px", color: "#fff", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.3)" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px 0", fontFamily: "var(--adm-font-display)" }}>
            Welcome to Nose Creek Physiotherapy Hub
          </h2>
          <p style={{ margin: 0, fontSize: 13.5, color: "#94a3b8" }}>
            Current Mode: <strong style={{ color: "#38bdf8" }}>{role === "admin" ? "Master Admin (Full Access)" : "Client Safe Mode (Guarded Editing)"}</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/admin/settings" className="adm-btn adm-btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SettingsIcon size={16} />
            <span>Clinic Settings & Schemas</span>
          </Link>
          <Link href="/admin/services" className="adm-btn adm-btn-secondary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ServiceIconSvg size={16} />
            <span>Manage Services</span>
          </Link>
          <Link href="/admin/conditions" className="adm-btn adm-btn-secondary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ConditionIconSvg size={16} />
            <span>Conditions</span>
          </Link>
          <Link href="/admin/reviews" className="adm-btn adm-btn-secondary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StarIcon size={16} style={{ color: "#f59e0b" }} />
            <span>Reviews</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="adm-stats-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-icon blue" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ServiceIconSvg size={22} />
          </div>
          <div className="adm-stat-info">
            <h3>{counts.services}</h3>
            <p>Clinical Services</p>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon green" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ConditionIconSvg size={22} />
          </div>
          <div className="adm-stat-info">
            <h3>{counts.conditions}</h3>
            <p>Conditions We Treat</p>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon purple" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TeamIcon size={22} />
          </div>
          <div className="adm-stat-info">
            <h3>{counts.team}</h3>
            <p>Practitioners &amp; Staff</p>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon amber" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <StarIcon size={22} />
          </div>
          <div className="adm-stat-info">
            <h3>4.9 ★</h3>
            <p>540+ Google Reviews</p>
          </div>
        </div>
      </div>

      {/* Content Management Shortcuts */}
      <div className="adm-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              ⚡ Quick Management Shortcuts
            </h3>
            <p style={{ margin: "3px 0 0 0", fontSize: 13, color: "#64748b" }}>
              Fast access to customize pages, FAQs, Schemas, and notification emails
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <Link
            href="/admin/settings"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              padding: 18,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              textDecoration: "none",
              color: "inherit",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(28, 159, 216, 0.12)", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <SettingsIcon size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", marginBottom: 4 }}>
                Settings &amp; Schemas
              </div>
              <div style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.4 }}>
                Configure client notification email, Custom Schemas, and clinic info.
              </div>
            </div>
          </Link>

          <Link
            href="/admin/services"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              padding: 18,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              textDecoration: "none",
              color: "inherit",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(16, 185, 129, 0.12)", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ServiceIconSvg size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", marginBottom: 4 }}>
                Services &amp; Service FAQs
              </div>
              <div style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.4 }}>
                Edit service descriptions, benefits, and dynamic FAQ items.
              </div>
            </div>
          </Link>

          <Link
            href="/admin/conditions"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              padding: 18,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              textDecoration: "none",
              color: "inherit",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(139, 92, 246, 0.12)", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ConditionIconSvg size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", marginBottom: 4 }}>
                Conditions &amp; Condition FAQs
              </div>
              <div style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.4 }}>
                Update injury treatment guides, symptoms, and condition FAQs.
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Setup & Guide */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        <div className="adm-card" style={{ padding: 24 }}>
          <h4 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 10px 0" }}>
            🚀 Supabase Backend Setup
          </h4>
          <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6, margin: "0 0 16px 0" }}>
            The SQL Schema is ready in <code>src/lib/supabase/schema.sql</code>. Execute it in your Supabase project SQL Editor to enable full PostgreSQL persistent tables with RLS policies.
          </p>
          <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: 8, fontSize: 12.5, border: "1px solid #e2e8f0" }}>
            <strong>Configuration Status:</strong> {isSupabaseConfigured ? "🟢 Live Connected" : "🟡 Demo / Local Storage Mode (Ready for API keys in .env.local)"}
          </div>
        </div>

        <div className="adm-card" style={{ padding: 24 }}>
          <h4 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 10px 0" }}>
            🛡️ Safe Mode for Clients
          </h4>
          <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6, margin: 0 }}>
            In <strong>Client Safe Mode</strong>, clinic staff can safely update text, therapist bios, FAQs, and reply to patient inquiries, with critical routing, code injection, and SEO parameters guarded from accidental deletion.
          </p>
        </div>
      </div>
    </div>
  );
}
