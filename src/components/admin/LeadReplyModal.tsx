"use client";

import React, { useState, useEffect } from "react";
import { Lead } from "@/lib/supabase/types";

interface LeadReplyModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSendReply: (leadId: string, subject: string, body: string) => Promise<void>;
}

const EMAIL_TEMPLATES = [
  {
    id: "appointment_confirm",
    title: "Appointment Booking Response",
    subject: "Regarding your appointment request at Nose Creek Physiotherapy",
    body: (name: string, service?: string) => `Hi ${name || "there"},

Thank you for reaching out to Nose Creek Physiotherapy regarding ${service || "physiotherapy treatment"}.

We have received your appointment request and would love to confirm your schedule. Please let us know what day and time works best for your initial assessment, or give our clinic a quick call at 403-295-8590.

You can also book directly online in under two minutes here:
https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington

Warm regards,
Nose Creek Physiotherapy Clinical Team`
  },
  {
    id: "inquiry_response",
    title: "General Inquiry Response",
    subject: "Thank you for contacting Nose Creek Physiotherapy",
    body: (name: string) => `Hi ${name || "there"},

Thank you for contacting Nose Creek Physiotherapy. We received your message and wanted to follow up with you.

If you have specific questions about our treatments, direct insurance billing, or our practitioners, feel free to reply to this email or call our Beddington North clinic directly at 403-295-8590.

We look forward to helping you move well and feel better!

Best regards,
Nose Creek Physiotherapy Team`
  },
  {
    id: "workshop_details",
    title: "Workshop / Class Information",
    subject: "Your Nose Creek Health Education Workshop Details",
    body: (name: string, workshop?: string) => `Hi ${name || "there"},

Thank you for registering for our upcoming ${workshop || "health education"} workshop!

We are excited to share practical, expert insights to help you manage and overcome pain without unnecessary medication or surgery. 

Our clinical coordinator will follow up with the exact calendar details, location, and webinar access links.

Warm regards,
Blair Schachterle & The Nose Creek Team`
  }
];

export default function LeadReplyModal({
  lead,
  isOpen,
  onClose,
  onSendReply
}: LeadReplyModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("appointment_confirm");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (lead) {
      const template = EMAIL_TEMPLATES.find((t) => t.id === selectedTemplate) || EMAIL_TEMPLATES[0];
      setSubject(template.subject);
      setBody(template.body(lead.name || lead.first_name || "", lead.service_interest));
    }
  }, [lead, selectedTemplate]);

  if (!isOpen || !lead) return null;

  const handleTemplateChange = (tmplId: string) => {
    setSelectedTemplate(tmplId);
    const tmpl = EMAIL_TEMPLATES.find((t) => t.id === tmplId);
    if (tmpl) {
      setSubject(tmpl.subject);
      setBody(tmpl.body(lead.name || lead.first_name || "", lead.service_interest));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      await onSendReply(lead.id, subject, body);

      // Also trigger mailto so the sender's local email client opens as fallback
      const mailtoLink = `mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink, "_blank");

      onClose();
    } catch (err) {
      console.error("Failed to send reply", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
              Reply to {lead.name || lead.email}
            </h3>
            <span style={{ fontSize: 13, color: "var(--adm-text-muted)" }}>
              Recipient: <strong>{lead.email}</strong>
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

        <form onSubmit={handleSubmit}>
          <div className="adm-modal-body">
            {/* Quick Templates Selector */}
            <div className="adm-form-group">
              <label className="adm-form-label">Choose Quick Response Template</label>
              <select
                className="adm-select"
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
              >
                {EMAIL_TEMPLATES.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Email Subject */}
            <div className="adm-form-group">
              <label className="adm-form-label">Email Subject</label>
              <input
                type="text"
                className="adm-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            {/* Message Body */}
            <div className="adm-form-group">
              <label className="adm-form-label">Message Body</label>
              <textarea
                className="adm-textarea"
                style={{ minHeight: 200, fontFamily: "monospace", fontSize: 13.5 }}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            </div>

            <div style={{ background: "#e0f2fe", padding: "10px 14px", borderRadius: 8, fontSize: 12.5, color: "#0369a1" }}>
              💡 <strong>Automatic Workflow:</strong> Sending this reply will automatically mark this lead status as <strong>&quot;Replied&quot;</strong> and append this message to the client&apos;s communication log.
            </div>
          </div>

          <div className="adm-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="adm-btn adm-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="adm-btn adm-btn-primary"
            >
              {isSending ? "Recording Reply..." : "✉️ Send Reply & Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
