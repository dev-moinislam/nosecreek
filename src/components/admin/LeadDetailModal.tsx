"use client";

import React, { useState } from "react";
import { Lead, LeadStatus } from "@/lib/supabase/types";

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onOpenReply: (lead: Lead) => void;
}

export default function LeadDetailModal({
  lead,
  isOpen,
  onClose,
  onStatusChange,
  onOpenReply
}: LeadDetailModalProps) {
  if (!isOpen || !lead) return null;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
              {lead.name || lead.email || "Lead Inquiry"}
            </h3>
            <span style={{ fontSize: 13, color: "var(--adm-text-muted)" }}>
              Submitted {formatDate(lead.created_at)} · Form: <strong>{lead.form_type}</strong>
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: "#94a3b8"
            }}
          >
            ✕
          </button>
        </div>

        <div className="adm-modal-body">
          {/* Status & Quick Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "12px 16px", borderRadius: 10, marginBottom: 20, border: "1px solid #e2e8f0" }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginRight: 8 }}>
                Current Status:
              </span>
              <select
                value={lead.status}
                onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  fontSize: 13,
                  fontWeight: 600,
                  backgroundColor: "#fff"
                }}
              >
                <option value="new">🔴 New / Unopened</option>
                <option value="contacted">🟡 Contacted</option>
                <option value="in_progress">🟠 In Progress</option>
                <option value="replied">🔵 Replied</option>
                <option value="converted">🟢 Converted / Booked</option>
                <option value="archived">⚪ Archived</option>
              </select>
            </div>

            <button
              onClick={() => onOpenReply(lead)}
              className="adm-btn adm-btn-primary adm-btn-sm"
            >
              ✉️ Reply to Lead
            </button>
          </div>

          {/* Contact Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Full Name</label>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{lead.name || "N/A"}</div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Email Address</label>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>
                <a href={`mailto:${lead.email}`} style={{ color: "var(--adm-primary)", textDecoration: "none" }}>
                  {lead.email}
                </a>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Phone Number</label>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>
                {lead.phone ? (
                  <a href={`tel:${lead.phone}`} style={{ color: "var(--adm-primary)", textDecoration: "none" }}>
                    {lead.phone}
                  </a>
                ) : "N/A"}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Service of Interest</label>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{lead.service_interest || "General Inquiry"}</div>
            </div>
          </div>

          {/* Message Content */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Message / Request Details</label>
            <div style={{ background: "#f8fafc", padding: "14px 16px", borderRadius: 10, marginTop: 4, fontSize: 14, lineHeight: 1.6, border: "1px solid #e2e8f0" }}>
              {lead.message || "No custom message provided."}
            </div>
          </div>

          {/* UTM / Metadata if available */}
          {lead.metadata && Object.keys(lead.metadata).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Submission Context</label>
              <div style={{ background: "#f1f5f9", padding: "10px 14px", borderRadius: 8, fontSize: 12, color: "#475569", marginTop: 4 }}>
                {Object.entries(lead.metadata).map(([key, val]) => (
                  <div key={key}>
                    <strong>{key}:</strong> {String(val)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reply History */}
          {lead.reply_history && lead.reply_history.length > 0 && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8, display: "block" }}>
                Reply History ({lead.reply_history.length})
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {lead.reply_history.map((rep) => (
                  <div key={rep.id} style={{ background: "#e0f2fe", border: "1px solid #bae6fd", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, color: "#0369a1", marginBottom: 4 }}>
                      <span>Subject: {rep.subject}</span>
                      <span style={{ fontSize: 11, fontWeight: 400, color: "#0284c7" }}>{formatDate(rep.sent_at)}</span>
                    </div>
                    <div style={{ whiteSpace: "pre-wrap", color: "#1e293b", fontSize: 13 }}>
                      {rep.body}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="adm-modal-footer">
          <button onClick={onClose} className="adm-btn adm-btn-secondary">
            Close
          </button>
          <button
            onClick={() => onOpenReply(lead)}
            className="adm-btn adm-btn-primary"
          >
            Reply Now
          </button>
        </div>
      </div>
    </div>
  );
}
