"use client";

import React, { useEffect } from "react";
import { CheckIcon } from "./AdminIcons";

interface AdminToastProps {
  message: string | null;
  onClose: () => void;
  type?: "success" | "error" | "info";
  duration?: number;
}

export default function AdminToast({
  message,
  onClose,
  type = "success",
  duration = 3500
}: AdminToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const bg = type === "error" ? "#dc2626" : type === "info" ? "#0284c7" : "#16a34a";

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 999999,
        background: bg,
        color: "#ffffff",
        padding: "14px 24px",
        borderRadius: 12,
        boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontWeight: 700,
        fontSize: 15,
        fontFamily: "'Poppins', sans-serif",
        animation: "fadeInDown 0.25s ease-out"
      }}
    >
      <CheckIcon size={20} style={{ color: "#fff" }} />
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.8)",
          cursor: "pointer",
          fontSize: 18,
          marginLeft: 8,
          lineHeight: 1
        }}
      >
        &times;
      </button>
    </div>
  );
}
