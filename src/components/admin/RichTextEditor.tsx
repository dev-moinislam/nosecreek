"use client";

import React, { useState, useRef, useEffect } from "react";
import InternalLinkPickerModal from "./InternalLinkPickerModal";
import { LinkIcon } from "./AdminIcons";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  label?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write narrative paragraphs...",
  minHeight = 160,
  label
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isCodeView, setIsCodeView] = useState(false);
  const [showLinkPicker, setShowLinkPicker] = useState(false);
  const [linkPickerTab, setLinkPickerTab] = useState<"internal" | "external">("internal");
  const savedSelectionRef = useRef<Range | null>(null);

  // Sync value to visual editor when not actively focused
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

  const formatBlockTag = (tag: "p" | "h2" | "h3" | "h4" | "h5" | "h6") => {
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
    if (!executed && editorRef.current) {
      const selectedText = sel ? sel.toString() : "";
      const text = selectedText || (tag === "p" ? "New paragraph" : `New ${tag.toUpperCase()} Heading`);
      document.execCommand("insertHTML", false, `<${tag}>${text}</${tag}>`);
    }
    handleInput();
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

    const linkHtml = `<a href="${url}" title="${title}"${targetAttr} style="color: #0284c7; text-decoration: underline; font-weight: 600;">${linkText}</a>&nbsp;`;
    const success = document.execCommand("insertHTML", false, linkHtml);
    if (!success && editorRef.current) {
      editorRef.current.innerHTML += linkHtml;
    }
    handleInput();
    setShowLinkPicker(false);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");

    if (html) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        // Remove foreign inline fonts, backgrounds, and fixed sizes
        const allElements = doc.body.querySelectorAll("*");
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style) {
            htmlEl.style.removeProperty("background");
            htmlEl.style.removeProperty("background-color");
            htmlEl.style.removeProperty("font-family");
            htmlEl.style.removeProperty("font-size");
          }
        });
        document.execCommand("insertHTML", false, doc.body.innerHTML);
        handleInput();
        return;
      } catch {}
    }

    if (text) {
      document.execCommand("insertText", false, text);
      handleInput();
    }
  };

  return (
    <div
      style={{
        border: "1px solid #cbd5e1",
        borderRadius: 10,
        overflow: "hidden",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* ── TOOLBAR ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 4,
          padding: "6px 8px",
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0"
        }}
      >
        {/* Headings Selector */}
        <select
          onChange={(e) => {
            const val = e.target.value as "p" | "h2" | "h3" | "h4" | "h5" | "h6";
            formatBlockTag(val);
            e.target.value = "";
          }}
          defaultValue=""
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            border: "1px solid #cbd5e1",
            fontSize: 12,
            fontWeight: 700,
            color: "#1e293b",
            background: "#ffffff",
            cursor: "pointer",
            outline: "none"
          }}
          title="Choose Heading or Normal Paragraph"
        >
          <option value="" disabled>
            Paragraph / Heading ▾
          </option>
          <option value="p">Paragraph (Normal)</option>
          <option value="h2">Heading 2 (H2 - Large)</option>
          <option value="h3">Heading 3 (H3 - Medium)</option>
          <option value="h4">Heading 4 (H4 - Subhead)</option>
          <option value="h5">Heading 5 (H5 - Small)</option>
          <option value="h6">Heading 6 (H6 - Tiny)</option>
        </select>

        <span style={dividerStyle} />

        {/* Text Alignment */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("justifyLeft")}
          title="Align Left"
          style={btnStyle}
        >
          ⇤ Left
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("justifyCenter")}
          title="Align Center"
          style={{ ...btnStyle, fontWeight: 700, background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" }}
        >
          ≡ Center
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("justifyRight")}
          title="Align Right"
          style={btnStyle}
        >
          ⇥ Right
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("justifyFull")}
          title="Justify Text"
          style={btnStyle}
        >
          ☵ Justify
        </button>

        <span style={dividerStyle} />

        {/* Basic Styles */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("bold")}
          title="Bold"
          style={{ ...btnStyle, fontWeight: 800 }}
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("italic")}
          title="Italic"
          style={{ ...btnStyle, fontStyle: "italic" }}
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("underline")}
          title="Underline"
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
          title="Bullet Points List"
          style={{ ...btnStyle, background: "#eff6ff", color: "#0369a1", borderColor: "#bfdbfe", fontWeight: 700 }}
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
          1. Numbered List
        </button>

        <span style={dividerStyle} />

        {/* Link Buttons */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            saveSelection();
            setLinkPickerTab("internal");
            setShowLinkPicker(true);
          }}
          title="Insert Internal or External Link"
          style={{
            ...btnStyle,
            background: "#eff6ff",
            color: "#0284c7",
            borderColor: "#bfdbfe",
            fontWeight: 700,
            gap: 4
          }}
        >
          <LinkIcon size={12} />
          <span>+ Insert Link</span>
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("unlink")}
          title="Remove Link from selection"
          style={btnStyle}
        >
          ✕ Unlink
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("removeFormat")}
          title="Clear formatting"
          style={btnStyle}
        >
          Clear
        </button>

        <span style={{ flexGrow: 1 }} />

        {/* Mode Toggle */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setIsCodeView(!isCodeView)}
          title="Toggle Visual / HTML Code"
          style={{
            ...btnStyle,
            background: isCodeView ? "#0e78a8" : "#e2e8f0",
            color: isCodeView ? "#ffffff" : "#334155",
            fontWeight: 700
          }}
        >
          {isCodeView ? "👁️ Visual View" : "</> HTML Code"}
        </button>
      </div>

      {/* ── EDITOR BODY ── */}
      {isCodeView ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste or edit HTML markup directly..."
          style={{
            width: "100%",
            minHeight,
            padding: 14,
            fontSize: 13,
            fontFamily: "monospace",
            lineHeight: 1.6,
            border: "none",
            outline: "none",
            resize: "vertical",
            background: "#0f172a",
            color: "#f8fafc",
            boxSizing: "border-box"
          }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          onPaste={handlePaste}
          style={{
            minHeight,
            padding: "14px 16px",
            fontSize: 15,
            lineHeight: 1.7,
            color: "#0f172a",
            outline: "none",
            overflowY: "auto",
            wordBreak: "break-word"
          }}
        />
      )}

      {/* ── FOOTER HINT ── */}
      <div
        style={{
          padding: "4px 10px",
          background: "#f8fafc",
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#64748b"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>💡 Supports Headings (H2–H6), Bullet Lists, Text Alignments, and Links.</span>
        </div>
        <span>WYSIWYG Rich Text Engine</span>
      </div>

      {/* ── LINK PICKER MODAL ── */}
      <InternalLinkPickerModal
        isOpen={showLinkPicker}
        onClose={() => setShowLinkPicker(false)}
        onSelect={handleSelectLink}
        modalTitle="Insert Link into Narrative"
        allowCustomText={true}
        defaultTab={linkPickerTab}
      />
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #cbd5e1",
  borderRadius: 5,
  padding: "4px 8px",
  fontSize: 11.5,
  fontWeight: 600,
  color: "#334155",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  userSelect: "none",
  transition: "all 0.15s ease"
};

const dividerStyle: React.CSSProperties = {
  width: 1,
  height: 18,
  background: "#cbd5e1",
  margin: "0 2px"
};
