"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRole } from "@/components/admin/RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Lead, LeadStatus } from "@/lib/supabase/types";
import LeadDetailModal from "@/components/admin/LeadDetailModal";
import LeadReplyModal from "@/components/admin/LeadReplyModal";
import servicesData from "@/data/services.json";
import teamData from "@/data/team.json";
import conditionsData from "@/data/conditions.json";

import {
  InboxIcon,
  ServiceIconSvg,
  TeamIcon,
  HelpCircleIcon
} from "@/components/admin/AdminIcons";

export default function AdminOverviewPage() {
  const { role } = useRole();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [replyLead, setReplyLead] = useState<Lead | null>(null);

  // Fetch leads
  const fetchRecentLeads = async () => {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("form_submissions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6);
        if (!error && data) {
          setLeads(data);
        }
      } catch (err) {
        console.error("Error fetching leads:", err);
      }
    } else if (typeof window !== "undefined") {
      const local = JSON.parse(localStorage.getItem("demo_leads") || "[]");
      setLeads(local.slice(0, 6));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecentLeads();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("form_submissions")
        .update({ status: newStatus })
        .eq("id", leadId);
    } else if (typeof window !== "undefined") {
      const local = JSON.parse(localStorage.getItem("demo_leads") || "[]");
      const updated = local.map((l: any) =>
        l.id === leadId ? { ...l, status: newStatus } : l
      );
      localStorage.setItem("demo_leads", JSON.stringify(updated));
    }
    fetchRecentLeads();
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleSendReply = async (leadId: string, subject: string, body: string) => {
    const newReply = {
      id: "rep_" + Date.now(),
      sent_at: new Date().toISOString(),
      sent_by: "Nose Creek Admin",
      subject,
      body,
      channel: "email" as const
    };

    if (isSupabaseConfigured && supabase) {
      const lead = leads.find((l) => l.id === leadId);
      const updatedHistory = [...(lead?.reply_history || []), newReply];
      await supabase
        .from("form_submissions")
        .update({
          status: "replied",
          reply_history: updatedHistory
        })
        .eq("id", leadId);
    } else if (typeof window !== "undefined") {
      const local = JSON.parse(localStorage.getItem("demo_leads") || "[]");
      const updated = local.map((l: any) => {
        if (l.id === leadId) {
          return {
            ...l,
            status: "replied",
            reply_history: [...(l.reply_history || []), newReply]
          };
        }
        return l;
      });
      localStorage.setItem("demo_leads", JSON.stringify(updated));
    }
    fetchRecentLeads();
  };

  const newLeads = leads.filter((l) => l.status === "new").length;

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
          <Link href="/admin/leads" className="adm-btn adm-btn-primary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <InboxIcon size={16} />
            <span>View All Leads ({leads.length})</span>
          </Link>
          <Link href="/admin/services" className="adm-btn adm-btn-secondary" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ServiceIconSvg size={16} />
            <span>Manage Services</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="adm-stats-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-icon blue" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <InboxIcon size={22} />
          </div>
          <div className="adm-stat-info">
            <h3>{leads.length}</h3>
            <p>Total Leads Ingested</p>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon amber" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <InboxIcon size={22} />
          </div>
          <div className="adm-stat-info">
            <h3>{newLeads}</h3>
            <p>New Inquiries Pending</p>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon green" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ServiceIconSvg size={22} />
          </div>
          <div className="adm-stat-info">
            <h3>{servicesData.length}</h3>
            <p>Active Clinical Services</p>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon purple" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TeamIcon size={22} />
          </div>
          <div className="adm-stat-info">
            <h3>{teamData.length}</h3>
            <p>Practitioners &amp; Staff</p>
          </div>
        </div>
      </div>

      {/* Recent Leads Table Card */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div>
            <h3 className="adm-card-title">Recent Inquiries & Form Submissions</h3>
            <p className="adm-card-subtitle">
              Live submissions from Contact, Appointment, and Workshop forms
            </p>
          </div>
          <Link href="/admin/leads" className="adm-btn adm-btn-secondary adm-btn-sm">
            View All Inbox →
          </Link>
        </div>

        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Patient / Visitor</th>
                <th>Form Type</th>
                <th>Contact Info</th>
                <th>Interest / Service</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 36, color: "#64748b" }}>
                    Loading live leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 36, color: "#64748b" }}>
                    No form submissions yet. Test submitting a form on the Contact or Appointment page to see it appear here in real-time!
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{lead.name || "Anonymous Visitor"}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>
                        {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, background: "#f1f5f9", padding: "3px 8px", borderRadius: 6, textTransform: "capitalize", fontWeight: 600 }}>
                        {lead.form_type.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <div>{lead.email}</div>
                      {lead.phone && <div style={{ fontSize: 12, color: "#64748b" }}>{lead.phone}</div>}
                    </td>
                    <td>{lead.service_interest || "General Physio"}</td>
                    <td>
                      <span className={`adm-status-pill ${lead.status}`}>
                        ● {lead.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        style={{ marginRight: 6 }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => setReplyLead(lead)}
                        className="adm-btn adm-btn-primary adm-btn-sm"
                      >
                        Reply
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

      {/* Modals */}
      <LeadDetailModal
        lead={selectedLead}
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        onStatusChange={handleStatusChange}
        onOpenReply={(lead) => {
          setSelectedLead(null);
          setReplyLead(lead);
        }}
      />

      <LeadReplyModal
        lead={replyLead}
        isOpen={Boolean(replyLead)}
        onClose={() => setReplyLead(null)}
        onSendReply={handleSendReply}
      />
    </div>
  );
}
