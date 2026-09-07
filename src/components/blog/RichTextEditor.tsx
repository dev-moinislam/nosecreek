"use client";

import React, { useState, useRef, useEffect } from "react";
import InternalLinkPickerModal from "@/components/admin/InternalLinkPickerModal";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your rich clinical article content here...",
  minHeight = 240
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isCodeView, setIsCodeView] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showInternalLinkPicker, setShowInternalLinkPicker] = useState(false);
  const [linkPickerTab, setLinkPickerTab] = useState<"internal" | "external">("internal");
  const [linkUrl, setLinkUrl] = useState("https://");
  const savedSelectionRef = useRef<Range | null>(null);

  // Sync value to editor only if NOT actively focused (prevents cursor jumping)
  useEffect(() => {
    if (editorRef.current && !isCodeView) {
      if (document.activeElement !== editorRef.current) {
        if (editorRef.current.innerHTML !== (value || "")) {
          editorRef.current.innerHTML = value || "";
        }
      }
    }
  }, [value, isCodeView]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Save selection before modal opens
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    } else if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const exec = (command: string, val: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, val);
    handleInput();
  };

  const formatHeading = (tag: "h2" | "h3" | "p") => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const sel = window.getSelection();
    let executed = false;
    try {
      executed = document.execCommand("formatBlock", false, tag);
    } catch {}
    if (!executed) {
      try {
        executed = document.execCommand("formatBlock", false, `<${tag}>`);
      } catch {}
    }
    // Reliable fallback if formatBlock fails
    if (!executed && editorRef.current) {
      const selectedText = sel ? sel.toString() : "";
      const text = selectedText || (tag === "p" ? "New paragraph" : `New ${tag.toUpperCase()} Heading`);
      document.execCommand("insertHTML", false, `<${tag}>${text}</${tag}>`);
    }
    handleInput();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");

    if (html) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        
        // Strip out foreign inline background, font-family, font-size, and indentation
        const allElements = doc.body.querySelectorAll("*");
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style) {
            htmlEl.style.removeProperty("background");
            htmlEl.style.removeProperty("background-color");
            htmlEl.style.removeProperty("font-family");
            htmlEl.style.removeProperty("font-size");
            htmlEl.style.removeProperty("text-indent");
            htmlEl.style.removeProperty("margin-inline-start");
            htmlEl.style.removeProperty("margin-inline-end");
            htmlEl.style.removeProperty("padding-inline-start");
          }
        });

        const cleaned = doc.body.innerHTML;
        document.execCommand("insertHTML", false, cleaned);
        handleInput();
        return;
      } catch {
        // fallback
      }
    }

    if (text) {
      document.execCommand("insertText", false, text);
      handleInput();
    }
  };

  const handleInsertQuote = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString() : "";
    const quoteContent = selectedText || "Insert clinical quote or patient takeaway here...";
    const quoteHtml = `<blockquote style="border-left: 4px solid #0e78a8; margin: 16px 0; padding: 12px 18px; background: #f0f9ff; color: #0f172a; font-style: italic; font-size: 1.05rem;"><p style="margin: 0;">${quoteContent}</p></blockquote><p></p>`;
    document.execCommand("insertHTML", false, quoteHtml);
    handleInput();
  };

  const handleInsertImage = () => {
    if (!imageUrl.trim()) return;
    restoreSelection();
    const imgHtml = `<figure style="margin: 20px 0; text-align: center;"><img src="${imageUrl.trim()}" alt="Clinical reference" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" /><figcaption style="font-size: 12px; color: #64748b; margin-top: 6px;">Nose Creek Physiotherapy</figcaption></figure><p></p>`;
    document.execCommand("insertHTML", false, imgHtml);
    handleInput();
    setImageUrl("");
    setShowImageModal(false);
  };

  const handleInsertLink = () => {
    if (!linkUrl.trim() || linkUrl === "https://") return;
    restoreSelection();
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString().trim() : "";
    const cleanLink = linkUrl.trim();
    
    if (!selectedText) {
      document.execCommand("insertHTML", false, `<a href="${cleanLink}" target="_blank" rel="noopener noreferrer" style="color: #0e78a8; text-decoration: underline; font-weight: 600;">${cleanLink}</a>&nbsp;`);
    } else {
      document.execCommand("createLink", false, cleanLink);
    }
    handleInput();
    setLinkUrl("https://");
    setShowLinkModal(false);
  };

  const handleSelectLink = (
    url: string,
    title: string,
    _item?: any,
    options?: { isExternal?: boolean; openInNewTab?: boolean }
  ) => {
    restoreSelection();
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString().trim() : "";
    const linkText = selectedText || title;
    const isExternal = options?.isExternal ?? (url.startsWith("http://") || url.startsWith("https://"));
    const targetAttr = isExternal || options?.openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : "";

    const linkHtml = `<a href="${url}" title="${title}"${targetAttr} style="color: #0e78a8; text-decoration: underline; font-weight: 600;">${linkText}</a>&nbsp;`;
    const success = document.execCommand("insertHTML", false, linkHtml);
    if (!success && editorRef.current) {
      editorRef.current.innerHTML += linkHtml;
    }
    handleInput();
    setShowInternalLinkPicker(false);
  };

  return (
    <div
      style={{
        border: "1px solid #cbd5e1",
        borderRadius: 12,
        overflow: "hidden",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        position: "relative"
      }}
    >
      {/* ── TOOLBAR ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 4,
          padding: "8px 10px",
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0"
        }}
      >
        {/* Headings */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatHeading("h2")}
          title="Heading 2 (Large)"
          style={{ ...btnStyle, fontWeight: 800 }}
        >
          H2
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatHeading("h3")}
          title="Heading 3 (Medium)"
          style={{ ...btnStyle, fontWeight: 700 }}
        >
          H3
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatHeading("p")}
          title="Normal Paragraph"
          style={btnStyle}
        >
          Paragraph
        </button>

        <span style={dividerStyle} />

        {/* Basic formatting */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("bold")}
          title="Bold (Ctrl+B)"
          style={{ ...btnStyle, fontWeight: 800 }}
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("italic")}
          title="Italic (Ctrl+I)"
          style={{ ...btnStyle, fontStyle: "italic" }}
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("underline")}
          title="Underline (Ctrl+U)"
          style={{ ...btnStyle, textDecoration: "underline" }}
        >
          U
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("strikeThrough")}
          title="Strikethrough"
          style={{ ...btnStyle, textDecoration: "line-through" }}
        >
          S
        </button>

        <span style={dividerStyle} />

        {/* Lists */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertUnorderedList")}
          title="Bullet List"
          style={btnStyle}
        >
          • Bullet List
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertOrderedList")}
          title="Numbered List"
          style={btnStyle}
        >
          1. Number List
        </button>

        <span style={dividerStyle} />

        {/* Quotes & Inserts */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleInsertQuote}
          title="Blockquote"
          style={btnStyle}
        >
          ❝ Quote
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            saveSelection();
            setLinkPickerTab("external");
            setShowInternalLinkPicker(true);
          }}
          title="Insert External Web Link (e.g., medical studies, partner sites)"
          style={{ ...btnStyle, color: "#0284c7", fontWeight: 700 }}
        >
          🔗 Add Web Link
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            saveSelection();
            setLinkPickerTab("internal");
            setShowInternalLinkPicker(true);
          }}
          title="Link to Internal Service, Condition, or Clinic Page"
          style={{
            ...btnStyle,
            background: "#eff6ff",
            color: "#0369a1",
            borderColor: "#bfdbfe",
            fontWeight: 700
          }}
        >
          🌐 Link Clinic Page
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            saveSelection();
            setShowImageModal(true);
          }}
          title="Insert Image"
          style={{ ...btnStyle, background: "#ecfdf5", color: "#059669", borderColor: "#a7f3d0", fontWeight: 700 }}
        >
          🖼️ Add Image
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertHorizontalRule")}
          title="Horizontal Divider"
          style={btnStyle}
        >
          ― Divider
        </button>

        <span style={{ flexGrow: 1 }} />

        {/* Code / Visual Toggle */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setIsCodeView(!isCodeView)}
          title="Switch to HTML Code"
          style={{
            ...btnStyle,
            background: isCodeView ? "#0e78a8" : "#e2e8f0",
            color: isCodeView ? "#fff" : "#334155",
            fontWeight: 700
          }}
        >
          {isCodeView ? "Visual View" : "</> HTML View"}
        </button>
      </div>

      {/* ── IMAGE INSERTION MODAL ── */}
      {showImageModal && (
        <div
          style={{
            position: "absolute",
            top: 50,
            left: 10,
            right: 10,
            zIndex: 100,
            background: "#ffffff",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
            border: "1px solid #cbd5e1"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h5 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              Insert Image into Article
            </h5>
            <button
              type="button"
              onClick={() => setShowImageModal(false)}
              style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}
            >
              &times;
            </button>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4 }}>
              Image URL (Local path or External Web URL):
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="e.g. /images/clinic/reception-three.jpg or https://..."
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: 13,
                outline: "none"
              }}
            />
          </div>

          {/* Quick preset pickers */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {[
              { label: "Clinic Reception", url: "/images/clinic/reception-three.jpg" },
              { label: "Front Desk", url: "/images/clinic/reception-desktop.jpg" },
              { label: "Treatment Room", url: "/images/clinic/reception-four.jpg" },
              { label: "Facility Mobile", url: "/images/clinic/clinic-mobile.jpg" }
            ].map((p) => (
              <button
                key={p.url}
                type="button"
                onClick={() => setImageUrl(p.url)}
                style={{
                  padding: "4px 8px",
                  borderRadius: 6,
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  fontSize: 11.5,
                  cursor: "pointer"
                }}
              >
                + {p.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              type="button"
              onClick={() => setShowImageModal(false)}
              style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 12.5 }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsertImage}
              style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: "#059669", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12.5 }}
            >
              Insert Image
            </button>
          </div>
        </div>
      )}

      {/* ── LINK INSERTION MODAL ── */}
      {showLinkModal && (
        <div
          style={{
            position: "absolute",
            top: 50,
            left: 10,
            right: 10,
            zIndex: 100,
            background: "#ffffff",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
            border: "1px solid #cbd5e1"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h5 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              Insert Link to Selected Text
            </h5>
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}
            >
              &times;
            </button>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4 }}>
              Destination Link:
            </label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://app.practiceperfectemr.com/..."
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: 13,
                outline: "none"
              }}
            />
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                onClick={() => {
                  setShowLinkModal(false);
                  setShowInternalLinkPicker(true);
                }}
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#0369a1",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                🌐 Or Browse Internal Services, Conditions &amp; Pages →
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontSize: 12.5 }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsertLink}
              style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: "#0284c7", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12.5 }}
            >
              Insert Link
            </button>
          </div>
        </div>
      )}

      {/* ── UNIVERSAL LINK PICKER MODAL (INTERNAL & EXTERNAL) ── */}
      <InternalLinkPickerModal
        isOpen={showInternalLinkPicker}
        onClose={() => setShowInternalLinkPicker(false)}
        onSelect={(url, title, _item, options) => handleSelectLink(url, title, _item, options)}
        modalTitle="Insert Link into Article"
        allowCustomText={true}
        defaultTab={linkPickerTab}
      />

      {/* ── EDITOR BODY ── */}
      {isCodeView ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            minHeight,
            padding: 16,
            fontSize: 13.5,
            fontFamily: "monospace",
            lineHeight: 1.6,
            border: "none",
            outline: "none",
            resize: "vertical",
            background: "#0f172a",
            color: "#f8fafc"
          }}
          placeholder="Paste or edit raw HTML..."
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          onPaste={handlePaste}
          data-placeholder={placeholder}
          style={{
            minHeight,
            padding: "16px 20px",
            fontSize: 15.5,
            lineHeight: 1.7,
            color: "#1e293b",
            outline: "none",
            overflowY: "auto"
          }}
        />
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  padding: "5px 9px",
  fontSize: 12.5,
  fontWeight: 600,
  color: "#334155",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.15s",
  userSelect: "none"
};

const dividerStyle: React.CSSProperties = {
  width: 1,
  height: 20,
  background: "#cbd5e1",
  margin: "0 4px"
};
