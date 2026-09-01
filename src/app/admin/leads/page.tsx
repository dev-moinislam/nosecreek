"use client";

import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Lead, LeadStatus, FormType } from "@/lib/supabase/types";
import LeadDetailModal from "@/components/admin/LeadDetailModal";
import LeadReplyModal from "@/components/admin/LeadReplyModal";

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedFormType, setSelectedFormType] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [replyLead, setReplyLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from("form_submissions").select("*").order("created_at", { ascending: false });
        if (selectedStatus !== "all") {
          query = query.eq("status", selectedStatus);
        }
        if (selectedFormType !== "all") {
          query = query.eq("form_type", selectedFormType);
        }
        const { data, error } = await query;
        if (!error && data) {
          setLeads(data);
        }
      } catch (err) {
        console.error("Error fetching leads:", err);
      }
    } else if (typeof window !== "undefined") {
      let local = JSON.parse(localStorage.getItem("demo_leads") || "[]");
      if (selectedStatus !== "all") {
        local = local.filter((l: any) => l.status === selectedStatus);
      }
      if (selectedFormType !== "all") {
        local = local.filter((l: any) => l.form_type === selectedFormType);
      }
      setLeads(local);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, [selectedStatus, selectedFormType]);

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
    fetchLeads();
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
    fetchLeads();
  };

  const exportCSV = () => {
    if (leads.length === 0) return;
    const headers = ["ID", "Form Type", "Name", "Email", "Phone", "Service Interest", "Message", "Status", "Date"];
    const rows = leads.map((l) => [
      l.id,
      l.form_type,
      `"${l.name || ""}"`,
      l.email,
      `"${l.phone || ""}"`,
      `"${l.service_interest || ""}"`,
      `"${(l.message || "").replace(/"/g, '""')}"`,
      l.status,
      l.created_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nosecreek_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter((l) => {
    const term = searchQuery.toLowerCase();
    return (
      (l.name && l.name.toLowerCase().includes(term)) ||
      (l.email && l.email.toLowerCase().includes(term)) ||
      (l.phone && l.phone.toLowerCase().includes(term)) ||
      (l.service_interest && l.service_interest.toLowerCase().includes(term)) ||
      (l.message && l.message.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      {/* Header with Title & Export */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, fontFamily: "var(--adm-font-display)" }}>
            Leads & Inquiries Inbox
          </h2>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "2px 0 0 0" }}>
            All patient inquiries, online appointment bookings, and workshop signups
          </p>
        </div>

        <button onClick={exportCSV} className="adm-btn adm-btn-secondary">
          📊 Export CSV
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="adm-card" style={{ padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          {/* Search Box */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <input
              type="text"
              placeholder="🔍 Search leads by name, email, phone, or service..."
              className="adm-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Form Type Filter */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Form:</span>
            <select
              className="adm-select"
              style={{ width: "auto", padding: "8px 12px", fontSize: 13 }}
              value={selectedFormType}
              onChange={(e) => setSelectedFormType(e.target.value)}
            >
              <option value="all">All Forms</option>
              <option value="contact">Contact Inquiry</option>
              <option value="appointment">Appointment Request</option>
              <option value="workshop_registration">Workshop Registration</option>
              <option value="workshop_replay">Workshop Replay</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Status:</span>
            <select
              className="adm-select"
              style={{ width: "auto", padding: "8px 12px", fontSize: 13 }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="new">🔴 New / Unopened</option>
              <option value="contacted">🟡 Contacted</option>
              <option value="in_progress">🟠 In Progress</option>
              <option value="replied">🔵 Replied</option>
              <option value="converted">🟢 Converted</option>
              <option value="archived">⚪ Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="adm-card">
        <div className="adm-table-container">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Patient / Visitor</th>
                <th>Form Source</th>
                <th>Contact Details</th>
                <th>Subject / Details</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 36, color: "#64748b" }}>
                    Loading leads...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 36, color: "#64748b" }}>
                    No leads matching your current filters.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{lead.name || "Anonymous Visitor"}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>
                        {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, background: "#f1f5f9", padding: "4px 8px", borderRadius: 6, fontWeight: 600, textTransform: "capitalize" }}>
                        {lead.form_type.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <div>
                        <a href={`mailto:${lead.email}`} style={{ color: "var(--adm-primary)", textDecoration: "none", fontWeight: 500 }}>
                          {lead.email}
                        </a>
                      </div>
                      {lead.phone && (
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          <a href={`tel:${lead.phone}`} style={{ color: "#64748b", textDecoration: "none" }}>
                            {lead.phone}
                          </a>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: "var(--adm-text-main)" }}>
                        {lead.service_interest || "General Physio"}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", maxWidth: 260, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {lead.message || "—"}
                      </div>
                    </td>
                    <td>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        style={{
                          padding: "3px 8px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          fontSize: 12,
                          fontWeight: 600,
                          backgroundColor: "#fff"
                        }}
                      >
                        <option value="new">🔴 New</option>
                        <option value="contacted">🟡 Contacted</option>
                        <option value="in_progress">🟠 In Progress</option>
                        <option value="replied">🔵 Replied</option>
                        <option value="converted">🟢 Converted</option>
                        <option value="archived">⚪ Archived</option>
                      </select>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        style={{ marginRight: 6 }}
                      >
                        Details
                      </button>
                      <button
                        onClick={() => setReplyLead(lead)}
                        className="adm-btn adm-btn-primary adm-btn-sm"
                      >
                        ✉️ Reply
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
