"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function FreeDiscoverySessionPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    phone: "",
    email: "",
    durationSuffered: "1-2 weeks",
    concerns: "",
    sampleReason: "I'd like to get a feel for what you can do to help me BEFORE I commit to a full appointment",
    whatItStops: "",
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
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        form_type: "free_discovery_session",
        first_name: formData.firstName.trim(),
        name: formData.firstName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        service_interest: "Free Discovery Session",
        message: formData.whatItStops ? `What it stops me from doing: ${formData.whatItStops}` : undefined,
        metadata: {
          duration_suffered: formData.durationSuffered || "Not specified",
          top_concern: formData.concerns || "Not specified",
          reason_for_sampling: formData.sampleReason || "Not specified",
          what_it_stops_from_doing: formData.whatItStops || "Not specified",
          main_goal: formData.mainGoal || "Not specified",
          source_page: "/free-discovery-session"
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
      console.error("Discovery session submission failed:", err);
      setErrorMessage(err.message || "Failed to submit discovery application. Please call us at (403) 295-8590.");
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
            Apply for a Free 15 Min Chiropractic <strong style={{ color: "#3db4e5" }}>&ldquo;Discovery Session&rdquo;</strong> (to See if You Like it)
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
              src="https://www.youtube.com/embed/EIPdXWb3gwc?rel=0&modestbranding=0&controls=1&showinfo=1&fs=1"
              title="Free Discovery Session Intro Video"
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
            Watch this video and then fill out the simple form below if you would like to apply for a no-obligation, free Discovery Session with one of our physiotherapists...
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

            {/* First Name */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 6 }}>
                Please Enter Your First Name <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. David"
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

            {/* Best Phone Number & Email Address */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 6 }}>
                  Best Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
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

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 6 }}>
                  Email Address <span style={{ color: "#e11d48" }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. david@example.com"
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

            {/* How Long Have You Been Suffering? */}
            <div style={{ background: "#ffffff", padding: "14px 16px", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 10 }}>
                How Long Have You Been Suffering?
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                {[
                  "A few days",
                  "1-2 weeks",
                  "2-4 weeks",
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

            {/* What Concerns You Most That Makes You Want To Consult? */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 6 }}>
                What Concerns You Most That Makes You Want To Consult?
              </label>
              <select
                name="concerns"
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

            {/* Main Reason For Wanting to Sample Physiotherapy */}
            <div style={{ background: "#ffffff", padding: "14px 16px", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 10 }}>
                Main Reason For Wanting to Sample Physiotherapy:
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "I'm new to Physiotherapy and I'm not sure what to expect",
                  "I was let down by another physio in the past and would like see how good you are before I commit",
                  "I'm NOT sure if physiotherapy can even help me",
                  "I'd like to get a feel for what you can do to help me BEFORE I commit to a full appointment",
                  "It's just easier for me doing it this way"
                ].map((reason) => (
                  <label key={reason} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14.5, cursor: "pointer", color: "#334155", lineHeight: 1.4 }}>
                    <input
                      type="radio"
                      name="sampleReason"
                      value={reason}
                      checked={formData.sampleReason === reason}
                      onChange={handleChange}
                      style={{ width: 17, height: 17, marginTop: 2, accentColor: "#0e78a8", flexShrink: 0 }}
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* What Does It STOP You From Doing? */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 6 }}>
                What Does It STOP You From Doing?
              </label>
              <input
                type="text"
                name="whatItStops"
                value={formData.whatItStops}
                onChange={handleChange}
                placeholder="e.g. Exercising, working without pain, sleeping, daily chores"
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

            {/* Main Goal You Would Like To Achieve */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 6 }}>
                Main Goal You Would Like To Achieve With Us
              </label>
              <select
                name="mainGoal"
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
                {isSubmitting ? "Sending Application..." : "Click To Send Your Inquiry »"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
