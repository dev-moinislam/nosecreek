"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function InquirePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    discipline: "Physical Therapy",
    idealDay: "",
    bestTime: "",
    whatItStops: "",
    concern: "",
    sufferedDuration: "1-2 weeks",
    mainGoal: "",
    email: "",
    phone: ""
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
    if (!formData.lastName.trim()) {
      setErrorMessage("Please enter your Last Name.");
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

    setIsSubmitting(true);

    try {
      const payload = {
        form_type: "cost_and_availability_inquiry",
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        service_interest: formData.discipline,
        message: formData.whatItStops ? `What it stops me from doing: ${formData.whatItStops}` : undefined,
        metadata: {
          discipline: formData.discipline,
          ideal_day: formData.idealDay || "Not specified",
          best_time: formData.bestTime || "Not specified",
          what_it_stops_from_doing: formData.whatItStops || "Not specified",
          top_concern: formData.concern || "Not specified",
          duration_suffered: formData.sufferedDuration || "Not specified",
          main_goal: formData.mainGoal || "Not specified",
          source_page: "/inquire"
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

      // Smooth navigation to thank you confirmation
      router.push("/thanks");
    } catch (err: any) {
      console.error("Inquiry submission failed:", err);
      setErrorMessage(err.message || "Failed to submit inquiry. Please call our clinic directly at (403) 295-8590.");
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
        {/* Top Header Banner */}
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
            Inquire About <strong style={{ color: "#3db4e5" }}>Cost and Availability</strong>
          </h1>

          {/* Embedded Video */}
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
              src="https://www.youtube.com/embed/NM6x_oc6-SM?rel=0&modestbranding=0&controls=1&showinfo=1&fs=1"
              title="Inquire About Cost and Availability Intro Video"
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

          {/* Narrative Paragraph */}
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
            So That We Can Serve Your SPECIFIC Needs, Please Fill Out This 30 Second Form And Show Us EXACTLY How You Want Us To Help YOU — the More We Know About You, the Better We Can Help You.
          </p>

          {/* Form Container */}
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

            {/* First Name & Last Name */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 6 }}>
                  First Name <span style={{ color: "#e11d48" }}>*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. John"
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
                  Last Name <span style={{ color: "#e11d48" }}>*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Doe"
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

            {/* Service Discipline Radios */}
            <div style={{ background: "#ffffff", padding: "14px 16px", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 10 }}>
                Discipline / Service Needed:
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                {["Physical Therapy", "Chiropractic", "Massage"].map((disc) => (
                  <label key={disc} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, cursor: "pointer", fontWeight: 600, color: "#334155" }}>
                    <input
                      type="radio"
                      name="discipline"
                      value={disc}
                      checked={formData.discipline === disc}
                      onChange={handleChange}
                      style={{ width: 18, height: 18, accentColor: "#0e78a8" }}
                    />
                    {disc}
                  </label>
                ))}
              </div>
            </div>

            {/* Ideal Day For Appointment */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 6 }}>
                Pick Your Ideal Day For An Appointment <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <select
                name="idealDay"
                required
                value={formData.idealDay}
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
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>

            {/* Best Time */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 6 }}>
                Tell us the best time <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <input
                type="text"
                name="bestTime"
                required
                value={formData.bestTime}
                onChange={handleChange}
                placeholder="e.g. Mornings between 9-11 AM, or After 4 PM"
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

            {/* What does it stop you from doing? */}
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
                placeholder="e.g. Running, sitting comfortably at work, playing with kids, sleeping through the night"
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

            {/* What concerns you most? */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 6 }}>
                What Concerns You Most? <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <select
                name="concern"
                required
                value={formData.concern}
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

            {/* How long have you suffered? */}
            <div style={{ background: "#ffffff", padding: "14px 16px", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 10 }}>
                How Long Have You Suffered Or Worried? <span style={{ color: "#e11d48" }}>*</span>
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
                      name="sufferedDuration"
                      value={dur}
                      checked={formData.sufferedDuration === dur}
                      onChange={handleChange}
                      style={{ width: 16, height: 16, accentColor: "#0e78a8" }}
                    />
                    {dur}
                  </label>
                ))}
              </div>
            </div>

            {/* Main Goal */}
            <div style={{ marginBottom: 18 }}>
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

            {/* Email & Phone */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
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

              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#0e78a8", marginBottom: 6 }}>
                  Phone Number <span style={{ color: "#e11d48" }}>*</span>
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
                {isSubmitting ? "Sending Your Inquiry..." : "Click To Send Your Inquiry »"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
