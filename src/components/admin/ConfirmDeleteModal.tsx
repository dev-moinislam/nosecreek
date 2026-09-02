"use client";

import React, { useState, useEffect } from "react";
import { TrashIcon, XIcon } from "@/components/admin/AdminIcons";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemName: string;
  itemType?: string; // e.g. "Clinical Service", "Condition", "Blog Article", "Section"
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title,
  itemName,
  itemType = "Item",
  onConfirm,
  onClose
}: ConfirmDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
    } catch (err) {
      console.error("Delete execution error:", err);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999999,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "modalBackdropFade 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
      onClick={(e) => {
        if (!isDeleting && e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @keyframes modalBackdropFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalContentPop {
          0% { opacity: 0; transform: scale(0.92) translateY(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes trashPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
      `}</style>

      <div
        style={{
          background: "#ffffff",
          borderRadius: 22,
          width: "100%",
          maxWidth: 460,
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(239, 68, 68, 0.15)",
          overflow: "hidden",
          animation: "modalContentPop 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
          position: "relative"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Alert Stripe */}
        <div
          style={{
            height: 5,
            width: "100%",
            background: "linear-gradient(90deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)"
          }}
        />

        {/* Close Icon Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "#f1f5f9",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            cursor: isDeleting ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
            padding: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#e2e8f0";
            e.currentTarget.style.color = "#0f172a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#f1f5f9";
            e.currentTarget.style.color = "#64748b";
          }}
          aria-label="Close"
        >
          <XIcon size={16} />
        </button>

        {/* Modal Header & Icon */}
        <div style={{ padding: "28px 26px 20px", textAlign: "center" }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 20px rgba(220, 38, 38, 0.18)",
              animation: "trashPulse 2s ease-in-out infinite"
            }}
          >
            <TrashIcon size={26} />
          </div>

          <h3
            style={{
              margin: "0 0 6px 0",
              fontSize: 20,
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.3px",
              lineHeight: 1.25
            }}
          >
            {title || `Delete this ${itemType}?`}
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: 14.5,
              color: "#64748b",
              lineHeight: 1.5
            }}
          >
            Are you sure you want to permanently delete
          </p>

          <div
            style={{
              margin: "8px 0 0 0",
              fontSize: 15.5,
              fontWeight: 700,
              color: "#1e293b",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              padding: "8px 14px",
              display: "inline-block",
              maxWidth: "100%",
              wordBreak: "break-word"
            }}
          >
            &ldquo;{itemName}&rdquo;
          </div>
        </div>

        {/* Warning Notice */}
        <div style={{ padding: "0 26px 24px" }}>
          <div
            style={{
              background: "#fff5f5",
              border: "1px solid #fed7d7",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: 13,
              color: "#991b1b",
              lineHeight: 1.55,
              display: "flex",
              alignItems: "flex-start",
              gap: 10
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1, marginTop: 1 }}>⚠️</span>
            <span>
              This will remove the {itemType.toLowerCase()} immediately from the database, JSON data files, and live website.
            </span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div
          style={{
            padding: "16px 26px 22px",
            borderTop: "1px solid #f1f5f9",
            background: "#fafbfc",
            display: "flex",
            justifyContent: "flex-end",
            gap: 12
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            style={{
              flex: 1,
              padding: "11px 18px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#475569",
              fontSize: 14.5,
              fontWeight: 700,
              cursor: isDeleting ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              textAlign: "center"
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) e.currentTarget.style.background = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) e.currentTarget.style.background = "#ffffff";
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            style={{
              flex: 1.3,
              padding: "11px 20px",
              borderRadius: 10,
              border: "none",
              background: isDeleting
                ? "#9ca3af"
                : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "#ffffff",
              fontSize: 14.5,
              fontWeight: 700,
              cursor: isDeleting ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: isDeleting
                ? "none"
                : "0 6px 18px rgba(220, 38, 38, 0.32)",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 8px 22px rgba(220, 38, 38, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 6px 18px rgba(220, 38, 38, 0.32)";
              }
            }}
          >
            <TrashIcon size={16} />
            <span>{isDeleting ? "Deleting..." : "Yes, Delete"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
