"use client";

import React, { useState, useMemo } from "react";
import { getAllInternalRoutes, InternalRouteItem } from "@/lib/content/internalRoutes";
import { SearchIcon, XIcon, CheckIcon, LinkIcon } from "./AdminIcons";

interface InternalLinkPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, title: string, item: InternalRouteItem) => void;
  initialUrl?: string;
  modalTitle?: string;
  allowCustomText?: boolean;
}

export default function InternalLinkPickerModal({
  isOpen,
  onClose,
  onSelect,
  initialUrl = "",
  modalTitle = "Select Internal Clinic Link",
  allowCustomText = true
}: InternalLinkPickerModalProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [customText, setCustomText] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<InternalRouteItem | null>(null);

  const allRoutes = useMemo(() => getAllInternalRoutes(), []);

  const filteredRoutes = useMemo(() => {
    return allRoutes.filter((r) => {
      const matchesCat = categoryFilter === "all" || r.category === categoryFilter;
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        r.title.toLowerCase().includes(query) ||
        r.url.toLowerCase().includes(query) ||
        (r.description && r.description.toLowerCase().includes(query));
      return matchesCat && matchesSearch;
    });
  }, [allRoutes, categoryFilter, search]);

  if (!isOpen) return null;

  const handleSelect = (route: InternalRouteItem) => {
    const finalTitle = customText.trim() || route.title;
    onSelect(route.url, finalTitle, route);
    onClose();
  };

  const getBadgeStyle = (category: string) => {
    switch (category) {
      case "service":
        return { background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" };
      case "condition":
        return { background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" };
      case "location":
        return { background: "#d1fae5", color: "#047857", border: "1px solid #a7f3d0" };
      case "cta":
        return { background: "#ffe4e6", color: "#be123c", border: "1px solid #fecdd3" };
      default:
        return { background: "#f3e8ff", color: "#7e22ce", border: "1px solid #e9d5ff" };
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: 16
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 680,
          maxHeight: "88vh",
          background: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid #e2e8f0"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#f8fafc"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <LinkIcon size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                {modalTitle}
              </h3>
              <p style={{ margin: 0, fontSize: 12.5, color: "#64748b" }}>
                Search and pick any clinic service, condition, location, or page.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              padding: 4,
              display: "flex",
              borderRadius: 6
            }}
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Search & Categories */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "#ffffff" }}>
          {/* Search Bar */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                display: "flex"
              }}
            >
              <SearchIcon size={16} />
            </span>
            <input
              type="text"
              autoFocus
              placeholder="Search by title, condition, or URL (e.g., 'back pain', 'physio', 'booking')..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 38px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                fontSize: 13.5,
                outline: "none",
                boxSizing: "border-box"
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  fontSize: 14
                }}
              >
                &times;
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { id: "all", label: "All Links", count: allRoutes.length },
              { id: "service", label: "Services", count: allRoutes.filter((r) => r.category === "service").length },
              { id: "condition", label: "Conditions", count: allRoutes.filter((r) => r.category === "condition").length },
              { id: "page", label: "Main Pages", count: allRoutes.filter((r) => r.category === "page").length },
              { id: "location", label: "Locations", count: allRoutes.filter((r) => r.category === "location").length },
              { id: "cta", label: "CTAs / Booking", count: allRoutes.filter((r) => r.category === "cta").length }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                style={{
                  padding: "5px 11px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  border: "1px solid",
                  borderColor: categoryFilter === tab.id ? "#0284c7" : "#e2e8f0",
                  background: categoryFilter === tab.id ? "#f0f9ff" : "#ffffff",
                  color: categoryFilter === tab.id ? "#0284c7" : "#64748b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: 10.5,
                    padding: "1px 6px",
                    borderRadius: 10,
                    background: categoryFilter === tab.id ? "#0284c7" : "#f1f5f9",
                    color: categoryFilter === tab.id ? "#ffffff" : "#64748b"
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Link List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "10px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 6
          }}
        >
          {filteredRoutes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
              <p style={{ fontSize: 14, margin: "0 0 6px" }}>No internal links found matching "{search}".</p>
              <span style={{ fontSize: 12.5 }}>Try adjusting your search terms or filter category.</span>
            </div>
          ) : (
            filteredRoutes.map((item) => {
              const isSelected = selectedRoute?.id === item.id || initialUrl === item.url;
              const badgeStyle = getBadgeStyle(item.category);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedRoute(item);
                    if (!customText) setCustomText(item.title);
                  }}
                  onDoubleClick={() => handleSelect(item)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid",
                    borderColor: isSelected ? "#0284c7" : "#e2e8f0",
                    background: isSelected ? "#f0f9ff" : "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          padding: "2px 7px",
                          borderRadius: 6,
                          ...badgeStyle
                        }}
                      >
                        {item.badge}
                      </span>
                      <strong style={{ fontSize: 13.5, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.title}
                      </strong>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                      <code
                        style={{
                          color: "#0284c7",
                          background: "#f1f5f9",
                          padding: "1px 6px",
                          borderRadius: 4,
                          fontFamily: "monospace",
                          fontWeight: 600
                        }}
                      >
                        {item.url}
                      </code>
                      {item.description && (
                        <span
                          style={{
                            color: "#64748b",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          — {item.description}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(item);
                    }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      border: "none",
                      background: isSelected ? "#0284c7" : "#f1f5f9",
                      color: isSelected ? "#ffffff" : "#334155",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    <span>{isSelected ? "Insert Link" : "Select"}</span>
                    <CheckIcon size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Optional Custom Anchor Text */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid #e2e8f0",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12
          }}
        >
          {allowCustomText && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", whiteSpace: "nowrap" }}>
                Link Anchor Text:
              </label>
              <input
                type="text"
                placeholder="Defaults to page title..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                style={{
                  width: "100%",
                  maxWidth: 280,
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  fontSize: 12.5,
                  background: "#fff"
                }}
              />
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "7px 16px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                fontSize: 13,
                fontWeight: 600,
                color: "#475569",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedRoute}
              onClick={() => {
                if (selectedRoute) handleSelect(selectedRoute);
              }}
              style={{
                padding: "7px 20px",
                borderRadius: 6,
                border: "none",
                background: selectedRoute
                  ? "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)"
                  : "#cbd5e1",
                fontSize: 13,
                fontWeight: 700,
                color: "#ffffff",
                cursor: selectedRoute ? "pointer" : "not-allowed"
              }}
            >
              Apply Selected Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
