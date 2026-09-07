"use client";

import React, { useState, useMemo, useRef } from "react";
import { LinkIcon } from "./AdminIcons";

interface LinkedContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  onOpenLinkPicker?: () => void;
  placeholder?: string;
  minHeight?: number;
  label?: string;
}

interface DetectedLink {
  raw: string;
  text: string;
  url: string;
  isInternal: boolean;
  index: number;
}

export default function LinkedContentEditor({
  value,
  onChange,
  onOpenLinkPicker,
  placeholder = "Enter narrative paragraphs...",
  minHeight = 120,
  label
}: LinkedContentEditorProps) {
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Extract all markdown links [text](url)
  const detectedLinks = useMemo<DetectedLink[]>(() => {
    if (!value) return [];
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links: DetectedLink[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(value)) !== null) {
      const raw = match[0];
      const text = match[1];
      const url = match[2].trim();
      const isInternal =
        url.startsWith("/") ||
        url.startsWith("#") ||
        url.includes("nosecreekphysiotherapy.com");

      links.push({
        raw,
        text,
        url,
        isInternal,
        index: match.index
      });
    }

    return links;
  }, [value]);

  // Remove a link: keep the text, remove the link markdown
  const handleUnlink = (link: DetectedLink) => {
    const updated = value.replace(link.raw, link.text);
    onChange(updated);
  };

  // Delete a link and its text entirely
  const handleDeleteLink = (link: DetectedLink) => {
    const updated = value.replace(link.raw, "");
    onChange(updated);
  };

  // Remove all links (preserve text)
  const handleUnlinkAll = () => {
    let updated = value;
    detectedLinks.forEach((l) => {
      updated = updated.replace(l.raw, l.text);
    });
    onChange(updated);
  };

  // Highlight links in the text for the preview mode
  const renderHighlightedContent = () => {
    if (!value) {
      return (
        <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: 13.5 }}>
          {placeholder}
        </span>
      );
    }

    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(value)) !== null) {
      const matchStart = match.index;
      const matchEnd = regex.lastIndex;

      // Text before link
      if (matchStart > lastIndex) {
        parts.push(value.substring(lastIndex, matchStart));
      }

      const text = match[1];
      const url = match[2].trim();
      const isInternal =
        url.startsWith("/") ||
        url.startsWith("#") ||
        url.includes("nosecreekphysiotherapy.com");

      parts.push(
        <span
          key={`hl-${matchStart}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 8px",
            borderRadius: 6,
            background: isInternal ? "#e0f2fe" : "#dcfce7",
            border: `1px solid ${isInternal ? "#7dd3fc" : "#86efac"}`,
            color: isInternal ? "#0369a1" : "#15803d",
            fontWeight: 700,
            fontSize: "0.92em",
            margin: "0 2px",
            lineHeight: 1.4
          }}
          title={isInternal ? `Internal Link: ${url}` : `External Link: ${url}`}
        >
          <span>{isInternal ? "🌐" : "🔗"}</span>
          <span style={{ textDecoration: "underline", textUnderlineOffset: 2 }}>{text}</span>
          <code
            style={{
              fontSize: "0.82em",
              background: isInternal ? "#bae6fd" : "#bbf7d0",
              padding: "1px 5px",
              borderRadius: 4,
              fontFamily: "monospace",
              color: isInternal ? "#0c4a6e" : "#14532d"
            }}
          >
            {url}
          </code>
        </span>
      );

      lastIndex = matchEnd;
    }

    if (lastIndex < value.length) {
      parts.push(value.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div
      style={{
        border: "1px solid #cbd5e1",
        borderRadius: 12,
        background: "#ffffff",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
      }}
    >
      {/* ── TOP CONTROLS & TABS ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          flexWrap: "wrap",
          gap: 8
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            onClick={() => setViewMode("edit")}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              border: "1px solid",
              borderColor: viewMode === "edit" ? "#0284c7" : "transparent",
              background: viewMode === "edit" ? "#ffffff" : "transparent",
              color: viewMode === "edit" ? "#0284c7" : "#64748b",
              boxShadow: viewMode === "edit" ? "0 1px 2px rgba(0,0,0,0.05)" : "none"
            }}
          >
            ✏️ Edit Text
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              border: "1px solid",
              borderColor: viewMode === "preview" ? "#0284c7" : "transparent",
              background: viewMode === "preview" ? "#ffffff" : "transparent",
              color: viewMode === "preview" ? "#0284c7" : "#64748b",
              boxShadow: viewMode === "preview" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              display: "flex",
              alignItems: "center",
              gap: 5
            }}
          >
            <span>🎨 Color Link Preview</span>
            {detectedLinks.length > 0 && (
              <span
                style={{
                  background: "#0284c7",
                  color: "#fff",
                  fontSize: 10.5,
                  padding: "1px 5px",
                  borderRadius: 10,
                  fontWeight: 800
                }}
              >
                {detectedLinks.length}
              </span>
            )}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {onOpenLinkPicker && (
            <button
              type="button"
              onClick={onOpenLinkPicker}
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 600,
                color: "#0369a1",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5
              }}
            >
              <LinkIcon size={13} />
              <span>+ Insert Link</span>
            </button>
          )}

          {detectedLinks.length > 1 && (
            <button
              type="button"
              onClick={handleUnlinkAll}
              title="Remove all links and keep plain text"
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 6,
                padding: "4px 8px",
                fontSize: 11.5,
                fontWeight: 600,
                color: "#b91c1c",
                cursor: "pointer"
              }}
            >
              Unlink All
            </button>
          )}
        </div>
      </div>

      {/* ── DETECTED LINKS PILL BAR (Always Visible if Links Exist) ── */}
      {detectedLinks.length > 0 && (
        <div
          style={{
            padding: "8px 12px",
            background: "#f1f5f9",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: 6
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              🔗 Detected Links in this text ({detectedLinks.length}):
            </span>
            <span style={{ fontSize: 11, color: "#64748b" }}>
              Click <strong>✕ Unlink</strong> to convert back to plain text
            </span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {detectedLinks.map((link, idx) => (
              <div
                key={`${link.raw}-${idx}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px 4px 10px",
                  borderRadius: 8,
                  fontSize: 12,
                  background: link.isInternal ? "#e0f2fe" : "#dcfce7",
                  border: `1px solid ${link.isInternal ? "#bae6fd" : "#bbf7d0"}`,
                  color: link.isInternal ? "#0369a1" : "#15803d",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
                }}
              >
                <span style={{ fontSize: 13 }}>{link.isInternal ? "🌐" : "🔗"}</span>
                <strong style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  [{link.text}]
                </strong>
                <code
                  style={{
                    fontSize: 11,
                    background: "rgba(255,255,255,0.7)",
                    padding: "1px 5px",
                    borderRadius: 4,
                    maxWidth: 160,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                  title={link.url}
                >
                  {link.url}
                </code>
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "1px 5px",
                    borderRadius: 4,
                    background: link.isInternal ? "#0284c7" : "#16a34a",
                    color: "#ffffff"
                  }}
                >
                  {link.isInternal ? "Internal" : "External"}
                </span>

                {/* Quick Unlink Button (Removes brackets & URL, keeps text) */}
                <button
                  type="button"
                  onClick={() => handleUnlink(link)}
                  title={`Remove link but keep '${link.text}'`}
                  style={{
                    background: "#ffffff",
                    border: `1px solid ${link.isInternal ? "#7dd3fc" : "#86efac"}`,
                    color: "#b91c1c",
                    borderRadius: 4,
                    padding: "1px 5px",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    marginLeft: 2
                  }}
                >
                  <span>✕ Unlink</span>
                </button>

                {/* Quick Delete Entire Link */}
                <button
                  type="button"
                  onClick={() => handleDeleteLink(link)}
                  title={`Delete link and text entirely`}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#94a3b8",
                    padding: "1px 4px",
                    fontSize: 12,
                    cursor: "pointer"
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── EDITOR BODY ── */}
      {viewMode === "edit" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            minHeight,
            padding: 14,
            fontSize: 13.5,
            lineHeight: 1.6,
            border: "none",
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
            fontFamily: "inherit",
            color: "#0f172a"
          }}
        />
      ) : (
        <div
          onClick={() => setViewMode("edit")}
          style={{
            minHeight,
            padding: 14,
            fontSize: 13.5,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: "#334155",
            cursor: "text",
            background: "#ffffff"
          }}
        >
          {renderHighlightedContent()}
        </div>
      )}

      {/* ── BOTTOM HELPER BAR ── */}
      <div
        style={{
          padding: "6px 12px",
          background: "#f8fafc",
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 11.5,
          color: "#64748b"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#0284c7" }} />
            <span>Blue = Internal Link</span>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#16a34a" }} />
            <span>Green = External Link</span>
          </span>
        </div>

        <span>
          Syntax: <code>[Anchor Text](/path-or-url)</code>
        </span>
      </div>
    </div>
  );
}
