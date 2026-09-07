"use client";

import React, { useState, useMemo, useEffect } from "react";
import { getAllInternalRoutes, InternalRouteItem } from "@/lib/content/internalRoutes";
import { SearchIcon, XIcon, CheckIcon, LinkIcon } from "./AdminIcons";

export interface LinkSelectOptions {
  isExternal?: boolean;
  openInNewTab?: boolean;
}

interface InternalLinkPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (
    url: string,
    title: string,
    item?: InternalRouteItem,
    options?: LinkSelectOptions
  ) => void;
  initialUrl?: string;
  modalTitle?: string;
  allowCustomText?: boolean;
  defaultTab?: "internal" | "external";
}

const EXTERNAL_PRESETS = [
  {
    name: "Google Maps / Review Profile",
    url: "https://www.google.com/maps/place/Nose+Creek+Physiotherapy/@51.126316,-114.0695037,17z/data=!3m1!5s0x537165d72e2e9a4f:0xf87800e6f2762f39!4m8!3m7!1s0x537165d74effbead:0xbe7dc01542416295!8m2!3d51.126316!4d-114.0695037!9m1!1b1!16s%2Fg%2F1tgps902?hl=en-US&entry=ttu&g_ep=EgoyMDI2MDkwMi4wIKXMDSoASAFQAw%3D%3D",
    badge: "Maps / Reviews",
    defaultTitle: "Nose Creek Physiotherapy on Google Maps"
  },
  {
    name: "PracticePerfect Online Booking Portal",
    url: "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington",
    badge: "Booking",
    defaultTitle: "Book Online via PracticePerfect"
  },
  {
    name: "Physiotherapy Alberta College + Association",
    url: "https://www.physiotherapyalberta.ca/",
    badge: "Governing Body",
    defaultTitle: "Physiotherapy Alberta College + Association"
  },
  {
    name: "Canadian Physiotherapy Association (CPA)",
    url: "https://physiotherapy.ca/",
    badge: "National Assoc",
    defaultTitle: "Canadian Physiotherapy Association"
  },
  {
    name: "Alberta Health Services (AHS)",
    url: "https://www.albertahealthservices.ca/",
    badge: "Health Authority",
    defaultTitle: "Alberta Health Services"
  },
  {
    name: "Facebook Page",
    url: "https://www.facebook.com/nosecreekphysiotherapy",
    badge: "Social",
    defaultTitle: "Nose Creek Physiotherapy on Facebook"
  },
  {
    name: "Instagram Profile",
    url: "https://www.instagram.com/nosecreekphysio",
    badge: "Social",
    defaultTitle: "@nosecreekphysio on Instagram"
  },
  {
    name: "LinkedIn Company Profile",
    url: "https://www.linkedin.com/company/nose-creek-physiotherapy",
    badge: "Social",
    defaultTitle: "Nose Creek Physiotherapy on LinkedIn"
  }
];

export default function InternalLinkPickerModal({
  isOpen,
  onClose,
  onSelect,
  initialUrl = "",
  modalTitle = "Insert Link (Internal Clinic Page or External Web URL)",
  allowCustomText = true,
  defaultTab
}: InternalLinkPickerModalProps) {
  // Detect if initialUrl is external
  const isInitiallyExternal = useMemo(() => {
    return Boolean(initialUrl && (initialUrl.startsWith("http://") || initialUrl.startsWith("https://")));
  }, [initialUrl]);

  const [activeTab, setActiveTab] = useState<"internal" | "external">(
    defaultTab || (isInitiallyExternal ? "external" : "internal")
  );

  // Internal Link states
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [customText, setCustomText] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<InternalRouteItem | null>(null);

  // External Link states
  const [externalUrl, setExternalUrl] = useState(isInitiallyExternal ? initialUrl : "");
  const [externalTitle, setExternalTitle] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(true);

  // Reset or update on open
  useEffect(() => {
    if (isOpen) {
      if (initialUrl && (initialUrl.startsWith("http://") || initialUrl.startsWith("https://"))) {
        setActiveTab("external");
        setExternalUrl(initialUrl);
      } else {
        setActiveTab(defaultTab || "internal");
      }
    }
  }, [isOpen, initialUrl, defaultTab]);

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

  // Handle selecting an internal route
  const handleSelectInternal = (route: InternalRouteItem) => {
    const finalTitle = customText.trim() || route.title;
    onSelect(route.url, finalTitle, route, { isExternal: false, openInNewTab: false });
    onClose();
  };

  // Handle inserting an external URL
  const handleSelectExternal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let cleanUrl = externalUrl.trim();
    if (!cleanUrl) return;

    // Prepend https:// if missing
    if (
      !cleanUrl.startsWith("http://") &&
      !cleanUrl.startsWith("https://") &&
      !cleanUrl.startsWith("mailto:") &&
      !cleanUrl.startsWith("tel:")
    ) {
      cleanUrl = `https://${cleanUrl}`;
    }

    let finalTitle = externalTitle.trim();
    if (!finalTitle) {
      try {
        const u = new URL(cleanUrl);
        finalTitle = u.hostname.replace(/^www\./, "");
      } catch {
        finalTitle = cleanUrl;
      }
    }

    onSelect(cleanUrl, finalTitle, undefined, { isExternal: true, openInNewTab });
    onClose();
  };

  // Check if search looks like an external URL
  const isSearchExternalUrl =
    search.trim().startsWith("http://") ||
    search.trim().startsWith("https://") ||
    search.trim().startsWith("www.") ||
    search.trim().includes(".com") ||
    search.trim().includes(".ca") ||
    search.trim().includes(".org");

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
          maxWidth: 720,
          maxHeight: "90vh",
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
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <LinkIcon size={19} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                {modalTitle}
              </h3>
              <p style={{ margin: 0, fontSize: 12.5, color: "#64748b" }}>
                Choose an internal clinic page or specify an external web destination.
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

        {/* Mode Switcher: Internal Pages vs External URL */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #e2e8f0",
            background: "#f1f5f9",
            padding: "4px 8px 0 8px"
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("internal")}
            style={{
              flex: 1,
              padding: "11px 16px",
              background: activeTab === "internal" ? "#ffffff" : "transparent",
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              border: "none",
              borderBottom: activeTab === "internal" ? "2px solid #0284c7" : "2px solid transparent",
              color: activeTab === "internal" ? "#0284c7" : "#64748b",
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.15s ease"
            }}
          >
            <span>🌐 Internal Clinic Pages</span>
            <span
              style={{
                fontSize: 11,
                padding: "2px 7px",
                borderRadius: 10,
                background: activeTab === "internal" ? "#e0f2fe" : "#e2e8f0",
                color: activeTab === "internal" ? "#0369a1" : "#64748b"
              }}
            >
              {allRoutes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("external")}
            style={{
              flex: 1,
              padding: "11px 16px",
              background: activeTab === "external" ? "#ffffff" : "transparent",
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              border: "none",
              borderBottom: activeTab === "external" ? "2px solid #0284c7" : "2px solid transparent",
              color: activeTab === "external" ? "#0284c7" : "#64748b",
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.15s ease"
            }}
          >
            <span>🔗 External Web Link</span>
            <span
              style={{
                fontSize: 11,
                padding: "2px 7px",
                borderRadius: 10,
                background: activeTab === "external" ? "#dcfce7" : "#e2e8f0",
                color: activeTab === "external" ? "#15803d" : "#64748b"
              }}
            >
              Custom URL
            </span>
          </button>
        </div>

        {/* ── TAB 1: INTERNAL CLINIC PAGES ── */}
        {activeTab === "internal" && (
          <>
            {/* Search & Categories */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "#ffffff" }}>
              {/* Search Bar */}
              <div style={{ position: "relative", marginBottom: 10 }}>
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

              {/* Auto-detect External Link notice */}
              {isSearchExternalUrl && (
                <div
                  onClick={() => {
                    setExternalUrl(search.trim());
                    setActiveTab("external");
                  }}
                  style={{
                    padding: "8px 12px",
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    borderRadius: 8,
                    color: "#065f46",
                    fontSize: 12.5,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span>🔗</span>
                    <span>
                      Detected external web link: <strong>{search}</strong>
                    </span>
                  </div>
                  <span style={{ fontWeight: 700, color: "#047857" }}>Use as External Link →</span>
                </div>
              )}

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
                  <span style={{ fontSize: 12.5 }}>
                    Looking for an external link? Switch to the "External Web Link" tab above.
                  </span>
                </div>
              ) : (
                filteredRoutes.map((item, idx) => {
                  const isSelected = selectedRoute?.id === item.id || initialUrl === item.url;
                  const badgeStyle = getBadgeStyle(item.category);

                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      onClick={() => {
                        setSelectedRoute(item);
                        if (!customText) setCustomText(item.title);
                      }}
                      onDoubleClick={() => handleSelectInternal(item)}
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
                          handleSelectInternal(item);
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

            {/* Footer for Internal Tab */}
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
                    Anchor Text:
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
                    if (selectedRoute) handleSelectInternal(selectedRoute);
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
                  Apply Internal Link
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── TAB 2: EXTERNAL WEB LINK ── */}
        {activeTab === "external" && (
          <form onSubmit={handleSelectExternal} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {/* External Destination URL Input */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                  External Destination URL <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#64748b",
                      fontSize: 13,
                      fontWeight: 600
                    }}
                  >
                    🔗
                  </span>
                  <input
                    type="text"
                    autoFocus
                    placeholder="https://www.example.com or https://albertahealthservices.ca"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 36px",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      fontSize: 13.5,
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                    required
                  />
                </div>
                <p style={{ margin: "4px 0 0 0", fontSize: 11.5, color: "#64748b" }}>
                  Paste any external website, article, video, or portal URL. If "https://" is omitted, it will be added automatically.
                </p>
              </div>

              {/* Link Anchor Text / Label */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                  Link Text / Anchor Label
                </label>
                <input
                  type="text"
                  placeholder="E.g., Visit Alberta Health Services, Book on PracticePerfect..."
                  value={externalTitle}
                  onChange={(e) => setExternalTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: 13.5,
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
                <p style={{ margin: "4px 0 0 0", fontSize: 11.5, color: "#64748b" }}>
                  The clickable words that users will see on your page.
                </p>
              </div>

              {/* Open in New Tab Toggle */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "12px 16px",
                  marginBottom: 20
                }}
              >
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={openInNewTab}
                    onChange={(e) => setOpenInNewTab(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#0284c7" }}
                  />
                  <div>
                    <strong style={{ fontSize: 13, color: "#0f172a" }}>
                      Open in new tab (target="_blank")
                    </strong>
                    <p style={{ margin: 0, fontSize: 11.5, color: "#64748b" }}>
                      Recommended for external sites so patients do not leave your clinic website.
                    </p>
                  </div>
                </label>
              </div>

              {/* Presets / Common External Links */}
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#475569", marginBottom: 8 }}>
                  ⚡ Quick Presets (One-Click Insert for Popular Healthcare &amp; Social Links):
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 8 }}>
                  {EXTERNAL_PRESETS.map((preset) => (
                    <div
                      key={preset.url}
                      onClick={() => {
                        setExternalUrl(preset.url);
                        if (!externalTitle) setExternalTitle(preset.defaultTitle);
                      }}
                      style={{
                        padding: "8px 12px",
                        background: externalUrl === preset.url ? "#f0fdf4" : "#ffffff",
                        border: "1px solid",
                        borderColor: externalUrl === preset.url ? "#10b981" : "#e2e8f0",
                        borderRadius: 8,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div style={{ overflow: "hidden", paddingRight: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "1px 6px",
                              borderRadius: 4,
                              background: "#e0f2fe",
                              color: "#0369a1"
                            }}
                          >
                            {preset.badge}
                          </span>
                          <strong style={{ fontSize: 12.5, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {preset.name}
                          </strong>
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#64748b",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            marginTop: 2
                          }}
                        >
                          {preset.url}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#0284c7", whiteSpace: "nowrap" }}>
                        {externalUrl === preset.url ? "✓ Selected" : "+ Use"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer for External Tab */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid #e2e8f0",
                background: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 12
              }}
            >
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
                type="submit"
                disabled={!externalUrl.trim()}
                style={{
                  padding: "8px 22px",
                  borderRadius: 6,
                  border: "none",
                  background: externalUrl.trim()
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "#cbd5e1",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#ffffff",
                  cursor: externalUrl.trim() ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <span>Insert External Link</span>
                <CheckIcon size={13} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
