"use client";
import React, { useState } from "react";
import { submitLead } from "@/lib/supabase/client";

interface WorkshopReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWorkshop?: string;
}

export default function WorkshopReplayModal({
  isOpen,
  onClose,
  defaultWorkshop = "Knee Pain"
}: WorkshopReplayModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    selectedWorkshop: defaultWorkshop
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update selected workshop if prop changes
  React.useEffect(() => {
    if (defaultWorkshop) {
      setFormData((prev) => ({ ...prev, selectedWorkshop: defaultWorkshop }));
    }
  }, [defaultWorkshop]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await submitLead({
        form_type: "workshop_replay",
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service_interest: formData.selectedWorkshop || "Workshop Replay",
        message: `Requested on-demand replay for: ${formData.selectedWorkshop}`,
        status: "new",
        metadata: {
          requested_workshop: formData.selectedWorkshop,
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

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(18, 48, 61, 0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 99999,
        overflowY: "auto",
        padding: "clamp(24px, 4vw, 48px) 16px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "540px",
          padding: "clamp(24px, 4vw, 36px)",
          margin: "auto",
          position: "relative",
          boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
          animation: "modalFadeIn 0.25s ease-out"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "#f2f8fb",
            border: "1px solid #e2ebf0",
            color: "#5a6570",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1
          }}
        >
          ✕
        </button>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "20px 8px" }}>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: "#1d2b34", marginBottom: 10 }}>
              Replay Access Granted!
            </h3>
            <p style={{ color: "#5a6570", fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
              Thank you, <strong>{formData.name}</strong>. We have sent the private video link for the <strong>{formData.selectedWorkshop}</strong> replay directly to <strong>{formData.email}</strong>.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              style={{
                background: "#6faf1c",
                color: "#fff",
                fontFamily: "'Poppins',sans-serif",
                fontWeight: 700,
                fontSize: 15,
                padding: "12px 28px",
                borderRadius: 9,
                border: "none",
                cursor: "pointer"
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div style={{ display: "inline-block", background: "rgba(111,175,28,0.12)", color: "#5c9515", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "1px", padding: "4px 12px", borderRadius: 999, marginBottom: 10, fontFamily: "'Poppins',sans-serif" }}>
                100% Free Instant Access
              </div>
              <h2 style={{ fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 800, color: "#1d2b34", letterSpacing: "-0.4px", lineHeight: 1.25, margin: "0 0 6px" }}>
                Fill Out the Form to Get Access to Our Workshop Video Replays
              </h2>
              <p style={{ fontSize: 14, color: "#5a6570", margin: 0 }}>
                Watch our recorded physiotherapy sessions anytime from your phone or computer.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1d2b34", marginBottom: 6, fontFamily: "'Poppins',sans-serif" }}>
                  Your First Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your First Name"
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
                  Put Your Best Email Here *
                </label>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
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

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1d2b34", marginBottom: 6, fontFamily: "'Poppins',sans-serif" }}>
                  Phone Number *
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
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1d2b34", marginBottom: 8, fontFamily: "'Poppins',sans-serif" }}>
                  Which workshops are you interested in? *
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "#f8fafc", padding: "14px 16px", borderRadius: 10, border: "1px solid #e7edf1" }}>
                  {[
                    { val: "Knee Pain", label: "Knee Pain" },
                    { val: "Foam Roller", label: "Foam Roller" },
                    { val: "Neck Pain", label: "Neck Pain" }
                  ].map((option) => (
                    <label
                      key={option.val}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 14.5,
                        color: "#1d2b34",
                        cursor: "pointer",
                        fontWeight: formData.selectedWorkshop === option.val ? 700 : 500
                      }}
                    >
                      <input
                        type="radio"
                        name="workshop"
                        value={option.val}
                        checked={formData.selectedWorkshop === option.val}
                        onChange={(e) => setFormData({ ...formData, selectedWorkshop: e.target.value })}
                        style={{ accentColor: "#6faf1c", width: 17, height: 17 }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
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
                  padding: "15px 20px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(111,175,28,0.32)",
                  marginTop: 6
                }}
              >
                {loading ? "Preparing Access..." : "Give me Access to the Videos »"}
              </button>

              <p style={{ textAlign: "center", fontSize: 12, color: "#8a97a1", margin: 0 }}>
                100% Free Video Access. We respect your privacy.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
