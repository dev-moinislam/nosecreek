"use client";

import React, { useState } from "react";
import { submitLead } from "@/lib/supabase/client";

export default function ContactInquiryForm() {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    phone: "",
    message: ""
  });

  const [status, setStatus] = useState<{
    type: "idle" | "submitting" | "success" | "error";
    message?: string;
  }>({ type: "idle" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "submitting" });

    if (!formData.email || !formData.firstName || !formData.phone || !formData.message) {
      setStatus({
        type: "error",
        message: "Please complete all required fields."
      });
      return;
    }

    try {
      const res = await submitLead({
        form_type: "contact",
        name: formData.firstName,
        first_name: formData.firstName,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        status: "new",
        metadata: {
          submitted_at: new Date().toISOString(),
          page: typeof window !== "undefined" ? window.location.pathname : "/contact"
        }
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to submit");
      }

      setStatus({
        type: "success",
        message: "Thank you! Your inquiry has been sent to Nose Creek Physiotherapy. We will contact you shortly."
      });
      setFormData({
        email: "",
        firstName: "",
        phone: "",
        message: ""
      });
    } catch {
      setStatus({
        type: "error",
        message: "An error occurred while sending. Please call us directly at 403.295.8590."
      });
    }
  };

  return (
    <div style={{ background: "#ffffff", borderRadius: 16, padding: "clamp(24px, 4vw, 36px)", border: "1px solid #dce5ec", boxShadow: "0 4px 20px rgba(18,60,80,0.06)" }}>
      
      {status.type === "success" && (
        <div style={{ background: "#eef8eb", border: "1px solid #c0e6b3", color: "#2d6614", padding: "16px 20px", borderRadius: 10, marginBottom: 20, fontSize: 15, lineHeight: 1.5, textAlign: "center" }}>
          <strong>✓ Message Sent!</strong> {status.message}
        </div>
      )}

      {status.type === "error" && (
        <div style={{ background: "#fde8e8", border: "1px solid #f8b4b4", color: "#9b1c1c", padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontSize: 14 }}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        
        {/* Email Address */}
        <div>
          <label htmlFor="mce-EMAIL" style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#1d2b34", marginBottom: 6 }}>
            Email Address *
          </label>
          <input
            type="email"
            id="mce-EMAIL"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your Email Address"
            required
            disabled={status.type === "submitting"}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #b9d6ea", fontSize: 15, color: "#1d2b34", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* First Name & Phone */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <div>
            <label htmlFor="mce-FNAME" style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#1d2b34", marginBottom: 6 }}>
              First Name *
            </label>
            <input
              type="text"
              id="mce-FNAME"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Your First Name"
              required
              disabled={status.type === "submitting"}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #b9d6ea", fontSize: 15, color: "#1d2b34", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label htmlFor="mce-PHONE" style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#1d2b34", marginBottom: 6 }}>
              Phone Number *
            </label>
            <input
              type="tel"
              id="mce-PHONE"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your Phone Number"
              required
              disabled={status.type === "submitting"}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #b9d6ea", fontSize: 15, color: "#1d2b34", outline: "none", boxSizing: "border-box" }}
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="mce-MMERGE20" style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#1d2b34", marginBottom: 6 }}>
            Message *
          </label>
          <textarea
            id="mce-MMERGE20"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            placeholder="How can we help you?"
            required
            disabled={status.type === "submitting"}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #b9d6ea", fontSize: 15, color: "#1d2b34", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={status.type === "submitting"}
          style={{
            background: "#6faf1c",
            color: "#ffffff",
            fontFamily: "'Poppins',sans-serif",
            fontWeight: 700,
            fontSize: 16,
            padding: "14px 28px",
            borderRadius: 8,
            border: "none",
            cursor: status.type === "submitting" ? "not-allowed" : "pointer",
            boxShadow: "0 4px 14px rgba(111,175,28,0.3)",
            transition: "all 0.2s ease",
            marginTop: 4,
            width: "100%"
          }}
        >
          {status.type === "submitting" ? "Sending..." : "Send Your Inquiry"}
        </button>

      </form>
    </div>
  );
}
