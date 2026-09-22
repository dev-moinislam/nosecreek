"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function TelephoneConsultationPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    phone: "",
    reasonToSpeak: "I'm in lots of pain and want some tips and advice I can start using right away",
    callBackTime: "Any time",
    whatItStops: "",
    concerns: "",
    durationSuffered: "1-2 weeks",
    mainGoal: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.firstName.trim()) {
      setErrorMessage("Please enter your First Name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage("Please enter your phone number.");
      return;
    }
    if (!formData.whatItStops.trim()) {
      setErrorMessage("Please let us know what this pain stops you from doing.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        form_type: "telephone_consultation",
        first_name: formData.firstName.trim(),
        name: formData.firstName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        service_interest: "Free Telephone Consultation",
        message: formData.whatItStops ? `What it stops me from doing: ${formData.whatItStops}` : undefined,
        metadata: {
          reason_for_speaking: formData.reasonToSpeak || "Not specified",
          best_time_for_call_back: formData.callBackTime || "Not specified",
          what_it_stops_from_doing: formData.whatItStops || "Not specified",
          top_concern: formData.concerns || "Not specified",
          duration_suffered: formData.durationSuffered || "Not specified",
          main_goal: formData.mainGoal || "Not specified",
          source_page: "/telephone-consultation"
        }
      };

      const res = await fetch("/api/forms/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const resData = await res.json().catch(() => ({}));

      if (!res.ok && resData.error) {
        throw new Error(resData.error);
      }

      router.push("/thanks");
    } catch (err: any) {
      console.error("Telephone consult submission failed:", err);
      setErrorMessage(err.message || "Failed to submit request. Please call us directly at (403) 295-8590.");
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "40px 16px 80px 16px" }}>
      <div
        style={{
          maxWidth: 780,
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
          border: "1px solid #e2e8f0",
          overflow: "hidden"
        }}
      >
        {/* Top Accent Ribbon */}
        <div style={{ height: 6, background: "linear-gradient(90deg, #0e78a8, #96c93d)" }} />

        <div style={{ padding: "clamp(24px, 5vw, 44px)" }}>
          {/* Main Title */}
          <h1
            style={{
              fontFamily: "'Open Sans Condensed', 'Poppins', sans-serif",
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: 700,
              textAlign: "center",
              color: "#0f172a",
              lineHeight: 1.2,
              margin: "0 0 24px 0",
              textTransform: "none"
            }}
          >
            Arrange Your <strong style={{ color: "#3db4e5" }}>Free (15 Minutes)</strong> Telephone Consultation With a Physio
          </h1>

          {/* Embedded YouTube Video */}
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
              overflow: "hidden",
              borderRadius: 12,
              marginBottom: 28,
              boxShadow: "0 4px 18px rgba(0,0,0,0.1)",
              background: "#000"
            }}
          >
            <iframe
              src="https://www.youtube.com/embed/23nOKjtDZfo?rel=0&modestbranding=0&controls=1&showinfo=1&fs=1"
              title="Free Telephone Consultation Intro Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: 0
              }}
            />
          </div>

          {/* Subtitle */}
          <p
            style={{
              textAlign: "center",
              fontSize: 16,
              color: "#475569",
              lineHeight: 1.6,
              maxWidth: 680,
              margin: "0 auto 36px auto",
              fontWeight: 500
            }}
          >
            So That We Can Meet Your SPECIFIC Needs, Please Fill Out This 35 Seconds Form And Show Us EXACTLY How You Want Us To Help YOU — The more we know about you, the better we can help you.
          </p>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: 12,
              padding: "clamp(18px, 4vw, 32px)",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)"
            }}
          >
            {errorMessage && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #f87171",
                  borderRadius: 8,
                  padding: "12px 16px",
                  color: "#991b1b",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 20
                }}
              >
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Email Address */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 6 }}>
                Email Address <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. john@example.com"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 6,
                  border: "1px solid #b9d6ea",
                  background: "#ffffff",
                  fontSize: 15,
                  color: "#0f172a",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* First Name & Phone */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 6 }}>
                  Please Enter Your First Name <span style={{ color: "#e11d48" }}>*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Sarah"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 6,
                    border: "1px solid #b9d6ea",
                    background: "#ffffff",
                    fontSize: 15,
                    color: "#0f172a",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 6 }}>
                  Best Phone Number <span style={{ color: "#e11d48" }}>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. (403) 123-4567"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 6,
                    border: "1px solid #b9d6ea",
                    background: "#ffffff",
                    fontSize: 15,
                    color: "#0f172a",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            {/* Primary Reason For Wanting to Speak */}
            <div style={{ background: "#ffffff", padding: "14px 16px", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 10 }}>
                Primary Reason For Wanting to Speak With a Specialist:
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "I'm in lots of pain and want some tips and advice I can start using right away",
                  "I would love to know what's wrong and how long it will take to ease",
                  "I am not sure if this service is right for me and talking to a professional staff member would help me decide"
                ].map((reason) => (
                  <label key={reason} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14.5, cursor: "pointer", color: "#334155", lineHeight: 1.4 }}>
                    <input
                      type="radio"
                      name="reasonToSpeak"
                      value={reason}
                      checked={formData.reasonToSpeak === reason}
                      onChange={handleChange}
                      style={{ width: 17, height: 17, marginTop: 2, accentColor: "#0e78a8", flexShrink: 0 }}
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Best Time For Call Back */}
            <div style={{ background: "#ffffff", padding: "14px 16px", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 10 }}>
                Best Time For A Call Back:
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                {["Through the day", "After 5pm", "Any time"].map((time) => (
                  <label key={time} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, cursor: "pointer", fontWeight: 600, color: "#334155" }}>
                    <input
                      type="radio"
                      name="callBackTime"
                      value={time}
                      checked={formData.callBackTime === time}
                      onChange={handleChange}
                      style={{ width: 18, height: 18, accentColor: "#0e78a8" }}
                    />
                    {time}
                  </label>
                ))}
              </div>
            </div>

            {/* What Does It STOP You From Doing? */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 6 }}>
                What Does It STOP You From Doing? <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <input
                type="text"
                name="whatItStops"
                required
                value={formData.whatItStops}
                onChange={handleChange}
                placeholder="e.g. Walking without pain, lifting items, sleeping, working"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 6,
                  border: "1px solid #b9d6ea",
                  background: "#ffffff",
                  fontSize: 15,
                  color: "#0f172a",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* What Concerns You the Most? */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 6 }}>
                What Concerns You the Most? <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <select
                name="concerns"
                required
                value={formData.concerns}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 6,
                  border: "1px solid #b9d6ea",
                  background: "#ffffff",
                  fontSize: 15,
                  color: "#0f172a",
                  boxSizing: "border-box"
                }}
              >
                <option value="">Select Option</option>
                <option value="Not knowing what's wrong">Not knowing what's wrong</option>
                <option value="Depending upon painkillers">Depending upon painkillers</option>
                <option value="Losing mobility or independence">Losing mobility or independence</option>
                <option value="The risk of facing dangerous surgery">The risk of facing dangerous surgery</option>
              </select>
            </div>

            {/* How Long Have You Suffered Or Worried? */}
            <div style={{ background: "#ffffff", padding: "14px 16px", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 10 }}>
                How Long Have You Suffered Or Worried?
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                {[
                  "A few days",
                  "1-2 weeks",
                  "1-3 months",
                  "Long enough",
                  "Seems like too long (years)"
                ].map((dur) => (
                  <label key={dur} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", color: "#334155" }}>
                    <input
                      type="radio"
                      name="durationSuffered"
                      value={dur}
                      checked={formData.durationSuffered === dur}
                      onChange={handleChange}
                      style={{ width: 16, height: 16, accentColor: "#0e78a8" }}
                    />
                    {dur}
                  </label>
                ))}
              </div>
            </div>

            {/* Main Goal */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 6 }}>
                Main Goal for Speaking to a Physical Therapist <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <select
                name="mainGoal"
                required
                value={formData.mainGoal}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 6,
                  border: "1px solid #b9d6ea",
                  background: "#ffffff",
                  fontSize: 15,
                  color: "#0f172a",
                  boxSizing: "border-box"
                }}
              >
                <option value="">Select Option</option>
                <option value="Ease Pain">Ease Pain</option>
                <option value="Ease Stiffness">Ease Stiffness</option>
                <option value="Get Active">Get Active</option>
                <option value="Stay Active">Stay Active</option>
                <option value="Avoid Painkillers">Avoid Painkillers</option>
                <option value="Find out what's wrong">Find out what's wrong</option>
                <option value="Stay healthy and get fixed BEFORE pain gets worse">
                  Stay healthy and get fixed BEFORE pain gets worse
                </option>
              </select>
            </div>

            {/* Submit Button */}
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: isSubmitting ? "#94a3b8" : "#96c93d",
                  color: "#ffffff",
                  border: 0,
                  borderRadius: 6,
                  padding: "16px 36px",
                  fontSize: "clamp(18px, 3vw, 24px)",
                  fontFamily: "'Open Sans Condensed', sans-serif",
                  fontWeight: 700,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(150,201,61,0.35)",
                  transition: "all 0.2s ease",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                  width: "100%",
                  maxWidth: 420
                }}
              >
                {isSubmitting ? "Sending Request..." : "Click To Send Your Inquiry »"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
