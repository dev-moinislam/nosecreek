"use client";

import React, { useState, useRef } from "react";
import { PhotoIcon, TrashIcon, CloudUploadIcon } from "@/components/admin/AdminIcons";

interface AdminImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  placeholder?: string;
  aspectRatioNote?: string;
  style?: React.CSSProperties;
}

export default function AdminImageUploader({
  value,
  onChange,
  label,
  folder = "general",
  placeholder = "Upload image or enter URL...",
  aspectRatioNote,
  style,
}: AdminImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(!value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      setUploadError("Please select a valid image file (.jpg, .png, .webp, .svg)");
      return;
    }

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image size must be under 10MB");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image");
      }

      onChange(data.url);
      setShowUrlInput(false);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>{label}</label>
          {aspectRatioNote && (
            <span style={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 500 }}>{aspectRatioNote}</span>
          )}
        </div>
      )}

      {/* Main Upload / Preview Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: isDragOver
            ? "2px dashed #0e78a8"
            : value
            ? "1px solid #cbd5e1"
            : "2px dashed #cbd5e1",
          borderRadius: 12,
          background: isDragOver ? "#f0f9ff" : value ? "#ffffff" : "#f8fafc",
          padding: value ? 10 : "22px 16px",
          transition: "all 0.2s ease",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        {/* Existing Image Preview */}
        {value ? (
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 72,
                height: 54,
                borderRadius: 8,
                overflow: "hidden",
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={value}
                alt="Upload preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#0f172a",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {value.split("/").pop() || value}
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  style={{
                    background: "#f1f5f9",
                    color: "#0e78a8",
                    border: "1px solid #cbd5e1",
                    padding: "3px 8px",
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {isUploading ? "Uploading..." : "Replace File"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  {showUrlInput ? "Hide Path" : "Edit Path"}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onChange("");
                setShowUrlInput(true);
              }}
              title="Remove image"
              style={{
                background: "#fef2f2",
                color: "#dc2626",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: "6px 8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrashIcon size={14} />
            </button>
          </div>
        ) : (
          /* Empty Drag & Drop Box */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: 8,
              cursor: "pointer",
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: isDragOver ? "#e0f2fe" : "#f1f5f9",
                color: isDragOver ? "#0284c7" : "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isUploading ? (
                <div
                  style={{
                    width: 20,
                    height: 20,
                    border: "2px solid #0e78a8",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              ) : (
                <CloudUploadIcon size={22} />
              )}
            </div>

            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
                {isUploading ? (
                  "Uploading to Supabase..."
                ) : (
                  <>
                    <span style={{ color: "#0e78a8", textDecoration: "underline" }}>Click to browse</span> or drag image here
                  </>
                )}
              </p>
              <p style={{ margin: "2px 0 0 0", fontSize: 11.5, color: "#94a3b8" }}>
                Supports JPG, PNG, WEBP, SVG (Max 10MB)
              </p>
            </div>
          </div>
        )}

        {/* Optional Manual URL Input */}
        {(showUrlInput || !value) && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: value ? 6 : 4 }}>
            <input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              style={{
                flex: 1,
                padding: "7px 10px",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 12.5,
                color: "#1e293b",
                background: "#ffffff",
                outline: "none",
              }}
            />
          </div>
        )}
      </div>

      {uploadError && (
        <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}>⚠️ {uploadError}</span>
      )}
    </div>
  );
}
