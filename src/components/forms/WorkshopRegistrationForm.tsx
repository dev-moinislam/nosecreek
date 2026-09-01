"use client";
import React, { useState } from "react";
import { submitLead } from "@/lib/supabase/client";

export default function WorkshopRegistrationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    hurtArea: "",
    reason: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await submitLead({
        form_type: "workshop_registration",
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service_interest: formData.hurtArea || "Health Workshop",
        message: `Area of pain: ${formData.hurtArea || "N/A"}. Goal: ${formData.reason || "N/A"}`,
        status: "new",
        metadata: {
          hurt_area: formData.hurtArea,
          reason: formData.reason,
          submitted_at: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div
        style={{
          background: "#eef6e4",
          border: "1px solid #c0e09e",
          borderRadius: 16,
          padding: "36px 28px",
          textAlign: "center"
        }}
      >
        <div style={{ fontSize: 42, marginBottom: 12 }}>🎉</div>
        <h3 style={{ fontSize: 22, fontWeight: 800, color: "#2e5c10", marginBottom: 8 }}>
          Registration Received!
        </h3>
        <p style={{ color: "#486e24", fontSize: 15, lineHeight: 1.6, maxWidth: 460, margin: "0 auto" }}>
          Thank you, <strong>{formData.name}</strong>. We have sent the workshop schedule, Zoom link, and dates to <strong>{formData.email}</strong>. Our clinical coordinator will also be in touch shortly!
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#ffffff",
        border: "1px solid #e7edf1",
        borderRadius: 20,
        padding: "clamp(24px, 4vw, 36px)",
        boxShadow: "0 12px 36px rgba(18,60,80,0.08)"
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ display: "inline-block", background: "rgba(111,175,28,0.12)", color: "#5c9515", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "1px", padding: "4px 12px", borderRadius: 999, marginBottom: 8, fontFamily: "'Poppins',sans-serif" }}>
          100% Free Workshop Access
        </div>
        <h3 style={{ fontSize: "clamp(20px, 2.6vw, 26px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.4px", margin: "0 0 6px" }}>
          Request Dates &amp; Times Of The Next Workshop
        </h3>
        <p style={{ fontSize: 14, color: "#5a6570", margin: 0 }}>
          Reserve your free seat or request access to on-demand video replays.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1d2b34", marginBottom: 6, fontFamily: "'Poppins',sans-serif" }}>
            Your Full Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Sarah Jenkins"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 8,
              border: "1px solid #cfdce4",
              fontSize: 14.5,
              color: "#1d2b34",
              outline: "none"
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1d2b34", marginBottom: 6, fontFamily: "'Poppins',sans-serif" }}>
            Email Address *
          </label>
          <input
            type="email"
            required
            placeholder="sarah@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 8,
              border: "1px solid #cfdce4",
              fontSize: 14.5,
              color: "#1d2b34",
              outline: "none"
            }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1d2b34", marginBottom: 6, fontFamily: "'Poppins',sans-serif" }}>
            Telephone Number *
          </label>
          <input
            type="tel"
            required
            placeholder="(403) 000-0000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 8,
              border: "1px solid #cfdce4",
              fontSize: 14.5,
              color: "#1d2b34",
              outline: "none"
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1d2b34", marginBottom: 6, fontFamily: "'Poppins',sans-serif" }}>
            Where Does It Hurt? *
          </label>
          <select
            required
            value={formData.hurtArea}
            onChange={(e) => setFormData({ ...formData, hurtArea: e.target.value })}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 8,
              border: "1px solid #cfdce4",
              fontSize: 14.5,
              color: "#1d2b34",
              backgroundColor: "#fff",
              outline: "none"
            }}
          >
            <option value="">-- Please Select Area --</option>
            <option value="Lower Back / Sciatica">Lower Back / Sciatica</option>
            <option value="Neck & Shoulder">Neck &amp; Shoulder</option>
            <option value="Knee Pain / Arthritis">Knee Pain / Arthritis</option>
            <option value="Foot / Ankle / Plantar Fasciitis">Foot / Ankle / Plantar Fasciitis</option>
            <option value="Hip Joint">Hip Joint</option>
            <option value="Pelvic Health / Postpartum">Pelvic Health / Postpartum</option>
            <option value="Headaches / Migraines">Headaches / Migraines</option>
            <option value="Sports Injury">Sports Injury</option>
            <option value="General Stiffness / Unsure">General Stiffness / Unsure</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1d2b34", marginBottom: 6, fontFamily: "'Poppins',sans-serif" }}>
          Reason for wanting to attend a workshop *
        </label>
        <select
          required
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 8,
            border: "1px solid #cfdce4",
            fontSize: 14,
            color: "#1d2b34",
            backgroundColor: "#fff",
            outline: "none"
          }}
        >
          <option value="">-- Select Your Main Goal --</option>
          <option value="I'm in lots of pain and want tips I can start using straight away">
            I&apos;m in lots of pain and want tips I can start using straight away
          </option>
          <option value="I would love to know what's wrong and how long it will take to ease">
            I would love to know what&apos;s wrong and how long it will take to ease
          </option>
          <option value="I'm not sure if Physiotherapy is right for me and talking to a clinician first would help">
            I&apos;m not sure if Physiotherapy is right for me and talking to a clinician first would help
          </option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          background: "#6faf1c",
          color: "#fff",
          fontFamily: "'Poppins',sans-serif",
          fontWeight: 700,
          fontSize: 16,
          padding: "16px 24px",
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 8px 20px rgba(111,175,28,0.32)",
          transition: "background 0.2s ease"
        }}
      >
        {loading ? "Registering..." : "Yes! Send Me Dates & Times »"}
      </button>

      <p style={{ textAlign: "center", fontSize: 12.5, color: "#8a97a1", marginTop: 12, marginBottom: 0 }}>
        🔒 100% Free Event. No spam, ever. Your privacy is strictly protected.
      </p>
    </form>
  );
}
