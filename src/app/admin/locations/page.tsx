"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/components/admin/RoleGuard";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Location } from "@/types/content";
import locationsData from "@/data/locations.json";
import AdminToast from "@/components/admin/AdminToast";
import AdminImageUploader from "@/components/admin/AdminImageUploader";

import { EditIcon, CheckIcon, XIcon, PlusIcon, TrashIcon } from "@/components/admin/AdminIcons";

export default function AdminLocationsPage() {
  const { isAdmin } = useRole();
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLoc, setEditingLoc] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchLocations = async () => {
    setLoading(true);
    let currentData = locationsData as any[];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from("locations").select("*");
        if (!error && data && data.length > 0) {
          currentData = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            slug: d.slug,
            address: d.address,
            phone: d.phone,
            email: d.email,
            eyebrow: d.seo?.eyebrow || "Visit us",
            title: d.seo?.title || "One clinic, ideally located in Calgary",
            directionsUrl: d.seo?.directionsUrl || "https://www.google.com/maps/dir//Nose+Creek+Physiotherapy",
            insuranceNote: d.seo?.insuranceNote || "Insurance-covered physiotherapy · Extended-health direct billing available.",
            hoursList: d.seo?.hoursList || [
              { day: "Monday – Friday", hours: "6:45 AM – 7:15 PM" },
              { day: "Saturday", hours: "8:00 AM – 2:00 PM" },
              { day: "Sunday", hours: "Closed" }
            ],
            openingHours: d.opening_hours || {},
            mapEmbedUrl: d.map_embed_url || "https://www.google.com/maps?q=Nose%20Creek%20Physiotherapy%208220%20Centre%20St%20NE%20Suite%20153%2C%20Calgary%2C%20AB%20T3K%201J7&output=embed",
            services: d.services || [],
            teamMembers: d.team_members || [],
            testimonials: d.testimonials || [],
            description: d.description || "",
            images: d.images || [],
            bookingUrl: d.booking_url || "",
            seo: d.seo || {}
          }));
        }
      } catch {}
    }

    setLocations(currentData);
    setLoading(false);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleSave = async (loc: any) => {
    const updated = locations.map((l) => (l.slug === loc.slug ? loc : l));
    if (!updated.find((l) => l.slug === loc.slug)) {
      updated.push(loc);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("locations").upsert({
          id: loc.id || `loc-${loc.slug}`,
          name: loc.name,
          slug: loc.slug,
          address: loc.address,
          phone: loc.phone,
          email: loc.email,
          opening_hours: loc.openingHours || {},
          map_embed_url: loc.mapEmbedUrl || null,
          services: loc.services || [],
          team_members: loc.teamMembers || [],
          testimonials: loc.testimonials || [],
          description: loc.description || null,
          images: loc.images || [],
          booking_url: loc.bookingUrl || null,
          seo: {
            ...(loc.seo || {}),
            eyebrow: loc.eyebrow,
            title: loc.title,
            directionsUrl: loc.directionsUrl,
            insuranceNote: loc.insuranceNote,
            hoursList: loc.hoursList
          },
          is_published: true
        });
      } catch (err) {
        console.warn("Supabase location note:", err);
      }
    }

    try {
      await fetch("/api/admin/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "locations", data: updated })
      });
    } catch {}

    if (typeof window !== "undefined") {
      localStorage.removeItem("adm_locations");
      window.dispatchEvent(new Event("locationsUpdated"));
    }

    setLocations(updated);
    setEditingLoc(null);
    setToastMessage("✓ Clinic location & Visit Us section saved successfully!");
  };

  return (
    <div>
      <AdminToast message={toastMessage} onClose={() => setToastMessage(null)} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "#0f172a" }}>
            Clinic Location &amp; &ldquo;Visit Us&rdquo; Section Manager
          </h2>
          <p style={{ fontSize: 14, color: "#64748b", margin: "4px 0 0 0" }}>
            Control the &ldquo;Visit us / One clinic, ideally located in Calgary&rdquo; section that appears across the Homepage, Services, and Conditions pages.
          </p>
        </div>
      </div>

      <div className="adm-card" style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
        <div className="adm-table-container">
          <table className="adm-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                <th style={{ padding: "14px 18px", fontSize: 13, fontWeight: 700, color: "#475569" }}>Clinic Facility</th>
                <th style={{ padding: "14px 18px", fontSize: 13, fontWeight: 700, color: "#475569" }}>Section Eyebrow &amp; Title</th>
                <th style={{ padding: "14px 18px", fontSize: 13, fontWeight: 700, color: "#475569" }}>Physical Address</th>
                <th style={{ padding: "14px 18px", fontSize: 13, fontWeight: 700, color: "#475569" }}>Phone</th>
                <th style={{ padding: "14px 18px", fontSize: 13, fontWeight: 700, color: "#475569", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 36, color: "#64748b" }}>
                    Loading location settings...
                  </td>
                </tr>
              ) : (
                locations.map((loc) => (
                  <tr key={loc.slug} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "16px 18px" }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>{loc.name}</div>
                      <div style={{ fontSize: 12.5, color: "#0e78a8" }}>/locations/{loc.slug}</div>
                    </td>
                    <td style={{ padding: "16px 18px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#5c9515", textTransform: "uppercase" }}>{loc.eyebrow || "Visit us"}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{loc.title || "One clinic, ideally located in Calgary"}</div>
                    </td>
                    <td style={{ padding: "16px 18px", fontSize: 13.5, color: "#334155", whiteSpace: "pre-line" }}>{loc.address}</td>
                    <td style={{ padding: "16px 18px", fontSize: 13.5, color: "#334155", fontWeight: 600 }}>{loc.phone}</td>
                    <td style={{ padding: "16px 18px", textAlign: "right" }}>
                      <button
                        onClick={() => setEditingLoc(JSON.parse(JSON.stringify(loc)))}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: "#0e78a8",
                          color: "#fff",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        <EditIcon size={14} />
                        <span>Edit Section &amp; Location</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingLoc && (
        <LocationEditorModal
          location={editingLoc}
          onClose={() => setEditingLoc(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function LocationEditorModal({
  location: initial,
  onClose,
  onSave
}: {
  location: any;
  onClose: () => void;
  onSave: (l: any) => void;
}) {
  const [loc, setLoc] = useState<any>(initial);

  const handleUpdateHour = (index: number, field: "day" | "hours", val: string) => {
    const list = [...(loc.hoursList || [])];
    list[index] = { ...list[index], [field]: val };
    setLoc({ ...loc, hoursList: list });
  };

  const handleAddHour = () => {
    const list = [...(loc.hoursList || [])];
    list.push({ day: "New Day/Holiday", hours: "9:00 AM – 5:00 PM" });
    setLoc({ ...loc, hoursList: list });
  };

  const handleRemoveHour = (index: number) => {
    const list = [...(loc.hoursList || [])];
    list.splice(index, 1);
    setLoc({ ...loc, hoursList: list });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15,23,42,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 960,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.3)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f8fafc"
          }}
        >
          <div>
            <h3 style={{ margin: "0 0 2px 0", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
              Edit &ldquo;Visit Us&rdquo; Section &amp; Clinic Information
            </h3>
            <span style={{ fontSize: 12.5, color: "#64748b" }}>
              Changes will automatically update the Homepage, Services, and Conditions pages
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 24, lineHeight: 1 }}
          >
            &times;
          </button>
        </div>

        <div style={{ padding: 24, overflowY: "auto", flexGrow: 1, display: "flex", flexDirection: "column", gap: 18 }}>
          
          {/* Section Header Controls */}
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: 18, borderRadius: 14 }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 700, color: "#166534" }}>
              Section Heading &amp; Eyebrow (Displayed on every page)
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Section Eyebrow</label>
                <input
                  type="text"
                  value={loc.eyebrow || "Visit us"}
                  onChange={(e) => setLoc({ ...loc, eyebrow: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g. Visit us"
                />
              </div>
              <div>
                <label style={labelStyle}>Section Title Heading</label>
                <input
                  type="text"
                  value={loc.title || "One clinic, ideally located in Calgary"}
                  onChange={(e) => setLoc({ ...loc, title: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g. One clinic, ideally located in Calgary"
                />
              </div>
            </div>
          </div>

          {/* Facility Info */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: 18, borderRadius: 14, display: "flex", flexDirection: "column", gap: 14 }}>
            <h4 style={{ margin: "0 0 4px 0", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              Clinic Info Card Details
            </h4>

            <div>
              <label style={labelStyle}>Clinic Facility Name</label>
              <input
                type="text"
                value={loc.name || ""}
                onChange={(e) => setLoc({ ...loc, name: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Physical Address</label>
              <textarea
                rows={2}
                value={loc.address || ""}
                onChange={(e) => setLoc({ ...loc, address: e.target.value })}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="8220 Centre St NE #153&#10;Calgary, AB T3K 1J7, Canada"
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Phone Number (Call Button)</label>
                <input
                  type="text"
                  value={loc.phone || ""}
                  onChange={(e) => setLoc({ ...loc, phone: e.target.value })}
                  style={inputStyle}
                  placeholder="403.295.8590"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Google Maps &ldquo;Get Directions&rdquo; Link</label>
                <input
                  type="text"
                  value={loc.directionsUrl || ""}
                  onChange={(e) => setLoc({ ...loc, directionsUrl: e.target.value })}
                  style={inputStyle}
                  placeholder="https://www.google.com/maps/dir/..."
                />
              </div>
            </div>

            <div>
              <AdminImageUploader
                label="Clinic Facility Photo / Exterior Banner"
                value={(loc.images && loc.images[0]) || loc.image || ""}
                onChange={(url) => {
                  const updatedImages = loc.images && loc.images.length > 0 ? [...loc.images] : [""];
                  updatedImages[0] = url;
                  setLoc({ ...loc, images: updatedImages, image: url });
                }}
                folder="locations"
                placeholder="/images/clinic/reception-three.jpg"
                aspectRatioNote="Landscape 16:9 recommended"
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Google Maps Embed URL (Iframe Src)</label>
                <button
                  type="button"
                  onClick={() => {
                    const exactPin = `https://www.google.com/maps?q=${encodeURIComponent(
                      (loc.name || "Nose Creek Physiotherapy") + " " + (loc.address ? loc.address.replace(/\n/g, ", ") : "8220 Centre St NE #153, Calgary, AB T3K 1J7")
                    )}&output=embed`;
                    setLoc({ ...loc, mapEmbedUrl: exactPin });
                  }}
                  style={{
                    background: "#f0fdf4",
                    color: "#166534",
                    border: "1px solid #bbf7d0",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  📍 Use Exact Address Pin
                </button>
              </div>
              <input
                type="text"
                value={loc.mapEmbedUrl || ""}
                onChange={(e) => {
                  let val = e.target.value;
                  const match = val.match(/src=["']([^"']+)["']/i);
                  if (match && match[1]) {
                    val = match[1];
                  }
                  setLoc({ ...loc, mapEmbedUrl: val });
                }}
                style={inputStyle}
                placeholder="Paste iframe code, embed link, or search query"
              />
              
              {/* Live Map Preview inside modal */}
              <div style={{ marginTop: 10, borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0", height: 180, background: "#f8fafc" }}>
                <iframe
                  title="Admin Map Preview"
                  src={
                    loc.mapEmbedUrl && (loc.mapEmbedUrl.includes("output=embed") || loc.mapEmbedUrl.includes("/embed?pb="))
                      ? loc.mapEmbedUrl
                      : `https://www.google.com/maps?q=${encodeURIComponent(
                          (loc.name || "Nose Creek Physiotherapy") + " " + (loc.address ? loc.address.replace(/\n/g, ", ") : "8220 Centre St NE #153, Calgary, AB T3K 1J7")
                        )}&output=embed`
                  }
                  style={{ width: "100%", height: "100%", border: 0 }}
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Hours and Insurance note */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: 18, borderRadius: 14, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: "0 0 2px 0", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                  Opening Hours List
                </h4>
                <p style={{ margin: 0, fontSize: 12.5, color: "#64748b" }}>
                  Add, edit, or remove schedule days and operational hours shown on the website.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddHour}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: 8,
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  border: "1px solid #bfdbfe",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <PlusIcon size={14} />
                <span>Add Hour Row</span>
              </button>
            </div>

            {(!loc.hoursList || loc.hoursList.length === 0) ? (
              <div style={{ padding: "16px", background: "#f8fafc", borderRadius: 8, textAlign: "center", color: "#64748b", fontSize: 13 }}>
                No opening hours configured. Click &ldquo;Add Hour Row&rdquo; to add one.
              </div>
            ) : (
              loc.hoursList.map((row: any, rIdx: number) => (
                <div key={rIdx} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr 38px", gap: 10, alignItems: "center" }}>
                  <input
                    type="text"
                    value={row.day}
                    onChange={(e) => handleUpdateHour(rIdx, "day", e.target.value)}
                    style={inputStyle}
                    placeholder="Day / Range (e.g. Monday – Friday)"
                  />
                  <input
                    type="text"
                    value={row.hours}
                    onChange={(e) => handleUpdateHour(rIdx, "hours", e.target.value)}
                    style={inputStyle}
                    placeholder="Time (e.g. 6:45 AM – 7:15 PM or Closed)"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveHour(rIdx)}
                    title="Delete this hour entry"
                    style={{
                      height: 38,
                      width: 38,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#fef2f2",
                      border: "1px solid #fee2e2",
                      color: "#dc2626",
                      borderRadius: 8,
                      cursor: "pointer",
                      padding: 0
                    }}
                  >
                    <TrashIcon size={15} />
                  </button>
                </div>
              ))
            )}

            <div style={{ marginTop: 6 }}>
              <label style={labelStyle}>Insurance Direct Billing Note</label>
              <input
                type="text"
                value={loc.insuranceNote || ""}
                onChange={(e) => setLoc({ ...loc, insuranceNote: e.target.value })}
                style={inputStyle}
                placeholder="Insurance-covered physiotherapy · Extended-health direct billing available."
              />
            </div>
          </div>

        </div>

        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#ffffff"
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#475569",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(loc)}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              border: "none",
              background: "#16a34a",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(22,163,74,0.3)"
            }}
          >
            Save Location &amp; Update All Pages
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 700,
  color: "#334155",
  marginBottom: 5
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 13px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  fontSize: 13.5,
  color: "#0f172a",
  background: "#ffffff",
  outline: "none"
};
