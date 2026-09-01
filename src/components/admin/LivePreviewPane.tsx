"use client";

import React, { useState } from "react";

interface LivePreviewPaneProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function LivePreviewPane({
  url,
  isOpen,
  onClose,
  title = "Live Visual Preview"
}: LivePreviewPaneProps) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [iframeKey, setIframeKey] = useState(1);

  if (!isOpen) return null;

  const getWidth = () => {
    switch (device) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      case "desktop":
      default:
        return "100%";
    }
  };

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div
        className="adm-modal"
        style={{
          width: "95vw",
          maxWidth: "1400px",
          height: "92vh",
          display: "flex",
          flexDirection: "column"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Controls */}
        <div className="adm-modal-header" style={{ padding: "12px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              👁️ {title}
            </h3>
            <span style={{ fontSize: 12, color: "#64748b", background: "#f1f5f9", padding: "2px 8px", borderRadius: 6 }}>
              {url}
            </span>
          </div>

          {/* Device Toggles & Refresh */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 3, gap: 2 }}>
              <button
                onClick={() => setDevice("desktop")}
                style={{
                  border: "none",
                  background: device === "desktop" ? "#fff" : "none",
                  boxShadow: device === "desktop" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  padding: "4px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                💻 Desktop
              </button>
              <button
                onClick={() => setDevice("tablet")}
                style={{
                  border: "none",
                  background: device === "tablet" ? "#fff" : "none",
                  boxShadow: device === "tablet" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  padding: "4px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                📱 Tablet
              </button>
              <button
                onClick={() => setDevice("mobile")}
                style={{
                  border: "none",
                  background: device === "mobile" ? "#fff" : "none",
                  boxShadow: device === "mobile" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  padding: "4px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                📱 Mobile
              </button>
            </div>

            <button
              onClick={handleRefresh}
              className="adm-btn adm-btn-secondary adm-btn-sm"
              title="Reload Preview"
            >
              🔄 Refresh
            </button>

            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "#94a3b8",
                marginLeft: 6
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Live Iframe Body */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#334155",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: getWidth(),
              height: "100%",
              backgroundColor: "#fff",
              borderRadius: device === "desktop" ? 0 : 16,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
              overflow: "hidden",
              transition: "width 0.25s ease"
            }}
          >
            <iframe
              key={iframeKey}
              src={url}
              title="Live Visual Preview"
              style={{
                width: "100%",
                height: "100%",
                border: "none"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
